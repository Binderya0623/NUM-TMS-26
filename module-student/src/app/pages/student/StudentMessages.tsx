import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { chatService, type ChatMessage } from "../../../services/chatService";
import { planService } from "../../../services/planService";
import { topicService } from "../../../services/topicService";
import { userService } from "../../../services/userService";
import { getStoredUser } from "../../../lib/authGuard";
import { initialsFromName } from "../../../lib/utils";

interface SupervisorRef {
  id: string;
  name: string;
}

export default function StudentMessages() {
  const user = getStoredUser();
  const studentId = user?.userId || user?.username || "";

  const [supervisor, setSupervisor] = useState<SupervisorRef | null>(null);
  const [thesisId, setThesisId] = useState<string | null>(null);
  const [resolveStatus, setResolveStatus] = useState<"loading" | "ready" | "no-supervisor">("loading");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Resolve the conversation peer (supervisor) using the same chain the rest
  // of the student app uses: plan.supervisorId, then any APPROVED topic
  // request's responder, in that order. If neither is available the student
  // simply has no peer to chat with yet.
  useEffect(() => {
    if (!studentId) { setResolveStatus("no-supervisor"); return; }
    let cancelled = false;
    (async () => {
      try {
        const planRes = await planService.getMyPlan(studentId).catch(() => ({ data: [] as any[] }));
        const plan = planRes.data?.[0] ?? null;
        let supId: string | undefined = plan?.supervisorId;
        const tId: string | null = plan?.thesisId ?? null;

        if (!supId) {
          const reqRes = await topicService.getMyRequests(studentId).catch(() => ({ data: [] as any[] }));
          const approved = (reqRes.data || []).find((r: any) => r.status === "APPROVED");
          supId = approved?.respondedById;
        }
        if (cancelled) return;
        if (!supId) { setResolveStatus("no-supervisor"); return; }

        const supRes = await userService.getById(supId).catch(() => ({ data: null as any }));
        if (cancelled) return;
        setSupervisor({ id: supId, name: supRes.data?.displayName || supId });
        setThesisId(tId);
        setResolveStatus("ready");
      } catch {
        if (!cancelled) setResolveStatus("no-supervisor");
      }
    })();
    return () => { cancelled = true; };
  }, [studentId]);

  const conversationId = useMemo(() => {
    if (!supervisor) return null;
    return chatService.conversationId(studentId, supervisor.id, thesisId);
  }, [studentId, supervisor, thesisId]);

  // Live conversation feed: fetch the backlog once, then subscribe to SSE for
  // new messages and read receipts. Falls back to polling only if SSE fails
  // to open (proxy strips text/event-stream, network blocked, etc.).
  useEffect(() => {
    if (!conversationId || !studentId) return;
    let cancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let stop: (() => void) | null = null;

    const reconcileSeen = (msgs: ChatMessage[]) => {
      if (msgs.some(m => m.receiverId === studentId && m.status !== "SEEN")) {
        chatService.markRead(conversationId, studentId);
      }
    };
    const loadBacklog = async () => {
      const res = await chatService.getMessages(conversationId);
      if (cancelled) return;
      setMessages(res.data);
      reconcileSeen(res.data);
    };

    loadBacklog();
    stop = chatService.openStream(conversationId, {
      onMessage: (m) => {
        if (cancelled) return;
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
        if (m.receiverId === studentId && m.status !== "SEEN") {
          chatService.markRead(conversationId, studentId);
        }
      },
      onSeen: (e) => {
        if (cancelled || e.viewerId === studentId) return;
        // Counterpart read our outbound messages — flip their status locally
        // so the "Уншсан" indicator updates without a refetch.
        setMessages(prev => prev.map(m =>
          m.senderId === studentId && m.receiverId === e.viewerId
            ? { ...m, status: "SEEN", seenAt: e.at }
            : m,
        ));
      },
      onError: () => {
        // SSE failed; degrade to a 10s poll so chat keeps working.
        if (pollInterval || cancelled) return;
        pollInterval = setInterval(loadBacklog, 10000);
      },
    });

    return () => {
      cancelled = true;
      if (stop) stop();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [conversationId, studentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId || !supervisor) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await chatService.sendMessage({
        conversationId,
        senderId: studentId,
        receiverId: supervisor.id,
        content: messageText.trim(),
      });
      // The same message will also arrive via the SSE stream — dedupe by id
      // so we don't render it twice when the broadcast wins the race.
      setMessages(prev => prev.some(x => x.id === res.data.id) ? prev : [...prev, res.data]);
      setMessageText("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || "";
      setSendError(typeof msg === "string" && msg ? msg : "Илгээж чадсангүй.");
    } finally {
      setSending(false);
    }
  };

  if (resolveStatus === "loading") {
    return <div className="text-center py-24 text-sm text-ink-400">Ачааллаж байна...</div>;
  }
  if (resolveStatus === "no-supervisor" || !supervisor) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 border border-border-strong rounded-full flex items-center justify-center mb-5">
          <MessageSquare className="w-6 h-6 text-ink-400" strokeWidth={1.4} />
        </div>
        <h2 className="text-lg font-semibold text-ink-900 tracking-tight mb-2">Удирдагч багш хуваарилагдаагүй байна</h2>
        <p className="text-ink-500 max-w-sm text-sm leading-relaxed">
          Сэдвийн хүсэлт батлагдсаны дараа удирдагч багштайгаа энд харилцах боломжтой болно.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)]">
      <Card className="h-full">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border-strong">
                <AvatarFallback className="text-sm font-medium">
                  {initialsFromName(supervisor.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-ink-900 tracking-tight">{supervisor.name}</p>
                <p className="text-xs text-ink-500">Дипломын удирдагч багш</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-sunken">
            {messages.length === 0 ? (
              <div className="text-center text-ink-500 pt-8">
                <p className="text-sm">Одоогоор мессеж байхгүй.</p>
                <p className="text-xs mt-1 text-ink-400">Багштайгаа харилцаагаа эхлүүлнэ үү.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const mine = msg.senderId === studentId;
                return (
                  <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className="flex items-end gap-2 max-w-[70%]">
                      {!mine && (
                        <Avatar className="h-7 w-7 border border-border-strong">
                          <AvatarFallback className="text-[10px] font-medium">
                            {initialsFromName(supervisor.name)}
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
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
