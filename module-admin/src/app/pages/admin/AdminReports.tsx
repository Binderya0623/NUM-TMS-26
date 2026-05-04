import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { FileText, Download, Search, RefreshCw } from "lucide-react";
import { thesisReportService, type ThesisReport } from "../../../services/thesisReportService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { committeeService, type Committee } from "../../../services/committeeService";
import { userService, type UserRecord } from "../../../services/userService";
import { resolveName } from "../../../lib/utils";

interface DisplayReport {
  id: string;
  studentId: string;
  student: string;
  reportType: string;
  stageType: string;
  stageLabel: string;
  committeeId: string;
  committeeName: string;
  reviewedBy: string;
  status: string;
  submittedAt: string;
}

const STAGE_LABEL: Record<string, string> = {
  PROGRESS_1:    "Явц 1",
  PROGRESS_2:    "Явц 2",
  PRE_DEFENSE:   "Урьдчилсан хамгаалалт",
  FINAL_DEFENSE: "Эцсийн хамгаалалт",
};

const REPORT_TYPE_STAGE: Record<string, string> = {
  PROGRESS_1:         "PROGRESS_1",
  PROGRESS_2:         "PROGRESS_2",
  PRELIMINARY:        "PRE_DEFENSE",
  PRE_DEFENSE:        "PRE_DEFENSE",
  FINAL:              "FINAL_DEFENSE",
  FINAL_DEFENSE:      "FINAL_DEFENSE",
  EXECUTION_PROGRESS: "PROGRESS_1",
};

function stageFromReport(report: ThesisReport, sessionMap: Map<string, DefenseSession>): string {
  if (report.defenseSessionId) {
    const sess = sessionMap.get(report.defenseSessionId);
    if (sess?.stageType) return sess.stageType;
  }
  return REPORT_TYPE_STAGE[report.reportType] || '';
}

type DotTone = "positive" | "warning" | "negative" | "neutral";

const STATUS_MAP: Record<string, { label: string; tone: DotTone }> = {
  SUBMITTED:         { label: 'Хянагдаж байна', tone: 'neutral' },
  REVIEWED:          { label: 'Хянасан',        tone: 'positive' },
  APPROVED:          { label: 'Батлагдсан',     tone: 'positive' },
  REVISION_REQUIRED: { label: 'Засвар шаардсан', tone: 'negative' },
};

const toneDot: Record<DotTone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
};

function statusLabel(s: string) { return STATUS_MAP[s]?.label ?? s; }
function statusTone(s: string): DotTone { return STATUS_MAP[s]?.tone ?? 'neutral'; }

