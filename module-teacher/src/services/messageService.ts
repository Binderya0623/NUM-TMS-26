/**
 * messageService.ts — message_service v2 (port 8089)
 *
 * Pure v2 surface (separate from chatService.ts which preserves the legacy
 * thesis_service /api/chat shape). Use this when you can pass `receiverId`.
 */
import { messageApi } from '../lib/apiClient';

export type MessageStatus = 'SENT' | 'DELIVERED' | 'SEEN';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  seenAt?: string;
}

export const messageService = {
  send: (body: { conversationId: string; senderId: string; receiverId: string; content: string }) =>
    messageApi.post<Message>('/api/messages', body),

  getConversation: (conversationId: string) =>
    messageApi.get<Message[]>(`/api/messages/${conversationId}`)
      .catch(() => ({ data: [] as Message[] })),

  markSeen: (conversationId: string, userId: string) =>
    messageApi.post(`/api/messages/${conversationId}/seen`, null, { params: { userId } }),
};
