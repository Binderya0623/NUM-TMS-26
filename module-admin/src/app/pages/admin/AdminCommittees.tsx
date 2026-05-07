import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogHeader, DialogBody, DialogFooter, ConfirmDialog, Drawer } from "../../components/ui/dialog";
import {
  Users, Plus, Search, Eye, CheckCircle2,
  Lock, AlertTriangle, X, Calendar, MapPin, FileDown,
} from "lucide-react";
import { committeeService } from "../../../services/committeeService";
import type { Committee, CommitteeTeacher, CommitteeStudent } from "../../../services/committeeService";
import { userService } from "../../../services/userService";
import type { UserRecord } from "../../../services/userService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { RichTextEditor } from "../../components/RichTextEditor";
import { RichText } from "../../components/RichText";
import { evaluationService } from "../../../services/evaluationService";
import { resolveName, isUuid, initialsFromName } from "../../../lib/utils";

const defenseTypes: { value: string; label: string }[] = [
  { value: "PROGRESS_2", label: "Явц 2" },
  { value: "PRE_DEFENSE", label: "Урьдчилсан хамгаалалт" },
  { value: "FINAL_DEFENSE", label: "Эцсийн хамгаалалт" },
];
const roles = ["Дарга", "Нарийн бичгийн дарга", "Гишүүн", "Эксперт"];

const inputClass = (hasError?: boolean) =>
  `w-full h-9 border rounded-md px-3 text-sm text-ink-900 bg-surface focus:outline-none focus:border-ink-900 ${
    hasError ? 'border-[var(--color-dot-negative)]' : 'border-border-strong'
  }`;

const selectClass = (hasError?: boolean) =>
  `w-full h-9 border rounded-md px-3 text-sm text-ink-900 bg-surface focus:outline-none focus:border-ink-900 ${
    hasError ? 'border-[var(--color-dot-negative)]' : 'border-border-strong'
  }`;

