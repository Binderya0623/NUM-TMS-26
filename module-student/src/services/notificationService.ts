import { notificationApi } from '../lib/apiClient';

/**
 * notificationService — single client for the canonical notification_service.
 * thesis_service.thesis-notifications is gone; everyone goes through here.
 */

export interface Notification {
  id: string;
  userId: string;
  title?: string;
  message: string;
  type?: string;
  status: string;          // 'PENDING' | 'SENT' | 'FAILED' | 'READ'
  thesisId?: string;
  referenceId?: string;
  referenceType?: string;
  isRead?: boolean;
  createdAt?: string;
  sentAt?: string;
}

export interface CreateNotificationBody {
  userId: string;
  title?: string;
  message: string;
  type?: string;           // see backend NotificationType enum; "GENERIC" allowed as catch-all
  thesisId?: string;
  referenceId?: string;
  referenceType?: string;
}

export const notificationService = {
  /** All notifications for a user, newest first. */
  getByUserId: (userId: string, opts?: { unreadOnly?: boolean }) =>
    notificationApi.get<Notification[]>(
      `/api/notifications/user/${encodeURIComponent(userId)}`,
      { params: opts?.unreadOnly ? { unreadOnly: true } : undefined },
    ).catch(() => ({ data: [] as Notification[] })),

  /** Drives the TopHeader bell badge. */
  unreadCount: (userId: string) =>
    notificationApi.get<{ count: number }>(
      `/api/notifications/user/${encodeURIComponent(userId)}/unread-count`,
    ).then(r => Number(r.data?.count ?? 0)).catch(() => 0),

  /** Mark a single notification as read. */
  markRead: (id: string) =>
    notificationApi.patch<Notification>(`/api/notifications/${encodeURIComponent(id)}/read`)
      .catch(() => undefined),

  /** Mark every unread notification for this user as read. */
  markAllRead: (userId: string) =>
    notificationApi.patch(`/api/notifications/user/${encodeURIComponent(userId)}/read-all`)
      .catch(() => undefined),

  /** Used by services that emit notifications synchronously. */
  create: (body: CreateNotificationBody) =>
    notificationApi.post<Notification>('/api/notifications', body),
};
