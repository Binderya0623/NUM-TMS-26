import { committeeApi } from '../lib/apiClient';

export interface Committee {
  id: string;
  name: string;
  departmentId?: string;
  stageType?: string;
  status: string;
  createdAt?: string;
  closedAt?: string;
}

export interface CommitteeAssignment {
  id: string;
  committeeId: string;
  teacherId: string;
  role: string;
  assignedAt?: string;
}

export interface CommitteeStudent {
  id: string;
  committeeId: string;
  studentId: string;
}

export interface ReviewerAssignment {
  id: string;
  committeeId: string;
  defenseSessionId: string;
  studentId: string;
  reviewerId: string;
  assignedBy?: string;
  assignedAt?: string;
}

export const committeeService = {
  getMyAssignments: (teacherId: string) =>
    committeeApi.get<CommitteeAssignment[]>('/api/committee-teachers', { params: { teacherId } }),

  getById: (id: string) =>
    committeeApi.get<Committee>(`/api/committees/${id}`),

  closeCommittee: (id: string) =>
    committeeApi.patch<Committee>(`/api/committees/${id}/close`),

  getAll: () =>
    committeeApi.get<Committee[]>('/api/committees'),

  getStudents: (committeeId: string) =>
    committeeApi.get<CommitteeStudent[]>(`/api/committees/${committeeId}/students`),

  getMembers: (committeeId: string) =>
    committeeApi.get<CommitteeAssignment[]>('/api/committee-teachers', { params: { committeeId } }),

  getReviewerAssignments: (params: { committeeId?: string; defenseSessionId?: string }) =>
    committeeApi.get<ReviewerAssignment[]>('/api/reviewer-assignments', { params }),

  assignReviewer: (body: {
    committeeId: string;
    defenseSessionId: string;
    studentId: string;
    reviewerId: string;
    assignedBy: string;
  }) => committeeApi.post<ReviewerAssignment>('/api/reviewer-assignments', body),

  deleteReviewerAssignment: (id: string) =>
    committeeApi.delete(`/api/reviewer-assignments/${id}`),
};
