import { useState, useEffect } from "react";
import { Search, Plus, CheckCircle2, Pencil } from "lucide-react";
import { userService, type UserRecord } from "../../../services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../../components/ui/dialog";

const DEFAULT_PASSWORD = 'Num2024!';

const inputClass = (hasError?: boolean) =>
  `w-full h-9 border rounded-md px-3 text-sm text-ink-900 bg-surface focus:outline-none focus:border-ink-900 ${
    hasError ? 'border-[var(--color-dot-negative)]' : 'border-border-strong'
  }`;

export default function ExternalExperts() {
  const [search, setSearch] = useState("");
  const [experts, setExperts] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: DEFAULT_PASSWORD, organization: '', expertise: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({ organization: '', expertise: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    userService.getExternalExperts()
      .then(r => setExperts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = experts.filter((e) =>
    (e.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', email: '', password: DEFAULT_PASSWORD, organization: '', expertise: '' });
    setFormErrors({});
    setCreatedCredentials(null);
  };

  const closeDialog = () => {
    setShowCreate(false);
    setCreateSuccess(false);
    resetForm();
  };

  const openEdit = (expert: UserRecord) => {
    setEditing(expert);
    setEditForm({
      organization: (expert as any).organization || '',
      expertise:    (expert as any).expertise    || '',
    });
    setEditError(null);
  };

  const closeEdit = () => {
    setEditing(null);
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await userService.updateExternalExpertProfile(editing.id, editForm);
      setExperts(prev => prev.map(e => e.id === editing.id ? { ...e, ...res.data } : e));
      closeEdit();
    } catch (err: any) {
      setEditError(err?.response?.data?.message || err?.message || 'Хадгалахад алдаа гарлаа.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCreate = async () => {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = 'Нэр оруулна уу.';
    if (!form.lastName.trim()) errors.lastName = 'Овог оруулна уу.';
    if (!form.email.trim()) errors.email = 'И-мэйл оруулна уу.';
    if (!form.password.trim()) errors.password = 'Нууц үг оруулна уу.';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      const res = await userService.createExternalExpert(form);
      setExperts(prev => [...prev, res.data]);
      setCreatedCredentials({ email: form.email, password: form.password });
      setCreateSuccess(true);
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data;
      setFormErrors({ email: (typeof serverMsg === 'string' && serverMsg) || err?.message || 'Бүртгэлд алдаа гарлаа.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 bg-surface border border-border-strong rounded-md h-9 px-3 w-72">
          <Search className="w-4 h-4 text-ink-400" strokeWidth={1.6} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Эксперт хайх..."
            className="bg-transparent outline-none text-sm text-ink-700 placeholder-ink-400 w-full"
          />
        </div>

        <Button onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="w-4 h-4" strokeWidth={1.6} />
          Гадаад эксперт нэмэх
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Нийт гадаад экспертүүд", value: loading ? "..." : experts.length },
          { label: "Шүүлтэнд тохирсон",     value: filtered.length },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                <th className="text-left px-5 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider">Эксперт</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider hidden md:table-cell">Байгууллага</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider hidden lg:table-cell">Мэргэжил</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider">Үүрэг</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-ink-400">Ачааллаж байна...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-ink-400">Гадаад эксперт бүртгэгдээгүй байна.</td></tr>
              ) : filtered.map((expert) => (
                <tr key={expert.id} className="border-b border-border last:border-b-0 hover:bg-surface-muted/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-border-strong bg-surface rounded-full flex items-center justify-center text-[11px] font-semibold text-ink-700 shrink-0 tabular-nums">
                        {(expert.displayName || expert.username || "?").substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-ink-900 font-medium tracking-tight">{expert.displayName || expert.username}</p>
                        <p className="text-xs text-ink-400">{expert.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-ink-700">{(expert as any).organization || "—"}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-ink-700">{(expert as any).expertise || "—"}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-neutral)]" />
                      Гадаад эксперт
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => openEdit(expert)}
                      title="Засварлах"
                      className="text-ink-400 hover:text-ink-900 hover:bg-accent-soft rounded-md p-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.6} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-ink-500">{filtered.length} / {experts.length} эксперт харагдаж байна</p>
          </div>
        </div>
      </Card>

      <Dialog open={showCreate} onClose={closeDialog}>
        {createSuccess ? (
          <>
            <DialogHeader title="Амжилттай бүртгэлээ" onClose={closeDialog} />
            <DialogBody>
              <div className="flex flex-col items-center text-center gap-4 py-2">
                <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-ink-900" strokeWidth={1.6} />
                </div>
                <p className="text-sm text-ink-500">Гадаад эксперт системд нэмэгдлээ.</p>
                {createdCredentials && (
                  <div className="w-full border border-border rounded-md p-4 text-left space-y-2 bg-surface-muted">
                    <p className="text-[11px] font-medium text-ink-500 uppercase tracking-wider">Нэвтрэх мэдээлэл</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-ink-500">И-мэйл</span>
                        <span className="font-mono font-medium text-ink-900 truncate">{createdCredentials.email}</span>
                      </div>
                      <div className="flex justify-between text-sm gap-4">
                        <span className="text-ink-500">Нууц үг</span>
                        <span className="font-mono font-medium text-ink-900">{createdCredentials.password}</span>
                      </div>
                    </div>
                    <p className="text-xs text-ink-500 mt-2">Энэ мэдээллийг эксперттэй хуваалцана уу.</p>
                  </div>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button onClick={closeDialog}>Хаах</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader title="Гадаад эксперт бүртгэх" onClose={closeDialog} />
            <DialogBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 block">Овог *</label>
                    <input
                      type="text" placeholder="Батболд"
                      className={inputClass(!!formErrors.lastName)}
                      value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                    />
                    {formErrors.lastName && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.lastName}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 block">Нэр *</label>
                    <input
                      type="text" placeholder="Дорж"
                      className={inputClass(!!formErrors.firstName)}
                      value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    />
                    {formErrors.firstName && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.firstName}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 block">
                    И-мэйл * <span className="normal-case tracking-normal text-ink-400">(нэвтрэх нэр болно)</span>
                  </label>
                  <input
                    type="email" placeholder="expert@company.mn"
                    className={inputClass(!!formErrors.email)}
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  />
                  {formErrors.email && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 block">Нууц үг *</label>
                  <input
                    type="text" placeholder="Num2024!"
                    className={`${inputClass(!!formErrors.password)} font-mono`}
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  />
                  {formErrors.password && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{formErrors.password}</p>}
                  <p className="text-xs text-ink-400 mt-1">Эксперт анх нэвтрэхэд ашиглах нууц үг.</p>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 block">Байгууллага</label>
                  <input
                    type="text" placeholder="Microsoft Mongolia"
                    className={inputClass()}
                    value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 block">Мэргэжил / Чиглэл</label>
                  <input
                    type="text" placeholder="Хиймэл оюун ухаан, өгөгдлийн шинжилгээ"
                    className={inputClass()}
                    value={form.expertise} onChange={e => setForm(p => ({ ...p, expertise: e.target.value }))}
                  />
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={closeDialog}>Цуцлах</Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Бүртгэж байна...' : 'Бүртгэх'}
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      <Dialog open={!!editing} onClose={closeEdit}>
        <DialogHeader title="Эксперт засварлах" onClose={closeEdit} />
        <DialogBody>
          {editing && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1">Эксперт</p>
                <p className="text-sm text-ink-900 font-medium tracking-tight">{editing.displayName || editing.username}</p>
                <p className="text-xs text-ink-400">{editing.email}</p>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 block">Байгууллага</label>
                <input
                  type="text" placeholder="Microsoft Mongolia"
                  className={inputClass()}
                  value={editForm.organization}
                  onChange={e => setEditForm(p => ({ ...p, organization: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 block">Мэргэжил / Чиглэл</label>
                <input
                  type="text" placeholder="Хиймэл оюун ухаан, өгөгдлийн шинжилгээ"
                  className={inputClass()}
                  value={editForm.expertise}
                  onChange={e => setEditForm(p => ({ ...p, expertise: e.target.value }))}
                />
              </div>
              {editError && <p className="text-[var(--color-dot-negative)] text-xs">{editError}</p>}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={closeEdit}>Цуцлах</Button>
          <Button onClick={handleEditSave} disabled={editSubmitting}>
            {editSubmitting ? 'Хадгалж байна...' : 'Хадгалах'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
