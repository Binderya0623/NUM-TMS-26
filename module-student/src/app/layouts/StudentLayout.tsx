import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import StudentSidebar from "../components/StudentSidebar";
import TopHeader from "../components/TopHeader";
import { FloatingMessageButton } from "../components/FloatingMessageButton";
import type { StoredUser } from "../../lib/authGuard";
import { logout } from "../../lib/authGuard";

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
  const location = useLocation();
  const navigate = useNavigate();
  const pageInfo = pageTitles[location.pathname] || pageTitles["/student"];

  const initials = user.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <StudentSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          userName={user.displayName}
          userRole="Оюутан"
          userInitials={initials}
          avatarColor="from-blue-500 to-blue-700"
          onLogout={logout}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <FloatingMessageButton
        unreadCount={3}
        onMessageClick={() => navigate("/student/messages")}
      />
    </div>
  );
}