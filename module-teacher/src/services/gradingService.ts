import { gradingApi } from '../lib/apiClient';

export interface Grade {
  id: string;
  thesisId: string;
  studentId?: string;
  workflowId?: string;
  totalScore?: number;
  letter?: string;
}

export interface Resolution {
  id: string;
  workflowId: string;
  status?: string;
  resolvedAt?: string;
}

export const gradingService = {
  getThesisGrade: (thesisId: string) =>
    gradingApi.get<Grade>(`/api/grades/thesis/${thesisId}`)
      .catch(() => ({ data: null as unknown as Grade })),

  getWorkflowGrades: (workflowId: string) =>
    gradingApi.get<Grade[]>(`/api/grades/workflow/${workflowId}`)
      .catch(() => ({ data: [] as Grade[] })),

  getWorkflowResolution: (workflowId: string) =>
    gradingApi.get<Resolution>(`/api/grades/resolutions/workflow/${workflowId}`)
      .catch(() => ({ data: null as unknown as Resolution })),
};
