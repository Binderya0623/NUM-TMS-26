import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Award, CheckCircle2, Calendar, MapPin, Users, ChevronUp, Send, FileText } from "lucide-react";
import { committeeService } from "../../../services/committeeService";
import { RichTextEditor } from "../../components/RichTextEditor";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { evaluationService, type DefenseGrade } from "../../../services/evaluationService";
import { userService } from "../../../services/userService";
import { planService } from "../../../services/planService";
import { thesisService, type ReportFile } from "../../../services/thesisService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName, isUuid } from "../../../lib/utils";
import FilePreviewModal from "../../components/FilePreviewModal";

type Tone = "positive" | "warning" | "negative" | "neutral";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]",
};

const isClosedStatus = (status?: string) => {
  const normalized = (status || "").trim().toUpperCase();
  return normalized === "CLOSED" || normalized === "ХААГДСАН" || normalized === "ДУУССАН";
};

const GRADING_SCHEMES: Record<string, { label: string; total: number; criteria: { name: string; max: number }[] }> = {
  PRE_DEFENSE: {
    label: "Урьдчилсан хамгаалалтын үнэлгээ",
    total: 25,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 },
      { name: "Гар бичмэл", max: 5 },
    ],
  },
  FINAL_DEFENSE: {
    label: "Эцсийн хамгаалалтын үнэлгээ",
    total: 40,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 },
      { name: "Гар бичмэл", max: 5 },
      { name: "Шүүмж (Reviewer)", max: 5 },
      { name: "Нэмэлт үнэлгээ", max: 10 },
    ],
  },
};

interface StudentInfo { studentId: string; name: string; thesisTitle: string; thesisId?: string; sisId?: string; }

interface CommitteeData {
  committeeId: string;
  committeeName: string;
  stageType: string;
  session: DefenseSession | null;
  students: StudentInfo[];
  myGrades: Record<string, DefenseGrade>;
}

