import { useState, useEffect } from "react";
import { Search, Download, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Dialog, DialogHeader, DialogBody } from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { planService, type Plan } from "../../../services/planService";
import { userService, type UserRecord } from "../../../services/userService";
import { resolveName } from "../../../lib/utils";

type DotTone = "positive" | "warning" | "negative" | "neutral";

const STATUS_CONFIG: Record<string, { label: string; tone: DotTone }> = {
  DRAFT:                    { label: "Ноорог",                         tone: "neutral"  },
  PENDING_TEACHER_APPROVAL: { label: "Багшийн батлалт хүлээж байна",   tone: "warning"  },
  DEPT_PENDING:             { label: "Тэнхимийн батлалт хүлээж байна", tone: "warning"  },
  APPROVED:                 { label: "Зөвшөөрлөгдсөн",                 tone: "positive" },
  ACTIVE:                   { label: "Хийгдэж байна",                  tone: "neutral"  },
  SUBMITTED:                { label: "Хянагдаж байна",                 tone: "warning"  },
};

const statusLabel = (s: string) => STATUS_CONFIG[s]?.label ?? s;
const statusTone  = (s: string): DotTone => STATUS_CONFIG[s]?.tone ?? "neutral";

const toneDot: Record<DotTone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
};

const progressFromStatus = (s: string) => ({
  DRAFT: 5, PENDING_TEACHER_APPROVAL: 20, DEPT_PENDING: 30,
  APPROVED: 40, ACTIVE: 60, SUBMITTED: 80,
}[s] ?? 30);

interface DisplayThesis {
  id: number;
  title: string;
  student: string;
  studentId: string;
  supervisor: string;
  supervisorId: string;
  status: string;
  progress: number;
  createdAt: string;
}

export default function Thesis() {
  const [theses, setTheses] = useState<DisplayThesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Бүгд");
  const [selected, setSelected] = useState<DisplayThesis | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, usersRes] = await Promise.all([
          planService.getPlans(),
          userService.getStudents(),
        ]);
        const teachersRes = await userService.getTeachers();

        const nameMap: Record<string, string> = {};
        [...plansRes.data as any[], ...usersRes.data as UserRecord[], ...teachersRes.data as UserRecord[]].forEach((u: any) => {
          if (u.id) nameMap[u.id] = u.displayName || u.name || u.id;
          if (u.username) nameMap[u.username] = u.displayName || u.name || u.username;
        });

        const items: DisplayThesis[] = (plansRes.data as Plan[]).map(p => ({
          id: p.id,
          title: p.title || 'Гарчиггүй',
          student: resolveName(p.studentId, nameMap, 'Тодорхойгүй оюутан'),
          studentId: p.studentId,
          supervisor: resolveName(p.supervisorId, nameMap, 'Хуваарилагдаагүй'),
          supervisorId: p.supervisorId || '',
          status: p.status,
          progress: progressFromStatus(p.status),
          createdAt: p.createdAt?.split('T')[0] || 'Огноогүй',
        }));
        setTheses(items);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statuses = ["Бүгд", ...Object.values(STATUS_CONFIG).map(c => c.label)];

  const filtered = theses.filter(t => {
    const matchSearch = search === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.student.toLowerCase().includes(search.toLowerCase()) ||
      t.supervisor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Бүгд" || statusLabel(t.status) === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total:    theses.length,
    active:   theses.filter(t => t.status === "ACTIVE").length,
    review:   theses.filter(t => t.status === "SUBMITTED").length,
    approved: theses.filter(t => t.status === "APPROVED").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Нийт дипломын ажил", value: counts.total },
          { label: "Хийгдэж байна",       value: counts.active },
          { label: "Хянагдаж байна",      value: counts.review },
          { label: "Зөвшөөрлөгдсөн",     value: counts.approved },
        ].map(stat => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{loading ? "—" : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 h-4 w-4" />
              <Input
                placeholder="Гарчиг, оюутан, багшаар хайх..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 h-9 border border-border-strong rounded-md text-sm text-ink-900 bg-surface focus:outline-none focus:border-ink-900"
            >
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <Button variant="outline" onClick={() => {
              const rows = filtered.map(t => `${t.title},${t.student},${t.supervisor},${statusLabel(t.status)},${t.createdAt}`).join('\n');
              const blob = new Blob([`Гарчиг,Оюутан,Удирдагч,Статус,Огноо\n${rows}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'thesis.csv'; a.click();
              URL.revokeObjectURL(url);
            }}>
              <Download className="h-4 w-4 mr-2" /> Гаргах
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Дипломын ажлын сан ({loading ? "…" : filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-ink-400">
              <FileText className="h-8 w-8 mx-auto mb-3 text-ink-300" strokeWidth={1.5} />
              <p className="text-sm">Илэрц олдсонгүй</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Гарчиг</th>
                    <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Оюутан</th>
                    <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Удирдагч багш</th>
                    <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Огноо</th>
                    <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Дэвшил</th>
                    <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Байдал</th>
                    <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} className="border-b border-border hover:bg-surface-muted">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-ink-400 shrink-0" strokeWidth={1.6} />
                          <p className="font-medium text-ink-900 max-w-xs truncate tracking-tight">{t.title}</p>
                        </div>
                      </td>
                      <td className="py-3 text-ink-700">{t.student}</td>
                      <td className="py-3 text-ink-700">{t.supervisor}</td>
                      <td className="py-3 text-ink-500 tabular-nums">{t.createdAt}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={t.progress} className="w-20 h-1.5" />
                          <span className="text-xs text-ink-500 tabular-nums">{t.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                          <span className={`w-1.5 h-1.5 rounded-full ${toneDot[statusTone(t.status)]}`} />
                          {statusLabel(t.status)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(t)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <Dialog open onClose={() => setSelected(null)} maxWidth="max-w-lg">
          <DialogHeader
            title={selected.title}
            icon={<FileText className="w-4 h-4" strokeWidth={1.6} />}
            onClose={() => setSelected(null)}
          />
          <DialogBody className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: "Оюутан",         value: selected.student },
                { label: "Удирдагч",       value: selected.supervisor },
                { label: "Статус",         value: statusLabel(selected.status) },
                { label: "Илгээсн огноо", value: selected.createdAt },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">{item.label}</p>
                  <p className="text-sm text-ink-900 font-medium tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-xs text-ink-500 mb-1.5 tabular-nums">
                <span className="uppercase tracking-wider font-medium">Дэвшил</span>
                <span>{selected.progress}%</span>
              </div>
              <Progress value={selected.progress} className="h-1.5" />
            </div>
          </DialogBody>
        </Dialog>
      )}
    </div>
  );
}
