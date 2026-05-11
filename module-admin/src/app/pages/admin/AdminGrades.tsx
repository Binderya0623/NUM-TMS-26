import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Drawer } from "../../components/ui/dialog";
import {
  Award, Download, CheckCircle2, Lock, AlertTriangle,
  Search, Eye, X,
} from "lucide-react";
import { evaluationService, type FinalGrade } from "../../../services/evaluationService";
import { planService } from "../../../services/planService";
import { workflowService } from "../../../services/workflowService";
import { userService } from "../../../services/userService";
import { resolveName, fmtDateTime} from "../../../lib/utils";

interface DisplayGrade {
  id: string;
  student: string;
  studentId: string;
  progress1: number | null;
  progress2: number | null;
  preDefense: number | null;
  finalDefense: number | null;
  reviewer: number | null;
  total: number | null;
  letterGrade: string;
  status: string;
  publishedBy: string | null;
  publishedOn: string | null;
}

// Backend (FinalGradeConfirmation) fields are: progress1Score (15), progress2Score (20),
// preliminaryScore (25), finalCommitteeScore (35), reviewerScore (5), totalScore (100).
const num = (v: unknown): number | null =>
  v === null || v === undefined || v === '' ? null : Number(v);

// NUM grading scale: A+, A, B+, B, C+, C, D, F.
function letterFromScore(total: number | null): string {
  if (total == null || Number.isNaN(total)) return '—';
  if (total >= 95) return 'A+';
  if (total >= 90) return 'A';
  if (total >= 85) return 'B+';
  if (total >= 80) return 'B';
  if (total >= 75) return 'C+';
  if (total >= 70) return 'C';
  if (total >= 60) return 'D';
  return 'F';
}

const toDisplayGrade = (g: FinalGrade, studentName: string): DisplayGrade => {
  const total = num(g.totalScore);
  return {
    id: g.id,
    student: studentName,
    studentId: g.studentId,
    progress1: num(g.progress1Score),
    progress2: num(g.progress2Score),
    preDefense: num(g.preliminaryScore),
    finalDefense: num(g.finalCommitteeScore),
    reviewer: num(g.reviewerScore),
    total,
    // Prefer the persisted letter; fall back to deriving it from the total
    // so older records (and the HEAD's first-pass confirms that didn't send a
    // letter) still display a grade instead of "—".
    letterGrade: g.gradeLetter || letterFromScore(total),
    status: g.isPublished ? 'Нийтлэгдсэн' : total != null ? 'Ноорог' : 'Хүлээгдэж буй',
    publishedBy: g.confirmedBy || null,
    publishedOn: fmtDateTime(g.publishedAt) || null,
  };
};

const stageWeights = { progress1: 15, progress2: 20, preDefense: 25, finalDefense: 35, reviewer: 5 };

type StatusTone = "positive" | "warning" | "neutral";

const statusTone = (s: string): StatusTone => {
  if (s === "Нийтлэгдсэн") return "positive";
  if (s === "Ноорог") return "warning";
  return "neutral";
};

const toneDot: Record<StatusTone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
};

