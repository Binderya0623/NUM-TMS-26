import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ChevronRight, Star } from "lucide-react";
import { committeeService, type Committee, type CommitteeAssignment } from "../../../services/committeeService";
import { getStoredUser } from "../../../lib/authGuard";
import { useNavigate } from "react-router";

interface CommitteeWithRole extends Committee {
  role: string;
}

type Tone = "positive" | "warning" | "negative" | "neutral";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]",
};

const stageLabel = (stageType: string) => {
  const map: Record<string, string> = {
    PROGRESS_1: "Явц 1-ийн хяналт",
    PROGRESS_2: "Явц 2-ын хяналт",
    PRE_DEFENSE: "Урьдчилсан хамгаалалт",
    FINAL_DEFENSE: "Эцсийн хамгаалалт",
  };
  return map[stageType] || stageType;
};

export default function TeacherCommittee() {
  const [activeTab, setActiveTab] = useState("students");
  const [myCommittees, setMyCommittees] = useState<CommitteeWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || '';

  useEffect(() => {
    const load = async () => {
      try {
        const assignmentsRes = await committeeService.getMyAssignments(teacherId);
        const assignments: CommitteeAssignment[] = assignmentsRes.data;

        const committeeIds = [...new Set(assignments.map(a => a.committeeId))];
        const committees = await Promise.all(
          committeeIds.map(id => committeeService.getById(id).then(r => r.data).catch(() => null))
        );

        const withRole: CommitteeWithRole[] = committees
          .filter((c): c is Committee => c !== null)
          .map(c => ({
            ...c,
            role: assignments.find(a => a.committeeId === c.id)?.role || 'MEMBER',
          }));
        setMyCommittees(withRole);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId]);

  const pending = myCommittees.filter(c => c.status === 'ACTIVE' || c.status === 'Идэвхтэй');
  const completed = myCommittees.filter(c => c.status !== 'ACTIVE' && c.status !== 'Идэвхтэй');

  const completionRatio =
    pending.length + completed.length > 0
      ? Math.round((completed.length / (pending.length + completed.length)) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Hero card — student-style headline */}
      <Card>
        <div className="h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md">
          <div className="h-full bg-accent transition-all duration-700" style={{ width: `${completionRatio}%` }} />
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                  <span className={`w-1.5 h-1.5 rounded-full ${pending.length > 0 ? toneDot.warning : toneDot.positive}`} />
                  {pending.length > 0 ? `${pending.length} идэвхтэй комисс` : "Бүх комисс дууссан"}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1 tabular-nums">
                  {pending.length + completed.length} нийт
                </span>
              </div>
              <h2 className="text-lg font-semibold text-ink-900 tracking-tight leading-tight">Комиссын ажил</h2>
              <p className="text-sm text-ink-500 mt-1">Комиссийн гишүүнээр хуваарилагдсан үнэлгээг удирдана уу.</p>
            </div>
            <div className="text-right shrink-0 border border-border rounded-md p-3">
              <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{completionRatio}%</div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1">Дууссан</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          {[
            { value: "students", label: "Хуваарилагдсан комиссууд" },
            { value: "completed", label: "Дууссан үнэлгээнүүд" },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="students" className="mt-6 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : (
            <>
              <h2 className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Идэвхтэй комиссууд</h2>
              {pending.length === 0 ? (
                <div className="text-center py-8 text-ink-400 text-sm bg-surface-muted rounded-md border border-border">Идэвхтэй комисс байхгүй байна.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pending.map(c => (
                    <Card key={c.id} className="border border-border hover:border-accent transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar className="h-10 w-10 border border-border-strong">
                            <AvatarFallback className="text-sm font-medium">
                              {c.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-sm font-semibold text-ink-900 tracking-tight truncate">{c.name}</p>
                              <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 whitespace-nowrap">
                                <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                                Идэвхтэй
                              </span>
                            </div>
                            <p className="text-xs text-ink-500 mt-0.5">{c.stageType ? stageLabel(c.stageType) : '—'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                          <div className="rounded-md border border-border bg-surface-muted p-2.5">
                            <span className="text-[10px] uppercase tracking-wider font-medium text-ink-500 block mb-1">Үүрэг</span>
                            <span className="text-sm font-medium text-ink-900">{c.role}</span>
                          </div>
                          <div className="rounded-md border border-border bg-surface-muted p-2.5">
                            <span className="text-[10px] uppercase tracking-wider font-medium text-ink-500 block mb-1">Статус</span>
                            <span className="text-sm font-medium text-ink-900">{c.status}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => { e.stopPropagation(); navigate(`/teacher/students?committeeId=${c.id}&stageType=${c.stageType || ''}`); }}
                        >
                          <Star className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Үнэлэх
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <h2 className="text-[11px] uppercase tracking-wider font-medium text-ink-500 pt-4">Дууссан комиссууд</h2>
              {completed.length === 0 ? (
                <div className="text-center py-4 text-ink-400 text-sm">Дууссан комисс байхгүй.</div>
              ) : (
                <Card className="border border-border">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {completed.map(c => (
                        <div key={c.id} className="p-4 flex items-center justify-between hover:bg-surface-muted transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border-strong">
                              <AvatarFallback className="text-xs font-medium">
                                {c.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-ink-900 tracking-tight">{c.name}</p>
                              <p className="text-xs text-ink-500">{c.stageType ? stageLabel(c.stageType) : '—'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-ink-600">{c.role}</span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                              Дууссан
                            </span>
                            <ChevronRight className="w-4 h-4 text-ink-300" strokeWidth={1.6} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {completed.length === 0 ? (
            <div className="text-center py-12 text-ink-400 text-sm bg-surface-muted border border-border rounded-md">Дууссан үнэлгээ байхгүй байна.</div>
          ) : (
            completed.map(c => (
              <Card key={c.id} className="border border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border-strong">
                        <AvatarFallback className="text-sm font-medium">
                          {c.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-ink-900 tracking-tight">{c.name}</p>
                        <p className="text-xs text-ink-500">{c.role} · {c.stageType ? stageLabel(c.stageType) : '—'}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                      Дууссан
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">Тайлбарын түүх</h4>
                    {c.closingNote && c.closingNote.trim() ? (
                      <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">{c.closingNote}</p>
                    ) : (
                      <p className="text-sm text-ink-400 italic">Тайлбар бичигдээгүй байна.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
