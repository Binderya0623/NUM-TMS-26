/**
 * chatService.ts — message_service v2 adapter
 *
 * Old: thesis_service `/api/chat/{thesisId}/messages` — messages keyed by
 *      `thesisId`, with senderType (STUDENT/TEACHER), no receiver.
 * New: message_service `/api/messages/{conversationId}` — messages keyed by
 *      a `conversationId` (we use thesisId as the conversation id), with
 *      explicit `receiverId`.
 *
 * The new API requires a `receiverId`. Callers that don't pass one will
 * trigger a console.warn and the call will likely 400 from the backend.
 * Callers (TeacherMessages / StudentMessages) should be updated to pass the
 * counterpart id (student id from teacher's side, supervisor id from student's).
 */
import { messageApi } from '../lib/apiClient';

export interface ChatMessage {
  id: number | string;
  thesisId: string;        // = conversationId in v2
  senderId: string;
  senderType: string;      // legacy "STUDENT" | "TEACHER" — derived from sender role
  content: string;
  read?: boolean;
  sentAt?: string;
  // v2-only fields (also set, for callers that want them)
  conversationId?: string;
  receiverId?: string;
  status?: string;
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

const fromV2 = (m: MessageResponse, fallbackThesisId: string): ChatMessage => ({
  id: m.id,
  thesisId: m.conversationId ?? fallbackThesisId,
  senderId: m.senderId,
  senderType: '',          // sender role no longer in payload — set by caller if needed
  content: m.content,
  sentAt: m.createdAt,
  read: m.status === 'SEEN',
  conversationId: m.conversationId,
  receiverId: m.receiverId,
  status: m.status,
  seenAt: m.seenAt,
});

const warn = (msg: string) => console.warn(`[chatService v2-adapter] ${msg}`);

export const chatService = {
  getMessages: (thesisId: string) =>
    messageApi.get<MessageResponse[]>(`/api/messages/${thesisId}`)
      .then(r => ({ data: r.data.map(m => fromV2(m, thesisId)) }))
      .catch(() => ({ data: [] as ChatMessage[] })),

  /**
   * Send a message in a conversation.
   *
   * `receiverId` is required by v2. Callers that omit it trigger a warning
   * and the backend will reject with 400.
   */
  sendMessage: (thesisId: string, senderId: string, senderRole: string, content: string, receiverId?: string) => {
    if (!receiverId) {
      warn(`sendMessage to thesis ${thesisId} missing receiverId — v2 message_service will reject this. ` +
           `Update caller to pass the counterpart user id (senderRole=${senderRole}).`);
    }
    return messageApi.post<MessageResponse>('/api/messages', {
      conversationId: thesisId,
      senderId,
      receiverId: receiverId ?? '',
      content,
    }).then(r => ({ data: fromV2(r.data, thesisId) }));
  },

  markRead: (thesisId: string, readerId: string) =>
    messageApi.post(`/api/messages/${thesisId}/seen`, null, { params: { userId: readerId } }),
};
