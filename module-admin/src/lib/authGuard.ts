/**
 * authGuard.ts — Микрофронтэндийн нэвтрэлт болон дүрийн хамгаалалт
 *
 * Архитектурын тэмдэглэл:
 * - Нэвтрэлтийн мэдээлэл localStorage-д хадгалагддаг (module-auth тохируулна)
 * - Дүр тус бүрийн модуль mount хийхдээ энэ функцийг дуудна
 * - Нэвтрэлт байхгүй → login.xhtml руу redirect
 * - Буруу дүр → өөрийн дүрийн хуудас руу redirect
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

/** localStorage-аас нэвтэрсэн хэрэглэгчийг унших */
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

/** Нэвтрэлт болон дүрийг шалгаж, шаардлагатай бол redirect хийнэ */
export function guardRoute(requiredRole: UserRole): StoredUser | null {
  const user = getStoredUser();

  // Нэвтрээгүй бол login хуудас руу
  if (!user) {
    window.location.replace('/login.xhtml');
    return null;
  }

  // Дүр буруу бол өөрийн хуудас руу
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

/** Гарах — localStorage цэвэрлэж login руу шилжих */
export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  window.location.replace('/login.xhtml');
}
