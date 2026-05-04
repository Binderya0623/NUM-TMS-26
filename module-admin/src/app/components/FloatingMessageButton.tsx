import { MessageSquare } from "lucide-react";

interface FloatingMessageButtonProps {
  unreadCount?: number;
  onMessageClick: () => void;
}

export function FloatingMessageButton({ unreadCount = 0, onMessageClick }: FloatingMessageButtonProps) {
  return (
    <button
      onClick={onMessageClick}
      className="fixed bottom-6 right-6 p-4 bg-[#1455BD] text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 z-50 group flex items-center justify-center"
      aria-label="Messages"
    >
      <div className="relative">
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
      
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Open Messages
      </span>
    </button>
  );
}
