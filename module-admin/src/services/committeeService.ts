import { committeeApi } from '../lib/apiClient';

export interface Committee {
  id: string;
  name: string;
  departmentId?: string;
  stageType?: string;
  status: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  closedAt?: string;
}

export interface CommitteeTeacher {
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

// Role mapping: Mongolian UI labels → backend CommitteeRole enum values
const roleMap: Record<string, string> = {
  'Ахлах': 'HEAD',
  'Нарийн бичиг': 'SECRETARY',
  'Гишүүн': 'MEMBER',
  'Хянагч': 'MEMBER',
  'Зочин шүүгч': 'EXTERNAL_EXPERT',
  // Legacy labels kept for backward compatibility (older committees may still
  // store the old role names in selectedTeachers state during a session).
  'Дарга': 'HEAD',
  'Нарийн бичгийн дарга': 'SECRETARY',
  'Эксперт': 'EXTERNAL_EXPERT',
};

export const committeeService = {
  getCommittees: () =>
    committeeApi.get<Committee[]>('/api/committees'),

  getById: (id: string) =>
    committeeApi.get<Committee>(`/api/committees/${id}`),

  create: (body: { name: string; defenseType?: string; stageType?: string; status?: string; departmentId?: string }) =>
    committeeApi.post<Committee>('/api/committees', {
      name: body.name,
      defenseType: body.defenseType || body.stageType || 'PROGRESS_2',
      departmentId: body.departmentId || '',
    }),

  close: (id: string) =>
    committeeApi.patch<Committee>(`/api/committees/${id}/close`),

  getMembers: (committeeId: string) =>
    committeeApi.get<CommitteeTeacher[]>('/api/committee-teachers', { params: { committeeId } }),

  addMember: (body: { committeeId: string; teacherId: string; role: string }) =>
    committeeApi.post<CommitteeTeacher>('/api/committee-teachers', {
      committeeId: body.committeeId,
      teacherId: body.teacherId,
      role: roleMap[body.role] || body.role.toUpperCase(),
    }),

  removeMember: (assignmentId: string) =>
    committeeApi.delete(`/api/committee-teachers/${assignmentId}`),

  getStudents: (committeeId: string) =>
    committeeApi.get<CommitteeStudent[]>(`/api/committees/${committeeId}/students`).catch(() => ({ data: [] as CommitteeStudent[] })),

  addStudent: (committeeId: string, studentId: string) =>
    committeeApi.post(`/api/committees/${committeeId}/students`, { studentId }),

  removeStudent: (committeeId: string, studentId: string) =>
    committeeApi.delete(`/api/committees/${committeeId}/students/${studentId}`),

  getReviewerAssignments: (params: { committeeId?: string; defenseSessionId?: string }) =>
    committeeApi.get<ReviewerAssignment[]>('/api/reviewer-assignments', { params })
      .catch(() => ({ data: [] as ReviewerAssignment[] })),

  assignReviewer: (body: {
    committeeId: string; defenseSessionId: string;
    studentId: string; reviewerId: string; assignedBy: string;
  }) => committeeApi.post<ReviewerAssignment>('/api/reviewer-assignments', body),

  deleteReviewerAssignment: (id: string) =>
    committeeApi.delete(`/api/reviewer-assignments/${id}`),
};
