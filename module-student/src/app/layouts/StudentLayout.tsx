import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import StudentSidebar from "../components/StudentSidebar";
import TopHeader from "../components/TopHeader";
import { FloatingMessageButton } from "../components/FloatingMessageButton";
import ErrorBoundary from "../components/ErrorBoundary";
import type { StoredUser } from "../../lib/authGuard";
import { logout } from "../../lib/authGuard";
import { chatService } from "../../services/chatService";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/student": { title: "Миний Хянах самбар", subtitle: "Судалгааны ажлын явцаа хянах" },
  "/student/thesis": { title: "Миний судалгааны ажил", subtitle: "Судалгааны ажил, тайлан, илгээлтийг удирдах" },
  "/student/feedback": { title: "Санал хүсэлт", subtitle: "Багшийн зөвлөгөө болон сэтгэгдэл" },
  "/student/deadlines": { title: "Хамгаалалт", subtitle: "Ирж буй хугацаа болон хамгаалалтын хуваарь" },
  "/student/grade": { title: "Эцсийн дүн", subtitle: "Эцсийн дүн болон үр дүнг харах" },
  "/student/messages": { title: "Зурвасууд", subtitle: "Удирдагч багштайгаа харилцах" },
  "/student/profile": { title: "Миний профайл", subtitle: "Хувийн мэдээллээ харах, засварлах" },
};

interface StudentLayoutProps {
  user: StoredUser;
}

export default function StudentLayout({ user }: StudentLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const pageInfo = pageTitles[location.pathname] || pageTitles["/student"];

  const initials = user.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Real unread count from message_service. Refresh on route changes (covers
  // navigating away from /messages where we just marked things as SEEN) and
  // poll every 20s to pick up incoming messages while idle.
  const userId = user.userId || user.username || '';
  useEffect(() => {
    if (!userId) { setUnreadCount(0); return; }
    let cancelled = false;
    const tick = () => chatService.unreadCount(userId).then(n => { if (!cancelled) setUnreadCount(n); });
    tick();
    const interval = setInterval(tick, 20000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [userId, location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="hidden md:block h-full shrink-0">
        <StudentSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-900/45"
            aria-label="Цэс хаах"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative h-full w-64 max-w-[84vw]">
            <StudentSidebar
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
          userRole="Оюутан"
          userInitials={initials}
          avatarColor="from-blue-500 to-blue-700"
          onLogout={logout}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <FloatingMessageButton
        unreadCount={unreadCount}
        onMessageClick={() => navigate("/student/messages")}
      />
    </div>
  );
}
