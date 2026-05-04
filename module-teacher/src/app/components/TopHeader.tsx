import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Bell, Search, ChevronDown, X, LogOut } from "lucide-react";
import { notificationService, type Notification } from "../../services/notificationService";
import { getStoredUser } from "../../lib/authGuard";

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
  userRole: string;
  userInitials: string;
  /** Deprecated — kept for API compatibility, no longer applied. */
  avatarColor?: string;
  onLogout?: () => void;
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60)   return 'Дөнгөж сая';
  if (diff < 3600) return `${Math.floor(diff / 60)} минутын өмнө`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} цагийн өмнө`;
  return `${Math.floor(diff / 86400)} өдрийн өмнө`;
}

export default function TopHeader({
  title,
  subtitle,
  userName,
  userRole,
  userInitials,
  onLogout,
}: TopHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    const user = getStoredUser();
    const userId = user?.userId;
    if (!userId) return;
    notificationService.getByUserId(userId).then(res => setNotifications(res.data));
  }, []);

  const handleSearchChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;

  return (
    <header className="bg-surface border-b border-border px-6 flex items-center justify-between h-16 shrink-0 relative z-20">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold text-ink-900 tracking-tight leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-ink-500 mt-1">{subtitle}</p>}
      </div>

      <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 h-9 bg-surface-muted border border-border rounded-md px-3 mx-6 focus-within:border-accent focus-within:bg-surface transition-colors">
        <Search className="w-4 h-4 text-ink-400" strokeWidth={1.6} />
        <input
          type="text"
          placeholder="Судалгааны ажил, оюутан, багш хайх..."
          value={query}
          onChange={e => handleSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-ink-900 placeholder-ink-400 w-full"
        />
      </div>

      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative w-9 h-9 rounded-md flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-accent-softer transition-colors"
            aria-label="Мэдэгдэл"
          >
            <Bell className="w-4 h-4" strokeWidth={1.6} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--color-dot-negative)] rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-surface rounded-md border border-border-strong overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-ink-900 tracking-tight flex items-center gap-2">
                  Мэдэгдэл
                  {unreadCount > 0 && (
                    <span className="text-[10px] tabular-nums text-white bg-accent rounded-sm px-1.5 py-0.5 font-medium">{unreadCount}</span>
                  )}
                </h3>
                <button onClick={() => setShowNotifications(false)} className="text-ink-400 hover:text-ink-900">
                  <X className="w-4 h-4" strokeWidth={1.6} />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-ink-400 text-sm">
                    <Bell className="w-6 h-6 mx-auto mb-2 text-ink-300" strokeWidth={1.4} />
                    Мэдэгдэл байхгүй байна
                  </div>
                ) : notifications.map(notif => {
                  const isUnread = notif.status !== 'READ';
                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-muted cursor-pointer border-b border-border last:border-b-0 ${isUnread ? "bg-accent-soft/60" : ""}`}
                    >
                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-semibold shrink-0 ${
                        isUnread ? "border-accent text-accent" : "border-border-strong text-ink-500"
                      }`}>
                        {(notif.type || 'N').substring(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        {notif.title && <p className="text-xs font-semibold text-ink-900 tracking-tight truncate">{notif.title}</p>}
                        <p className="text-sm text-ink-700 leading-tight">{notif.message}</p>
                        <p className="text-xs text-ink-400 mt-1 tabular-nums">{formatTime(notif.createdAt)}</p>
                      </div>
                      {isUnread && <div className="w-1.5 h-1.5 bg-accent rounded-full shrink-0 mt-1.5" />}
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <button className="text-xs text-accent hover:text-accent-hover font-medium tracking-tight">Бүх мэдэгдлийг харах</button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border-strong mx-1.5" />

        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
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
