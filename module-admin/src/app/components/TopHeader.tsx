import { useState } from "react";
import { ChevronDown, LogOut, Menu } from "lucide-react";

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
  userRole: string;
  userInitials: string;
  /** Deprecated — kept for API compatibility, no longer applied. */
  avatarColor?: string;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export default function TopHeader({
  title,
  subtitle,
  userName,
  userRole,
  userInitials,
  onLogout,
  onMenuClick,
}: TopHeaderProps) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between h-16 shrink-0 relative z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-md border border-border bg-surface flex items-center justify-center text-ink-700 hover:bg-surface-muted transition-colors shrink-0"
          aria-label="Цэс нээх"
        >
          <Menu className="w-4 h-4" strokeWidth={1.7} />
        </button>
        <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-ink-900 tracking-tight leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-ink-500 mt-1 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-md px-2 h-9 hover:bg-accent-softer transition-colors"
          >
            <div className="w-7 h-7 border border-border-strong bg-surface rounded-full flex items-center justify-center text-[11px] font-semibold text-ink-700 shrink-0">
              {userInitials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm text-ink-900 font-medium leading-none tracking-tight">{userName}</p>
              <p className="text-xs text-ink-500 mt-0.5">{userRole}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-ink-400 hidden md:block" strokeWidth={1.6} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-11 w-52 bg-surface rounded-md border border-border-strong overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm text-ink-900 font-medium tracking-tight">{userName}</p>
                <p className="text-xs text-ink-500 mt-0.5">{userRole}</p>
              </div>
              {["Тохиргоо", "Сонголтууд", "Тусламж & Дэмжлэг"].map((item) => (
                <button key={item} className="w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-muted transition-colors">
                  {item}
                </button>
              ))}
              <div className="border-t border-border">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-muted hover:text-ink-900 transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.6} />
                  Гарах
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
