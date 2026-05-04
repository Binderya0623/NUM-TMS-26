import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Search, Send, MoreVertical, Paperclip } from "lucide-react";
import { planService, type Plan } from "../../../services/planService";
import { chatService, type ChatMessage } from "../../../services/chatService";
import { userService } from "../../../services/userService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName, initialsFromName } from "../../../lib/utils";

export default function TeacherMessages() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || '';
  const teacherName = user?.username || 'Багш';

  useEffect(() => {
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

  const planStatusLabel: Record<string, string> = {
    DRAFT: 'Ноорог',
    SUBMITTED: 'Илгээсэн',
    REVISION_REQUIRED: 'Засвар шаардлагатай',
    APPROVED: 'Багш баталсан',
    DEPT_APPROVED: 'Тэнхим баталсан',
  };
  const statusLabel = (s?: string) => (s && planStatusLabel[s]) || s || '';

  useEffect(() => {
    const thesisId = selectedPlan?.thesisId ?? selectedPlan?.studentId;
    if (!thesisId) {
      setMessages([]);
      return;
    }
    const load = () => {
      chatService.getMessages(thesisId)
        .then(res => {
          setMessages(res.data);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [selectedPlan]);

  const handleSendMessage = () => {
    const thesisId = selectedPlan?.thesisId ?? selectedPlan?.studentId;
    if (!messageText.trim() || !thesisId) return;
    setSending(true);
    chatService.sendMessage(thesisId, teacherId, 'TEACHER', messageText.trim())
      .then(res => {
        setMessages(prev => [...prev, res.data]);
        setMessageText("");
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .catch(() => {})
      .finally(() => setSending(false));
  };

  const filteredPlans = plans.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.studentId.toLowerCase().includes(q)
      || studentLabel(p.studentId).toLowerCase().includes(q);
  });

  const isTeacherMessage = (msg: ChatMessage) =>
    msg.senderType === 'TEACHER' || msg.senderId === teacherId;

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
                    <Button variant="ghost" size="icon" aria-label="Дэлгэрэнгүй">
                      <MoreVertical className="h-4 w-4" strokeWidth={1.6} />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-sunken">
                    {messages.length === 0 ? (
                      <div className="text-center text-ink-500 pt-8">
                        <p className="text-sm">Харилцаа алга байна</p>
                        <p className="text-xs mt-1 text-ink-400">Оюутантайгаа харилцаагаа эхлүүлнэ үү.</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const mine = isTeacherMessage(msg);
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
                                  <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                                <p className={`text-[10px] mt-1 text-ink-400 tabular-nums ${mine ? "text-right" : ""}`}>
                                  {msg.sentAt?.split('T')[1]?.substring(0, 5) || ''}
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

                  <div className="p-4 border-t border-border bg-surface">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="Файл хавсаргах">
                        <Paperclip className="h-4 w-4" strokeWidth={1.6} />
                      </Button>
                      <Input
                        placeholder="Мессежээ бичнэ үү..."
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button className="flex-shrink-0" disabled={sending || !messageText.trim()} onClick={handleSendMessage}>
                        <Send className="h-4 w-4 mr-2" strokeWidth={1.6} />
                        Илгээх
                      </Button>
                    </div>
                    <p className="text-xs text-ink-400 mt-2">Enter — илгээх, Shift+Enter — шинэ мөр</p>
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
