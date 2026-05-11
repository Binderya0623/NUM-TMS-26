import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Backend bases — overridable at build time via Vite env vars so the same
// bundle can be deployed to staging/prod without code changes.
const AUTH_API = (import.meta as any).env?.VITE_API_AUTH ?? 'http://localhost:8887';
const USER_API = (import.meta as any).env?.VITE_API_USER ?? 'http://localhost:8086';

export type UserRole = 'admin' | 'teacher' | 'student';

export const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  admin:   '/admin.xhtml',
  teacher: '/teacher.xhtml',
  student: '/student.xhtml',
};

interface AuthUser {
  username: string;
  displayName: string;
  role: UserRole;
  systemRole?: string;
  userId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'mauth_current_user';

function mapRole(roles: string[]): UserRole {
  if (!roles || roles.length === 0) return 'student';
  const r = roles[0].toUpperCase();
  if (r.includes('ADMIN'))           return 'admin';
  if (r.includes('EXTERNAL_EXPERT')) return 'teacher';
  if (r.includes('TEACHER'))         return 'teacher';
  return 'student';
}

async function buildAuthUser(data: any, fallbackId: string): Promise<AuthUser> {
  const role = mapRole(data.roles ?? []);
  const raw = (data.roles ?? [])[0]?.toUpperCase() ?? '';
  const systemRole = raw.startsWith('ROLE_') ? raw.slice(5) : raw;

  const resolvedSisiId = data.sisiId ?? fallbackId;
  let displayName = resolvedSisiId;
  let userId = '';
  try {
    const emailCandidates = resolvedSisiId.includes('@')
      ? [resolvedSisiId]
      : [`${resolvedSisiId}@stud.num.edu.mn`, `${resolvedSisiId}@num.edu.mn`];
    for (const email of emailCandidates) {
      const userRes = await fetch(`${USER_API}/api/users/by-email?email=${encodeURIComponent(email)}`);
      if (userRes.ok) {
        const profile = await userRes.json();
        const first = profile.firstName ?? '';
        const last  = profile.lastName  ?? '';
        if (first || last) displayName = `${first} ${last}`.trim();
        userId = profile.id ?? '';
        break;
      }
    }
  } catch {
    // user_service unreachable — keep sisiId as the displayed name
  }
  return { username: resolvedSisiId, displayName, role, systemRole, userId };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    // Login is case-insensitive: backend stores sisiId in lowercase, so
    // normalise here once at the entry point.
    const sisiId = username.trim().toLowerCase();
    let res: Response;
    try {
      res = await fetch(`${AUTH_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sisiId, password }),
      });
    } catch {
      return { success: false, error: 'Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.' };
    }

    if (!res.ok) {
      return { success: false, error: 'Нэвтрэх нэр эсвэл нууц үг буруу байна' };
    }

    const data = await res.json();
    localStorage.setItem('mauth_token', data.token ?? '');
    const userData = await buildAuthUser(data, sisiId);

    setUser(userData);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(userData));

    window.location.href = ROLE_REDIRECT_MAP[userData.role];
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = '/login.xhtml';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
