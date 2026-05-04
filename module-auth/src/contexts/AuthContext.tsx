import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockLoginWithStored, mockRegister, UserRole, ROLE_REDIRECT_MAP } from '@/services/mockAuthService';

const AUTH_API  = 'http://localhost:8887';
const USER_API  = 'http://localhost:8086';

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
  register: (username: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
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

async function realLogin(sisiId: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch(`${AUTH_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sisiId: sisiId.trim(), password }),
    });

    if (!res.ok) {
      return { success: false, error: 'Нэвтрэх нэр эсвэл нууц үг буруу байна' };
    }

    const data = await res.json();
    // data: { id, sisiId, roles, token }
    const role = mapRole(data.roles ?? []);
    const raw = (data.roles ?? [])[0]?.toUpperCase() ?? '';
    const systemRole = raw.startsWith('ROLE_') ? raw.slice(5) : raw;

    // Store JWT for downstream API calls
    localStorage.setItem('mauth_token', data.token ?? '');

    // Fetch display name from user_service by email
    // Students: {sisiId}@stud.num.edu.mn, Teachers/Admin: {sisiId}@num.edu.mn
    const resolvedSisiId = data.sisiId ?? sisiId;
    let displayName = resolvedSisiId;
    let userId = '';
    try {
      // Try the sisiId as a bare email first (external experts use full email as sisiId),
      // then fall back to NUM email patterns for internal users.
      const emailCandidates = resolvedSisiId.includes('@')
        ? [resolvedSisiId]
        : [
            `${resolvedSisiId}@stud.num.edu.mn`,
            `${resolvedSisiId}@num.edu.mn`,
          ];
      for (const email of emailCandidates) {
        const userRes = await fetch(`${USER_API}/api/users/by-email?email=${encodeURIComponent(email)}`);
        if (userRes.ok) {
          const userProfile = await userRes.json();
          const first = userProfile.firstName ?? '';
          const last  = userProfile.lastName  ?? '';
          if (first || last) { displayName = `${first} ${last}`.trim(); }
          userId = userProfile.id ?? '';
          break;
        }
      }
    } catch {
      // user_service unavailable — keep sisiId as name
    }

    return {
      success: true,
      user: { username: resolvedSisiId, displayName, role, systemRole, userId },
    };
  } catch {
    // Network error — fall through to mock
    return { success: false, error: '__NETWORK_ERROR__' };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Апп ачааллах үед хадгалагдсан хэрэглэгчийг сэргээнэ
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
    // 1. Try real auth service first
    const realResult = await realLogin(username, password);

    let userData: AuthUser | null = null;

    if (realResult.success && realResult.user) {
      userData = realResult.user;
    } else if (realResult.error === '__NETWORK_ERROR__') {
      // Auth service is down — fall back to mock users
      const mockResult = await mockLoginWithStored(username, password);
      if (mockResult.success && mockResult.user) {
        userData = {
          username: mockResult.user.username,
          displayName: mockResult.user.displayName,
          role: mockResult.user.role,
        };
      } else {
        return { success: false, error: mockResult.error };
      }
    } else {
      return { success: false, error: realResult.error };
    }

    setUser(userData);

    // rememberMe → localStorage, эс бол sessionStorage
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(userData));

    // Дүрд тохирох JSF хуудас руу чиглүүлэх
    const redirectUrl = ROLE_REDIRECT_MAP[userData.role];
    window.location.href = redirectUrl;

    return { success: true };
  };

  const register = async (username: string, password: string, role: UserRole = 'student') => {
    const result = await mockRegister(username, password, role);

    if (result.success) {
      return { success: true };
    }

    return { success: false, error: result.error };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = '/login.xhtml';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
