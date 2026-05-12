import { useEffect, useState } from "react";
import { Award, Calendar, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { RichTextEditor } from "../../components/RichTextEditor";
import { evaluationService } from "../../../services/evaluationService";
import { planService, type Plan } from "../../../services/planService";
import { userService, type UserRecord } from "../../../services/userService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName } from "../../../lib/utils";

type Tone = "positive" | "negative" | "neutral";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]",
};

interface ProgressOneStudent {
  id: string;
  studentId: string;
  name: string;
  thesis: string;
  thesisId?: string;
}

const P1_CRITERIA = [
  { name: "Судалгааны тайлан", max: 10 },
  { name: "Танилцуулга", max: 5 },
];

export default function TeacherProgressOne() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || "";

  const [students, setStudents] = useState<ProgressOneStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress1Session, setProgress1Session] = useState<DefenseSession | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ scheduledDate: "", location: "", notes: "" });
  const [scheduleStatus, setScheduleStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [gradeStudentId, setGradeStudentId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [gradeStatus, setGradeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [existingGrades, setExistingGrades] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("roster");

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const [plansRes, usersRes, sessionsRes] = await Promise.all([
          planService.getPlans({ supervisorId: teacherId }),
          userService.getStudents(),
          workflowService.getDefenseSessions({ supervisorId: teacherId }).catch(() => ({ data: [] as DefenseSession[] })),
        ]);

        const users: UserRecord[] = usersRes.data;
        const userMap: Record<string, string> = {};
        users.forEach(u => {
          if (u.username) userMap[u.username] = u.displayName;
          userMap[u.id] = u.displayName;
        });

        setStudents((plansRes.data as Plan[]).map(p => ({
          id: p.studentId,
          studentId: p.studentId,
          name: resolveName(p.studentId, userMap, "Тодорхойгүй оюутан"),
          thesis: p.title || "Гарчиггүй ажил",
          thesisId: p.thesisId,
        })));

        const session = sessionsRes.data.find(s => s.stageType === "PROGRESS_1") || null;
        if (session) {
          setProgress1Session(session);
          setScheduleForm({
            scheduledDate: session.scheduledDate ? session.scheduledDate.slice(0, 16) : "",
            location: session.location || "",
            notes: session.notes || "",
          });
          const gradesRes = await evaluationService.getDefenseGrades({ defenseSessionId: session.id }).catch(() => ({ data: [] as any[] }));
          const gradeMap: Record<string, number> = {};
          gradesRes.data.forEach((g: any) => {
            gradeMap[g.studentId] = Number(g.points);
          });
          setExistingGrades(gradeMap);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId]);

  const selectedStudent = students.find(s => s.id === gradeStudentId);
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const saveSchedule = async () => {
    setScheduleStatus("saving");
    try {
      const payload = {
        scheduledDate: scheduleForm.scheduledDate ? new Date(scheduleForm.scheduledDate).toISOString().replace("Z", "") : undefined,
        location: scheduleForm.location || undefined,
        notes: scheduleForm.notes || undefined,
      };
      const res = progress1Session
        ? await workflowService.updateDefenseSession(progress1Session.id, payload)
        : await workflowService.createDefenseSession({ stageType: "PROGRESS_1", supervisorId: teacherId, ...payload });
      setProgress1Session(res.data);
      setScheduleStatus("success");
      setTimeout(() => setScheduleStatus("idle"), 3000);
    } catch {
      setScheduleStatus("error");
      setTimeout(() => setScheduleStatus("idle"), 3000);
    }
  };

  const submitGrade = async () => {
    if (!progress1Session || !gradeStudentId) return;
    setGradeStatus("loading");
    setGradeError(null);
    try {
      const res = await evaluationService.saveGrade({
        defenseSessionId: progress1Session.id,
        thesisId: selectedStudent?.thesisId || gradeStudentId,
        studentId: gradeStudentId,
        evaluatorId: teacherId,
        evaluatorRole: "SUPERVISOR",
        points: totalScore,
        maxPoints: 15,
      });
      if (!res.data?.id) throw new Error("Серверийн хариу дээр id олдсонгүй.");
      await evaluationService.submitGrade(res.data.id);
      setExistingGrades(prev => ({ ...prev, [gradeStudentId]: totalScore }));
      setGradeStatus("success");
      setTimeout(() => {
        setGradeStudentId(null);
        setScores({});
        setGradeStatus("idle");
        setActiveTab("roster");
      }, 2000);
    } catch (err: any) {
      const status = err?.response?.status;
      const raw = err?.response?.data;
      const msg = raw?.message || raw?.error || (typeof raw === "string" ? raw : "") || err?.message || "";
      setGradeError(status ? `HTTP ${status}${msg ? ` — ${msg}` : ""}` : (msg || "Алдаа гарлаа."));
      setGradeStatus("error");
      setTimeout(() => setGradeStatus("idle"), 5000);
    }
  };

  const openGrade = (student: ProgressOneStudent) => {
    setGradeStudentId(student.id);
    setScores({});
    setGradeError(null);
    setGradeStatus("idle");
    setActiveTab("evaluation");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <Card>
        <div className="h-0.5 w-full bg-accent" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                <span className={`w-1.5 h-1.5 rounded-full ${progress1Session ? toneDot.positive : toneDot.neutral}`} />
                Явц 1
              </span>
              <h2 className="text-lg font-semibold text-ink-900 tracking-tight mt-2">Явц 1 хуваарь ба үнэлгээ</h2>
              <p className="text-sm text-ink-500 mt-1">Удирдсан оюутнуудын Явц 1 хамгаалалтын цагийг товлож, үнэлгээ илгээнэ.</p>
            </div>
            <div className="text-right shrink-0 border border-border rounded-md p-3">
              <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{students.length}</div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1">Оюутан</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="roster">Оюутны жагсаалт</TabsTrigger>
          <TabsTrigger value="schedule">Явц 1 хуваарь</TabsTrigger>
          <TabsTrigger value="evaluation">Үнэлгээний маягт</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="mt-6">
          {loading ? (
            <div className="text-center py-12 text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-ink-400 text-sm bg-surface-muted rounded-md border border-border">
              Оюутан байхгүй байна.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map(student => {
                const savedScore = existingGrades[student.studentId];
                return (
                  <Card key={student.id} className="hover:border-accent transition-colors overflow-hidden">
                    <div className="h-0.5 w-full bg-border-strong">
                      <div className="h-full bg-accent transition-all" style={{ width: `${savedScore !== undefined ? 100 : 20}%` }} />
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 border border-border-strong shrink-0">
                          <AvatarFallback className="text-sm font-medium">
                            {(student.name || "??").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-ink-900 tracking-tight truncate">{student.name}</h3>
                            <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 shrink-0">
                              <span className={`w-1.5 h-1.5 rounded-full ${savedScore !== undefined ? toneDot.positive : toneDot.neutral}`} />
                              {savedScore !== undefined ? "Үнэлсэн" : "Хүлээгдэж байна"}
                            </span>
                          </div>
                          <p className="text-xs text-ink-500 line-clamp-2 mb-3 min-h-[2.5rem]">{student.thesis}</p>
                          <div className="flex items-center justify-between text-xs mb-4 rounded-md border border-border bg-surface-muted px-2.5 py-2">
                            <span className="text-ink-700">Явц 1</span>
                            <span className="text-ink-900 font-medium tabular-nums">
                              {savedScore !== undefined ? `${savedScore}/15` : "—"}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="w-full text-xs"
                            disabled={!progress1Session}
                            onClick={() => openGrade(student)}
                          >
                            <Award className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} />
                            {savedScore !== undefined ? "Засах" : "Үнэлэх"}
                          </Button>
                          {!progress1Session && (
                            <p className="text-[11px] text-ink-400 mt-2">Эхлээд хуваарь үүсгэнэ үү.</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card className="max-w-3xl">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" strokeWidth={1.6} />
                {progress1Session ? "Явц 1 хуваарийг засах" : "Явц 1 хуваарь үүсгэх"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">Огноо, цаг</label>
                <input
                  type="datetime-local"
                  className="w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-surface"
                  value={scheduleForm.scheduledDate}
                  onChange={e => setScheduleForm(f => ({ ...f, scheduledDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">Байршил / Өрөө</label>
                <input
                  type="text"
                  placeholder="Жнь: 305 тоот, A байр"
                  className="w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-surface"
                  value={scheduleForm.location}
                  onChange={e => setScheduleForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">Нэмэлт тэмдэглэл</label>
                <RichTextEditor
                  value={scheduleForm.notes}
                  onChange={(html) => setScheduleForm(f => ({ ...f, notes: html }))}
                  placeholder="Оюутнуудад мэдэгдэх мэдээлэл..."
                  minHeight={110}
                  ariaLabel="Хуваарийн нэмэлт тэмдэглэл"
                />
              </div>
              {scheduleStatus === "success" && (
                <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                  Хуваарь амжилттай хадгалагдлаа!
                </div>
              )}
              {scheduleStatus === "error" && (
                <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                  Алдаа гарлаа. Дахин оролдоно уу.
                </div>
              )}
              <Button className="w-full" disabled={!scheduleForm.scheduledDate || scheduleStatus === "saving"} onClick={saveSchedule}>
                {scheduleStatus === "saving" ? "Хадгалж байна..." : progress1Session ? "Шинэчлэх" : "Хуваарь үүсгэх"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="mt-6">
          {!gradeStudentId ? (
            <Card>
              <CardContent className="text-center py-16">
                <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4">
                  <Users className="w-5 h-5 text-ink-400" strokeWidth={1.6} />
                </div>
                <h3 className="text-base font-semibold text-ink-900 tracking-tight">Оюутан сонгоно уу</h3>
                <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto">
                  "Оюутны жагсаалт" хэсгээс оюутнаа сонгоод "Үнэлэх" товчийг дарна уу.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
              <Card className="xl:sticky xl:top-4 overflow-hidden">
                <div className="h-1 bg-accent" />
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border border-border-strong shrink-0">
                      <AvatarFallback className="text-sm font-medium">
                        {(selectedStudent?.name || "??").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-ink-900 tracking-tight truncate">{selectedStudent?.name || "Оюутан"}</h3>
                      <p className="text-xs text-ink-500 line-clamp-2 mt-1">{selectedStudent?.thesis || "Дипломын сэдэв"}</p>
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-surface-muted p-4">
                    <p className="text-xs text-ink-500 font-medium">Нийт оноо</p>
                    <div className="flex items-baseline gap-1.5 tabular-nums mt-1">
                      <span className="text-4xl font-semibold text-accent">{totalScore}</span>
                      <span className="text-ink-500 text-sm">/ 15</span>
                    </div>
                  </div>
                  {gradeError && (
                    <p className="text-xs text-ink-700 border border-border bg-surface rounded-md px-3 py-2 inline-flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                      {gradeError}
                    </p>
                  )}
                  {gradeStatus === "success" ? (
                    <div className="border border-border bg-surface text-ink-900 p-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                      Үнэлгээ амжилттай хадгалагдлаа!
                    </div>
                  ) : (
                    <Button className="w-full" size="lg" disabled={!progress1Session || gradeStatus === "loading" || totalScore === 0} onClick={submitGrade}>
                      {gradeStatus === "loading" ? "Илгээж байна..." : "Үнэлгээ илгээх"}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">Явц 1-ийн үнэлгээ</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {P1_CRITERIA.map((criterion, idx) => {
                    const value = scores[idx];
                    return (
                      <div key={idx} className="rounded-md border border-border bg-surface p-4 hover:border-border-strong transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent-softer text-xs font-semibold text-accent tabular-nums">
                                {idx + 1}
                              </span>
                              <p className="text-sm font-semibold text-ink-900 tracking-tight">{criterion.name}</p>
                            </div>
                            <p className="text-xs text-ink-500 mt-1 ml-8 tabular-nums">Дээд оноо: {criterion.max}</p>
                          </div>
                          <div className="flex items-center gap-2 md:justify-end">
                            <input
                              type="number"
                              min={0}
                              max={criterion.max}
                              step={1}
                              className="h-11 w-24 border border-border-strong rounded-md px-3 text-center text-base font-semibold focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 bg-surface tabular-nums"
                              value={value ?? ""}
                              onChange={e => setScores(s => ({ ...s, [idx]: Math.max(0, Math.min(criterion.max, Number(e.target.value) || 0)) }))}
                            />
                            <span className="text-sm text-ink-500 tabular-nums">/ {criterion.max}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
