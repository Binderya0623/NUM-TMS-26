import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Award, Lock } from "lucide-react";
import {
  evaluationService,
  type FinalGradeConfirmation,
  type SecretarySubmission,
  type DefenseGrade,
} from "../../../services/evaluationService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { getStoredUser } from "../../../lib/authGuard";

const STAGES = [
  { stageType: "PROGRESS_1",    label: "Явц 1",                 maxPoints: 15 },
  { stageType: "PROGRESS_2",    label: "Явц 2",                 maxPoints: 20 },
  { stageType: "PRE_DEFENSE",   label: "Урьдчилсан хамгаалалт", maxPoints: 25 },
  { stageType: "FINAL_DEFENSE", label: "Эцсийн хамгаалалт",     maxPoints: 40 },
] as const;

export default function StudentFinalGrade() {
  const user = getStoredUser();
  const studentId = user?.userId || user?.username || "";

  const [finalGrade, setFinalGrade] = useState<FinalGradeConfirmation | null>(null);
  const [submissions, setSubmissions] = useState<SecretarySubmission[]>([]);
  const [grades, setGrades] = useState<DefenseGrade[]>([]);
  const [sessions, setSessions] = useState<DefenseSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    Promise.all([
      evaluationService.getMyFinalGrade(studentId),
      evaluationService.getSecretarySubmissions(studentId),
      evaluationService.getMyDefenseGrades(studentId),
      workflowService.getDefenseSessions(),
    ])
      .then(([gradeRes, subRes, gradesRes, sessRes]) => {
        setFinalGrade(gradeRes.data ?? null);
        setSubmissions(subRes.data);
        setGrades(gradesRes.data);
        setSessions(sessRes.data);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const sessionMap = new Map(sessions.map(s => [s.id, s]));

  // Backend canonicalizes PRE_DEFENSE→PRELIMINARY and FINAL_DEFENSE→FINAL
  // for stored sessions; map back to the frontend stage names so the UI matches.
  const normalizeStage = (s?: string) =>
    s === "PRELIMINARY" ? "PRE_DEFENSE" : s === "FINAL" ? "FINAL_DEFENSE" : (s ?? "");

  const scoreByStage = new Map<string, { averageScore: number; submittedAt?: string }>();
  const relevantSessionIds = new Set<string>([
    ...submissions.map(s => s.defenseSessionId),
    ...grades.map(g => g.defenseSessionId),
  ]);
  for (const sid of relevantSessionIds) {
    const sess = sessionMap.get(sid);
    if (!sess) continue;
    const stageType = normalizeStage(sess.stageType);

    const sub = submissions.find(s => s.defenseSessionId === sid);
    let score: number;
    let submittedAt: string | undefined;
    if (sub) {
      score = sub.averageScore;
      submittedAt = sub.submittedAt;
    } else {
      const sessGrades = grades.filter(g =>
        g.defenseSessionId === sid && g.isSubmitted && g.evaluatorRole !== "REVIEWER"
      );
      if (sessGrades.length === 0) continue;
      score = sessGrades.reduce((a, g) => a + g.points, 0) / sessGrades.length;
      submittedAt = sessGrades.map(g => g.submittedAt).filter(Boolean).sort().pop();
    }

    const existing = scoreByStage.get(stageType);
    if (!existing || (submittedAt ?? "") > (existing.submittedAt ?? "")) {
      scoreByStage.set(stageType, { averageScore: score, submittedAt });
    }
  }

  const revealedTotal = STAGES.reduce((sum, s) => {
    const r = scoreByStage.get(s.stageType);
    return sum + (r ? r.averageScore : 0);
  }, 0);

  const revealedMax = STAGES.reduce((sum, s) => {
    return sum + (scoreByStage.has(s.stageType) ? s.maxPoints : 0);
  }, 0);

  const isPublished = finalGrade?.isPublished === true;
  const isConfirmed = finalGrade != null;
  const hasAnyScore = scoreByStage.size > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-3 text-ink-500">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
          <span className="text-sm">Ачааллаж байна...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Дипломын дүн</h1>
          <p className="text-sm text-ink-500 mt-1">
            Хамгаалалтын шатуудаар нээгдсэн оноо болон эцсийн үнэлгээ
          </p>
        </div>
        {hasAnyScore && !isConfirmed && (
          <span className="inline-flex items-center gap-2 text-xs text-ink-700 border border-border-strong rounded-md px-3 h-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-warning)]" />
            Хянагдаж байна
          </span>
        )}
        {isPublished && (
          <span className="inline-flex items-center gap-2 text-xs text-ink-700 border border-ink-900 rounded-md px-3 h-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-positive)]" />
            Албан ёсоор нийтлэгдсэн
          </span>
        )}
      </div>

      {isConfirmed && (
        <Card>
          <div className="h-0.5 bg-accent" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full border border-ink-900 flex flex-col items-center justify-center bg-surface shrink-0">
                <span className="text-3xl font-semibold text-ink-900 tabular-nums tracking-tight leading-none">
                  {finalGrade?.totalScore ?? revealedTotal}
                </span>
                <span className="text-xs text-ink-400 mt-1 tabular-nums">/ 100</span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Эцсийн оноо</p>
                <h2 className="text-lg font-semibold text-ink-900 tracking-tight mt-0.5">Албан ёсны үнэлгээ</h2>
                {finalGrade?.gradeLetter && (
                  <div className="inline-flex items-center justify-center mt-3 border border-ink-900 rounded-md px-4 h-9 text-base font-semibold text-ink-900 tracking-tight">
                    {finalGrade.gradeLetter}
                  </div>
                )}
                {finalGrade?.publishedAt && (
                  <p className="text-xs text-ink-500 mt-3 tabular-nums">
                    {new Date(finalGrade.publishedAt).toLocaleDateString("mn-MN", {
                      year: "numeric", month: "long", day: "numeric",
                    })}-д нийтлэгдсэн
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-semibold text-ink-900 tracking-tight flex items-center justify-between">
            <span>Шатуудаар оноо</span>
            {hasAnyScore && (
              <span className="text-xs font-normal text-ink-500 tabular-nums">
                Нийлбэр: <span className="text-ink-900 font-semibold">{revealedTotal}</span>
                {revealedMax < 100 && (
                  <span className="text-ink-400"> / {revealedMax} нээгдсэн</span>
                )}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {STAGES.map(stage => {
            const sub = scoreByStage.get(stage.stageType);
            const pct = sub ? Math.round((sub.averageScore / stage.maxPoints) * 100) : 0;

            return (
              <div key={stage.stageType} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${sub ? "bg-[var(--color-dot-positive)]" : "bg-[var(--color-dot-neutral)]"}`} />
                    <span className="text-sm font-semibold text-ink-900 tracking-tight">{stage.label}</span>
                    <span className="text-xs text-ink-400 tabular-nums">макс {stage.maxPoints}</span>
                  </div>
                  <div className="w-full bg-border-strong rounded-full h-0.5">
                    <div
                      className="h-0.5 bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {sub ? (
                    <>
                      <div className="text-center px-4 h-10 rounded-md border border-border-strong bg-surface-muted flex items-center gap-1.5">
                        <span className="text-lg font-semibold text-ink-900 tabular-nums tracking-tight">
                          {sub.averageScore.toFixed(1)}
                        </span>
                        <span className="text-xs text-ink-400 tabular-nums">/ {stage.maxPoints}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-900 tabular-nums">{pct}%</p>
                        {sub.submittedAt && (
                          <p className="text-[10px] text-ink-500 tabular-nums">
                            {sub.submittedAt.split("T")[0]}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 px-3 h-10 rounded-md border border-dashed border-border-strong">
                      <Lock className="w-3.5 h-3.5 text-ink-300" strokeWidth={1.6} />
                      <span className="text-xs text-ink-400">Хүлээгдэж байна</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {!hasAnyScore && !isConfirmed && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4">
              <Award className="w-5 h-5 text-ink-400" strokeWidth={1.4} />
            </div>
            <h3 className="text-base font-semibold text-ink-900 mb-2 tracking-tight">Оноо нээгдэж эхлээгүй</h3>
            <p className="text-sm text-ink-500 max-w-sm mx-auto">
              Хамгаалалтын шат бүрийн дараа нарийн бичгийн дарга дундаж оноог нийтэлсний дараа харагдана.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