export default function ExternalExpertGrading() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || '';

  const [committees, setCommittees] = useState<CommitteeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState<Record<string, "roster" | "evaluations">>({});

  const [gradingStudent, setGradingStudent] = useState<{ studentId: string; committeeId: string } | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comment, setComment] = useState("");
  const [gradeStatus, setGradeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [gradeError, setGradeError] = useState<string | null>(null);

  // Thesis manuscript viewer state — expert clicks "View manuscript" on a row.
  const [manuscriptFiles, setManuscriptFiles] = useState<ReportFile[]>([]);
  const [manuscriptActiveId, setManuscriptActiveId] = useState<string | null>(null);
  const [manuscriptLoadingFor, setManuscriptLoadingFor] = useState<string | null>(null);
  const [manuscriptError, setManuscriptError] = useState<string | null>(null);

  const openManuscript = async (studentId: string) => {
    setManuscriptLoadingFor(studentId);
    setManuscriptError(null);
    try {
      const reportsRes = await thesisService.getReports({ studentId });
      const reports = reportsRes.data || [];
      if (reports.length === 0) {
        setManuscriptError("Энэ оюутан тайлан илгээгээгүй байна.");
        return;
      }
      const fileLists = await Promise.all(
        reports.map(r => thesisService.getReportFiles(r.id).then(r2 => r2.data).catch(() => []))
      );
      const files = fileLists.flat();
      if (files.length === 0) {
        setManuscriptError("Тайланд файл хавсаргагдаагүй байна.");
        return;
      }
      setManuscriptFiles(files);
      setManuscriptActiveId(files[0].id);
    } catch {
      setManuscriptError("Тайланг ачаалж чадсангүй.");
    } finally {
      setManuscriptLoadingFor(null);
    }
  };

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }
    const load = async () => {
      try {
        const [assignRes, usersRes] = await Promise.all([
          committeeService.getMyAssignments(teacherId),
          userService.getStudents(),
        ]);
        const expertAssignments = assignRes.data.filter(a => a.role === 'EXTERNAL_EXPERT');
        if (expertAssignments.length === 0) { setLoading(false); return; }

        const userMap: Record<string, string> = {};
        const userCodeMap: Record<string, string> = {};
        usersRes.data.forEach(u => {
          userMap[u.id] = u.displayName;
          if (u.username) userMap[u.username] = u.displayName;
          const code = u.sisId || u.studentId || u.username || '';
          if (code) {
            userCodeMap[u.id] = code;
            if (u.username) userCodeMap[u.username] = code;
          }
        });
        const codeFor = (id: string) => userCodeMap[id] || (isUuid(id) ? '' : id);

        const allPlansRes = await planService.getPlans().catch(() => ({ data: [] as any[] }));
        const planMap: Record<string, { title?: string; thesisId?: string }> = {};
        allPlansRes.data.forEach((p: any) => {
          planMap[p.studentId] = { title: p.title, thesisId: p.thesisId };
        });

        const items: CommitteeData[] = [];
        await Promise.all(expertAssignments.map(async (assignment) => {
          try {
            const [committeeRes, studentsRes] = await Promise.all([
              committeeService.getById(assignment.committeeId),
              committeeService.getStudents(assignment.committeeId),
            ]);
            const committee = committeeRes.data;
            // External expert behaves like a regular committee member: only a
            // closed committee is locked. Scheduled/open/active committees are gradable.
            if (isClosedStatus(committee.status)) return;

            const stageType = committee.stageType || '';
            // Admin creates a single GLOBAL defense session per stage (committeeId='GLOBAL'),
            // so querying by committeeId misses it. Query by stageType, prefer per-committee
            // session, else fall back to the global one. Don't restrict to OPEN/ACTIVE —
            // a SCHEDULED final-defense session should still surface so the expert sees
            // the roster ahead of the session opening.
            const sessionsRes = await workflowService.getDefenseSessions({ stageType })
              .catch(() => ({ data: [] as DefenseSession[] }));
            const all = sessionsRes.data;
            const byStatus = (target: string) =>
              all.find(s => s.committeeId === assignment.committeeId && s.status === target)
              || all.find(s => s.stageType === stageType && s.status === target);
            const session = byStatus('ACTIVE')
              || byStatus('OPEN')
              || byStatus('SCHEDULED')
              || all.find(s => s.committeeId === assignment.committeeId)
              || all.find(s => s.stageType === stageType)
              || null;

            const students: StudentInfo[] = studentsRes.data.map(cs => ({
              studentId: cs.studentId,
              name: resolveName(cs.studentId, userMap, 'Тодорхойгүй оюутан'),
              thesisTitle: planMap[cs.studentId]?.title || 'Гарчиггүй',
              thesisId: planMap[cs.studentId]?.thesisId,
              sisId: codeFor(cs.studentId),
            }));

            const myGrades: Record<string, DefenseGrade> = {};
            if (session) {
              const gradesRes = await evaluationService.getDefenseGrades({
                defenseSessionId: session.id,
                evaluatorId: teacherId,
              });
              gradesRes.data.forEach(g => { myGrades[g.studentId] = g; });
            }

            items.push({ committeeId: assignment.committeeId, committeeName: committee.name, stageType, session, students, myGrades });
          } catch { /* skip failed committee */ }
        }));

        setCommittees(items);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId]);

  const openGrading = (committeeId: string, studentId: string, existing?: DefenseGrade) => {
    setGradingStudent({ committeeId, studentId });
    setScores({});
    setComment(existing?.comment || '');
    setGradeStatus('idle');
    setGradeError(null);
  };

  // External experts are never the assigned reviewer, so drop the
  // "Шүүмж (Reviewer)" criterion at FINAL_DEFENSE.
  const getSchemeFor = (stageType: string) => {
    const base = GRADING_SCHEMES[stageType];
    if (!base) return null;
    if (stageType !== 'FINAL_DEFENSE') return base;
    const criteria = base.criteria.filter(c => !c.name.startsWith('Шүүмж'));
    const total = criteria.reduce((sum, c) => sum + c.max, 0);
    return { ...base, criteria, total };
  };

  const handleSubmit = async (cmt: CommitteeData, student: StudentInfo) => {
    if (!cmt.session) return;
    const scheme = getSchemeFor(cmt.stageType);
    if (!scheme) return;
    const total = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
    setGradeStatus('loading');
    setGradeError(null);
    try {
      const res = await evaluationService.saveGrade({
        defenseSessionId: cmt.session.id,
        // Backend uniqueness still includes thesis_id, so never send blank:
        // external experts may grade committee students whose thesis lookup is
        // unavailable in this frontend context.
        thesisId: student.thesisId || student.studentId,
        studentId: student.studentId,
        evaluatorId: teacherId,
        evaluatorRole: 'EXTERNAL_EXPERT',
        points: total,
        maxPoints: scheme.total,
        comment,
      });
      await evaluationService.submitGrade(res.data.id);
      setCommittees(prev => prev.map(c =>
        c.committeeId !== cmt.committeeId ? c : {
          ...c,
          myGrades: { ...c.myGrades, [student.studentId]: { ...res.data, isSubmitted: true } },
        }
      ));
      setGradeStatus('success');
      setActiveTabs(prev => ({ ...prev, [cmt.committeeId]: "roster" }));
      setTimeout(() => { setGradingStudent(null); setScores({}); setComment(''); setGradeStatus('idle'); }, 1500);
    } catch (err: any) {
      setGradeError(err?.response?.data?.message || 'Үнэлгээ илгээхэд алдаа гарлаа.');
      setGradeStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-400">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-6 h-6 border-2 border-ink-900 border-t-transparent rounded-full" />
          <span className="text-sm">Ачааллаж байна...</span>
        </div>
      </div>
    );
  }

  if (committees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-ink-500">
        <Award className="w-10 h-10 text-ink-200 mb-4" strokeWidth={1.4} />
        <p className="text-base font-medium text-ink-700">Зочин шүүгчийн үнэлгээ байхгүй</p>
        <p className="text-sm mt-1 text-ink-400">Танд хуваарилагдсан комиссийн үнэлгээ олдсонгүй.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {committees.map(cmt => {
        const scheme = getSchemeFor(cmt.stageType);
        const sessionClosed = isClosedStatus(cmt.session?.status);
        const canGrade = !!cmt.session && !sessionClosed;
        const stageLabel = cmt.stageType === 'PRE_DEFENSE' ? 'Урьдчилсан хамгаалалт' : 'Эцсийн хамгаалалт';
        const gradedCount = cmt.students.filter(s => cmt.myGrades[s.studentId]?.isSubmitted).length;
        const activeTab = activeTabs[cmt.committeeId] || "roster";
        const selectedStudent = gradingStudent?.committeeId === cmt.committeeId
          ? cmt.students.find(s => s.studentId === gradingStudent.studentId)
          : undefined;
        const selectedExisting = selectedStudent ? cmt.myGrades[selectedStudent.studentId] : undefined;
        const totalScore = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
        const scorePct = scheme ? Math.min(100, Math.round((totalScore / scheme.total) * 100)) : 0;
        const completedCriteria = scheme ? scheme.criteria.filter((_, idx) => scores[idx] !== undefined && scores[idx] !== null).length : 0;

        return (
          <Card key={cmt.committeeId} className="border border-border">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base text-ink-900 tracking-tight mb-1.5">{cmt.committeeName}</CardTitle>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-ink-500">
                    <span className="text-ink-700">{stageLabel}</span>
                    {cmt.session?.scheduledDate && (
                      <span className="flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3 h-3" strokeWidth={1.6} />
                        {new Date(cmt.session.scheduledDate).toLocaleString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {cmt.session?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" strokeWidth={1.6} />{cmt.session.location}
                      </span>
                    )}
                    {canGrade && (
                      <span className="inline-flex items-center gap-1.5 text-ink-700">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                        Явцад байна
                      </span>
                    )}
                    {sessionClosed && (
                      <span className="inline-flex items-center gap-1.5 text-ink-500">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.neutral}`} />
                        Дууссан
                      </span>
                    )}
                    {!cmt.session && (
                      <span className="text-ink-400">Хуваарь тогтоогдоогүй</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-ink-500 flex items-center gap-1 justify-end tabular-nums">
                    <Users className="w-3.5 h-3.5" strokeWidth={1.6} /> {cmt.students.length} оюутан
                  </p>
                  {cmt.students.length > 0 && (
                    <p className="text-xs font-medium text-ink-900 mt-0.5 tabular-nums">
                      {gradedCount}/{cmt.students.length} үнэлсэн
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTabs(prev => ({ ...prev, [cmt.committeeId]: value as "roster" | "evaluations" }))}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="roster">Оюутны жагсаалт</TabsTrigger>
                  <TabsTrigger value="evaluations">
                    Үнэлгээний маягт {scheme && <span className="ml-1 text-[10px] text-ink-400 tabular-nums">({scheme.total} оноо)</span>}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="roster" className="mt-6">
                  {!cmt.session ? (
                    <div className="p-8 text-center text-ink-400 text-sm bg-surface-muted rounded-md border border-border">
                      Хамгаалалтын сесс олдсонгүй.
                    </div>
                  ) : cmt.students.length === 0 ? (
                    <div className="p-8 text-center text-ink-400 text-sm bg-surface-muted rounded-md border border-border">
                      Комисст оюутан байхгүй байна.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cmt.students.map(student => {
                        const existing = cmt.myGrades[student.studentId];
                        return (
                          <Card key={student.studentId} className="hover:border-accent transition-colors overflow-hidden">
                            <div className={`h-0.5 w-full ${existing?.isSubmitted ? "bg-accent" : "bg-border-strong"}`} />
                            <CardContent className="p-5">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10 shrink-0 border border-border-strong">
                                  <AvatarFallback className="text-sm font-medium">
                                    {student.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <h3 className="text-sm font-semibold text-ink-900 tracking-tight truncate">{student.name}</h3>
                                      {student.sisId && <p className="text-[10px] text-ink-400 truncate mt-0.5">{student.sisId}</p>}
                                    </div>
                                    {existing?.isSubmitted && scheme && (
                                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 tabular-nums shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-dot-positive)]" strokeWidth={1.6} />
                                        {existing.points}/{scheme.total}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-ink-500 line-clamp-2 mt-2 mb-4 min-h-[2.5rem]">{student.thesisTitle}</p>
                                  <div className="flex gap-2 flex-wrap">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 text-xs"
                                      onClick={() => openManuscript(student.studentId)}
                                      disabled={manuscriptLoadingFor === student.studentId}
                                    >
                                      <FileText className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} />
                                      {manuscriptLoadingFor === student.studentId ? "Нээж байна..." : "Дипломын ажил"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="flex-1 text-xs"
                                      disabled={!canGrade}
                                      onClick={() => {
                                        openGrading(cmt.committeeId, student.studentId, existing);
                                        setActiveTabs(prev => ({ ...prev, [cmt.committeeId]: "evaluations" }));
                                      }}
                                    >
                                      <Award className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} />
                                      {existing ? "Засах" : "Үнэлэх"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="evaluations" className="mt-6">
                  {!scheme ? (
                    <Card>
                      <CardContent className="text-center py-16">
                        <Award className="w-8 h-8 text-ink-300 mx-auto mb-3" strokeWidth={1.5} />
                        <h3 className="text-base font-semibold text-ink-900 tracking-tight">Үнэлгээний маягт олдсонгүй</h3>
                        <p className="text-sm text-ink-500 mt-1.5">Энэ шатанд тохирох үнэлгээний тохиргоо байхгүй байна.</p>
                      </CardContent>
                    </Card>
                  ) : !selectedStudent ? (
                    <Card>
                      <CardContent className="text-center py-16">
                        <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4">
                          <Users className="w-5 h-5 text-ink-400" strokeWidth={1.6} />
                        </div>
                        <h3 className="text-base font-semibold text-ink-900 tracking-tight">Үнэлэх оюутан сонгоно уу</h3>
                        <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto">
                          "Оюутны жагсаалт" табаас оюутнаа сонгоод "Үнэлэх" товчийг дарна уу.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
                      <Card className="xl:sticky xl:top-4 overflow-hidden">
                        <div className="h-1 bg-accent" />
                        <CardContent className="p-5 space-y-5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-0"
                            onClick={() => {
                              setActiveTabs(prev => ({ ...prev, [cmt.committeeId]: "roster" }));
                            }}
                          >
                            <ChevronUp className="w-4 h-4 mr-2 -rotate-90" strokeWidth={1.6} />
                            Оюутны жагсаалт
                          </Button>
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12 border border-border-strong shrink-0">
                              <AvatarFallback className="text-sm font-medium">
                                {selectedStudent.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h3 className="text-base font-semibold text-ink-900 tracking-tight truncate">{selectedStudent.name}</h3>
                              {selectedStudent.sisId && <p className="text-[10px] text-ink-400 truncate mt-0.5">{selectedStudent.sisId}</p>}
                              <p className="text-xs text-ink-500 line-clamp-2 mt-1">{selectedStudent.thesisTitle}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] uppercase tracking-wider font-medium text-accent bg-accent-softer rounded-sm px-2 py-0.5">{cmt.stageType}</span>
                              <span className="text-[11px] uppercase tracking-wider font-medium text-ink-600 bg-surface-muted border border-border rounded-sm px-2 py-0.5">Үүрэг: EXTERNAL_EXPERT</span>
                            </div>
                            <p className="text-sm font-medium text-ink-900">{scheme.label}</p>
                            <p className="text-xs text-ink-500">{completedCriteria}/{scheme.criteria.length} шалгуур бөглөгдсөн</p>
                          </div>
                          <div className="rounded-md border border-border bg-surface-muted p-4">
                            <div className="flex items-end justify-between gap-3">
                              <div>
                                <p className="text-xs text-ink-500 font-medium">Нийт оноо</p>
                                <div className="flex items-baseline gap-1.5 tabular-nums mt-1">
                                  <span className={`text-4xl font-semibold ${totalScore > scheme.total ? "text-[var(--color-dot-negative)]" : "text-accent"}`}>{totalScore}</span>
                                  <span className="text-ink-500 text-sm">/ {scheme.total}</span>
                                </div>
                              </div>
                              <span className="text-xs text-ink-500 tabular-nums">{scorePct}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-border overflow-hidden mt-3">
                              <div
                                className={`h-full ${totalScore > scheme.total ? "bg-[var(--color-dot-negative)]" : "bg-accent"} transition-all`}
                                style={{ width: `${scorePct}%` }}
                              />
                            </div>
                          </div>
                          {selectedExisting?.isSubmitted && (
                            <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm inline-flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                              Өмнөх үнэлгээ: <span className="font-semibold tabular-nums">{selectedExisting.points}/{scheme.total}</span>
                            </div>
                          )}
                          {gradeError && (
                            <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm inline-flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                              {gradeError}
                            </div>
                          )}
                          {gradeStatus === "success" ? (
                            <div className="border border-border bg-surface text-ink-900 p-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                              Үнэлгээ амжилттай хадгалагдлаа!
                            </div>
                          ) : (
                            <Button
                              className="w-full"
                              size="lg"
                              disabled={gradeStatus === "loading" || totalScore === 0 || totalScore > scheme.total}
                              onClick={() => handleSubmit(cmt, selectedStudent)}
                            >
                              {gradeStatus === "loading" ? (
                                <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Илгээж байна...</span>
                              ) : (
                                <><Send className="w-4 h-4 mr-2" strokeWidth={1.6} />Үнэлгээ илгээх</>
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        <Card>
                          <CardHeader className="border-b border-border pb-4">
                            <CardTitle className="text-base">{scheme.label}</CardTitle>
                            <p className="text-sm text-ink-500 mt-1">Шалгуур бүрийн оноог оруулаад нийт оноогоо шалгана уу.</p>
                          </CardHeader>
                          <CardContent className="p-5 space-y-3">
                            {scheme.criteria.map((criterion, idx) => {
                              const value = scores[idx];
                              const half = Math.floor(criterion.max / 2);
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
                                        onChange={(e) => {
                                          const v = Number(e.target.value) || 0;
                                          setScores(prev => ({ ...prev, [idx]: Math.max(0, Math.min(criterion.max, v)) }));
                                        }}
                                      />
                                      <span className="text-sm text-ink-500 tabular-nums">/ {criterion.max}</span>
                                    </div>
                                  </div>
                                  <div className="mt-3 flex flex-wrap gap-2 pl-0 md:pl-8">
                                    {[0, half, criterion.max].map(v => (
                                      <button
                                        key={v}
                                        type="button"
                                        onClick={() => setScores(prev => ({ ...prev, [idx]: v }))}
                                        className={`h-7 rounded-md border px-2.5 text-xs font-medium transition-colors tabular-nums ${
                                          value === v
                                            ? "border-accent bg-accent-softer text-accent"
                                            : "border-border text-ink-600 hover:border-accent hover:text-accent"
                                        }`}
                                      >
                                        {v} оноо
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="border-b border-border pb-4">
                            <CardTitle className="text-base">Тайлбар</CardTitle>
                            <p className="text-sm text-ink-500 mt-1">Зочин шүүгчийн тэмдэглэл, зөвлөмжийг энд бичнэ үү.</p>
                          </CardHeader>
                          <CardContent className="p-5">
                            <RichTextEditor
                              value={comment}
                              onChange={setComment}
                              placeholder="Тайлбар (заавал биш)..."
                              minHeight={120}
                              ariaLabel="Үнэлгээний тайлбар"
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        );
      })}

      {manuscriptError && !manuscriptActiveId && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-surface border border-border rounded-md p-3 shadow-lg flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)] mt-1.5 shrink-0" />
          <div className="flex-1 text-sm text-ink-900">{manuscriptError}</div>
          <button
            type="button"
            onClick={() => setManuscriptError(null)}
            className="text-ink-400 hover:text-ink-900 text-xs px-1"
            aria-label="Хаах"
          >
            ✕
          </button>
        </div>
      )}

      {manuscriptActiveId && manuscriptFiles.length > 0 && (
        <FilePreviewModal
          files={manuscriptFiles}
          activeId={manuscriptActiveId}
          onClose={() => { setManuscriptFiles([]); setManuscriptActiveId(null); }}
          onSelect={setManuscriptActiveId}
        />
      )}
    </div>
  );
}
