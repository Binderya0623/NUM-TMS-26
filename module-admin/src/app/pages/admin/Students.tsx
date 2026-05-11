import { useState, useEffect } from "react";
import { Search, Download, Eye, FileText, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Dialog, DialogHeader, DialogBody } from "../../components/ui/dialog";
import { userService, type UserRecord } from "../../../services/userService";
import { planService, type Plan } from "../../../services/planService";
import { topicService, type Topic } from "../../../services/topicService";
import { evaluationService } from "../../../services/evaluationService";
import { committeeService, type Committee } from "../../../services/committeeService";
import { isUuid, resolveName, fmtDateTime} from "../../../lib/utils";

type SortKey = "progress" | "title";
type SortDir = "asc" | "desc";

// 5-stage timeline (topic, prog1, prog2, pre, final) — each stage = 20%.
// Mirrors /teacher/progress and the old /admin/thesis derivation. The final
// grade override below promotes confirmed students to 100%.
const progressFromStatus = (s: string) => ({
  DRAFT: 0,
  PENDING_TEACHER_APPROVAL: 5,
  DEPT_PENDING: 10,
  APPROVED: 20,
  ACTIVE: 20,
  SUBMITTED: 20,
}[s] ?? 0);

interface DisplayRow {
  // Student
  id: string;
  displayName: string;
  username: string;
  email: string;
  departmentId?: string;
  programId?: string;
  studentNumber: string;
  // Thesis (may be empty if the student has no plan yet)
  hasPlan: boolean;
  thesisTitle: string;
  supervisor: string;
  status: string;
  progress: number;
  createdAt: string;
  topic?: Topic;
  committeeName: string;
}

