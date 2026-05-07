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
  reviewedAt?: string;
  reviewedBy?: string;
}

export const topicService = {
  createTopic: (body: {
    title: string; titleEn: string; description: string; researchGoal: string;
    keywords?: string; createdById: string; departmentId?: string;
    visibility?: string; status?: string;
  }) =>
    topicApi.post<Topic>('/api/v2/topics', {
      ...body,
      createdByType: 'TEACHER',
      visibility: body.visibility || 'PUBLIC',
      status: body.status || 'DRAFT',
    }),

  getTopics: (params?: { status?: string; departmentId?: string }) =>
    topicApi.get<Topic[]>('/api/v2/topics', { params }),

  getTopicRequests: (params?: { topicId?: number; requestedById?: string; status?: string }) =>
    topicApi.get<TopicRequest[]>('/api/v2/topic-requests', { params }),

  approveRequest: (requestId: number, teacherId: string) =>
    topicApi.post<TopicRequest>(`/api/v2/topic-requests/${requestId}/approve`, { teacherId }),

  rejectRequest: (requestId: number, teacherId: string, rejectionReason: string) =>
    topicApi.post<TopicRequest>(`/api/v2/topic-requests/${requestId}/reject`, { teacherId, rejectionReason }),

  getStudentProposals: (supervisorId: string) =>
    topicApi.get<Topic[]>('/api/v2/topics', { params: { createdByType: 'STUDENT', supervisorId } }),

  submitTopicForDeptReview: (topicId: number, submittedBy: string) =>
    topicApi.post<Topic>(`/api/v2/topics/${topicId}/submit`, { submittedBy }),

  /**
   * Teacher rejects a student-proposed topic.
   *
   * Backend has no separate "teacher reject" endpoint, but dept-decision
   * accepts REJECT from any non-terminal status. Result: status = REJECTED
   * with the supplied reason — exactly what the UX needs.
   */
  rejectProposal: (topicId: number, teacherId: string, rejectionReason: string) =>
    topicApi.post<Topic>(`/api/v2/topics/${topicId}/dept-decision`, {
      decision: 'REJECT',
      reviewedBy: teacherId,
      rejectionReason,
    }),
};
