import { thesisApi } from '../lib/apiClient';

export interface ThesisReport {
  id: number;
  thesisId?: string;
  studentId: string;
  supervisorId?: string;
  reportType: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  status: string;
  reviewComment?: string;
  supervisorNotes?: string;
  reviewedBy?: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface ThesisInfo {
  id: string;
  title?: string;
  studentId: string;
  supervisorId?: string;
  departmentId?: string;
  status?: string;
  progress?: number;
  submissionDate?: string;
  createdAt?: string;
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
  getMyThesis: (studentId: string) =>
    thesisApi.get<ThesisInfo>('/api/theses', { params: { studentId } })
      .catch(() => ({ data: null as unknown as ThesisInfo })),

  getMyReports: (studentId: string) =>
    thesisApi.get<ThesisReport[]>('/api/thesis-reports', { params: { studentId } }),

  getReportBySession: (studentId: string, defenseSessionId: string) =>
    thesisApi.get<ThesisReport[]>('/api/thesis-reports', { params: { studentId, defenseSessionId } })
      .catch(() => ({ data: [] as ThesisReport[] })),

  getReportFiles: (reportId: string) =>
    thesisApi.get<ReportFile[]>(`/api/thesis-reports/${reportId}/files`),

  downloadFile: (fileId: string) =>
    thesisApi.get(`/api/thesis-reports/files/${fileId}/download`, { responseType: 'blob' }),

  submitReport: (formData: FormData) =>
    thesisApi.post<ThesisReport>('/api/thesis-reports', formData),
};
