import { useState, useEffect } from "react";
import { Bell, Search, ChevronDown, X, LogOut } from "lucide-react";
import { notificationService, type Notification } from "../../services/notificationService";
import { getStoredUser } from "../../lib/authGuard";

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  userName: string;
  userRole: string;
  userInitials: string;
  /** Retained for API compatibility; no longer used (avatar is monochrome). */
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

  useEffect(() => {
    const user = getStoredUser();
    const userId = user?.userId;
    if (!userId) return;
    notificationService.getByUserId(userId).then(res => setNotifications(res.data));
  }, []);

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;

  return (
    <header className="bg-surface border-b border-border h-16 shrink-0 relative z-20">
      <div className="h-full px-6 flex items-center justify-between gap-6">
        {/* Left — page title */}
        <div className="min-w-0 shrink-0">
          <h1 className="text-[15px] font-semibold text-ink-900 tracking-tight leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-ink-500 mt-1.5 truncate">{subtitle}</p>}
        </div>

        {/* Center — search */}
        <div className="hidden md:flex flex-1 max-w-xl items-center gap-2 h-9 border border-border rounded-md px-3 focus-within:border-ink-900 transition-colors">
          <Search className="w-4 h-4 text-ink-400 shrink-0" strokeWidth={1.6} />
          <input
            type="text"
            placeholder="Судалгааны ажил, оюутан, багш хайх..."
            className="bg-transparent border-none outline-none text-sm text-ink-800 placeholder:text-ink-400 w-full"
          />
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative w-9 h-9 rounded-md flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-accent-soft transition-colors"
              aria-label="Мэдэгдэл"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.6} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-ink-900 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-11 w-80 bg-surface border border-border-strong rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-ink-900 tracking-tight">Мэдэгдэл</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-ink-500 font-medium">{unreadCount}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-ink-400 hover:text-ink-900 transition-colors"
                    aria-label="Хаах"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-ink-400 text-sm">
                      <Bell className="w-6 h-6 mx-auto mb-2 text-ink-300" strokeWidth={1.5} />
                      Мэдэгдэл байхгүй байна
                    </div>
                  ) : notifications.map(notif => {
                    const isUnread = notif.status !== 'READ';
                    return (
                      <div
                        key={notif.id}
                        className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-muted cursor-pointer transition-colors"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 ${isUnread ? "bg-ink-900" : "bg-ink-300"}`} />
                        <div className="flex-1 min-w-0">
                          {notif.title && (
                            <p className={`text-[13px] tracking-tight truncate ${isUnread ? "text-ink-900 font-medium" : "text-ink-700"}`}>
                              {notif.title}
                            </p>
                          )}
                          <p className="text-[13px] text-ink-600 leading-snug mt-0.5">{notif.message}</p>
                          <p className="text-[11px] text-ink-400 mt-1.5">{formatTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2.5 border-t border-border">
                  <button className="text-xs text-ink-700 hover:text-ink-900 font-medium tracking-tight">
                    Бүх мэдэгдлийг харах
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-2" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2.5 rounded-md pl-1 pr-2 py-1 hover:bg-accent-soft transition-colors"
            >
              <div className="w-8 h-8 border border-border-strong rounded-full flex items-center justify-center text-ink-900 text-[11px] font-medium tracking-tight shrink-0 bg-surface">
                {userInitials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[13px] text-ink-900 font-medium leading-none tracking-tight">{userName}</p>
                <p className="text-[11px] text-ink-500 mt-1">{userRole}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-ink-400 hidden md:block" strokeWidth={1.8} />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-11 w-56 bg-surface border border-border-strong rounded-md overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[13px] text-ink-900 font-medium tracking-tight">{userName}</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">{userRole}</p>
                </div>
                {["Тохиргоо", "Сонголтууд", "Тусламж"].map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-4 py-2 text-[13px] text-ink-700 hover:bg-accent-soft hover:text-ink-900 transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <div className="border-t border-border">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-[13px] text-ink-700 hover:bg-accent-soft hover:text-ink-900 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={1.8} />
                    Гарах
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
