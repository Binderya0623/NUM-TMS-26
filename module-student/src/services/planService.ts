import { topicApi } from '../lib/apiClient';

export interface Plan {
  id: number;
  thesisId?: string;
  studentId: string;
  supervisorId?: string;
  sessionId?: number;
  title?: string;
  status: string;
  revisionCount?: number;
  submittedAt?: string;
  createdAt?: string;
}

export interface PlanWeek {
  id: number;
  planId: number;
  weekNumber: number;
  description?: string;
  plannedTasks?: string;
  completedTasks?: string;
  completionRate?: number;
}

export interface PlanReview {
  id: number;
  planId: number;
  reviewedBy: string;
  decision: string;
  comment?: string;
  reviewedAt?: string;
}

export const planService = {
  getMyPlan: (studentId: string) =>
    topicApi.get<Plan[]>('/api/v2/plans', { params: { studentId } }),

  /**
   * Backend requires a topicRequestId pointing to an APPROVED row + the
   * topicId/supervisorId from that row. Caller must look it up first
   * (typically via topicService.getMyRequests + finding status='APPROVED').
   */
  createPlan: (body: {
    topicRequestId: number;
    topicId: number;
    studentId: string;
    supervisorId: string;
    weeks?: Array<{ weekNumber: number; task: string }>;
  }) => topicApi.post<Plan>('/api/v2/plans', body),

  submitPlan: (planId: number) =>
    topicApi.post<Plan>(`/api/v2/plans/${planId}/submit`),

  getPlanWeeks: (planId: number) =>
    topicApi.get<PlanWeek[]>(`/api/v2/plans/${planId}/weeks`),

  upsertWeek: (planId: number, body: Partial<PlanWeek>) =>
    topicApi.post<PlanWeek>(`/api/v2/plans/${planId}/weeks`, body),

  updateWeek: (planId: number, weekId: number, body: Partial<PlanWeek>) =>
    topicApi.put<PlanWeek>(`/api/v2/plans/${planId}/weeks/${weekId}`, body),

  deleteWeek: (planId: number, weekId: number) =>
    topicApi.delete(`/api/v2/plans/${planId}/weeks/${weekId}`),

  getPlanReviews: (planId: number) =>
    topicApi.get<PlanReview[]>(`/api/v2/plans/${planId}/reviews`),
};
