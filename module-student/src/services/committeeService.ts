import { committeeApi } from '../lib/apiClient';

export interface CommitteeTeacher {
  id: string;
  committeeId: string;
  teacherId: string;
  role: string;
  assignedAt?: string;
}

export interface Committee {
  id: string;
  name: string;
  stageType?: string;
  status: string;
}

export interface CommitteeStudent {
  id: string;
  committeeId: string;
  studentId: string;
  assignedAt?: string;
}

const ROLE_LABEL: Record<string, string> = {
  HEAD: 'Ахлах',
  SECRETARY: 'Нарийн бичиг',
  MEMBER: 'Гишүүн',
  EXTERNAL_EXPERT: 'Зочин шүүгч',
};

export const committeeService = {
  getCommittees: () =>
    committeeApi.get<Committee[]>('/api/committees')
      .catch(() => ({ data: [] as Committee[] })),

  getMyCommittees: (studentId: string) =>
    committeeApi.get<CommitteeStudent[]>(`/api/committees/by-student/${studentId}`)
      .catch(() => ({ data: [] as CommitteeStudent[] })),

  getMembers: (committeeId: string) =>
    committeeApi.get<CommitteeTeacher[]>('/api/committee-teachers', { params: { committeeId } })
      .catch(() => ({ data: [] as CommitteeTeacher[] })),

  getRoleLabel: (role: string) => ROLE_LABEL[role] || role,
};
