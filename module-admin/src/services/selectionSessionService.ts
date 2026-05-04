import { topicApi } from '../lib/apiClient';

export interface SelectionSession {
  id: number;
  departmentId?: number;
  academicYear?: string;
  semester?: string;
  durationDays?: number;
  startDate?: string;
  endDate?: string;
  status: string;
  createdBy?: string;
  closedBy?: string;
  closedAt?: string;
  createdAt?: string;
}

export const selectionSessionService = {
  listSessions: (params?: { status?: string }) =>
    topicApi.get<SelectionSession[]>('/api/v2/selection-sessions', { params }),

  getActive: () =>
    topicApi.get<SelectionSession>('/api/v2/selection-sessions/active').catch(() => ({ data: null })),

  createSession: (body: {
    academicYear?: string;
    semester?: string;
    durationDays?: number;
    createdBy?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    topicApi.post<SelectionSession>('/api/v2/selection-sessions', body),

  openSession: (id: number) =>
    topicApi.patch<SelectionSession>(`/api/v2/selection-sessions/${id}/open`, { actorId: 'admin' }),

  closeSession: (id: number) =>
    topicApi.patch<SelectionSession>(`/api/v2/selection-sessions/${id}/close`, { actorId: 'admin' }),
};
