import { NavLink } from "react-router";
import numLogo from "../../assets/image/num_logo.png";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Bell,
  UserCheck,
  Settings,
  ClipboardCheck,
  Award,
  FileSearch,
  Star,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navSections: {
  label: string;
  items: { path: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[];
}[] = [
  {
    label: "Ерөнхий",
    items: [
      { path: "/admin", label: "Хянах самбар", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "Хэрэглэгчид",
    items: [
      { path: "/admin/teachers",          label: "Багш нар",          icon: GraduationCap },
      { path: "/admin/external-experts",  label: "Гадаад экспертүүд", icon: Star },
      { path: "/admin/students",          label: "Оюутнууд",          icon: Users },
    ],
  },
  {
    label: "Хамгаалалт",
    items: [
      { path: "/admin/thesis",              label: "Дипломын ажил",       icon: BookOpen },
      { path: "/admin/topics",              label: "Сэдвийн удирдлага",   icon: FileSearch },
      { path: "/admin/committees",          label: "Комиссууд",           icon: UserCheck },
      { path: "/admin/evaluation-process",  label: "Үнэлгээний тохиргоо", icon: Settings },
    ],
  },
  {
    label: "Тайлан",
    items: [
      { path: "/admin/reports",    label: "Нэгдсэн тайлан", icon: ClipboardCheck },
      { path: "/admin/grades",     label: "Эцсийн дүн",     icon: Award },
      { path: "/admin/statistics", label: "Статистик",      icon: BarChart3 },
    ],
  },
];

export default function AdminSidebar({ collapsed }: AdminSidebarProps) {
  return (
    <aside
      className={`relative flex flex-col bg-ink-900 border-r border-black/20 transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-72"
      } shrink-0`}
    >
      {/* Logo / wordmark */}
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

      {/* Navigation */}
      <nav className="flex-1 py-5 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={section.label} className={sIdx === 0 ? "" : "mt-6"}>
            {!collapsed && (
              <p className="px-5 mb-2 text-[10px] uppercase tracking-[0.14em] font-medium text-white/35">
                {section.label}
              </p>
            )}
            <div className="space-y-px">
              {section.items.map((item) => {
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
          </div>
        ))}
      </nav>

      {/* Bottom section */}
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
