import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import AdminSidebar from "../components/AdminSidebar";
import TopHeader from "../components/TopHeader";
import ErrorBoundary from "../components/ErrorBoundary";
import type { StoredUser } from "../../lib/authGuard";
import { logout } from "../../lib/authGuard";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Хянах самбар", subtitle: "Тавтай морилно уу, Тэнхимийн администратор" },
  "/admin/teachers": { title: "Багш нар", subtitle: "Тэнхимийн багш нарыг удирдах" },
  "/admin/students": { title: "Оюутнууд", subtitle: "Оюутнууд болон тэдний дипломын ажлын явц" },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
      <div className="hidden md:block h-full shrink-0">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-900/45"
            aria-label="Цэс хаах"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[84vw]">
            <AdminSidebar
              collapsed={false}
              onToggle={() => setCollapsed(!collapsed)}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <TopHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          userName={user.displayName}
          userRole="Администратор"
          userInitials={initials}
          onLogout={logout}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-surface-muted">
          <div className="max-w-[1400px] mx-auto px-4 py-5 md:px-8 md:py-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
