import { thesisApi } from '../lib/apiClient';

export interface ThesisReport {
  id: string;
  thesisId: string;
  studentId: string;
  defenseSessionId?: string;
  reportType: string;
  submissionNumber: number;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  supervisorNotes?: string;
  submittedAt?: string;
}

export const thesisReportService = {
  getReports: (params?: { thesisId?: string; studentId?: string; status?: string }) =>
    thesisApi.get<ThesisReport[]>('/api/thesis-reports', { params }),
};
