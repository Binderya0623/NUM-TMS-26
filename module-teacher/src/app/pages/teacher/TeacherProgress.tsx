import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Search, Filter, ChevronDown, ChevronUp,
  ArrowUpDown, X, Eye
} from "lucide-react";
import { planService, type Plan } from "../../../services/planService";
import { userService, type UserRecord } from "../../../services/userService";
import { evaluationService } from "../../../services/evaluationService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName } from "../../../lib/utils";

interface DisplayStudent {
  id: string;
  name: string;
  thesis: string;
  stage: string;
  status: string;
  progress: number;
  submittedAt?: string;
  revisionCount: number;
}

type Tone = "positive" | "warning" | "negative" | "neutral";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]",
};

const stageLabel = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: "Ноорог",
    PENDING_TEACHER_APPROVAL: "Багш хянаж байна",
    DEPT_PENDING: "Тэнхим хянаж байна",
    APPROVED: "Батлагдсан",
    ACTIVE: "Гүйцэтгэлд",
    SUBMITTED: "Тайлан илгаасэн",
    REVISION_REQUIRED: "Засвар шаардлагатай",
  };
  return map[status] || status;
};

// 5-stage timeline (topic, prog1, prog2, pre, final) — each stage = 20%.
// Matches /admin/thesis and /teacher/students. Without per-student defense
// session data here we credit "topic done" (20%) for APPROVED+; the final
// grade override below promotes confirmed students to 100%.
const progressFromStatus = (status: string) => {
  const map: Record<string, number> = {
    DRAFT: 0,
    PENDING_TEACHER_APPROVAL: 5,
    DEPT_PENDING: 10,
    APPROVED: 20,
    ACTIVE: 20,
    SUBMITTED: 20,
  };
  return map[status] ?? 0;
};

const statusMap: Record<string, { label: string; tone: Tone }> = {
  SUBMITTED: { label: "Тайлан илгаасэн", tone: "warning" },
  ACTIVE: { label: "Гүйцэтгэлд", tone: "neutral" },
  REVISION_REQUIRED: { label: "Засвар шаардлагатай", tone: "negative" },
  APPROVED: { label: "Батлагдсан", tone: "positive" },
  DEPT_PENDING: { label: "Тэнхим хянаж байна", tone: "warning" },
  PENDING_TEACHER_APPROVAL: { label: "Хянагдаж байна", tone: "warning" },
  DRAFT: { label: "Ноорог", tone: "neutral" },
};

type SortKey = "name" | "stage" | "progress";
type SortDir = "asc" | "desc";

