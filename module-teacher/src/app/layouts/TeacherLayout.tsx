import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import TeacherSidebar from "../components/TeacherSidebar";
import TopHeader from "../components/TopHeader";
import { FloatingMessageButton } from "../components/FloatingMessageButton";
import ErrorBoundary from "../components/ErrorBoundary";
import type { StoredUser } from "../../lib/authGuard";
import { logout } from "../../lib/authGuard";
import { chatService } from "../../services/chatService";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/teacher": { title: "Хянах самбар", subtitle: "Тавтай морилно уу, Багш" },
  "/teacher/students": { title: "Оюутнууд", subtitle: "Харьцлаж буй оюутнуудынгоо харах, удирдах" },
  "/teacher/progress": { title: "Явцын хяналт", subtitle: "Бүх оюутны дэвшил, шат, эцсийн хугацааг хянах" },
  "/teacher/committee": { title: "Комисс", subtitle: "Комиссийн үнэлгээний даалгавраа удирдах" },
  "/teacher/evaluations": { title: "Комисс", subtitle: "Комиссийн үнэлгээний даалгавраа удирдах" },
  "/teacher/expert": { title: "Гадаад эксперт үнэлгээ", subtitle: "Томилогдсон комиссын оюутнуудад үнэлгээ өгөх" },
  "/teacher/settings": { title: "Тохиргоо", subtitle: "Профайл, тохиргоо удирдах" },
};

interface TeacherLayoutProps {
  user: StoredUser;
}

export default function TeacherLayout({ user }: TeacherLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const pageInfo = pageTitles[location.pathname] || pageTitles["/teacher"];

  const initials = user.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // External experts don't participate in the supervisor↔student chat — hide
  // the FAB entirely on their workspace so it doesn't navigate them somewhere
  // they have nothing to do.
  const isExpertWorkspace =
    location.pathname.startsWith("/teacher/expert") || user.systemRole === "EXTERNAL_EXPERT";

  const userId = user.userId || user.username || '';
  useEffect(() => {
    if (!userId || isExpertWorkspace) { setUnreadCount(0); return; }
    let cancelled = false;
    const tick = () => chatService.unreadCount(userId).then(n => { if (!cancelled) setUnreadCount(n); });
    tick();
    const interval = setInterval(tick, 20000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [userId, isExpertWorkspace, location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <TeacherSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          userName={user.displayName}
          userRole="Багш"
          userInitials={initials}
          avatarColor="from-green-500 to-green-700"
          onLogout={logout}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      {!isExpertWorkspace && (
        <FloatingMessageButton
          unreadCount={unreadCount}
          onMessageClick={() => navigate("/teacher/messages")}
        />
      )}
    </div>
  );
}