export default function Students() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedProgram, setSelectedProgram] = useState("ALL");
  const [selectedCommittee, setSelectedCommittee] = useState("ALL");
  const [rows, setRows] = useState<DisplayRow[]>([]);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DisplayRow | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "progress" ? "desc" : "desc");
    }
  };

  useEffect(() => {
    Promise.all([
      userService.getStudents().catch(() => ({ data: [] as UserRecord[] })),
      userService.getTeachers().catch(() => ({ data: [] as UserRecord[] })),
      userService.getDepartments().catch(() => ({ data: [] as any[] })),
      planService.getPlans().catch(() => ({ data: [] as Plan[] })),
      evaluationService.getFinalGrades().catch(() => ({ data: [] as any[] })),
      topicService.getTopics().catch(() => ({ data: [] as Topic[] })),
      committeeService.getCommittees().catch(() => ({ data: [] as Committee[] })),
    ]).then(async ([sr, tr, dr, pr, fr, tpr, cr]) => {
      const dmap: Record<string, string> = {};
      (dr.data || []).forEach((d: any) => { if (d.id) dmap[d.id] = d.departmentName || d.id; });
      setDepartmentMap(dmap);

      const nameMap: Record<string, string> = {};
      [...(sr.data || []), ...(tr.data || [])].forEach((u: any) => {
        if (u.id) nameMap[u.id] = u.displayName || u.name || u.id;
        if (u.username) nameMap[u.username] = u.displayName || u.name || u.username;
      });

      // First plan per student wins. There's normally only one active plan;
      // older ones (REJECTED/superseded) won't crowd a student out.
      const planByStudent: Record<string, Plan> = {};
      (pr.data || []).forEach(p => {
        if (p.studentId && !planByStudent[p.studentId]) planByStudent[p.studentId] = p;
      });

      const gradedStudentIds = new Set(
        (fr.data || []).map((g: any) => g.studentId).filter(Boolean)
      );

      const topicMap = new Map<number, Topic>();
      (tpr.data || []).forEach(t => topicMap.set(t.id, t));

      // Each student is typically assigned to several stage-committees that
      // share the same name; first match wins for display.
      const studentToCommittee = new Map<string, string>();
      const studentLists = await Promise.all(
        (cr.data || []).map(c =>
          committeeService.getStudents(c.id)
            .then(r => ({ name: c.name, students: r.data }))
            .catch(() => ({ name: c.name, students: [] as any[] }))
        )
      );
      studentLists.forEach(({ name, students }) => {
        students.forEach((cs: any) => {
          if (cs.studentId && !studentToCommittee.has(cs.studentId)) {
            studentToCommittee.set(cs.studentId, name);
          }
        });
      });

      const items: DisplayRow[] = (sr.data || []).map(s => {
        const plan = planByStudent[s.id] || planByStudent[s.username || ''];
        const graded = gradedStudentIds.has(s.id) || gradedStudentIds.has(s.username || '');
        return {
          id: s.id,
          displayName: s.displayName || s.username || s.id,
          username: s.username || '',
          email: s.email || '',
          departmentId: s.departmentId,
          programId: s.programId,
          studentNumber: s.studentId || '',
          hasPlan: !!plan,
          thesisTitle: plan?.title || '',
          supervisor: plan ? resolveName(plan.supervisorId, nameMap, 'Хуваарилагдаагүй') : '',
          status: plan?.status || '',
          progress: graded ? 100 : plan ? progressFromStatus(plan.status) : 0,
          createdAt: fmtDateTime(plan?.createdAt) || '',
          topic: plan?.topicId ? topicMap.get(plan.topicId) : undefined,
          committeeName: studentToCommittee.get(s.id) || studentToCommittee.get(s.username || '') || '',
        };
      });

      setRows(items);
    }).finally(() => setLoading(false));
  }, []);

  const deptLabel = (id?: string) => {
    if (!id) return "";
    return departmentMap[id] || (isUuid(id) ? "" : id);
  };

  // Department options come straight from the loaded department map (so the
  // dropdown only offers things that actually exist in the data).
  const departmentOptions = Object.entries(departmentMap)
    .map(([id, name]) => ({ id, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Program/major options come from whatever the rows expose (no separate
  // backend list exists). We skip raw UUIDs since those aren't human-readable.
  const programOptions = Array.from(
    new Set(
      rows
        .map(r => r.programId)
        .filter((p): p is string => !!p && !isUuid(p))
    )
  ).sort((a, b) => a.localeCompare(b));

  const committeeOptions = Array.from(
    new Set(rows.map(r => r.committeeName).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.displayName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.username.toLowerCase().includes(q) ||
      r.studentNumber.toLowerCase().includes(q) ||
      r.thesisTitle.toLowerCase().includes(q) ||
      r.supervisor.toLowerCase().includes(q) ||
      r.committeeName.toLowerCase().includes(q);
    const matchesDept = selectedDept === "ALL" || r.departmentId === selectedDept;
    const matchesProgram = selectedProgram === "ALL" || r.programId === selectedProgram;
    const matchesCommittee = selectedCommittee === "ALL" || r.committeeName === selectedCommittee;
    return matchesSearch && matchesDept && matchesProgram && matchesCommittee;
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "progress") return (a.progress - b.progress) * dir;
        // "title" sort = selected (has plan) ↔ unselected. asc → unselected first;
        // desc → selected first. Within selected, alphabetical by title.
        if (a.hasPlan !== b.hasPlan) return (Number(a.hasPlan) - Number(b.hasPlan)) * dir;
        return a.thesisTitle.localeCompare(b.thesisTitle) * dir;
      })
    : filtered;

  // CSV with UTF-8 BOM so Excel opens it directly with Cyrillic intact.
  const handleExport = () => {
    const headers = [
      "Оюутан", "И-мэйл", "Тэнхим", "Хөтөлбөр", "Оюутны ID",
      "Гарчиг", "Удирдагч", "Комисс", "Дэвшил (%)", "Илгээсэн огноо",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = sorted.map(r => [
      r.displayName, r.email,
      deptLabel(r.departmentId) || "",
      r.programId && !isUuid(r.programId) ? r.programId : "",
      r.studentNumber && !isUuid(r.studentNumber) ? r.studentNumber : "",
      r.hasPlan ? r.thesisTitle : "",
      r.hasPlan ? r.supervisor : "",
      r.committeeName,
      r.hasPlan ? r.progress : "",
      r.createdAt,
    ]);
    const csv = "﻿" + [headers, ...lines].map(row => row.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `students-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 text-ink-400" strokeWidth={1.8} />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3 h-3 text-ink-900" strokeWidth={2} />
      : <ArrowDown className="w-3 h-3 text-ink-900" strokeWidth={2} />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-500">Нийт оюутнууд</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : rows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-500">Шүүлтэнд тохирсон</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-500">Дипломын ажилтай</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rows.filter(r => r.hasPlan).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400 h-4 w-4" />
              <Input
                placeholder="Оюутан, гарчиг, удирдагчаар хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2 border border-border-strong rounded-md text-sm text-ink-900 bg-surface focus:outline-none focus:border-ink-900"
            >
              <option value="ALL">Бүх тэнхим</option>
              {departmentOptions.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-4 py-2 border border-border-strong rounded-md text-sm text-ink-900 bg-surface focus:outline-none focus:border-ink-900"
              disabled={programOptions.length === 0}
            >
              <option value="ALL">Бүх хөтөлбөр</option>
              {programOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={selectedCommittee}
              onChange={(e) => setSelectedCommittee(e.target.value)}
              className="px-4 py-2 border border-border-strong rounded-md text-sm text-ink-900 bg-surface focus:outline-none focus:border-ink-900"
              disabled={committeeOptions.length === 0}
            >
              <option value="ALL">Бүх комисс</option>
              {committeeOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Button variant="outline" onClick={handleExport} disabled={sorted.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Гаргах
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Оюутны бүртгэл ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-ink-400 py-6 text-center text-sm">Ачааллаж байна...</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Оюутан</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Тэнхим</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Хөтөлбөр</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Оюутны ID</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">
                    <button
                      type="button"
                      onClick={() => handleSort("title")}
                      className="inline-flex items-center gap-1 uppercase tracking-wider font-medium hover:text-ink-900 transition-colors"
                      title="Сонгосон ↔ сонгоогүй"
                    >
                      Гарчиг <SortIcon k="title" />
                    </button>
                  </th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Удирдагч</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Комисс</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500 w-16 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort("progress")}
                      className="inline-flex items-center gap-1 uppercase tracking-wider font-medium hover:text-ink-900 transition-colors"
                      title="Их ↔ бага"
                    >
                      Дэвшил <SortIcon k="progress" />
                    </button>
                  </th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-surface-muted">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-surface border border-border-strong text-ink-900 text-[11px] font-medium">
                            {(r.displayName || r.username || "?").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-ink-900 tracking-tight">{r.displayName}</p>
                          <p className="text-xs text-ink-500">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm">{deptLabel(r.departmentId) || "—"}</td>
                    <td className="py-4 text-sm">{r.programId && !isUuid(r.programId) ? r.programId : "—"}</td>
                    <td className="py-4 text-sm">{r.studentNumber && !isUuid(r.studentNumber) ? r.studentNumber : "—"}</td>
                    <td className="py-4 text-sm">
                      {r.hasPlan ? (
                        <p className="text-ink-900 max-w-xs truncate tracking-tight">{r.thesisTitle || "Гарчиггүй"}</p>
                      ) : <span className="text-ink-400">—</span>}
                    </td>
                    <td className="py-4 text-sm">{r.hasPlan ? r.supervisor : <span className="text-ink-400">—</span>}</td>
                    <td className="py-4 text-sm">{r.committeeName || <span className="text-ink-400">—</span>}</td>
                    <td className="py-4 w-16 whitespace-nowrap">
                      {r.hasPlan
                        ? <span className="text-xs font-medium text-ink-700 tabular-nums">{r.progress}%</span>
                        : <span className="text-ink-400 text-sm">—</span>}
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(r)} disabled={!r.hasPlan}>
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
            title={selected.thesisTitle || "Гарчиггүй"}
            icon={<FileText className="w-4 h-4" strokeWidth={1.6} />}
            onClose={() => setSelected(null)}
          />
          <DialogBody className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: "Оюутан",         value: selected.displayName },
                { label: "Удирдагч",       value: selected.supervisor || "—" },
                { label: "Тэнхим",         value: deptLabel(selected.departmentId) || "—" },
                { label: "Илгээсэн огноо", value: selected.createdAt || "—" },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">{item.label}</p>
                  <p className="text-sm text-ink-900 font-medium tracking-tight">{item.value}</p>
                </div>
              ))}
            </div>

            {selected.topic && (
              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500">Сонгосон сэдэв</p>
                <div>
                  <p className="text-sm font-semibold text-ink-900 tracking-tight">{selected.topic.title}</p>
                  {selected.topic.titleEn && (
                    <p className="text-xs italic text-ink-500 mt-0.5">{selected.topic.titleEn}</p>
                  )}
                </div>
                {selected.topic.description && (
                  <div
                    className="text-sm text-ink-700 leading-relaxed [&_p]:m-0 [&_p+p]:mt-2 line-clamp-6"
                    dangerouslySetInnerHTML={{ __html: selected.topic.description }}
                  />
                )}
                {selected.topic.keywords && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.topic.keywords.split(",").map(kw => (
                      <span key={kw} className="text-[10px] px-2 py-0.5 bg-surface-muted text-ink-600 rounded-md border border-border">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-xs text-ink-500 mb-1.5 tabular-nums">
                <span className="uppercase tracking-wider font-medium">Дэвшил</span>
                <span>{selected.progress}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 flex-1 bg-border-strong">
                  <div className="h-full bg-accent transition-all" style={{ width: `${selected.progress}%` }} />
                </div>
                <span className="text-xs font-medium text-ink-700 w-8 text-right tabular-nums">{selected.progress}%</span>
              </div>
            </div>
          </DialogBody>
        </Dialog>
      )}
    </div>
  );
}
