import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
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
  const [studentCodeMap, setStudentCodeMap] = useState<Record<string, string>>({});
  const [conversationSummaries, setConversationSummaries] = useState<Record<number, {
    lastMessage?: ChatMessage;
    unread: number;
  }>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!teacherId) return;
    Promise.all([
      planService.getPlans({ supervisorId: teacherId }).catch(() => ({ data: [] as Plan[] })),
      userService.getStudents().catch(() => ({ data: [] as any[] })),
    ]).then(([planRes, studentsRes]) => {
      setPlans(planRes.data || []);
      const map: Record<string, string> = {};
      const codeMap: Record<string, string> = {};
      (studentsRes.data || []).forEach((s: any) => {
        if (s.id) map[s.id] = s.displayName || s.name || s.id;
        if (s.studentId) map[s.studentId] = s.displayName || s.name || s.id;
        const code = s.sisId || s.studentId || s.username || '';
        if (code) {
          if (s.id) codeMap[s.id] = code;
          if (s.username) codeMap[s.username] = code;
        }
      });
      setUserMap(map);
      setStudentCodeMap(codeMap);
    });
  }, [teacherId]);

  const studentLabel = (sid?: string) => resolveName(sid, userMap, "Оюутан");
  const studentCode = (sid?: string) => sid ? studentCodeMap[sid] || "" : "";
  const statusLabel = (s?: string) => (s && PLAN_STATUS_LABEL[s]) || s || "";
  const planConversationId = (plan: Plan) =>
    chatService.conversationId(plan.studentId, teacherId, plan.thesisId ?? null);
  const sortMessages = (items: ChatMessage[]) =>
    [...items].sort((a, b) => new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime());
  const latestMessage = (items: ChatMessage[]) => {
    const sorted = sortMessages(items);
    return sorted[sorted.length - 1];
  };
  const timeLabel = (iso?: string) =>
    iso ? new Date(iso).toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }) : "";

  const conversationId = useMemo(() => {
    if (!selectedPlan) return null;
    return planConversationId(selectedPlan);
  }, [selectedPlan, teacherId]);

  useEffect(() => {
    if (!teacherId || plans.length === 0) {
      setConversationSummaries({});
      return;
    }
    let cancelled = false;
    const refreshSummaries = () => Promise.all(plans.map(async (plan) => {
      const res = await chatService.getMessages(planConversationId(plan));
      const lastMessage = latestMessage(res.data);
      const unread = res.data.filter(m => m.receiverId === teacherId && m.status !== "SEEN").length;
      return [plan.id, { lastMessage, unread }] as const;
    })).then(entries => {
      if (!cancelled) setConversationSummaries(Object.fromEntries(entries));
    });
    refreshSummaries();
    const interval = setInterval(refreshSummaries, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [plans, teacherId]);

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
      setMessages(sortMessages(res.data));
      scrollToBottom();
      reconcileSeen(res.data);
    };

    loadBacklog();
    stop = chatService.openStream(conversationId, {
      onMessage: (m) => {
        if (cancelled) return;
        setMessages(prev => sortMessages(prev.some(x => x.id === m.id) ? prev : [...prev, m]));
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

  useEffect(() => {
    if (!selectedPlan || !conversationId) return;
    const lastMessage = latestMessage(messages);
    setConversationSummaries(prev => ({
      ...prev,
      [selectedPlan.id]: {
        lastMessage,
        unread: 0,
      },
    }));
  }, [messages, selectedPlan, conversationId, teacherId]);

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
      setMessages(prev => sortMessages(prev.some(x => x.id === res.data.id) ? prev : [...prev, res.data]));
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
    return studentCode(p.studentId).toLowerCase().includes(q)
      || studentLabel(p.studentId).toLowerCase().includes(q);
  }).sort((a, b) => {
    const aTime = conversationSummaries[a.id]?.lastMessage?.sentAt;
    const bTime = conversationSummaries[b.id]?.lastMessage?.sentAt;
    return new Date(bTime || 0).getTime() - new Date(aTime || 0).getTime();
  });

  return (
    <div className="h-[calc(100vh-112px)] overflow-hidden">
      <Card className="h-full overflow-hidden rounded-md">
        <CardContent className="p-0 h-full min-h-0">
          <div className="flex h-full min-h-0">
            {/* Conversations List */}
            <aside className="w-80 shrink-0 border-r border-border flex flex-col h-full min-h-0 bg-surface">
              <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-ink-900 mb-3">Чат</h2>
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
              <div className="flex-1 min-h-0 overflow-y-auto">
                {filteredPlans.length === 0 ? (
                  <div className="p-4 text-center text-ink-400 text-sm mt-4">Оюутан олдсонгүй</div>
                ) : (
                  filteredPlans.map(plan => {
                    const active = selectedPlan?.id === plan.id;
                    const summary = conversationSummaries[plan.id];
                    const last = summary?.lastMessage;
                    const lastMine = last?.senderId === teacherId;
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
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-ink-900 truncate tracking-tight">{studentLabel(plan.studentId)}</p>
                              {last?.sentAt && (
                                <span className="text-[10px] text-ink-400 tabular-nums shrink-0">{timeLabel(last.sentAt)}</span>
                              )}
                            </div>
                            {studentCode(plan.studentId) && (
                              <p className="text-[10px] text-ink-400 truncate mt-0.5">{studentCode(plan.studentId)}</p>
                            )}
                            <div className="mt-0.5 flex items-center gap-2 min-w-0">
                              <p className={`text-xs truncate ${summary?.unread ? "text-ink-900 font-medium" : "text-ink-500"}`}>
                                {last ? `${lastMine ? "Та: " : "Оюутан: "}${last.content}` : statusLabel(plan.status)}
                              </p>
                              {!!summary?.unread && (
                                <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white tabular-nums shrink-0">
                                  {summary.unread > 9 ? "9+" : summary.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Chat Area */}
            <section className="flex-1 flex flex-col h-full min-h-0 bg-surface">
              {!selectedPlan ? (
                <div className="flex-1 flex items-center justify-center bg-surface-sunken">
                  <p className="text-ink-400 text-sm">Зүүн талаас оюутан сонгоно уу</p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-border flex items-center justify-between bg-surface shrink-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border-strong">
                        <AvatarFallback className="text-sm font-medium">
                          {initialsFromName(studentLabel(selectedPlan.studentId))}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-ink-900 tracking-tight">{studentLabel(selectedPlan.studentId)}</p>
                        <p className="text-xs text-ink-500">
                          {[studentCode(selectedPlan.studentId), statusLabel(selectedPlan.status)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-surface-sunken">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-ink-500">
                        <p className="text-sm">Харилцаа алга байна</p>
                        <p className="text-xs mt-1 text-ink-400">Оюутантайгаа харилцаагаа эхлүүлнэ үү.</p>
                      </div>
                    ) : (
                      <div className="min-h-full flex flex-col justify-end gap-4">
                        {messages.map(msg => {
                          const mine = msg.senderId === teacherId;
                          return (
                            <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                              <div className="flex items-end gap-2 max-w-[72%]">
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
                                      ? "bg-accent text-white"
                                      : "bg-surface text-ink-900 border border-border"
                                  }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                  </div>
                                  <p className={`text-[10px] mt-1 text-ink-400 tabular-nums ${mine ? "text-right" : ""}`}>
                                    {msg.sentAt
                                      ? timeLabel(msg.sentAt)
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
                        })}
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <div className="p-4 border-t border-border bg-surface space-y-2 shrink-0">
                    <div className="flex items-end gap-2">
                      <Textarea
                        placeholder="Мессежээ бичнэ үү..."
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-11 max-h-28 flex-1 resize-none"
                        disabled={sending}
                      />
                      <Button className="h-11 flex-shrink-0" disabled={sending || !messageText.trim()} onClick={handleSendMessage}>
                        <Send className="h-4 w-4 mr-2" strokeWidth={1.6} />
                        Илгээх
                      </Button>
                    </div>
                    {sendError && (
                      <p className="text-xs text-[var(--color-dot-negative)] inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)]" /> {sendError}
                      </p>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
