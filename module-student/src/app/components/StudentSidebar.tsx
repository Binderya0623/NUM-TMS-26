import { NavLink } from "react-router";
import numLogo from "../../assets/image/num_logo.png";
import { Home, BookOpen, MessageSquare, Calendar, Award, Bell } from "lucide-react";

interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems: { icon: typeof Home; label: string; path: string; end?: boolean }[] = [
  { icon: Home,          label: "Хянах самбар",            path: "/student", end: true },
  { icon: BookOpen,      label: "Миний судалгааны ажил",   path: "/student/thesis" },
  { icon: MessageSquare, label: "Санал хүсэлт",            path: "/student/feedback" },
  { icon: Calendar,      label: "Хамгаалалт",              path: "/student/deadlines" },
  { icon: Award,         label: "Эцсийн дүн",              path: "/student/grade" },
];

export default function StudentSidebar({ collapsed }: StudentSidebarProps) {
  return (
    <aside
      className={`relative flex flex-col bg-ink-900 border-r border-black/20 transition-[width] duration-300 ${
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
        <button
          className={`w-full flex items-center gap-3 h-9 text-white/55 hover:text-white transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Bell className="w-[18px] h-[18px] shrink-0" strokeWidth={1.6} />
          {!collapsed && <span className="text-[13px] tracking-tight">Мэдэгдэл</span>}
        </button>
      </div>
    </aside>
  );
}
