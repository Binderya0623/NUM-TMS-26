import { useEffect, useState } from "react";
import { Bell, CheckCheck, AlertTriangle } from "lucide-react";
import { notificationService, type Notification } from "../../services/notificationService";
import { getStoredUser } from "../../lib/authGuard";

/**
 * Full-page notifications list. Drives the sidebar "Мэдэгдэл" entry.
 * Same logic that used to live in the TopHeader bell dropdown.
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [error, setError] = useState<string | null>(null);

  const user = getStoredUser();
  const userId = user?.userId || "";

  const isUnread = (n: Notification) => !(n.isRead || n.status === "READ");

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;
    const load = () =>
      notificationService.getByUserId(userId).then(res => {
        if (cancelled) return;
        setNotifications(res.data);
      });
    load().finally(() => { if (!cancelled) setLoading(false); });
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [userId]);

  const handleClick = async (n: Notification) => {
    if (!isUnread(n)) return;
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true, status: "READ" } : x));
    try { await notificationService.markRead(n.id); }
    catch { setError("Уншсан гэж тэмдэглэхэд алдаа гарлаа."); }
  };

  const handleMarkAll = async () => {
    if (!userId) return;
    setNotifications(prev => prev.map(x => ({ ...x, isRead: true, status: "READ" })));
    try { await notificationService.markAllRead(userId); }
    catch { setError("Бүгдийг уншсан болгож чадсангүй."); }
  };

  const visible = filter === "unread" ? notifications.filter(isUnread) : notifications;
  const unreadCount = notifications.filter(isUnread).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Мэдэгдэл</h1>
          <p className="text-sm text-ink-500 mt-1">
            Системээс ирсэн бүх мэдэгдлийг энд харна уу.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex bg-surface-muted p-0.5 rounded-md border border-border">
            {(["all", "unread"] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 h-8 text-xs font-medium tracking-tight rounded-sm transition-colors ${
                  filter === opt
                    ? "bg-surface text-ink-900 border border-border-strong"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {opt === "all" ? "Бүгд" : `Уншаагүй${unreadCount ? ` (${unreadCount})` : ""}`}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium tracking-tight text-ink-700 hover:text-ink-900 border border-border-strong hover:border-ink-900 rounded-md transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.7} />
              Бүгдийг уншсан болгох
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.7} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-surface border border-border rounded-md overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-ink-400 text-sm">Ачааллаж байна...</div>
        ) : visible.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-8 h-8 mx-auto mb-3 text-ink-300" strokeWidth={1.4} />
            <p className="text-sm text-ink-500">
              {filter === "unread" ? "Уншаагүй мэдэгдэл байхгүй байна." : "Мэдэгдэл байхгүй байна."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map(n => {
              const unread = isUnread(n);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex items-start gap-3 px-5 py-4 transition-colors hover:bg-surface-muted ${
                      unread ? "bg-accent-soft/40" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 ${
                      unread ? "border-accent text-accent" : "border-border-strong text-ink-500"
                    }`}>
                      {(n.type || "N").substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {n.title && (
                          <p className="text-sm font-semibold text-ink-900 tracking-tight truncate">{n.title}</p>
                        )}
                        {n.type && (
                          <span className="text-[10px] uppercase tracking-wider text-ink-500 border border-border-strong rounded-sm px-1.5 py-0.5">
                            {n.type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink-700 leading-relaxed mt-1 whitespace-pre-line">{n.message}</p>
                      <p className="text-xs text-ink-400 mt-2 tabular-nums">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString("mn-MN", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        }) : ""}
                      </p>
                    </div>
                    {unread && <div className="w-2 h-2 bg-accent rounded-full shrink-0 mt-2" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
