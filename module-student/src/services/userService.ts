import { userApi } from '../lib/apiClient';

export interface UserRecord {
  id: string;
  displayName: string;
  name: string;
  email: string;
  systemRole: string;
  departmentId?: string;
  department?: string;
  programId?: string;
  username?: string;
  studentId?: string;
  sisId?: string;
  firstName?: string;
  lastName?: string;
}

function firstHumanId(...values: Array<unknown>): string {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (const value of values) {
    const text = String(value || '').trim();
    if (text && !uuidPattern.test(text) && !text.includes('@')) return text;
  }
  return '';
}

function normalize(raw: any): UserRecord {
  const firstName = raw.firstName || '';
  const lastName = raw.lastName || '';
  const full = [firstName, lastName].filter(Boolean).join(' ') || raw.email || '';
  const sisId = firstHumanId(raw.sisiId, raw.sisId, raw.sisiID, raw.sisID, raw.studentId, raw.username);
  return {
    ...raw,
    displayName: full,
    name: full,
    department: raw.departmentId,
    username: sisId || raw.username || raw.id,
    studentId: sisId,
    sisId,
    programId: raw.programId || raw.major || '',
  };
}

export const userService = {
  getTeachers: (departmentId?: string) =>
    userApi.get<any[]>('/api/users/teachers', { params: departmentId ? { departmentId } : {} })
      .then(res => ({ ...res, data: res.data.map(normalize) })),

  getExternalExperts: (departmentId?: string) =>
    userApi.get<any[]>('/api/users/external-experts', { params: departmentId ? { departmentId } : {} })
      .then(res => ({ ...res, data: res.data.map(normalize) })),

  getById: (id: string) =>
    userApi.get<any>(`/api/users/${id}`)
      .then(res => ({ ...res, data: normalize(res.data) }))
      .catch(() => ({ data: null as unknown as UserRecord })),

  getDepartments: () =>
    userApi.get<{ id: string; departmentName: string }[]>('/api/users/departments'),
};
