import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import AdminSidebar from "../components/AdminSidebar";
import TopHeader from "../components/TopHeader";
import type { StoredUser } from "../../lib/authGuard";
import { logout } from "../../lib/authGuard";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Хянах самбар", subtitle: "Тавтай морилно уу, Тэнхимийн администратор" },
  "/admin/teachers": { title: "Багш нар", subtitle: "Тэнхимийн багш нарыг удирдах" },
  "/admin/students": { title: "Оюутнууд", subtitle: "Тэнхимд бүртгэлтэй бүх оюутнууд" },
  "/admin/thesis": { title: "Дипломын ажил", subtitle: "Бүх дипломын ажлыг хянах" },
  "/admin/committees": { title: "Комиссууд", subtitle: "Үнэлгээний комиссуудыг удирдах" },
  "/admin/assignment": { title: "Оюутан хуваарилалт", subtitle: "Оюутнуудыг багш нарт хуваарилах" },
  "/admin/evaluation-process": { title: "Үнэлгээний үйл явцын тохиргоо", subtitle: "Үнэлгээний шатууд болон оноолтыг тохируулах" },
  "/admin/evaluation-methods": { title: "Үнэлгээний аргачлал", subtitle: "Шалгуур үзүүлэлт болон жинг тохируулах" },
  "/admin/reports": { title: "Нэгдсэн тайлан", subtitle: "Тэнхимийн нэгдсэн тайлангийн мэдээлэл" },
  "/admin/grades": { title: "Эцсийн дүн", subtitle: "Оюутны дүнг хянах, нийтлэх, аудит хийх" },
  "/admin/statistics": { title: "Статистик", subtitle: "Тэнхимийн гүйцэтгэл болон үзүүлэлтүүд" },
  "/admin/closure": { title: "Комисс хаах", subtitle: "Үнэлгээний комиссыг хааж, түгжих" },
};

interface AdminLayoutProps {
  user: StoredUser;
}

export default function AdminLayout({ user }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || pageTitles["/admin"];

  const initials = user.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          userName={user.displayName}
          userRole="Администратор"
          userInitials={initials}
          onLogout={logout}
        />
        <main className="flex-1 overflow-y-auto bg-surface-muted">
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
