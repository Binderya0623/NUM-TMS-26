import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Award, CheckCircle2, Calendar, MapPin, Users, ChevronDown, ChevronUp, Send, FileText } from "lucide-react";
import { committeeService } from "../../../services/committeeService";
import { RichTextEditor } from "../../components/RichTextEditor";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { evaluationService, type DefenseGrade } from "../../../services/evaluationService";
import { userService } from "../../../services/userService";
import { planService } from "../../../services/planService";
import { thesisService, type ReportFile } from "../../../services/thesisService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName } from "../../../lib/utils";
import FilePreviewModal from "../../components/FilePreviewModal";

type Tone = "positive" | "warning" | "negative" | "neutral";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]",
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

interface StudentInfo { studentId: string; name: string; thesisTitle: string; thesisId?: string; }

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
        usersRes.data.forEach(u => {
          userMap[u.id] = u.displayName;
          if (u.username) userMap[u.username] = u.displayName;
        });

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
            // External expert behaves like a regular committee member: once the
            // committee is closed (secretary submitted), nothing is gradable, so
            // drop it from the active grading view entirely.
            if (committee.status !== 'ACTIVE' && committee.status !== 'Идэвхтэй') return;

            const stageType = committee.stageType || '';
            // Admin creates a single GLOBAL defense session per stage (committeeId='GLOBAL'),
            // so querying by committeeId misses it. Query by stageType, prefer per-committee
            // session, else fall back to the global one.
            const sessionsRes = await workflowService.getDefenseSessions({ stageType })
              .catch(() => ({ data: [] as DefenseSession[] }));
            const liveSessions = sessionsRes.data.filter(s => s.status === 'OPEN' || s.status === 'ACTIVE');
            const session = liveSessions.find(s => s.committeeId === assignment.committeeId)
              || liveSessions.find(s => s.stageType === stageType)
              || null;

            const students: StudentInfo[] = studentsRes.data.map(cs => ({
              studentId: cs.studentId,
              name: resolveName(cs.studentId, userMap, 'Тодорхойгүй оюутан'),
              thesisTitle: planMap[cs.studentId]?.title || 'Гарчиггүй',
              thesisId: planMap[cs.studentId]?.thesisId,
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
        thesisId: student.thesisId || '',
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
        <p className="text-base font-medium text-ink-700">Гадаад эксперт үнэлгээ байхгүй</p>
        <p className="text-sm mt-1 text-ink-400">Танд хуваарилагдсан комиссийн үнэлгээ олдсонгүй.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Гадаад эксперт үнэлгээ</h1>
        <p className="text-sm text-ink-500 mt-1">Томилогдсон комиссын оюутнуудад үнэлгээ өгнө үү.</p>
      </div>

      {committees.map(cmt => {
        const scheme = getSchemeFor(cmt.stageType);
        const sessionOpen = cmt.session?.status === 'OPEN' || cmt.session?.status === 'ACTIVE';
        const sessionClosed = cmt.session?.status === 'CLOSED';
        const stageLabel = cmt.stageType === 'PRE_DEFENSE' ? 'Урьдчилсан хамгаалалт' : 'Эцсийн хамгаалалт';
        const gradedCount = cmt.students.filter(s => cmt.myGrades[s.studentId]?.isSubmitted).length;

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
                    {sessionOpen && (
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

            <CardContent className="p-0">
              {!cmt.session && (
                <div className="p-8 text-center text-ink-400 text-sm">Хамгаалалтын сесс эхлээгүй байна.</div>
              )}
              {cmt.session && cmt.students.length === 0 && (
                <div className="p-8 text-center text-ink-400 text-sm">Комисст оюутан байхгүй байна.</div>
              )}

              {cmt.session && cmt.students.map(student => {
                const existing = cmt.myGrades[student.studentId];
                const isGrading = gradingStudent?.committeeId === cmt.committeeId && gradingStudent?.studentId === student.studentId;
                const totalScore = Object.values(scores).reduce((a, b) => a + (b || 0), 0);

                return (
                  <div key={student.studentId} className="border-b border-border last:border-0">
                    <div
                      className="p-4 flex items-center justify-between hover:bg-surface-muted transition-colors cursor-pointer select-none"
                      onClick={() => {
                        if (sessionClosed) return;
                        if (isGrading) { setGradingStudent(null); return; }
                        openGrading(cmt.committeeId, student.studentId, existing);
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0 border border-border-strong">
                          <AvatarFallback className="text-xs font-medium">
                            {student.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink-900 tracking-tight">{student.name}</p>
                          <p className="text-xs text-ink-500 truncate max-w-[280px]">{student.thesisTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openManuscript(student.studentId); }}
                          className="inline-flex items-center gap-1 text-xs text-ink-700 hover:text-ink-900 border border-border-strong hover:border-ink-900 rounded-sm px-2 h-6 transition-colors"
                          disabled={manuscriptLoadingFor === student.studentId}
                          title="Дипломын ажил үзэх"
                        >
                          <FileText className="w-3 h-3" strokeWidth={1.6} />
                          {manuscriptLoadingFor === student.studentId ? "Нээж байна..." : "Дипломын ажил"}
                        </button>
                        {existing?.isSubmitted ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 tabular-nums">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-dot-positive)]" strokeWidth={1.6} />
                            {existing.points}/{scheme?.total}
                          </span>
                        ) : sessionClosed ? (
                          <span className="text-xs text-ink-400">Дууссан</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-ink-600">
                            {isGrading ? <ChevronUp className="w-3 h-3" strokeWidth={1.6} /> : <ChevronDown className="w-3 h-3" strokeWidth={1.6} />}
                            {existing ? 'Засах' : 'Үнэлэх'}
                          </span>
                        )}
                      </div>
                    </div>

                    {isGrading && scheme && (
                      <div className="px-5 pb-5 pt-4 bg-surface-muted border-t border-border space-y-4">
                        <p className="text-sm font-semibold text-ink-900 tracking-tight">{scheme.label}</p>
                        <div className="space-y-3">
                          {scheme.criteria.map((c, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="text-sm text-ink-700 flex-1">{c.name}</span>
                              <input
                                type="number"
                                min={0}
                                max={c.max}
                                value={scores[idx] ?? ''}
                                onChange={e => {
                                  const v = Math.min(c.max, Math.max(0, Number(e.target.value)));
                                  setScores(prev => ({ ...prev, [idx]: v }));
                                }}
                                className="w-16 border border-border rounded-md px-2 py-1.5 text-sm text-center bg-surface focus:outline-none focus:border-ink-900 tabular-nums"
                              />
                              <span className="text-xs text-ink-400 w-10 tabular-nums">/ {c.max}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Нийт оноо</span>
                          <span className={`text-lg font-semibold tabular-nums ${totalScore > scheme.total ? 'text-[var(--color-dot-negative)]' : 'text-ink-900'}`}>
                            {totalScore} / {scheme.total}
                          </span>
                        </div>

                        <RichTextEditor
                          value={comment}
                          onChange={setComment}
                          placeholder="Тайлбар (заавал биш)..."
                          minHeight={88}
                          ariaLabel="Үнэлгээний тайлбар"
                        />

                        {gradeError && (
                          <p className="text-xs text-[var(--color-dot-negative)] flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                            {gradeError}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setGradingStudent(null)}>
                            Болих
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={gradeStatus === 'loading' || totalScore === 0 || totalScore > scheme.total}
                            onClick={() => handleSubmit(cmt, student)}
                          >
                            {gradeStatus === 'loading' ? (
                              <span className="flex items-center gap-2 justify-center">
                                <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                                Хадгалж байна...
                              </span>
                            ) : gradeStatus === 'success' ? (
                              <span className="flex items-center gap-2 justify-center"><CheckCircle2 className="w-4 h-4" strokeWidth={1.6} /> Амжилттай</span>
                            ) : (
                              <span className="flex items-center gap-2 justify-center"><Send className="w-4 h-4" strokeWidth={1.6} /> Үнэлгээ илгээх</span>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
