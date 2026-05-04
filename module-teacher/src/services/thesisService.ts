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
  updatedAt?: string;
}

export interface ReportFile {
  id: string;
  reportId: string;
  originalFilename: string;
  storedPath: string;
  mimeType?: string;
  uploadedAt?: string;
}

export const thesisService = {
  getThesisByStudent: (studentId: string) =>
    thesisApi.get<{ id: string; title?: string; studentId: string; supervisorId?: string; status?: string } | null>(
      '/api/theses', { params: { studentId } }
    ).catch(() => ({ data: null })),

  getReports: (params?: { thesisId?: string; studentId?: string }) =>
    thesisApi.get<ThesisReport[]>('/api/thesis-reports', { params }),

  getReportFiles: (reportId: string) =>
    thesisApi.get<ReportFile[]>(`/api/thesis-reports/${reportId}/files`),

  reviewReport: (reportId: string, reviewedBy: string, decision: string, notes?: string) =>
    thesisApi.patch<ThesisReport>(`/api/thesis-reports/${reportId}/review`, { reviewedBy, decision, notes }),

  downloadFile: (fileId: string) =>
    thesisApi.get(`/api/thesis-reports/files/${fileId}/download`, { responseType: 'blob' }),
};
