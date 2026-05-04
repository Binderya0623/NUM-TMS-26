/**
 * authGuard.ts — Микрофронтэндийн нэвтрэлт болон дүрийн хамгаалалт
 * (module-admin/src/lib/authGuard.ts-тэй ижил — микрофронтэнд тус бүр бие даасан)
 */
export type UserRole = 'admin' | 'teacher' | 'student';

export interface StoredUser {
  username: string;
  displayName: string;
  role: UserRole;
  userId?: string;
  systemRole?: string;
}

const STORAGE_KEY = 'mauth_current_user';

export function getStoredUser(): StoredUser | null {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function guardRoute(requiredRole: UserRole): StoredUser | null {
  const user = getStoredUser();

  if (!user) {
    window.location.replace('/login.xhtml');
    return null;
  }

  if (user.role !== requiredRole) {
    const redirectMap: Record<UserRole, string> = {
      admin: '/admin.xhtml',
      teacher: '/teacher.xhtml',
      student: '/student.xhtml',
    };
    window.location.replace(redirectMap[user.role]);
    return null;
  }

  return user;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  window.location.replace('/login.xhtml');
}
