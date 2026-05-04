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
  firstName?: string;
  lastName?: string;
}

function normalize(raw: any): UserRecord {
  const firstName = raw.firstName || '';
  const lastName = raw.lastName || '';
  const full = [firstName, lastName].filter(Boolean).join(' ') || raw.email || raw.id;
  const emailPrefix = raw.email?.split('@')[0] || '';
  return {
    ...raw,
    displayName: full,
    name: full,
    department: raw.departmentId,
    username: emailPrefix || raw.username || raw.id,
    studentId: emailPrefix || raw.studentId || '',
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

  getDepartments: () =>
    userApi.get<{ id: string; departmentName: string }[]>('/api/users/departments'),
};
