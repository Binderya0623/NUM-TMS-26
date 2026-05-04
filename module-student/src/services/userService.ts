import { userApi } from '../lib/apiClient';

export interface UserRecord {
  id: string;
  displayName: string;
  name: string;
  email: string;
  systemRole: string;
  departmentId?: string;
  firstName?: string;
  lastName?: string;
}

function normalize(raw: any): UserRecord {
  const firstName = raw.firstName || '';
  const lastName = raw.lastName || '';
  const full = [firstName, lastName].filter(Boolean).join(' ') || raw.email || raw.id;
  return { ...raw, displayName: full, name: full };
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
