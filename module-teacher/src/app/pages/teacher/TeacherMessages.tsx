import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Search, Send } from "lucide-react";
import { planService, type Plan } from "../../../services/planService";
import { chatService, type ChatMessage } from "../../../services/chatService";
import { userService } from "../../../services/userService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName, initialsFromName } from "../../../lib/utils";

const PLAN_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Ноорог",
  SUBMITTED: "Илгээсэн",
  REVISION_REQUIRED: "Засвар шаардлагатай",
  APPROVED: "Багш баталсан",
  DEPT_APPROVED: "Тэнхим баталсан",
};

export default function TeacherMessages() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";
  const teacherName = user?.username || "Багш";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!teacherId) return;
    Promise.all([
      planService.getPlans({ supervisorId: teacherId }).catch(() => ({ data: [] as Plan[] })),
      userService.getStudents().catch(() => ({ data: [] as any[] })),
    ]).then(([planRes, studentsRes]) => {
      setPlans(planRes.data || []);
      const map: Record<string, string> = {};
      (studentsRes.data || []).forEach((s: any) => {
        if (s.id) map[s.id] = s.displayName || s.name || s.id;
        if (s.studentId) map[s.studentId] = s.displayName || s.name || s.id;
      });
      setUserMap(map);
    });
  }, [teacherId]);

  const studentLabel = (sid?: string) => resolveName(sid, userMap, "Оюутан");
  const statusLabel = (s?: string) => (s && PLAN_STATUS_LABEL[s]) || s || "";

  const conversationId = useMemo(() => {
    if (!selectedPlan) return null;
    return chatService.conversationId(selectedPlan.studentId, teacherId, selectedPlan.thesisId ?? null);
  }, [selectedPlan, teacherId]);

  // Live conversation feed: fetch the backlog once, then subscribe to SSE.
  // Polling kicks in only if the stream fails to open.
  useEffect(() => {
    if (!conversationId || !teacherId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let stop: (() => void) | null = null;

    const scrollToBottom = () =>
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    const reconcileSeen = (msgs: ChatMessage[]) => {
      if (msgs.some(m => m.receiverId === teacherId && m.status !== "SEEN")) {
        chatService.markRead(conversationId, teacherId);
      }
    };
    const loadBacklog = async () => {
      const res = await chatService.getMessages(conversationId);
      if (cancelled) return;
      setMessages(res.data);
      scrollToBottom();
      reconcileSeen(res.data);
    };

    loadBacklog();
    stop = chatService.openStream(conversationId, {
      onMessage: (m) => {
        if (cancelled) return;
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
        scrollToBottom();
        if (m.receiverId === teacherId && m.status !== "SEEN") {
          chatService.markRead(conversationId, teacherId);
        }
      },
      onSeen: (e) => {
        if (cancelled || e.viewerId === teacherId) return;
        setMessages(prev => prev.map(m =>
          m.senderId === teacherId && m.receiverId === e.viewerId
            ? { ...m, status: "SEEN", seenAt: e.at }
            : m,
        ));
      },
      onError: () => {
        if (pollInterval || cancelled) return;
        pollInterval = setInterval(loadBacklog, 10000);
      },
    });

    return () => {
      cancelled = true;
      if (stop) stop();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [conversationId, teacherId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId || !selectedPlan) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await chatService.sendMessage({
        conversationId,
        senderId: teacherId,
        receiverId: selectedPlan.studentId,
        content: messageText.trim(),
      });
      // The same message will also arrive via the SSE stream — dedupe by id
      // so we don't render it twice when the broadcast wins the race.
      setMessages(prev => prev.some(x => x.id === res.data.id) ? prev : [...prev, res.data]);
      setMessageText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || "";
      setSendError(typeof msg === "string" && msg ? msg : "Илгээж чадсангүй.");
    } finally {
      setSending(false);
    }
  };

  const filteredPlans = plans.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.studentId.toLowerCase().includes(q)
      || studentLabel(p.studentId).toLowerCase().includes(q);
  });

  return (
    <div className="h-[calc(100vh-200px)]">
      <Card className="h-full">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List */}
            <div className="col-span-4 border-r border-border flex flex-col h-full bg-surface">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400 h-4 w-4" strokeWidth={1.6} />
                  <Input
                    placeholder="Оюутан хайх..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredPlans.length === 0 ? (
                  <div className="p-4 text-center text-ink-400 text-sm mt-4">Оюутан олдсонгүй</div>
                ) : (
                  filteredPlans.map(plan => {
                    const active = selectedPlan?.id === plan.id;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`w-full px-4 py-3 border-b border-border text-left transition-colors ${
                          active
                            ? "bg-accent-soft border-l-2 border-l-accent"
                            : "hover:bg-surface-muted border-l-2 border-l-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border-strong">
                            <AvatarFallback className="text-xs font-medium">
                              {initialsFromName(studentLabel(plan.studentId))}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink-900 truncate tracking-tight">{studentLabel(plan.studentId)}</p>
                            <p className="text-xs text-ink-500 truncate">{statusLabel(plan.status)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-8 flex flex-col h-full">
              {!selectedPlan ? (
                <div className="flex-1 flex items-center justify-center bg-surface-sunken">
                  <p className="text-ink-400 text-sm">Зүүн талаас оюутан сонгоно уу</p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border-strong">
                        <AvatarFallback className="text-sm font-medium">
                          {initialsFromName(studentLabel(selectedPlan.studentId))}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-ink-900 tracking-tight">{studentLabel(selectedPlan.studentId)}</p>
                        <p className="text-xs text-ink-500">{statusLabel(selectedPlan.status)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-sunken">
                    {messages.length === 0 ? (
                      <div className="text-center text-ink-500 pt-8">
                        <p className="text-sm">Харилцаа алга байна</p>
                        <p className="text-xs mt-1 text-ink-400">Оюутантайгаа харилцаагаа эхлүүлнэ үү.</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const mine = msg.senderId === teacherId;
                        return (
                          <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div className="flex items-end gap-2 max-w-[70%]">
                              {!mine && (
                                <Avatar className="h-7 w-7 border border-border-strong">
                                  <AvatarFallback className="text-[10px] font-medium">
                                    {initialsFromName(studentLabel(msg.senderId))}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <div className={`rounded-md px-3 py-2 ${
                                  mine
                                    ? "bg-ink-900 text-white"
                                    : "bg-surface text-ink-900 border border-border"
                                }`}>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                </div>
                                <p className={`text-[10px] mt-1 text-ink-400 tabular-nums ${mine ? "text-right" : ""}`}>
                                  {msg.sentAt
                                    ? new Date(msg.sentAt).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" })
                                    : ""}
                                  {mine && msg.status === "SEEN" ? " · Уншсан" : ""}
                                </p>
                              </div>
                              {mine && (
                                <Avatar className="h-7 w-7 border border-border-strong">
                                  <AvatarFallback className="text-[10px] font-medium">
                                    {initialsFromName(teacherName)}
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

                  <div className="p-4 border-t border-border bg-surface space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Мессежээ бичнэ үү..."
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        className="flex-1"
                        disabled={sending}
                      />
                      <Button className="flex-shrink-0" disabled={sending || !messageText.trim()} onClick={handleSendMessage}>
                        <Send className="h-4 w-4 mr-2" strokeWidth={1.6} />
                        Илгээх
                      </Button>
                    </div>
                    {sendError && (
                      <p className="text-xs text-[var(--color-dot-negative)] inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)]" /> {sendError}
                      </p>
                    )}
                    <p className="text-xs text-ink-400">Enter — илгээх</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
