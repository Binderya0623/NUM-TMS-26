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
  getPlans: (params?: { supervisorId?: string; studentId?: string; status?: string }) =>
    topicApi.get<Plan[]>('/api/v2/plans', { params }),

  getPlanById: (id: number) =>
    topicApi.get<Plan>(`/api/v2/plans/${id}`),

  getPlanWeeks: (planId: number) =>
    topicApi.get<PlanWeek[]>(`/api/v2/plans/${planId}/weeks`),

  getPlanReviews: (planId: number) =>
    topicApi.get<PlanReview[]>(`/api/v2/plans/${planId}/reviews`),

  reviewPlan: (planId: number, body: { reviewedBy: string; decision: string; comment?: string }) =>
    topicApi.post<PlanReview>(`/api/v2/plans/${planId}/review`, {
      supervisorId: body.reviewedBy,
      decision: body.decision,
      feedback: body.comment,
    }),
};
