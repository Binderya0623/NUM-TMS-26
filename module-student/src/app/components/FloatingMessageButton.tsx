import { MessageSquare } from "lucide-react";

interface FloatingMessageButtonProps {
  unreadCount?: number;
  onMessageClick: () => void;
}

export function FloatingMessageButton({ unreadCount = 0, onMessageClick }: FloatingMessageButtonProps) {
  return (
    <button
      onClick={onMessageClick}
      className="fixed bottom-6 right-6 w-12 h-12 bg-accent text-white rounded-full hover:bg-accent-hover transition-all hover:scale-105 z-50 group flex items-center justify-center"
      aria-label="Мессеж"
    >
      <div className="relative flex items-center justify-center">
        <MessageSquare className="w-5 h-5" strokeWidth={1.6} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[var(--color-dot-negative)] text-white text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full border border-white min-w-[18px] text-center leading-tight">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      <span className="absolute right-full mr-3 bg-ink-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none tracking-tight">
        Мессеж
      </span>
    </button>
  );
}