export default function TeacherProgress() {
  const [students, setStudents] = useState<DisplayStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Бүгд");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedStudent, setSelectedStudent] = useState<DisplayStudent | null>(null);

  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || '';

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }
    const load = async () => {
      try {
        const [plansRes, usersRes, finalGradesRes] = await Promise.all([
          planService.getPlans({ supervisorId: teacherId }),
          userService.getStudents(),
          evaluationService.getFinalGrades().catch(() => ({ data: [] as any[] })),
        ]);
        const plans: Plan[] = plansRes.data;
        const users: UserRecord[] = usersRes.data;
        const userMap: Record<string, string> = {};
        users.forEach(u => {
          if (u.username) userMap[u.username] = u.displayName;
          userMap[u.id] = u.displayName;
        });
        // Students with a confirmed final grade are 100% regardless of plan.status
        // (which often stays at APPROVED/SUBMITTED past the actual finish line).
        const gradedStudentIds = new Set(
          (finalGradesRes.data || []).map((g: any) => g.studentId).filter(Boolean)
        );
        setStudents(plans.map(p => ({
          id: p.studentId,
          name: resolveName(p.studentId, userMap, 'Тодорхойгүй оюутан'),
          thesis: p.title || 'Гарчиггүй',
          stage: gradedStudentIds.has(p.studentId) ? 'Дүн гарсан' : stageLabel(p.status),
          status: p.status,
          progress: gradedStudentIds.has(p.studentId) ? 100 : progressFromStatus(p.status),
          submittedAt: p.submittedAt,
          revisionCount: p.revisionCount || 0,
        })));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const statusFilters = ["Бүгд", ...Object.keys(statusMap).filter(k => students.some(s => s.status === k))];

  const filtered = students
    .filter(s => statusFilter === "Бүгд" || s.status === statusFilter)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.thesis.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const valA = typeof a[sortKey] === "string" ? (a[sortKey] as string).toLowerCase() : a[sortKey];
      const valB = typeof b[sortKey] === "string" ? (b[sortKey] as string).toLowerCase() : b[sortKey];
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" strokeWidth={1.6} /> : <ChevronDown className="w-3 h-3" strokeWidth={1.6} />)
      : <ArrowUpDown className="w-3 h-3 opacity-40" strokeWidth={1.6} />;

  const submitted = students.filter(s => s.status === "SUBMITTED");
  const revisions = students.filter(s => s.status === "REVISION_REQUIRED");

  const avgProgress =
    students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Hero card — student-style */}
      <Card>
        <div className="h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md">
          <div className="h-full bg-accent transition-all duration-700" style={{ width: `${avgProgress}%` }} />
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                  <span className={`w-1.5 h-1.5 rounded-full ${submitted.length > 0 ? toneDot.warning : toneDot.positive}`} />
                  {submitted.length > 0 ? "Тайлан хянах хүлээгдэж байна" : "Бүх тайлан хянагдсан"}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1 tabular-nums">
                  {students.length} оюутан
                </span>
              </div>
              <h2 className="text-lg font-semibold text-ink-900 tracking-tight leading-tight">Явцын хяналт</h2>
              <p className="text-sm text-ink-500 mt-1">Хянаж буй оюутнуудын явц, шатны байдлыг доороос харна уу.</p>
            </div>
            <div className="text-right shrink-0 border border-border rounded-md p-3">
              <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{avgProgress}%</div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1">Дундаж</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(submitted.length > 0 || revisions.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submitted.length > 0 && (
            <Card className="border border-border">
              <CardContent className="p-4">
                <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                  Хянах шаардлагатай ({submitted.length})
                </h3>
                <div className="space-y-2">
                  {submitted.map(s => (
                    <div key={s.id} className="flex items-center justify-between border border-border rounded-md px-3 py-2 bg-surface-muted">
                      <span className="text-sm font-medium text-ink-900">{s.name}</span>
                      <span className="text-xs text-ink-600">{s.stage}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {revisions.length > 0 && (
            <Card className="border border-border">
              <CardContent className="p-4">
                <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                  Засвар шаардлагатай ({revisions.length})
                </h3>
                <div className="space-y-2">
                  {revisions.map(s => (
                    <div key={s.id} className="flex items-center justify-between border border-border rounded-md px-3 py-2 bg-surface-muted">
                      <span className="text-sm font-medium text-ink-900">{s.name}</span>
                      <span className="text-xs text-ink-600 tabular-nums">{s.revisionCount}x засвар</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.6} />
              <input
                type="text"
                placeholder="Оюутан эсвэл дипломын ажлаар хайх..."
                className="pl-9 pr-4 py-2 border border-border rounded-md text-sm w-full focus:outline-none focus:border-ink-900 bg-surface"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="border border-border rounded-md text-sm px-3 py-2 bg-surface focus:outline-none focus:border-ink-900"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {statusFilters.map(s => <option key={s} value={s}>{s === "Бүгд" ? "Бүгд" : (statusMap[s]?.label || s)}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-ink-400">
              <Filter className="w-8 h-8 mx-auto mb-3 text-ink-200" strokeWidth={1.4} />
              <p className="text-sm">{students.length === 0 ? "Хянаж буй оюутан байхгүй байна." : "Шүүлтэд тохирох оюутан олдсонгүй."}</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-surface-muted border-b border-border">
                  {[
                    { label: "Оюутан", key: "name" },
                    { label: "Шат", key: "stage" },
                    { label: "Засвар", key: null },
                    { label: "Дэвшил", key: "progress" },
                    { label: "Байдал", key: null },
                    { label: "", key: null },
                  ].map(({ label, key }, i) => (
                    <th key={i} className="text-left px-5 py-3">
                      {key ? (
                        <button onClick={() => handleSort(key as SortKey)} className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium text-ink-500 hover:text-ink-900 transition-colors">
                          {label} <SortIcon col={key as SortKey} />
                        </button>
                      ) : (
                        <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{label}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(s => {
                  const cfg = statusMap[s.status] || { label: s.status, tone: "neutral" as Tone };
                  return (
                    <tr key={s.id} className="hover:bg-surface-muted transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border-strong">
                            <AvatarFallback className="text-xs font-medium">{s.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-ink-900 tracking-tight">{s.name}</p>
                            <p className="text-xs text-ink-500 line-clamp-1 max-w-[180px]">{s.thesis}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-ink-700">{s.stage}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs tabular-nums ${s.revisionCount > 0 ? "text-ink-900 font-medium" : "text-ink-500"}`}>
                          {s.revisionCount > 0 ? `${s.revisionCount}x засвар` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <div className="h-0.5 flex-1 bg-border-strong">
                            <div className="h-full bg-accent transition-all" style={{ width: `${s.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-ink-700 w-8 text-right tabular-nums">{s.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${toneDot[cfg.tone]}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Button variant="ghost" size="sm" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSelectedStudent(s)}>
                          <Eye className="w-3.5 h-3.5 mr-1" strokeWidth={1.6} /> Дэлгэрэнгүй
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <div className="fixed inset-0 bg-ink-900/30 z-50 flex justify-end" onClick={() => setSelectedStudent(null)}>
          <div className="w-full max-w-md bg-surface h-full shadow-xl overflow-y-auto border-l border-border" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex justify-between items-start gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink-900 tracking-tight">{selectedStudent.name}</h2>
                <p className="text-sm text-ink-500 mt-1">{selectedStudent.thesis}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-1.5 hover:bg-surface-muted rounded-md shrink-0" aria-label="Хаах">
                <X className="w-4 h-4 text-ink-500" strokeWidth={1.6} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Шат", value: selectedStudent.stage },
                  { label: "Байдал", value: statusMap[selectedStudent.status]?.label || selectedStudent.status },
                  { label: "Засварын тоо", value: selectedStudent.revisionCount > 0 ? `${selectedStudent.revisionCount}x` : "—" },
                  { label: "Илгээсэн", value: selectedStudent.submittedAt ? selectedStudent.submittedAt.split('T')[0] : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-md p-3 border border-border bg-surface-muted">
                    <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">{label}</p>
                    <p className="text-sm font-medium text-ink-900 tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">Нийт дэвшил</p>
                <div className="flex items-center gap-3">
                  <div className="h-0.5 flex-1 bg-border-strong">
                    <div className="h-full bg-accent transition-all" style={{ width: `${selectedStudent.progress}%` }} />
                  </div>
                  <span className="text-lg font-semibold text-ink-900 tabular-nums">{selectedStudent.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
