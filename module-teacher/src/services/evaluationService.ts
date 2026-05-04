import { evaluationApi } from '../lib/apiClient';

export interface DefenseGrade {
  id: string;
  defenseSessionId: string;
  thesisId: string;
  studentId: string;
  evaluatorId: string;
  evaluatorRole: string;
  points: number;
  maxPoints: number;
  comment?: string;
  isSubmitted?: boolean;
  submittedAt?: string;
}

export interface ReviewDocument {
  id: string;
  defenseSessionId: string;
  thesisId: string;
  studentId: string;
  reviewerId: string;
  originalFilename: string;
  storedPath?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface SecretarySubmission {
  id: string;
  defenseSessionId: string;
  committeeId: string;
  studentId: string;
  secretaryId: string;
  averageScore: number;
  gradedCount: number;
  submittedAt?: string;
}

export type FinalGrade = FinalGradeConfirmation;

export interface FinalGradeConfirmation {
  id: string;
  studentId: string;
  thesisId?: string;
  committeeId?: string;
  confirmedBy?: string;
  progress1Score?: number;
  progress2Score?: number;
  preliminaryScore?: number;
  finalCommitteeScore?: number;
  reviewerScore?: number;
  totalScore?: number;
  finalScore?: number;
  averageScore?: number;
  gradeLetter?: string;
  passFail?: string;
  headNotes?: string;
  confirmedAt?: string;
  isPublished?: boolean;
  publishedAt?: string;
}

export const evaluationService = {
  // ── Defense grades ────────────────────────────────────────────────────
  getDefenseGrades: (params: {
    defenseSessionId?: string;
    studentId?: string;
    evaluatorId?: string;
  }) =>
    evaluationApi.get<DefenseGrade[]>('/api/defense-grades', { params })
      .catch(() => ({ data: [] as DefenseGrade[] })),

  getMyGrade: (params: { defenseSessionId: string; thesisId: string; evaluatorId: string }) =>
    evaluationApi.get<DefenseGrade>('/api/defense-grades/my', { params })
      .catch(() => ({ data: null as unknown as DefenseGrade })),

  saveGrade: (body: {
    defenseSessionId: string;
    thesisId: string;
    studentId: string;
    evaluatorId: string;
    evaluatorRole: string;
    points: number;
    maxPoints: number;
    comment?: string;
  }) => evaluationApi.post<DefenseGrade>('/api/defense-grades', body),

  submitGrade: (id: string) =>
    evaluationApi.post<DefenseGrade>(`/api/defense-grades/${id}/submit`),

  // Student-facing alias
  getMyDefenseGrades: (studentId: string) =>
    evaluationApi.get<DefenseGrade[]>('/api/defense-grades', { params: { studentId } })
      .catch(() => ({ data: [] as DefenseGrade[] })),

  // ── Secretary submissions ─────────────────────────────────────────────
  getSecretarySubmissions: (
    arg: string | { studentId?: string; defenseSessionId?: string; committeeId?: string }
  ) => {
    const params = typeof arg === 'string' ? { studentId: arg } : arg;
    return evaluationApi.get<SecretarySubmission[]>('/api/secretary-submissions', { params })
      .catch(() => ({ data: [] as SecretarySubmission[] }));
  },

  getSessionSubmissions: (defenseSessionId: string) =>
    evaluationApi.get<SecretarySubmission[]>('/api/secretary-submissions', {
      params: { defenseSessionId },
    }).catch(() => ({ data: [] as SecretarySubmission[] })),

  getSecretarySubmissionByStudent: (defenseSessionId: string, studentId: string) =>
    evaluationApi.get<SecretarySubmission>('/api/secretary-submissions/by-session-student', {
      params: { defenseSessionId, studentId },
    }).catch(() => ({ data: null as unknown as SecretarySubmission })),

  sendAverageScore: (body: {
    defenseSessionId: string;
    committeeId: string;
    studentId: string;
    secretaryId: string;
  }) => evaluationApi.post<SecretarySubmission>('/api/secretary-submissions', body),

  // ── Review documents ──────────────────────────────────────────────────
  getReviewDocuments: (params: {
    defenseSessionId?: string;
    reviewerId?: string;
    studentId?: string;
  }) =>
    evaluationApi.get<ReviewDocument[]>('/api/review-documents', { params })
      .catch(() => ({ data: [] as ReviewDocument[] })),

  getMyReviewDocuments: (studentId: string) =>
    evaluationApi.get<ReviewDocument[]>('/api/review-documents', { params: { studentId } })
      .catch(() => ({ data: [] as ReviewDocument[] })),

  uploadReviewDocument: (formData: FormData) =>
    evaluationApi.post<ReviewDocument>('/api/review-documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  reviewDocumentDownloadUrl: (id: string) =>
    `${evaluationApi.defaults.baseURL ?? ''}/api/review-documents/${id}/download`,

  // ── Final grades ──────────────────────────────────────────────────────
  getFinalGrades: (params?: { committeeId?: string; studentId?: string; isPublished?: boolean }) =>
    evaluationApi.get<FinalGrade[]>('/api/final-grades', { params })
      .catch(() => ({ data: [] as FinalGrade[] })),

  getMyFinalGrade: (studentId: string) =>
    evaluationApi.get<FinalGradeConfirmation>(`/api/final-grades/by-student/${studentId}`)
      .then(r => ({ data: r.data }))
      .catch(() => ({ data: null as unknown as FinalGradeConfirmation })),

  confirmFinalGrade: (body: {
    studentId: string;
    thesisId?: string;
    committeeId?: string;
    confirmedBy?: string;
    progress1Score?: number;
    progress2Score?: number;
    preliminaryScore?: number;
    finalCommitteeScore?: number;
    reviewerScore?: number;
    gradeLetter?: string;
    passFail?: string;
    headNotes?: string;
  }) => evaluationApi.post<FinalGradeConfirmation>('/api/final-grades', body),

  publishGrade: (id: string) =>
    evaluationApi.patch<FinalGradeConfirmation>(`/api/final-grades/${id}/publish`),
};
