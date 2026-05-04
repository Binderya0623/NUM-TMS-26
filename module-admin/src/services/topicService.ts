import { topicApi } from '../lib/apiClient';

export interface Topic {
  id: number;
  title: string;
  description?: string;
  researchGoal?: string;
  createdById: string;
  createdByType: string;
  supervisorId?: string;
  departmentId?: string;
  programId?: string;
  status: string;
  visibility: string;
  keywords?: string;
  rejectionReason?: string;
  createdAt?: string;
}

export interface TopicDeptDecisionRequest {
  decision: 'APPROVE' | 'REJECT';
  reviewedBy: string;
  rejectionReason?: string;
}

export const topicService = {
  getTopics: (params?: { status?: string; departmentId?: string }) =>
    topicApi.get<Topic[]>('/api/v2/topics', { params }),

  getById: (id: number) =>
    topicApi.get<Topic>(`/api/v2/topics/${id}`),

  deptDecision: (id: number, body: TopicDeptDecisionRequest) =>
    topicApi.post<Topic>(`/api/v2/topics/${id}/dept-decision`, body),
};