export default function AdminCommittees() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<UserRecord[]>([]);
  const [externalExperts, setExternalExperts] = useState<UserRecord[]>([]);
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PROGRESS_2" | "PRE_DEFENSE" | "FINAL_DEFENSE">("ALL");
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<CommitteeTeacher[]>([]);
  const [committeeStudents, setCommitteeStudents] = useState<CommitteeStudent[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showClosure, setShowClosure] = useState<Committee | null>(null);
  const [copyingMembers, setCopyingMembers] = useState(false);
  const [copySourceId, setCopySourceId] = useState("");
  const [copyResult, setCopyResult] = useState<{ teachers: number; students: number } | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "",
    scheduledDate: "",
    location: "",
    notes: "",
    selectedTeachers: [] as { id: string; name: string; role: string }[],
    selectedStudents: [] as { id: string; name: string }[],
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createSuccess, setCreateSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [committeeSessions, setCommitteeSessions] = useState<Record<string, DefenseSession>>({});
  const [exportingId, setExportingId] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ name: "", type: "", scheduledDate: "", location: "", notes: "", selectedTeachers: [], selectedStudents: [] });
    setFormErrors({});
    setStudentSearch("");
    setCopySourceId("");
    setCopyResult(null);
  };

  useEffect(() => {
    committeeService.getCommittees()
      .then(res => setCommittees(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    userService.getTeachers()
      .then(res => setTeachers(res.data))
      .catch(() => {});
    userService.getExternalExperts()
      .then(res => setExternalExperts(res.data))
      .catch(() => {});
    userService.getStudents()
      .then(res => setStudents(res.data))
      .catch(() => {});
  }, []);

  const handleSelectCommittee = (c: Committee) => {
    setSelectedCommittee(c);
    setCommitteeStudents([]);
    committeeService.getMembers(c.id)
      .then(res => setSelectedMembers(res.data))
      .catch(() => setSelectedMembers([]));
    committeeService.getStudents(c.id)
      .then(res => setCommitteeStudents(res.data))
      .catch(() => {});
    if (!committeeSessions[c.id]) {
      workflowService.getDefenseSessions({ committeeId: c.id })
        .then(res => {
          const s = res.data?.[0];
          if (s) setCommitteeSessions(prev => ({ ...prev, [c.id]: s }));
        })
        .catch(() => {});
    }
  };

  const [drawerStudentSearch, setDrawerStudentSearch] = useState("");
  const [addingStudentId, setAddingStudentId] = useState<string | null>(null);

  const allUserMap: Record<string, string> = {};
  [...teachers, ...externalExperts, ...students].forEach(u => {
    if (u.id) allUserMap[u.id] = u.displayName || '';
    if (u.username) allUserMap[u.username] = u.displayName || '';
  });

  const handleAddStudentToCommittee = async (studentId: string) => {
    if (!selectedCommittee) return;
    setAddingStudentId(studentId);
    try {
      await committeeService.addStudent(selectedCommittee.id, studentId);
      const res = await committeeService.getStudents(selectedCommittee.id);
      setCommitteeStudents(res.data);
      setDrawerStudentSearch("");
    } catch {
      // ignore
    } finally {
      setAddingStudentId(null);
    }
  };

  const filtered = committees
    .filter(c => filter === "ALL" || c.stageType === filter)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const isActive = (c: Committee) => c.status === 'ACTIVE' || c.status === 'Идэвхтэй';

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Комиссийн нэрийг оруулна уу.";
    if (!form.type) errors.type = "Хамгаалалтын төрлийг сонгоно уу.";
    if (!form.scheduledDate) errors.scheduledDate = "Огноо, цаг оруулна уу.";
    else if (new Date(form.scheduledDate).getTime() < Date.now()) errors.scheduledDate = "Огноо өнгөрсөн байна.";
    if (!form.location.trim()) errors.location = "Байршил оруулна уу.";
    if (form.selectedTeachers.length < 2) errors.teachers = "Дор хаяж 2 багш сонгоно уу.";
    if (!form.selectedTeachers.some(t => t.role === "Дарга")) errors.role = "Дор хаяж нэг гишүүнийг Дарга болгон тогтооно уу.";
    if (!form.selectedTeachers.some(t => t.role === "Нарийн бичгийн дарга")) errors.secretary = "Нарийн бичгийн дарга томилно уу.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await committeeService.create({ name: form.name, stageType: form.type });
      const newCommittee = res.data;

      await Promise.allSettled([
        ...form.selectedTeachers.map(t =>
          committeeService.addMember({ committeeId: newCommittee.id, teacherId: t.id, role: t.role })
        ),
        ...form.selectedStudents.map(s =>
          committeeService.addStudent(newCommittee.id, s.id)
        ),
      ]);

      try {
        const sessionRes = await workflowService.createDefenseSession({
          committeeId: newCommittee.id,
          stageType: form.type,
          scheduledDate: new Date(form.scheduledDate).toISOString().replace('Z', ''),
          location: form.location,
          notes: form.notes || undefined,
        });
        if (sessionRes.data) {
          setCommitteeSessions(prev => ({ ...prev, [newCommittee.id]: sessionRes.data }));
        }
      } catch { /* committee is already created */ }

      setCommittees(prev => [...prev, newCommittee]);
      setCreateSuccess(true);
      setTimeout(() => {
        setCreateSuccess(false);
        setShowCreate(false);
        resetForm();
      }, 1800);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCommittee = async (c: Committee) => {
    setExportingId(c.id);
    try {
      const [membersRes, studentsRes, sessionsRes] = await Promise.all([
        committeeService.getMembers(c.id),
        committeeService.getStudents(c.id),
        workflowService.getDefenseSessions({ committeeId: c.id }),
      ]);
      const members = membersRes.data;
      const cStudents = studentsRes.data;
      const sessions = sessionsRes.data;
      const sessionIds = sessions.map(s => s.id);

      const [gradesList, subsList] = await Promise.all([
        Promise.all(sessionIds.map(sid => evaluationService.getDefenseGrades({ defenseSessionId: sid }).then(r => r.data))),
        Promise.all(sessionIds.map(sid => evaluationService.getSecretarySubmissions({ defenseSessionId: sid }).then(r => r.data))),
      ]);
      const grades = gradesList.flat();
      const subs = subsList.flat();

      const graders = members.filter(m => m.role !== 'REVIEWER');
      const roleLabel = (r: string) =>
        r === 'HEAD' ? 'Дарга' :
        r === 'SECRETARY' ? 'Нарийн бичиг' :
        r === 'EXTERNAL_EXPERT' ? 'Эксперт' : 'Гишүүн';
      const nameOf = (id: string) => {
        const t = teachers.find(x => x.id === id) || externalExperts.find(x => x.id === id);
        return t?.displayName || id;
      };
      const studentNameOf = (id: string) => students.find(x => x.id === id)?.displayName || id;

      const headers = [
        'Оюутан', 'Оюутны ID',
        ...graders.map(m => `${nameOf(m.teacherId)} (${roleLabel(m.role)})`),
        'Дундаж', 'Хамгийн их', 'Төлөв', 'Илгээсэн огноо',
      ];
      const rows = cStudents.map(cs => {
        const cells: string[] = [studentNameOf(cs.studentId), cs.studentId];
        let sum = 0, count = 0, maxTotal = 0;
        graders.forEach(m => {
          const g = grades.find(x => x.studentId === cs.studentId && x.evaluatorId === m.teacherId && x.isSubmitted);
          if (g) { cells.push(`${g.points}/${g.maxPoints}`); sum += g.points; maxTotal = g.maxPoints; count++; }
          else cells.push('—');
        });
        const avg = count > 0 ? (sum / count) : null;
        const sub = subs.find(s => s.studentId === cs.studentId);
        cells.push(avg !== null ? avg.toFixed(2) : '—');
        cells.push(maxTotal ? String(maxTotal) : '—');
        cells.push(sub ? 'Илгээсэн' : (count === graders.length && graders.length > 0 ? 'Бэлэн' : `${count}/${graders.length}`));
        cells.push(sub?.submittedAt ? sub.submittedAt.split('T')[0] : '—');
        return cells;
      });
      const escape = (v: string) => {
        const s = String(v ?? '');
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv = '﻿' + [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `${c.name.replace(/[^\wЀ-ӿ-]+/g, '_')}-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* ignore */ } finally {
      setExportingId(null);
    }
  };

  const handleClose = async () => {
    if (!showClosure) return;
    setSubmitting(true);
    try {
      const res = await committeeService.close(showClosure.id);
      setCommittees(prev => prev.map(c => c.id === showClosure.id ? res.data : c));
      setShowClosure(null);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const addTeacher = (t: UserRecord) => {
    if (form.selectedTeachers.find(s => s.id === t.id)) return;
    setForm(prev => ({ ...prev, selectedTeachers: [...prev.selectedTeachers, { id: t.id, name: t.displayName, role: "Гишүүн" }] }));
  };

  const addStudent = (s: UserRecord) => {
    if (form.selectedStudents.find(x => x.id === s.id)) return;
    setForm(prev => ({ ...prev, selectedStudents: [...prev.selectedStudents, { id: s.id, name: s.displayName }] }));
  };

  const removeStudent = (id: string) => {
    setForm(prev => ({ ...prev, selectedStudents: prev.selectedStudents.filter(s => s.id !== id) }));
  };

  const filteredStudents = students.filter(s =>
    !form.selectedStudents.find(x => x.id === s.id) &&
    (s.displayName.toLowerCase().includes(studentSearch.toLowerCase()) ||
     s.id.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const stageLabel = (s: string | undefined | null) => {
    if (!s) return "Тодорхойгүй";
    return defenseTypes.find(d => d.value === s)?.label || s;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-900 tracking-tight">Комиссууд</h1>
          <p className="text-sm text-ink-500 mt-1">Үнэлгээний комисс, гишүүд болон хаах үйл явцыг удирдах.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" strokeWidth={1.6} /> Комисс үүсгэх
        </Button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { label: "Нийт комиссууд", value: committees.length },
          { label: "Идэвхтэй",       value: committees.filter(isActive).length },
          { label: "Хаагдсан",       value: committees.filter(c => !isActive(c)).length },
        ].map(stat => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.6} />
          <input
            type="text"
            placeholder="Комисс хайх..."
            className="h-9 pl-9 pr-3 border border-border-strong rounded-md text-sm w-full bg-surface text-ink-900 placeholder-ink-400 focus:outline-none focus:border-ink-900"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { value: "ALL", label: "Бүгд" },
            { value: "PROGRESS_2", label: "Явц 2" },
            { value: "PRE_DEFENSE", label: "Урьдчилсан" },
            { value: "FINAL_DEFENSE", label: "Жинхэнэ" },
          ] as const).map(f => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-14 text-sm text-ink-400">Ачааллаж байна...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 rounded-md border border-dashed border-border-strong bg-surface">
          <Users className="w-10 h-10 text-ink-300 mx-auto mb-3" strokeWidth={1.3} />
          <h3 className="text-sm font-semibold text-ink-900 tracking-tight">Комисс олдсонгүй</h3>
          <p className="text-xs text-ink-500 mt-1">Шүүлт өөрчлөх эсвэл шинэ комисс үүсгэнэ үү.</p>
          <Button onClick={() => setShowCreate(true)} className="mt-4" size="sm">Комисс үүсгэх</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(c => {
            const active = isActive(c);
            return (
              <Card key={c.id} className={!active ? 'opacity-75' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-semibold text-ink-900 tracking-tight truncate">{c.name}</h3>
                        {!active && <Lock className="w-3.5 h-3.5 text-ink-400 shrink-0" strokeWidth={1.6} />}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {c.stageType && (
                          <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">
                            {stageLabel(c.stageType)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[var(--color-dot-positive)]' : 'bg-[var(--color-dot-neutral)]'}`} />
                          {active ? 'Идэвхтэй' : 'Хаагдсан'}
                        </span>
                      </div>
                    </div>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback>
                        {c.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {c.createdAt && (
                    <p className="text-xs text-ink-400 mb-4 tabular-nums">Үүсгэсэн: {c.createdAt.split("T")[0]}</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSelectCommittee(c)}>
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.6} /> Дэлгэрэнгүй
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={exportingId === c.id}
                      onClick={() => handleExportCommittee(c)}
                    >
                      <FileDown className="w-3.5 h-3.5" strokeWidth={1.6} />
                      {exportingId === c.id ? 'Татаж байна…' : 'Excel'}
                    </Button>
                    {active && (
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => setShowClosure(c)}>
                        <Lock className="w-3.5 h-3.5" strokeWidth={1.6} /> Хаах
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} maxWidth="max-w-xl" scrollable>
        <DialogHeader title="Шинэ комисс үүсгэх" onClose={() => { setShowCreate(false); resetForm(); }} />
        {createSuccess ? (
          <DialogBody className="py-10">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-ink-900" strokeWidth={1.6} />
              </div>
              <h3 className="text-[15px] font-semibold text-ink-900 tracking-tight">Комисс үүслээ</h3>
              <p className="text-sm text-ink-500">Шинэ комисс амжилттай үүслээ.</p>
            </div>
          </DialogBody>
        ) : (
          <>
            <DialogBody className="overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">Комиссийн нэр *</label>
                  <input
                    type="text"
                    placeholder="Жишээ: Урьдчилсан хамгаалалтын комисс 2026-А"
                    className={inputClass(!!formErrors.name)}
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                  {formErrors.name && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">Хамгаалалтын төрөл *</label>
                  <select
                    className={selectClass(!!formErrors.type)}
                    value={form.type}
                    onChange={e => { setForm(p => ({ ...p, type: e.target.value })); setCopySourceId(""); }}
                  >
                    <option value="">Төрөл сонгох...</option>
                    {defenseTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  {formErrors.type && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.type}</p>}

                  {(form.type === 'PRE_DEFENSE' || form.type === 'FINAL_DEFENSE') && (() => {
                    const sourceType = form.type === 'PRE_DEFENSE' ? 'PROGRESS_2' : 'PRE_DEFENSE';
                    const sourceLabel = form.type === 'PRE_DEFENSE' ? 'Явц 2-ын хамгаалалт' : 'Урьдчилсан хамгаалалт';
                    const sourceCmts = committees.filter(c => c.stageType === sourceType);
                    return (
                      <div className="mt-3 p-3 border border-border rounded-md bg-surface-muted space-y-2">
                        <p className="text-[11px] uppercase tracking-wider font-medium text-ink-700 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" strokeWidth={1.6} />
                          {sourceLabel} комиссоос хуулах
                        </p>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 h-9 border border-border-strong rounded-md px-3 text-sm bg-surface text-ink-900 focus:outline-none focus:border-ink-900"
                            value={copySourceId}
                            onChange={e => setCopySourceId(e.target.value)}
                          >
                            <option value="">Комисс сонгох...</option>
                            {sourceCmts.length === 0
                              ? <option disabled value="">— {sourceLabel} комисс байхгүй —</option>
                              : sourceCmts.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))
                            }
                          </select>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={copyingMembers || !copySourceId}
                            onClick={async () => {
                              if (!copySourceId) return;
                              setCopyingMembers(true);
                              setCopyResult(null);
                              try {
                                const membersRes = await committeeService.getMembers(copySourceId);
                                const studentsRes = await committeeService.getStudents(copySourceId);
                                const studentsData: { studentId: string }[] = (studentsRes.data as any[]) ?? [];

                                const copiedTeachers = membersRes.data.map(m => {
                                  const t = teachers.find(x => x.id === m.teacherId)
                                         || externalExperts.find(x => x.id === m.teacherId);
                                  const roleLabel =
                                    m.role === 'HEAD' ? 'Дарга' :
                                    m.role === 'SECRETARY' ? 'Нарийн бичгийн дарга' :
                                    m.role === 'EXTERNAL_EXPERT' ? 'Эксперт' : 'Гишүүн';
                                  return { id: m.teacherId, name: t?.displayName || 'Тодорхойгүй багш', role: roleLabel };
                                });
                                const copiedStudents = studentsData.map(cs => {
                                  const s = students.find(x => x.id === cs.studentId);
                                  return { id: cs.studentId, name: s?.displayName || 'Тодорхойгүй оюутан' };
                                });
                                const newTeachers = copiedTeachers.filter(
                                  c => !form.selectedTeachers.find(x => x.id === c.id)
                                );
                                const newStudents = copiedStudents.filter(
                                  c => !form.selectedStudents.find(x => x.id === c.id)
                                );
                                setForm(p => ({
                                  ...p,
                                  selectedTeachers: [
                                    ...p.selectedTeachers,
                                    ...copiedTeachers.filter(c => !p.selectedTeachers.find(x => x.id === c.id)),
                                  ],
                                  selectedStudents: [
                                    ...p.selectedStudents,
                                    ...copiedStudents.filter(c => !p.selectedStudents.find(x => x.id === c.id)),
                                  ],
                                }));
                                setCopyResult({ teachers: newTeachers.length, students: newStudents.length });
                              } catch { /* ignore */ } finally {
                                setCopyingMembers(false);
                              }
                            }}
                          >
                            {copyingMembers ? 'Уншиж байна...' : 'Хуулах'}
                          </Button>
                        </div>
                        <p className="text-[11px] text-ink-500">Гишүүд (гадаад эксперт орно), оюутнуудыг хуулна. Дараа нь өөрчлөх боломжтой.</p>
                        {copyResult && (
                          <p className="text-[11px] font-medium text-ink-700 border border-border rounded-md px-2 py-1 bg-surface inline-flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              copyResult.teachers + copyResult.students === 0
                                ? 'bg-[var(--color-dot-warning)]'
                                : 'bg-[var(--color-dot-positive)]'
                            }`} />
                            {copyResult.teachers + copyResult.students === 0
                              ? 'Хуулах шинэ гишүүн/оюутан олдсонгүй.'
                              : `${copyResult.teachers} багш, ${copyResult.students} оюутан нэмэгдлээ.`}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.6} /> Огноо, цаг *
                    </label>
                    <input
                      type="datetime-local"
                      className={inputClass(!!formErrors.scheduledDate)}
                      value={form.scheduledDate}
                      onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))}
                    />
                    {formErrors.scheduledDate && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.scheduledDate}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={1.6} /> Байршил / Өрөө *
                    </label>
                    <input
                      type="text"
                      placeholder="Жнь: 305 тоот, A байр"
                      className={inputClass(!!formErrors.location)}
                      value={form.location}
                      onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    />
                    {formErrors.location && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.location}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 flex items-center gap-1.5">
                    Нэмэлт тэмдэглэл
                    <span className="normal-case tracking-normal text-[10px] font-normal text-ink-500 border border-border rounded-sm px-1.5 py-0.5">Заавал биш</span>
                  </label>
                  <RichTextEditor
                    value={form.notes}
                    onChange={(html) => setForm(p => ({ ...p, notes: html }))}
                    placeholder="Оюутнуудад мэдэгдэх мэдээлэл..."
                    minHeight={88}
                    ariaLabel="Нэмэлт тэмдэглэл"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">Багш нар сонгох *</label>
                  <div className="border border-border rounded-md overflow-hidden max-h-48 overflow-y-auto">
                    {teachers.length === 0 ? (
                      <p className="text-sm text-ink-400 p-4 text-center">Багш олдсонгүй</p>
                    ) : teachers.map(t => {
                      const selected = form.selectedTeachers.find(s => s.id === t.id);
                      return (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between px-3 py-2.5 border-b border-border last:border-0 cursor-pointer transition-colors ${selected ? 'bg-surface-muted' : 'hover:bg-surface-muted/60'}`}
                          onClick={() => selected
                            ? setForm(p => ({ ...p, selectedTeachers: p.selectedTeachers.filter(s => s.id !== t.id) }))
                            : addTeacher(t)}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? 'bg-ink-900 border-ink-900' : 'border-border-strong'}`}>
                              {selected && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={2} />}
                            </div>
                            <span className="text-sm text-ink-900 truncate">{t.displayName}</span>
                            {t.departmentId && <span className="text-xs text-ink-400 shrink-0">{t.departmentId}</span>}
                          </div>
                          {selected && (
                            <select
                              className="border border-border-strong rounded-md text-xs px-2 h-7 bg-surface focus:outline-none focus:border-ink-900"
                              onClick={e => e.stopPropagation()}
                              value={selected.role}
                              onChange={e => setForm(p => ({ ...p, selectedTeachers: p.selectedTeachers.map(s => s.id === t.id ? { ...s, role: e.target.value } : s) }))}
                            >
                              {roles.map(r => <option key={r}>{r}</option>)}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {formErrors.teachers && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.teachers}</p>}
                  {formErrors.role && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.role}</p>}
                  {formErrors.secretary && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.secretary}</p>}
                </div>

                {(form.type === 'PRE_DEFENSE' || form.type === 'FINAL_DEFENSE') && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 flex items-center gap-2">
                      Гадаад экспертүүд нэмэх
                      <span className="normal-case tracking-normal text-[10px] font-normal text-ink-500 border border-border rounded-sm px-1.5 py-0.5">Заавал биш</span>
                    </label>
                    <div className="border border-border rounded-md overflow-hidden max-h-40 overflow-y-auto">
                      {externalExperts.length === 0 ? (
                        <p className="text-sm text-ink-400 p-4 text-center">Гадаад эксперт бүртгэгдээгүй байна</p>
                      ) : externalExperts.map(e => {
                        const selected = form.selectedTeachers.find(s => s.id === e.id);
                        return (
                          <div
                            key={e.id}
                            className={`flex items-center justify-between px-3 py-2.5 border-b border-border last:border-0 cursor-pointer transition-colors ${selected ? 'bg-surface-muted' : 'hover:bg-surface-muted/60'}`}
                            onClick={() => selected
                              ? setForm(p => ({ ...p, selectedTeachers: p.selectedTeachers.filter(s => s.id !== e.id) }))
                              : setForm(p => ({ ...p, selectedTeachers: [...p.selectedTeachers, { id: e.id, name: e.displayName, role: 'Эксперт' }] }))
                            }
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? 'bg-ink-900 border-ink-900' : 'border-border-strong'}`}>
                                {selected && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={2} />}
                              </div>
                              <span className="text-sm text-ink-900 truncate">{e.displayName}</span>
                              <span className="text-[10px] uppercase tracking-wider text-ink-500 border border-border rounded-sm px-1.5 py-0.5 shrink-0">Гадаад</span>
                            </div>
                            <span className="text-xs text-ink-400 truncate shrink-0 ml-2">{e.email}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {form.selectedTeachers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.selectedTeachers.map(t => (
                      <span key={t.id} className="inline-flex items-center gap-1.5 border border-border-strong rounded-md px-2.5 h-7 text-xs font-medium text-ink-900 bg-surface">
                        {t.name} <span className="text-ink-400">·</span> <span className="text-ink-600">{t.role}</span>
                        <button
                          onClick={() => setForm(p => ({ ...p, selectedTeachers: p.selectedTeachers.filter(s => s.id !== t.id) }))}
                          className="text-ink-400 hover:text-ink-900 ml-0.5"
                        >
                          <X className="w-3 h-3" strokeWidth={2} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">Оюутнууд нэмэх</label>
                  {form.selectedStudents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.selectedStudents.map(s => (
                        <span key={s.id} className="inline-flex items-center gap-1.5 border border-border-strong rounded-md px-2.5 h-7 text-xs font-medium text-ink-900 bg-surface">
                          {s.name}
                          <button onClick={() => removeStudent(s.id)} className="text-ink-400 hover:text-ink-900 ml-0.5">
                            <X className="w-3 h-3" strokeWidth={2} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Оюутан хайх..."
                    className={`${inputClass()} mb-2`}
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                  <div className="border border-border rounded-md overflow-hidden max-h-40 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="text-sm text-ink-400 p-3 text-center">
                        {studentSearch ? "Оюутан олдсонгүй" : students.length === 0 ? "Оюутан байхгүй" : "Бүгд сонгогдсон"}
                      </p>
                    ) : filteredStudents.slice(0, 20).map(s => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between px-3 py-2 border-b border-border last:border-0 hover:bg-surface-muted/60 cursor-pointer"
                        onClick={() => addStudent(s)}
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-ink-900 truncate">{s.displayName}</p>
                          <p className="text-xs text-ink-400 truncate">{s.id} {s.departmentId ? `· ${s.departmentId}` : ''}</p>
                        </div>
                        <Plus className="w-4 h-4 text-ink-400 shrink-0" strokeWidth={1.6} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Цуцлах</Button>
              <Button disabled={submitting} onClick={handleCreate}>
                {submitting ? "Үүсгэж байна..." : "Комисс үүсгэх"}
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      <Drawer open={!!selectedCommittee} onClose={() => setSelectedCommittee(null)} width="max-w-lg">
        {selectedCommittee && (
          <>
            <div className="px-6 py-4 border-b border-border flex justify-between items-start shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-[15px] font-semibold text-ink-900 tracking-tight truncate">{selectedCommittee.name}</h2>
                  {!isActive(selectedCommittee) && <Lock className="w-4 h-4 text-ink-400 shrink-0" strokeWidth={1.6} />}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {selectedCommittee.stageType && (
                    <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">
                      {stageLabel(selectedCommittee.stageType)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive(selectedCommittee) ? 'bg-[var(--color-dot-positive)]' : 'bg-[var(--color-dot-neutral)]'}`} />
                    {isActive(selectedCommittee) ? 'Идэвхтэй' : 'Хаагдсан'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedCommittee(null)} className="text-ink-400 hover:text-ink-900 hover:bg-accent-soft rounded-md p-1.5 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="members" className="w-full">
                <TabsList className="px-6 h-auto">
                  {[
                    { value: "members", label: "Гишүүд" },
                    { value: "students", label: "Оюутнууд" },
                    { value: "info", label: "Мэдээлэл" },
                  ].map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="members" className="px-6 pb-6 mt-4 space-y-2.5">
                  {selectedMembers.length === 0 ? (
                    <p className="text-center text-ink-400 text-sm py-6">Гишүүд олдсонгүй</p>
                  ) : selectedMembers.map(m => {
                    const teacher = teachers.find(t => t.id === m.teacherId)
                                 || externalExperts.find(t => t.id === m.teacherId);
                    const displayName = teacher?.displayName || 'Тодорхойгүй';
                    const isExpert = m.role === 'EXTERNAL_EXPERT';
                    const roleLabel =
                      m.role === 'HEAD' ? 'Дарга' :
                      m.role === 'SECRETARY' ? 'Нарийн бичгийн дарга' :
                      isExpert ? 'Гадаад эксперт' :
                      m.role === 'MEMBER' ? 'Гишүүн' : m.role;
                    return (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 border border-border rounded-md bg-surface">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initialsFromName(displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 tracking-tight truncate">{displayName}</p>
                          {teacher?.departmentId && !isUuid(teacher.departmentId) && <p className="text-xs text-ink-400 truncate">{teacher.departmentId}</p>}
                        </div>
                        <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500 border border-border rounded-sm px-2 py-0.5 shrink-0">
                          {roleLabel}
                        </span>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="students" className="px-6 pb-6 mt-4 space-y-2.5">
                  {committeeStudents.length === 0 ? (
                    <p className="text-center text-ink-400 text-sm py-3">Оюутнууд олдсонгүй</p>
                  ) : committeeStudents.map(cs => {
                    const studentInfo = students.find(s => s.id === cs.studentId);
                    const displayName = studentInfo?.displayName || 'Тодорхойгүй оюутан';
                    const sid = studentInfo?.studentId;
                    return (
                      <div key={cs.id} className="flex items-center gap-3 px-3 py-2.5 border border-border rounded-md bg-surface">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initialsFromName(displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 tracking-tight truncate">{displayName}</p>
                          {sid && !isUuid(sid) && <p className="text-xs text-ink-400 truncate">{sid}</p>}
                        </div>
                      </div>
                    );
                  })}

                  {isActive(selectedCommittee) && (
                    <div className="pt-4 mt-2 border-t border-border space-y-2">
                      <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" strokeWidth={1.6} /> Оюутан нэмэх
                      </label>
                      <input
                        type="text"
                        placeholder="Оюутан хайх..."
                        className={inputClass()}
                        value={drawerStudentSearch}
                        onChange={e => setDrawerStudentSearch(e.target.value)}
                      />
                      <div className="border border-border rounded-md overflow-hidden max-h-48 overflow-y-auto">
                        {(() => {
                          const assignedIds = new Set(committeeStudents.map(cs => cs.studentId));
                          const candidates = students.filter(s =>
                            !assignedIds.has(s.id) &&
                            (s.displayName.toLowerCase().includes(drawerStudentSearch.toLowerCase()) ||
                             s.id.toLowerCase().includes(drawerStudentSearch.toLowerCase()))
                          );
                          if (candidates.length === 0) {
                            return (
                              <p className="text-sm text-ink-400 p-3 text-center">
                                {drawerStudentSearch ? "Оюутан олдсонгүй" : "Бүх оюутан нэмэгдсэн"}
                              </p>
                            );
                          }
                          return candidates.slice(0, 20).map(s => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between px-3 py-2 border-b border-border last:border-0 hover:bg-surface-muted/60 cursor-pointer"
                              onClick={() => addingStudentId ? null : handleAddStudentToCommittee(s.id)}
                            >
                              <div className="min-w-0">
                                <p className="text-sm text-ink-900 truncate">{s.displayName}</p>
                                {s.studentId && !isUuid(s.studentId) && (
                                  <p className="text-xs text-ink-400 truncate">{s.studentId}{s.departmentId && !isUuid(s.departmentId) ? ` · ${s.departmentId}` : ''}</p>
                                )}
                              </div>
                              {addingStudentId === s.id
                                ? <span className="text-xs text-ink-400">Нэмж байна...</span>
                                : <Plus className="w-4 h-4 text-ink-400 shrink-0" strokeWidth={1.6} />}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="info" className="px-6 pb-6 mt-4 space-y-4">
                  {(() => {
                    const sess = committeeSessions[selectedCommittee.id];
                    if (!sess) return null;
                    const scheduled = sess.scheduledDate
                      ? new Date(sess.scheduledDate).toLocaleString('mn-MN', { dateStyle: 'medium', timeStyle: 'short' })
                      : null;
                    if (!scheduled && !sess.location && !sess.notes) return null;
                    return (
                      <div className="border border-border rounded-md bg-surface-muted p-4 space-y-2">
                        <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={1.6} /> Хамгаалалтын хуваарь
                        </p>
                        {scheduled && (
                          <div className="flex items-center gap-2 text-sm text-ink-900 tabular-nums">
                            <Calendar className="w-4 h-4 text-ink-500" strokeWidth={1.6} />
                            {scheduled}
                          </div>
                        )}
                        {sess.location && (
                          <div className="flex items-center gap-2 text-sm text-ink-900">
                            <MapPin className="w-4 h-4 text-ink-500" strokeWidth={1.6} />
                            {sess.location}
                          </div>
                        )}
                        {sess.notes && (
                          <RichText
                            html={sess.notes}
                            className="text-sm text-ink-700 leading-relaxed pt-1 border-t border-border"
                          />
                        )}
                      </div>
                    );
                  })()}

                  <div className="border border-border rounded-md divide-y divide-border">
                    {[
                      { label: "Үүсгэсэн",         value: selectedCommittee.createdAt?.split("T")[0] || "Огноогүй" },
                      { label: "Тэнхим",           value: selectedCommittee.departmentId && !isUuid(selectedCommittee.departmentId) ? selectedCommittee.departmentId : "Тодорхойгүй" },
                      { label: "Үүсгэсэн хэрэглэгч", value: resolveName(selectedCommittee.createdBy, allUserMap, "Удирдлага") },
                      { label: "Хаасан огноо",     value: selectedCommittee.closedAt?.split("T")[0] || "Идэвхтэй" },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center px-4 py-3 text-sm">
                        <span className="text-ink-500">{item.label}</span>
                        <span className="text-ink-900 font-medium tabular-nums">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={exportingId === selectedCommittee.id}
                    onClick={() => handleExportCommittee(selectedCommittee)}
                  >
                    <FileDown className="w-4 h-4" strokeWidth={1.6} />
                    {exportingId === selectedCommittee.id ? 'Татаж байна…' : 'Үнэлгээг Excel-ээр татах'}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!showClosure}
        onClose={() => setShowClosure(null)}
        onConfirm={handleClose}
        title="Комисс хаах"
        description={showClosure
          ? `Хаасны дараа "${showClosure.name}"-г засварлах боломжгүй болно. Үргэлжлүүлэх үү?`
          : ''}
        confirmLabel={submitting ? 'Хааж байна...' : 'Комисс хаах'}
        cancelLabel="Цуцлах"
        variant="danger"
        icon={<AlertTriangle strokeWidth={1.6} />}
      />
    </div>
  );
}
