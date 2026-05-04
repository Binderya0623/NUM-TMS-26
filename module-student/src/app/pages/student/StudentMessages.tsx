import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Send, Paperclip, MoreVertical } from "lucide-react";
import { chatService, type ChatMessage } from "../../../services/chatService";
import { planService } from "../../../services/planService";
import { userService } from "../../../services/userService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName, initialsFromName } from "../../../lib/utils";

export default function StudentMessages() {
  const user = getStoredUser();
  const studentId = user?.userId || user?.username || "";

  const [thesisId, setThesisId] = useState<string | null>(null);
  const [supervisorName, setSupervisorName] = useState<string>("Удирдагч багш");
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    planService.getMyPlan(studentId)
      .then(async res => {
        const plan = res.data[0];
        setThesisId(plan?.thesisId ?? studentId);
        if (plan?.supervisorId) {
          const sup = await userService.getById(plan.supervisorId).catch(() => ({ data: null as any }));
          if (sup.data?.displayName) {
            setSupervisorName(sup.data.displayName);
            setUserMap(prev => ({ ...prev, [plan.supervisorId!]: sup.data.displayName }));
          }
        }
      })
      .catch(() => setThesisId(studentId));
  }, [studentId]);

  useEffect(() => {
    if (!thesisId) return;
    chatService.getMessages(thesisId)
      .then(res => setMessages(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      chatService.getMessages(thesisId)
        .then(res => setMessages(res.data))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [thesisId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !thesisId) return;
    setSending(true);
    chatService.sendMessage(thesisId, studentId, "STUDENT", messageText.trim())
      .then(res => {
        setMessages(prev => [...prev, res.data]);
        setMessageText("");
      })
      .catch(() => {})
      .finally(() => setSending(false));
  };

  return (
    <div className="h-[calc(100vh-200px)]">
      <Card className="h-full">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border-strong">
                <AvatarFallback className="text-sm font-medium">
                  {initialsFromName(supervisorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-ink-900 tracking-tight">{supervisorName}</p>
                <p className="text-xs text-ink-500">Дипломын удирдагч багш</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Дэлгэрэнгүй">
              <MoreVertical className="h-4 w-4" strokeWidth={1.6} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-sunken">
            {loading ? (
              <div className="text-center text-ink-400 text-sm pt-8">Ачааллаж байна...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-ink-500 pt-8">
                <p className="text-sm">Одоогоор мессеж байхгүй.</p>
                <p className="text-xs mt-1 text-ink-400">Багштайгаа харилцаагаа эхлүүлнэ үү.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isStudent = msg.senderType === "STUDENT" || msg.senderId === studentId;
                return (
                  <div key={msg.id} className={`flex ${isStudent ? "justify-end" : "justify-start"}`}>
                    <div className="flex items-end gap-2 max-w-[70%]">
                      {!isStudent && (
                        <Avatar className="h-7 w-7 border border-border-strong">
                          <AvatarFallback className="text-[10px] font-medium">
                            {initialsFromName(resolveName(msg.senderId, userMap, supervisorName))}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className={`rounded-md px-3 py-2 ${
                          isStudent
                            ? "bg-ink-900 text-white"
                            : "bg-surface text-ink-900 border border-border"
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <p className={`text-[10px] mt-1 text-ink-400 tabular-nums ${isStudent ? "text-right" : ""}`}>
                          {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                      {isStudent && (
                        <Avatar className="h-7 w-7 border border-border-strong">
                          <AvatarFallback className="text-[10px] font-medium">
                            {studentId.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-border bg-surface">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="Файл хавсаргах">
                <Paperclip className="h-4 w-4" strokeWidth={1.6} />
              </Button>
              <Input
                placeholder="Мессежээ бичнэ үү..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                className="flex-1"
              />
              <Button className="flex-shrink-0" disabled={sending || !messageText.trim()} onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" strokeWidth={1.6} />
                Илгээх
              </Button>
            </div>
            <p className="text-xs text-ink-400 mt-2">Enter — илгээх, Shift+Enter — шинэ мөр</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
