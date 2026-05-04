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

export const planService = {
  getPlans: (params?: { supervisorId?: string; studentId?: string; status?: string }) =>
    topicApi.get<Plan[]>('/api/v2/plans', { params }),

  getPlanById: (id: number) =>
    topicApi.get<Plan>(`/api/v2/plans/${id}`),
};
