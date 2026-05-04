// =============================================
// Mock Authentication Service
// PoC зориулалттай — бодит системд API дуудлагаар солигдоно
// =============================================

export type UserRole = 'admin' | 'teacher' | 'student';

export interface MockUser {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
}

export interface AuthResult {
  success: boolean;
  user?: MockUser;
  error?: string;
}

// Mock хэрэглэгчдийн жагсаалт
// Нэвтрэх нэр → Дүр → JSF хуудас руу чиглүүлэгдэнэ
export const MOCK_USERS: MockUser[] = [
  // Legacy demo users (offline fallback)
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    displayName: 'Системийн Администратор',
  },
  {
    username: 'teacher',
    password: 'teacher123',
    role: 'teacher',
    displayName: 'Д. Батбаяр Багш',
  },
  {
    username: 'student',
    password: 'student123',
    role: 'student',
    displayName: 'Б. Болд Оюутан',
  },
  // Real users (offline fallback — same password as in auth_service_db)
  {
    username: 'purevkhand',
    password: 'Num2024!',
    role: 'admin',
    displayName: 'Пүрэвханд Пүрэвдорж',
  },
  {
    username: 'batbayar',
    password: 'Num2024!',
    role: 'teacher',
    displayName: 'Батбаяр Дорж',
  },
  {
    username: 'oyuntsetseg',
    password: 'Num2024!',
    role: 'teacher',
    displayName: 'Оюунцэцэг Нямдорж',
  },
  {
    username: 'munkhjargal',
    password: 'Num2024!',
    role: 'teacher',
    displayName: 'Мөнхжаргал Батсүх',
  },
  {
    username: 'enkhtuya',
    password: 'Num2024!',
    role: 'teacher',
    displayName: 'Энхтуяа Гантулга',
  },
  {
    username: 'lkhamragchaa',
    password: 'Num2024!',
    role: 'teacher',
    displayName: 'Лхамрагчаа Цэрэндорж',
  },
  {
    username: '22b1num0001',
    password: 'Num2024!',
    role: 'student',
    displayName: 'Болд Батбаяр',
  },
  {
    username: '22b1num0002',
    password: 'Num2024!',
    role: 'student',
    displayName: 'Сарнай Дорж',
  },
  {
    username: '22b1num0003',
    password: 'Num2024!',
    role: 'student',
    displayName: 'Энхбаяр Гантулга',
  },
  {
    username: '22b1num0004',
    password: 'Num2024!',
    role: 'student',
    displayName: 'Нарантуяа Батсүх',
  },
  {
    username: '22b1num0005',
    password: 'Num2024!',
    role: 'student',
    displayName: 'Мөнхбаяр Цэрэндорж',
  },
];

// Дүрд тохирох JSF хуудасны URL
export const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  admin: '/admin.xhtml',
  teacher: '/teacher.xhtml',
  student: '/student.xhtml',
};

/**
 * Mock нэвтрэх үйлдэл
 * Бодит API дуудлагыг дуурайж 300ms хоцрогдол симуляць хийнэ
 */
export async function mockLogin(username: string, password: string): Promise<AuthResult> {
  // API дуудлагын хоцрогдолыг дуурайх
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = MOCK_USERS.find(
    (u) => u.username === username.trim() && u.password === password
  );

  if (user) {
    return { success: true, user };
  }

  return {
    success: false,
    error: 'Нэвтрэх нэр эсвэл нууц үг буруу байна',
  };
}

/**
 * Mock бүртгэл үйлдэл
 * PoC-д зориулж localStorage-д хадгална
 */
export async function mockRegister(
  username: string,
  password: string,
  role: UserRole = 'student'
): Promise<AuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Нэвтрэх нэр давхардаж байгаа эсэхийг шалгах
  const existing = MOCK_USERS.find((u) => u.username === username.trim());
  if (existing) {
    return { success: false, error: 'Энэ нэвтрэх нэр аль хэдийн бүртгэлтэй байна' };
  }

  const newUser: MockUser = {
    username: username.trim(),
    password,
    role,
    displayName: `${username} (Шинэ Хэрэглэгч)`,
  };

  // localStorage-д хадгалах (PoC зориулалттай)
  const stored = JSON.parse(localStorage.getItem('mauth_registered_users') || '[]');
  stored.push(newUser);
  localStorage.setItem('mauth_registered_users', JSON.stringify(stored));

  return { success: true, user: newUser };
}

/**
 * localStorage-аас бүртгэлтэй хэрэглэгчийг шалгах
 */
export async function mockLoginWithStored(
  username: string,
  password: string
): Promise<AuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Эхлээд mock жагсаалтаас хайх
  const mockUser = MOCK_USERS.find(
    (u) => u.username === username.trim() && u.password === password
  );
  if (mockUser) return { success: true, user: mockUser };

  // Дараа нь localStorage-аас хайх (бүртгэлийн дараа нэвтэрсэн хэрэгтэй)
  const stored: MockUser[] = JSON.parse(
    localStorage.getItem('mauth_registered_users') || '[]'
  );
  const storedUser = stored.find(
    (u) => u.username === username.trim() && u.password === password
  );
  if (storedUser) return { success: true, user: storedUser };

  return { success: false, error: 'Нэвтрэх нэр эсвэл нууц үг буруу байна' };
}
