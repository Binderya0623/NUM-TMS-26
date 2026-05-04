import { useState, useEffect } from "react";
import { Search, MoreHorizontal, Mail, BookOpen, ChevronDown, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { userService, type UserRecord } from "../../../services/userService";
import { planService } from "../../../services/planService";
import { isUuid } from "../../../lib/utils";

export default function Teachers() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("Бүх тэнхим");
  const [view, setView] = useState<"grid" | "table">("table");
  const [teachers, setTeachers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', departmentId: '', position: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [thesisCounts, setThesisCounts] = useState<Record<string, number>>({});
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      userService.getTeachers().catch(() => ({ data: [] as UserRecord[] })),
      planService.getPlans().catch(() => ({ data: [] as any[] })),
      userService.getDepartments().catch(() => ({ data: [] as any[] })),
    ]).then(([tr, pr, dr]) => {
      setTeachers(tr.data);
      const counts: Record<string, number> = {};
      (pr.data || []).forEach((p: any) => {
        if (p.supervisorId) counts[p.supervisorId] = (counts[p.supervisorId] || 0) + 1;
      });
      setThesisCounts(counts);
      const map: Record<string, string> = {};
      (dr.data || []).forEach((d: any) => { if (d.id) map[d.id] = d.departmentName || d.id; });
      setDepartmentMap(map);
    }).finally(() => setLoading(false));
  }, []);

  const deptLabel = (id?: string) => {
    if (!id) return "";
    return departmentMap[id] || (isUuid(id) ? "" : id);
  };

  const departments = ["Бүх тэнхим", ...Array.from(new Set(teachers.map(t => deptLabel(t.departmentId)).filter(Boolean))) as string[]];

  const filtered = teachers.filter((t) => {
    const matchSearch =
      (t.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.username || "").toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === "Бүх тэнхим" || deptLabel(t.departmentId) === selectedDept;
    return matchSearch && matchDept;
  });

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', email: '', departmentId: '', position: '' });
    setFormErrors({});
  };

  const handleCreate = async () => {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = 'Нэр оруулна уу.';
    if (!form.lastName.trim()) errors.lastName = 'Овог оруулна уу.';
    if (!form.email.trim()) errors.email = 'И-мэйл оруулна уу.';
    if (!form.departmentId.trim()) errors.departmentId = 'Тэнхим оруулна уу.';
    if (!form.position.trim()) errors.position = 'Албан тушаал оруулна уу.';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      const res = await userService.createTeacher(form);
      setTeachers(prev => [...prev, res.data]);
      setCreateSuccess(true);
      setTimeout(() => { setCreateSuccess(false); setShowCreate(false); resetForm(); }, 1800);
    } catch (err: any) {
      setFormErrors({ email: err?.response?.data?.message || 'Бүртгэлд алдаа гарлаа.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full h-9 border rounded-md px-3 text-sm text-ink-900 bg-surface focus:outline-none focus:border-ink-900 ${
      hasError ? 'border-[var(--color-dot-negative)]' : 'border-border-strong'
    }`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-surface border border-border-strong rounded-md px-3 h-9 focus-within:border-ink-900 transition-colors w-64">
            <Search className="w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Багш хайх..."
              className="bg-transparent outline-none text-sm text-ink-900 placeholder-ink-400 w-full"
            />
          </div>

          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="appearance-none bg-surface border border-border-strong rounded-md pl-3 pr-8 h-9 text-sm text-ink-900 outline-none focus:border-ink-900 cursor-pointer"
            >
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-surface border border-border-strong rounded-md p-0.5">
            {(["table", "grid"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-xs rounded-sm capitalize font-medium tracking-tight transition-colors ${
                  view === v ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Нийт багш нар", value: loading ? "—" : teachers.length },
          { label: "Шүүлтэнд тохирсон", value: filtered.length },
          { label: "Тэнхимүүд", value: new Set(teachers.map(t => t.departmentId).filter(Boolean)).size },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{s.label}</p>
              <p className="text-2xl font-semibold text-ink-900 mt-2 tabular-nums tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {view === "table" ? (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider">Багш</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider hidden md:table-cell">Тэнхим</th>
                <th className="text-center px-4 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider">Дипломын тоо</th>
                <th className="text-center px-4 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider">Байдал</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-ink-400 text-sm">Ачааллаж байна...</td></tr>
              ) : filtered.map((teacher) => (
                <tr key={teacher.id} className="border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-border-strong bg-surface rounded-full flex items-center justify-center text-ink-900 text-[11px] font-medium shrink-0">
                        {(teacher.displayName || teacher.username || "?").substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-ink-900 font-medium tracking-tight">{teacher.displayName || teacher.username}</p>
                        <p className="text-xs text-ink-500">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-sm text-ink-700">{deptLabel(teacher.departmentId) || "—"}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center gap-1 text-sm text-ink-700 tabular-nums">
                      <BookOpen className="w-3.5 h-3.5 text-ink-400" strokeWidth={1.6} />
                      {thesisCounts[teacher.id] || 0}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-positive)]" />
                      Идэвхтэй
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="w-8 h-8 rounded-md flex items-center justify-center text-ink-400 hover:bg-surface-muted hover:text-ink-900 transition-colors">
                      <MoreHorizontal className="w-4 h-4" strokeWidth={1.6} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-ink-500 tabular-nums">{filtered.length} / {teachers.length} багш харагдаж байна</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-7 h-7 rounded-md text-xs font-medium tabular-nums transition-colors ${
                    p === 1 ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-surface-muted hover:text-ink-900"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-border-strong bg-surface rounded-full flex items-center justify-center text-ink-900 text-[12px] font-medium">
                      {(teacher.displayName || teacher.username || "?").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-ink-900 font-medium tracking-tight">{teacher.displayName || teacher.username}</p>
                      <p className="text-xs text-ink-500">{deptLabel(teacher.departmentId) || "Тэнхим тодорхойгүй"}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-700 font-medium tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-positive)]" />
                    Идэвхтэй
                  </span>
                </div>
                <p className="text-xs text-ink-500 mb-4">{teacher.email}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.8} /> И-мэйл
                  </Button>
                  <Button size="sm" className="flex-1">Профайл харах</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <Dialog open onClose={() => { setShowCreate(false); resetForm(); }} maxWidth="max-w-md">
          <DialogHeader
            title="Багш бүртгэх"
            onClose={() => { setShowCreate(false); resetForm(); }}
          />
          {createSuccess ? (
            <DialogBody className="py-10 text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-[var(--color-dot-positive)]" strokeWidth={1.5} />
              <h3 className="text-[15px] font-semibold text-ink-900 tracking-tight">Амжилттай бүртгэлээ</h3>
              <p className="text-sm text-ink-500 mt-1">Багш системд нэмэгдлээ.</p>
            </DialogBody>
          ) : (
            <>
              <DialogBody className="space-y-4">
                <p className="text-sm text-ink-500 -mt-1">Гадаад эксперт болон багш нарыг энд нэмнэ.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">Овог <span className="text-[var(--color-dot-negative)] normal-case">*</span></label>
                    <input
                      type="text" placeholder="Батболд"
                      className={inputClass(!!formErrors.lastName)}
                      value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                    />
                    {formErrors.lastName && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.lastName}</p>}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">Нэр <span className="text-[var(--color-dot-negative)] normal-case">*</span></label>
                    <input
                      type="text" placeholder="Дорж"
                      className={inputClass(!!formErrors.firstName)}
                      value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    />
                    {formErrors.firstName && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.firstName}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">И-мэйл <span className="text-[var(--color-dot-negative)] normal-case">*</span></label>
                  <input
                    type="email" placeholder="teacher@num.edu.mn"
                    className={inputClass(!!formErrors.email)}
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  />
                  {formErrors.email && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">Тэнхим <span className="text-[var(--color-dot-negative)] normal-case">*</span></label>
                  <input
                    type="text" placeholder="Компьютерийн ухааны тэнхим"
                    className={inputClass(!!formErrors.departmentId)}
                    value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}
                  />
                  {formErrors.departmentId && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.departmentId}</p>}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">Албан тушаал <span className="text-[var(--color-dot-negative)] normal-case">*</span></label>
                  <input
                    type="text" placeholder="Дэд профессор / Гадаад эксперт"
                    className={inputClass(!!formErrors.position)}
                    value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                  />
                  {formErrors.position && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.position}</p>}
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Цуцлах</Button>
                <Button disabled={submitting} onClick={handleCreate}>
                  {submitting ? 'Бүртгэж байна...' : 'Бүртгэх'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
