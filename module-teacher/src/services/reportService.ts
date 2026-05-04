import { reportApi } from '../lib/apiClient';

export interface AcademicReport {
  id: string;
  departmentId?: string;
  academicYear?: string;
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  averageScore?: number;
  generatedAt?: string;
  generatedBy?: string;
}

export const reportService = {
  getAcademicReports: (params?: { departmentId?: string; academicYear?: string }) =>
    reportApi.get<AcademicReport[]>('/api/academic-reports', { params })
      .catch(() => ({ data: [] as AcademicReport[] })),

  getAcademicReport: (id: string) =>
    reportApi.get<AcademicReport>(`/api/academic-reports/${id}`)
      .catch(() => ({ data: null as unknown as AcademicReport })),

  generateAcademicReport: (params?: { departmentId?: string; academicYear?: string }) =>
    reportApi.post<AcademicReport>('/api/academic-reports/generate', null, { params }),
};
