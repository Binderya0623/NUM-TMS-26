import { notificationApi } from '../lib/apiClient';

export interface Notification {
  id: string;
  userId: string;
  title?: string;
  message: string;
  type?: string;
  channel?: string;
  status: string;
  createdAt?: string;
  sentAt?: string;
}

export const notificationService = {
  getByUserId: (userId: string) =>
    notificationApi.get<Notification[]>(`/api/notifications/user/${userId}`)
      .catch(() => ({ data: [] as Notification[] })),
};
