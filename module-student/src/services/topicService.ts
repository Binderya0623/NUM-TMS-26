import { topicApi } from '../lib/apiClient';

export interface Topic {
  id: number;
  title: string;
  titleEn?: string;
  description?: string;
  researchGoal?: string;
  createdById: string;
  createdByType: string;
  supervisorId?: string;
  departmentId?: string;
  status: string;
  visibility: string;
  keywords?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export interface TopicRequest {
  id: number;
  topicId: number;
  requestedById: string;
  sessionId?: number;
  status: string;
  motivation?: string;
  rejectionReason?: string;
  requestedAt?: string;
}

export const topicService = {
  getPublicTopics: (params?: { sessionId?: number }) =>
    topicApi.get<Topic[]>('/api/v2/topics', { params: { visibility: 'PUBLIC', status: 'APPROVED', ...params } }),

  getMyRequests: (requestedById: string) =>
    topicApi.get<TopicRequest[]>('/api/v2/topic-requests', { params: { requestedById } }),

  // All approved requests across the cohort — used to grey out topics that
  // another student has already locked in. Backend also accepts status as a
  // filter so we don't pull rejections we'd discard anyway.
  getApprovedRequests: () =>
    topicApi.get<TopicRequest[]>('/api/v2/topic-requests', { params: { status: 'APPROVED' } })
      .catch(() => ({ data: [] as TopicRequest[] })),

  submitRequest: (topicId: number, requestedById: string, sessionId?: number, motivation?: string) =>
    topicApi.post<TopicRequest>('/api/v2/topic-requests', { topicId, requestedById, sessionId, motivation }),

  submitProposal: (body: {
    title: string; titleEn: string; description: string; researchGoal: string;
    keywords?: string; createdById: string; supervisorId?: string;
  }) =>
    topicApi.post<Topic>('/api/v2/topics', { ...body, createdByType: 'STUDENT' }),

  updateProposal: (id: number, body: Partial<Topic>) =>
    topicApi.put<Topic>(`/api/v2/topics/${id}`, body),

  getMyProposals: (createdById: string) =>
    topicApi.get<Topic[]>('/api/v2/topics', { params: { createdById, createdByType: 'STUDENT' } }),

  getActiveSession: () =>
    topicApi.get('/api/v2/selection-sessions/active').catch(() => ({ data: null })),
};
