/**
 * chatService.ts — message_service client
 *
 * Backend: message_service `/api/messages` (port 8089).
 *   - POST   /api/messages                       send message
 *   - GET    /api/messages/{conversationId}      list conversation
 *   - POST   /api/messages/{conversationId}/seen mark as read for a viewer
 *
 * Conversation key: in this prototype every student/supervisor pair has a
 * single conversation. We use the thesisId as conversationId when the thesis
 * exists; otherwise we fall back to a synthetic id so the chat is still
 * usable during the topic-request phase. Both sides converge on the same
 * conversationId because both derive it from the same plan record.
 */
import { messageApi } from '../lib/apiClient';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: string;        // 'SENT' | 'DELIVERED' | 'SEEN'
  sentAt: string;        // ISO instant
  seenAt?: string;
}

interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: string;
  createdAt: string;
  seenAt?: string;
}

const fromV2 = (m: MessageResponse): ChatMessage => ({
  id: m.id,
  conversationId: m.conversationId,
  senderId: m.senderId,
  receiverId: m.receiverId,
  content: m.content,
  status: m.status,
  sentAt: m.createdAt,
  seenAt: m.seenAt,
});

export const chatService = {
  /** Conversation id used by the chat. Stable across both ends. */
  conversationId: (studentId: string, supervisorId: string, thesisId?: string | null) =>
    thesisId && thesisId.trim() ? thesisId : `pair:${studentId}:${supervisorId}`,

  getMessages: (conversationId: string) =>
    messageApi.get<MessageResponse[]>(`/api/messages/${conversationId}`)
      .then(r => ({ data: (r.data || []).map(fromV2) }))
      .catch(() => ({ data: [] as ChatMessage[] })),

  sendMessage: (params: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
  }) =>
    messageApi.post<MessageResponse>('/api/messages', {
      conversationId: params.conversationId,
      senderId: params.senderId,
      receiverId: params.receiverId,
      content: params.content,
    }).then(r => ({ data: fromV2(r.data) })),

  markRead: (conversationId: string, viewerId: string) =>
    messageApi.post(`/api/messages/${conversationId}/seen`, null, { params: { userId: viewerId } })
      .catch(() => undefined),

  /** Total unread messages addressed to this user across every conversation. */
  unreadCount: (userId: string) =>
    messageApi.get<{ count: number }>('/api/messages/unread-count', { params: { userId } })
      .then(r => Number(r.data?.count ?? 0))
      .catch(() => 0),

  /**
   * Open a Server-Sent Events stream for one conversation. Events arrive in
   * real time; consumers handle two named types:
   *   - "message": payload is a {@link ChatMessage}
   *   - "seen":    payload is { conversationId, viewerId, at }
   *
   * Returns a cleanup function. Caller is responsible for calling it on unmount.
   */
  openStream(
    conversationId: string,
    handlers: {
      onMessage?: (m: ChatMessage) => void;
      onSeen?: (e: { conversationId: string; viewerId: string; at: string }) => void;
      onError?: (e: Event) => void;
      onOpen?: () => void;
    },
  ): () => void {
    const base = (messageApi.defaults.baseURL ?? '').replace(/\/$/, '');
    // EventSource doesn't carry the axios interceptor's Bearer header; when
    // backend auth is enabled the SSE endpoint must be permitted (it is — see
    // JwtAuthWebFilter PUBLIC_PREFIXES) or the token has to be passed via
    // query string. For the prototype we keep the connection unauthenticated.
    const url = `${base}/api/messages/stream/${encodeURIComponent(conversationId)}`;
    const es = new EventSource(url);

    if (handlers.onOpen) es.addEventListener('open', () => handlers.onOpen!());

    es.addEventListener('message', (raw) => {
      try {
        const data = JSON.parse((raw as MessageEvent).data);
        const msg: ChatMessage = {
          id: data.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          status: data.status,
          sentAt: data.createdAt ?? data.sentAt,
          seenAt: data.seenAt,
        };
        handlers.onMessage?.(msg);
      } catch (e) {
        console.warn('[chat sse] bad message payload', e);
      }
    });

    es.addEventListener('seen', (raw) => {
      try {
        const data = JSON.parse((raw as MessageEvent).data);
        handlers.onSeen?.(data);
      } catch (e) {
        console.warn('[chat sse] bad seen payload', e);
      }
    });

    es.addEventListener('error', (e) => {
      handlers.onError?.(e);
    });

    return () => es.close();
  },
};