export default function AdminGrades() {
  const [grades, setGrades] = useState<DisplayGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Бүгд");
  const [selectedGrade, setSelectedGrade] = useState<DisplayGrade | null>(null);
  const [publishModal, setPublishModal] = useState<DisplayGrade | null>(null);
  const [publishConfirmed, setPublishConfirmed] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const loadGrades = async () => {
    try {
      const [gradesRes, plansRes, studentsRes, teachersRes, submissionsRes, sessionsRes] = await Promise.all([
        evaluationService.getFinalGrades(),
        planService.getPlans(),
        userService.getStudents(),
        userService.getTeachers().catch(() => ({ data: [] as any[] })),
        evaluationService.getSecretarySubmissions({}),
        workflowService.getDefenseSessions(),
      ]);

      const userMap: Record<string, string> = {};
      studentsRes.data.forEach(u => {
        userMap[u.id] = u.displayName;
        userMap[u.username] = u.displayName;
      });
      teachersRes.data.forEach((u: any) => {
        if (u.id) userMap[u.id] = u.displayName;
        if (u.username) userMap[u.username] = u.displayName;
      });

      // Map sessionId → stageType so we can attribute secretary submissions
      // (which only carry sessionId) to the right stage column.
      const sessionStage: Record<string, string> = {};
      sessionsRes.data.forEach(s => { sessionStage[s.id] = s.stageType; });

      // For each student, the latest averageScore per stage type. If a stage
      // has multiple submissions (e.g. resubmissions), the most recent wins.
      const stageScoresByStudent: Record<string, Record<string, number>> = {};
      [...submissionsRes.data]
        .sort((a, b) => (a.submittedAt || '').localeCompare(b.submittedAt || ''))
        .forEach(sub => {
          const stage = sessionStage[sub.defenseSessionId];
          if (!stage || !sub.studentId) return;
          (stageScoresByStudent[sub.studentId] ||= {})[stage] = sub.averageScore;
        });

      const rows: DisplayGrade[] = [];
      const seen = new Set<string>();

      // 1. Students with a finalized grade record — full data, real id (so
      //    the publish button targets the right backend row).
      gradesRes.data.forEach(g => {
        if (!g.studentId) return;
        seen.add(g.studentId);
        const display = toDisplayGrade(g, resolveName(g.studentId, userMap, 'Тодорхойгүй оюутан'));
        if (display.publishedBy) display.publishedBy = resolveName(display.publishedBy, userMap, 'Удирдлага');
        rows.push(display);
      });

      // 2. Every other supervised student (post-approval plans) — show stage
      //    scores if we have them, mark as "Хүлээгдэж буй". Status is gated
      //    on the plan reaching APPROVED so we don't surface drafts.
      const POST_APPROVAL = new Set(['APPROVED', 'ACTIVE', 'SUBMITTED']);
      plansRes.data.forEach(p => {
        if (!p.studentId || seen.has(p.studentId) || !POST_APPROVAL.has(p.status)) return;
        seen.add(p.studentId);
        const stageScores = stageScoresByStudent[p.studentId] || {};
        rows.push({
          id: `plan-${p.id}`,
          student: resolveName(p.studentId, userMap, 'Тодорхойгүй оюутан'),
          studentId: p.studentId,
          progress1:    stageScores.PROGRESS_1     ?? null,
          progress2:    stageScores.PROGRESS_2     ?? null,
          preDefense:   stageScores.PRE_DEFENSE    ?? null,
          finalDefense: stageScores.FINAL_DEFENSE  ?? null,
          reviewer:     null,
          total:        null,
          letterGrade:  '—',
          status:       'Хүлээгдэж буй',
          publishedBy:  null,
          publishedOn:  null,
        });
      });

      setGrades(rows);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGrades(); }, []);

  const handlePublish = () => {
    if (!publishModal) return;
    setPublishSuccess(false);
    evaluationService.publishGrade(publishModal.id)
      .then(() => {
        setPublishSuccess(true);
        setGrades(prev => prev.map(g => g.id === publishModal.id ? { ...g, status: 'Нийтлэгдсэн' } : g));
        setTimeout(() => { setPublishModal(null); setPublishConfirmed(false); setPublishSuccess(false); }, 1500);
      })
      .catch(() => {
        setTimeout(() => { setPublishModal(null); setPublishConfirmed(false); }, 1000);
      });
  };

  /**
   * Download the currently visible (filtered) grades as a CSV file. Excel
   * opens this directly thanks to the UTF-8 BOM. Per-stage scores plus the
   * letter grade and publish status are included.
   */
  const handleExport = () => {
    const headers = [
      "Оюутан", "Оюутны ID",
      "Явц 1 (15)", "Явц 2 (20)", "Урьдчилсан (25)", "Эцсийн (35)", "Шүүмж (5)",
      "Нийт (100)", "Үсгэн дүн", "Байдал", "Нийтлэгч", "Нийтэлсэн огноо",
    ];
    const rows = filtered.map(g => [
      g.student,
      g.studentId,
      g.progress1 ?? "",
      g.progress2 ?? "",
      g.preDefense ?? "",
      g.finalDefense ?? "",
      g.reviewer ?? "",
      g.total ?? "",
      g.letterGrade,
      g.status,
      g.publishedBy ?? "",
      g.publishedOn ?? "",
    ]);
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = "﻿" + [headers, ...rows].map(r => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `grades-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filtered = grades
    .filter(g => statusFilter === "Бүгд" || g.status === statusFilter)
    .filter(g => g.student.toLowerCase().includes(search.toLowerCase()));

  const draftCount = grades.filter(g => g.status === "Ноорог").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-sm text-ink-500">Оюутны дүнг хянах, нийтлэх болон аудит хийх.</p>
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="w-3.5 h-3.5 mr-2" strokeWidth={1.8} /> Дүн гаргах
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Нийт оюутан",    value: grades.length },
          { label: "Нийтлэгдсэн",    value: grades.filter(g => g.status === "Нийтлэгдсэн").length },
          { label: "Ноорог",         value: draftCount },
          { label: "Хүлээгдэж буй",  value: grades.filter(g => g.status === "Хүлээгдэж буй").length },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-ink-900 mt-2 tabular-nums tracking-tight">{loading ? "—" : stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {draftCount > 0 && (
        <div className="border-l-2 border-[var(--color-dot-warning)] pl-4 py-2 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-ink-500 shrink-0" strokeWidth={1.6} />
          <p className="text-sm text-ink-700">
            <strong className="text-ink-900 font-medium">{draftCount} дүн</strong> ноорог байдалтай бөгөөд оюутанд харагдахгүй байна.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Оюутнаар хайх..."
            className="pl-9 pr-3 h-9 border border-border-strong rounded-md text-sm w-full text-ink-900 bg-surface focus:outline-none focus:border-ink-900"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {["Бүгд", "Нийтлэгдсэн", "Ноорог", "Хүлээгдэж буй"].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`h-9 px-3 rounded-md text-xs font-medium tracking-tight transition-colors ${
                statusFilter === f
                  ? "bg-ink-900 text-white"
                  : "text-ink-600 border border-border-strong hover:border-ink-900 hover:text-ink-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-ink-400 text-sm">Дүн олдсонгүй.</div>
          ) : (
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-border">
                  {["Оюутан", "Явц 1", "Явц 2", "Урьдч.", "Эцсийн", "Шүүмж", "Нийт", "Дүн", "Байдал", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g.id} className="border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors group">
                    <td className="px-4 py-4">
                      <p className="font-medium text-sm text-ink-900 tracking-tight">{g.student}</p>
                    </td>
                    {[g.progress1, g.progress2, g.preDefense, g.finalDefense, g.reviewer].map((score, i) => (
                      <td key={i} className="px-4 py-4 text-center tabular-nums">
                        {score !== null ? <span className="text-sm font-medium text-ink-900">{score}</span> : <span className="text-ink-300 text-sm">—</span>}
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center">
                      {g.total !== null ? <span className="text-base font-semibold text-ink-900 tabular-nums">{g.total}</span> : <span className="text-ink-300">—</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 text-xs font-medium rounded-sm border ${
                        g.letterGrade !== '—' ? 'border-border-strong text-ink-900' : 'border-transparent text-ink-300'
                      }`}>
                        {g.letterGrade}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot[statusTone(g.status)]}`} />
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedGrade(g)}>
                          <Eye className="w-3.5 h-3.5 mr-1" strokeWidth={1.8} /> Харах
                        </Button>
                        {g.status !== "Нийтлэгдсэн" && g.total !== null && (
                          <Button size="sm" onClick={() => { setPublishModal(g); setPublishConfirmed(false); }}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" strokeWidth={1.8} /> Нийтлэх
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {selectedGrade && (
        <Drawer open onClose={() => setSelectedGrade(null)}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
              <h2 className="text-[15px] font-semibold text-ink-900 tracking-tight">{selectedGrade.student}</h2>
            </div>
            <button
              onClick={() => setSelectedGrade(null)}
              className="text-ink-400 hover:text-ink-900 hover:bg-accent-soft rounded-md p-1.5 transition-colors"
              aria-label="Хаах"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2">Нийт оноо</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-semibold text-ink-900 tabular-nums tracking-tight">{selectedGrade.total ?? "—"}</span>
                <span className="text-sm text-ink-500 tabular-nums">/ 100</span>
                <span className="ml-auto text-sm font-medium text-ink-900 border border-border-strong rounded-sm px-2 py-0.5">{selectedGrade.letterGrade}</span>
              </div>
            </div>
            <div className="pt-5 border-t border-border">
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-3">Шатуудаар авсан оноо</p>
              <div className="space-y-px">
                {[
                  { label: "Явц 1", score: selectedGrade.progress1, weight: stageWeights.progress1 },
                  { label: "Явц 2", score: selectedGrade.progress2, weight: stageWeights.progress2 },
                  { label: "Урьдчилсан хамгаалалт", score: selectedGrade.preDefense, weight: stageWeights.preDefense },
                  { label: "Эцсийн хамгаалалт", score: selectedGrade.finalDefense, weight: stageWeights.finalDefense },
                  { label: "Шүүмжийн оноо", score: selectedGrade.reviewer, weight: stageWeights.reviewer },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-ink-900 tracking-tight">{item.label}</p>
                      <p className="text-[11px] text-ink-400 mt-0.5 tabular-nums">Жин: {item.weight}%</p>
                    </div>
                    <span className={`text-lg font-semibold tabular-nums ${item.score !== null ? 'text-ink-900' : 'text-ink-300'}`}>
                      {item.score ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {selectedGrade.publishedBy && (
              <div className="pt-5 border-t border-border">
                <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2">Аудитын мэдээлэл</p>
                <p className="text-sm text-ink-700">
                  Нийтлэгч: <span className="text-ink-900 font-medium">{selectedGrade.publishedBy}</span>
                </p>
                <p className="text-xs text-ink-500 mt-1 tabular-nums">{selectedGrade.publishedOn}</p>
              </div>
            )}
            {selectedGrade.status === "Нийтлэгдсэн" && (
              <div className="flex items-start gap-2 text-sm text-ink-600 border-l-2 border-ink-300 pl-3 py-1">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-ink-400" strokeWidth={1.6} />
                <span>Энэ дүн нийтлэгдсэн тул засварлах боломжгүй.</span>
              </div>
            )}
          </div>
        </Drawer>
      )}

      {publishModal && (
        <Dialog open onClose={() => { setPublishModal(null); setPublishConfirmed(false); }} maxWidth="max-w-md">
          <DialogHeader
            title="Эцсийн дүн нийтлэх"
            icon={<CheckCircle2 className="w-4 h-4" strokeWidth={1.6} />}
            onClose={() => { setPublishModal(null); setPublishConfirmed(false); }}
          />
          {publishSuccess ? (
            <DialogBody className="py-10 text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-[var(--color-dot-positive)]" strokeWidth={1.5} />
              <h3 className="text-[15px] font-semibold text-ink-900 tracking-tight">Дүн нийтлэгдлээ</h3>
            </DialogBody>
          ) : (
            <>
              <DialogBody className="space-y-5">
                <p className="text-sm text-ink-500 -mt-1">Дүн нийтлэгдсэний дараа оюутанд харагдана.</p>
                <div className="border border-border rounded-md p-4">
                  <p className="text-sm font-medium text-ink-900 tracking-tight">{publishModal.student}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-semibold text-ink-900 tabular-nums tracking-tight">{publishModal.total ?? "—"}</span>
                    <span className="text-sm text-ink-500 tabular-nums">/ 100</span>
                    <span className="ml-auto text-sm font-medium text-ink-900 border border-border-strong rounded-sm px-2 py-0.5">{publishModal.letterGrade}</span>
                  </div>
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-3.5 h-3.5 accent-ink-900"
                    checked={publishConfirmed}
                    onChange={e => setPublishConfirmed(e.target.checked)}
                  />
                  <span className="text-sm text-ink-700 leading-relaxed">
                    Энэ дүн эцсийн хэлбэртэй бөгөөд оюутанд нийтлэхэд бэлэн болсныг баталгаажуулж байна.
                  </span>
                </label>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setPublishModal(null); setPublishConfirmed(false); }}>Цуцлах</Button>
                <Button disabled={!publishConfirmed} onClick={handlePublish}>Дүн нийтлэх</Button>
              </DialogFooter>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
