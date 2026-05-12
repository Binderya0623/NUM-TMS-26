import { userApi } from '../lib/apiClient';

export interface UserRecord {
  id: string;
  username: string;
  displayName: string;
  name: string;
  email: string;
  systemRole: string;
  departmentId?: string;
  department?: string;
  programId?: string;
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
  const full = [firstName, lastName].filter(Boolean).join(' ') || raw.email || raw.id;
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
  getStudents: (departmentId?: string) =>
    userApi.get<any[]>('/api/users/students', { params: departmentId ? { departmentId } : {} })
      .then(res => ({ ...res, data: res.data.map(normalize) })),

  getTeachers: (departmentId?: string) =>
    userApi.get<any[]>('/api/users/teachers', { params: departmentId ? { departmentId } : {} })
      .then(res => ({ ...res, data: res.data.map(normalize) })),

  createTeacher: (body: { firstName: string; lastName: string; email: string; departmentId: string; position: string }) =>
    userApi.post<any>('/api/users/teachers', body).then(res => ({ ...res, data: normalize(res.data) })),

  getExternalExperts: (departmentId?: string) =>
    userApi.get<any[]>('/api/users/external-experts', { params: departmentId ? { departmentId } : {} })
      .then(res => ({ ...res, data: res.data.map(normalize) })),

  createExternalExpert: (body: { firstName: string; lastName: string; email: string; password?: string; departmentId?: string; organization?: string; expertise?: string }) =>
    userApi.post<any>('/api/users/external-experts', body).then(res => ({ ...res, data: normalize(res.data) })),

  updateExternalExpertProfile: (userId: string, body: { organization?: string; expertise?: string }) =>
    userApi.put<any>(`/api/users/external-experts/${userId}/profile`, body)
      .then(res => ({ ...res, data: normalize(res.data) })),

  getDepartments: () =>
    userApi.get<{ id: string; departmentName: string }[]>('/api/users/departments'),
};