export default function AdminReports() {
  const [reports, setReports] = useState<DisplayReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("Бүгд");
  const [statusFilter, setStatusFilter] = useState("Бүгд");
  const [committeeFilter, setCommitteeFilter] = useState("Бүгд");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [reportsRes, sessionsRes, committeesRes, studentsRes, teachersRes] = await Promise.all([
        thesisReportService.getReports(),
        workflowService.getDefenseSessions(),
        committeeService.getCommittees().catch(() => ({ data: [] as Committee[] })),
        userService.getStudents(),
        userService.getTeachers(),
      ]);

      const sessionMap = new Map<string, DefenseSession>(sessionsRes.data.map(s => [s.id, s]));
      const committeeMap = new Map<string, string>(committeesRes.data.map(c => [c.id, c.name]));
      const userMap: Record<string, string> = {};
      [...studentsRes.data, ...teachersRes.data].forEach((u: UserRecord) => {
        userMap[u.id] = u.displayName || u.id;
        if (u.username) userMap[u.username] = u.displayName || u.username;
      });

      const display: DisplayReport[] = reportsRes.data.map(r => {
        const stageType = stageFromReport(r, sessionMap);
        const sess = r.defenseSessionId ? sessionMap.get(r.defenseSessionId) : undefined;
        const committeeId = sess?.committeeId || '';
        const committeeName = committeeId ? (committeeMap.get(committeeId) || '') : '';
        return {
          id: r.id,
          studentId: r.studentId,
          student: resolveName(r.studentId, userMap, 'Тодорхойгүй оюутан'),
          reportType: r.reportType,
          stageType,
          stageLabel: STAGE_LABEL[stageType] || stageType || r.reportType,
          committeeId,
          committeeName: committeeName || 'Хуваарилагдаагүй',
          reviewedBy: resolveName(r.reviewedBy, userMap, 'Хяналт хүлээгдэж буй'),
          status: r.status,
          submittedAt: r.submittedAt?.split('T')[0] || 'Огноогүй',
        };
      });

      setReports(display);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const stages = ['Бүгд', ...Array.from(new Set(reports.map(r => r.stageLabel).filter(Boolean)))];
  const committees = ['Бүгд', ...Array.from(new Set(reports.map(r => r.committeeName).filter(n => n !== '—')))];
  const statuses = ['Бүгд', 'Хянагдаж байна', 'Хянасан', 'Батлагдсан', 'Засвар шаардсан'];

  const filtered = reports
    .filter(r => stageFilter === 'Бүгд' || r.stageLabel === stageFilter)
    .filter(r => statusFilter === 'Бүгд' || statusLabel(r.status) === statusFilter)
    .filter(r => committeeFilter === 'Бүгд' || r.committeeName === committeeFilter)
    .filter(r => r.student.toLowerCase().includes(search.toLowerCase()) || r.studentId.toLowerCase().includes(search.toLowerCase()));

  const submitted = reports.filter(r => r.status !== 'REVISION_REQUIRED').length;
  const reviewed  = reports.filter(r => r.status === 'REVIEWED' || r.status === 'APPROVED').length;
  const revision  = reports.filter(r => r.status === 'REVISION_REQUIRED').length;
  const total = reports.length || 1;
  const submittedPct = Math.round((submitted / total) * 100);
  const reviewedPct  = Math.round((reviewed  / total) * 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-sm text-ink-500">Бүх оюутны тайлан илгээлт болон хянах байдлыг харах.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.8} />
            {loading ? 'Ачааллаж...' : 'Шинэчлэх'}
          </Button>
          <Button>
            <Download className="w-3.5 h-3.5 mr-2" strokeWidth={1.8} /> Гаргах
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Нийт тайлан",     value: reports.length },
          { label: "Хянагдаж байна",  value: reports.filter(r => r.status === 'SUBMITTED').length },
          { label: "Хянасан",         value: reviewed },
          { label: "Засвар шаардсан", value: revision },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-ink-900 mt-2 tabular-nums tracking-tight">{loading ? '—' : stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between mb-2.5">
              <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Илгээлтын хувь</span>
              <span className="text-sm font-semibold text-ink-900 tabular-nums">{submittedPct}%</span>
            </div>
            <Progress value={submittedPct} className="h-1.5" />
            <p className="text-xs text-ink-400 mt-2 tabular-nums">{submitted} / {reports.length} тайлан илгээсан</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-between mb-2.5">
              <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Хяналтын хувь</span>
              <span className="text-sm font-semibold text-ink-900 tabular-nums">{reviewedPct}%</span>
            </div>
            <Progress value={reviewedPct} className="h-1.5" />
            <p className="text-xs text-ink-400 mt-2 tabular-nums">{reviewed} / {reports.length} тайлан хянасан</p>
          </CardContent>
        </Card>
      </div>

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
        <select className="border border-border-strong rounded-md text-sm px-3 h-9 bg-surface text-ink-900 focus:outline-none focus:border-ink-900" value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
          {stages.map(s => <option key={s} value={s}>{s === 'Бүгд' ? 'Бүх шатууд' : s}</option>)}
        </select>
        <select className="border border-border-strong rounded-md text-sm px-3 h-9 bg-surface text-ink-900 focus:outline-none focus:border-ink-900" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s === 'Бүгд' ? 'Бүх статус' : s}</option>)}
        </select>
        {committees.length > 1 && (
          <select className="border border-border-strong rounded-md text-sm px-3 h-9 bg-surface text-ink-900 focus:outline-none focus:border-ink-900" value={committeeFilter} onChange={e => setCommitteeFilter(e.target.value)}>
            {committees.map(c => <option key={c} value={c}>{c === 'Бүгд' ? 'Бүх комисс' : c}</option>)}
          </select>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Оюутан", "Шат", "Комисс", "Хянасан", "Статус", "Огноо"].map(h => (
                    <th key={h} className="px-4 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-14 text-ink-400">
                      <FileText className="w-8 h-8 mx-auto mb-3 text-ink-300" strokeWidth={1.5} />
                      <p className="text-sm">{reports.length === 0 ? 'Тайлан байхгүй байна.' : 'Шүүлтэд тохирох тайлан олдсонгүй.'}</p>
                    </td>
                  </tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-medium text-sm text-ink-900 tracking-tight">{r.student}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-ink-700 border border-border-strong rounded-sm px-2 py-0.5">
                        {r.stageLabel || r.reportType}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-ink-600">{r.committeeName}</td>
                    <td className="px-4 py-4 text-sm text-ink-600">{r.reviewedBy}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot[statusTone(r.status)]}`} />
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-ink-500 tabular-nums">{r.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
