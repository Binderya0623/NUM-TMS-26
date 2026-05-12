import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import numLogo from "../../assets/image/num_logo.png";
import { Home, Users, FileSearch, CheckCircle, Award, Bell } from "lucide-react";
import { getStoredUser } from "../../lib/authGuard";
import { notificationService } from "../../services/notificationService";

interface TeacherSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

const BASE_MENU: { icon: typeof Home; label: string; path: string; end?: boolean }[] = [
  { icon: Home,        label: "Хянах самбар",           path: "/teacher", end: true },
  { icon: FileSearch,  label: "Судалгааны удирдлага",  path: "/teacher/thesis" },
  { icon: Users,       label: "Оюутнууд",               path: "/teacher/students" },
  { icon: CheckCircle, label: "Комисс",                 path: "/teacher/committee" },
];

export default function TeacherSidebar({ collapsed, onNavigate }: TeacherSidebarProps) {
  const user = getStoredUser();
  const isExpert = user?.systemRole === 'EXTERNAL_EXPERT';

  const menuItems = isExpert
    ? [{ icon: Award, label: "Зочин шүүгчийн үнэлгээ", path: "/teacher/expert", end: true }]
    : BASE_MENU;

  const [unread, setUnread] = useState(0);

  // Unread badge feed for the bottom "Мэдэгдэл" link. External experts also
  // see this — every authenticated user has a notification inbox.
  useEffect(() => {
    const userId = user?.userId;
    if (!userId) return;
    let cancelled = false;
    const tick = () => notificationService.unreadCount(userId).then(c => { if (!cancelled) setUnread(c); });
    tick();
    const interval = setInterval(tick, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user?.userId]);

  return (
    <aside
      className={`relative flex h-full flex-col bg-primary-900 border-r border-white/10 transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-64"
      } shrink-0`}
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <img
          src={numLogo}
          alt="МУИС"
          width={26}
          height={26}
          className="shrink-0 opacity-90 [filter:brightness(0)_invert(1)]"
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-tight text-white leading-none">МУИС</p>
            <p className="text-[11px] text-white/50 mt-1 leading-snug">
              Дипломын ажлын<br />удирдлагын систем
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-5 overflow-y-auto">
        {!collapsed && (
          <p className="px-5 mb-2 text-[10px] uppercase tracking-[0.14em] font-medium text-white/35">
            Үндсэн цэс
          </p>
        )}
        <div className="space-y-px">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 h-9 px-5 transition-colors ${
                    collapsed ? "justify-center px-0" : ""
                  } ${
                    isActive
                      ? "text-white bg-white/[0.07]"
                      : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent" />
                    )}
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 ${
                        isActive ? "text-white" : "text-white/45 group-hover:text-white/80"
                      }`}
                      strokeWidth={1.6}
                    />
                    {!collapsed && (
                      <span className={`text-[13px] tracking-tight ${isActive ? "font-medium" : "font-normal"}`}>
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="px-5 py-3 border-t border-white/10">
        <NavLink
          to="/teacher/notifications"
          onClick={onNavigate}
          className={({ isActive }) =>
            `relative w-full flex items-center gap-3 h-9 transition-colors rounded-sm ${
              collapsed ? "justify-center" : ""
            } ${isActive ? "text-white" : "text-white/55 hover:text-white"}`
          }
        >
          <span className="relative inline-flex shrink-0">
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.6} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-semibold leading-none rounded-full bg-accent text-white tabular-nums">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </span>
          {!collapsed && (
            <span className="text-[13px] tracking-tight">Мэдэгдэл</span>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
