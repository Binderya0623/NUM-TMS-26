import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Drawer } from "../../components/ui/dialog";
import {
  Award, Download, CheckCircle2, Lock, AlertTriangle,
  Search, Eye, RefreshCw, X,
} from "lucide-react";
import { evaluationService, type FinalGrade } from "../../../services/evaluationService";
import { userService } from "../../../services/userService";
import { resolveName } from "../../../lib/utils";

interface DisplayGrade {
  id: string;
  student: string;
  studentId: string;
  progress1: number | null;
  progress2: number | null;
  preDefense: number | null;
  finalDefense: number | null;
  weightedFinal: number | null;
  letterGrade: string;
  status: string;
  publishedBy: string | null;
  publishedOn: string | null;
}

const toDisplayGrade = (g: FinalGrade, studentName: string): DisplayGrade => ({
  id: g.id,
  student: studentName,
  studentId: g.studentId,
  progress1: g.progress1Score ?? null,
  progress2: g.progress2Score ?? null,
  preDefense: g.preliminaryScore ?? null,
  finalDefense: g.finalScore ?? null,
  weightedFinal: g.averageScore ?? null,
  letterGrade: g.gradeLetter || '—',
  status: g.isPublished ? 'Нийтлэгдсэн' : g.averageScore != null ? 'Ноорог' : 'Хүлээгдэж буй',
  publishedBy: g.confirmedBy || null,
  publishedOn: g.publishedAt?.split('T')[0] || null,
});

const stageWeights = { progress1: 10, progress2: 15, preDefense: 20, finalDefense: 40 };

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
  const [recalculating, setRecalculating] = useState(false);

  const loadGrades = async () => {
    try {
      const [gradesRes, usersRes] = await Promise.all([
        evaluationService.getFinalGrades(),
        userService.getStudents(),
      ]);
      const userMap: Record<string, string> = {};
      usersRes.data.forEach(u => {
        userMap[u.id] = u.displayName;
        userMap[u.username] = u.displayName;
      });
      // Resolve confirmedBy to a display name too (it's stored as a user UUID)
      const teachersRes = await userService.getTeachers().catch(() => ({ data: [] as any[] }));
      teachersRes.data.forEach((u: any) => {
        if (u.id) userMap[u.id] = u.displayName;
        if (u.username) userMap[u.username] = u.displayName;
      });
      setGrades(gradesRes.data.map(g => {
        const display = toDisplayGrade(g, resolveName(g.studentId, userMap, 'Тодорхойгүй оюутан'));
        if (display.publishedBy) display.publishedBy = resolveName(display.publishedBy, userMap, 'Удирдлага');
        return display;
      }));
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

  const handleRecalc = () => {
    setRecalculating(true);
    loadGrades().finally(() => setRecalculating(false));
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
          <Button variant="outline" onClick={handleRecalc} disabled={recalculating}>
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${recalculating ? 'animate-spin' : ''}`} strokeWidth={1.8} />
            {recalculating ? "Шинэчилж байна..." : "Шинэчлэх"}
          </Button>
          <Button>
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
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  {["Оюутан", "Явц 1", "Явц 2", "Урьдч.", "Эцсийн", "Жигнэсэн", "Дүн", "Байдал", ""].map(h => (
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
                    {[g.progress1, g.progress2, g.preDefense, g.finalDefense].map((score, i) => (
                      <td key={i} className="px-4 py-4 text-center tabular-nums">
                        {score !== null ? <span className="text-sm font-medium text-ink-900">{score}</span> : <span className="text-ink-300 text-sm">—</span>}
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center">
                      {g.weightedFinal !== null ? <span className="text-base font-semibold text-ink-900 tabular-nums">{g.weightedFinal}</span> : <span className="text-ink-300">—</span>}
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
                        {g.status !== "Нийтлэгдсэн" && g.weightedFinal !== null && (
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
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2">Жигнэсэн нийт оноо</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-semibold text-ink-900 tabular-nums tracking-tight">{selectedGrade.weightedFinal ?? "—"}</span>
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
                    <span className="text-3xl font-semibold text-ink-900 tabular-nums tracking-tight">{publishModal.weightedFinal}</span>
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
