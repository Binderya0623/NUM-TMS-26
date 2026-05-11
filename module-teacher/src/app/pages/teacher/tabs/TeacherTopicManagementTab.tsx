import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, X, BookOpen, Tag, Send } from 'lucide-react';
import { topicService } from '../../../../services/topicService';
import type { Topic } from '../../../../services/topicService';
import { getStoredUser } from '../../../../lib/authGuard';
import { RichTextEditor, RichText } from '../../../components/RichTextEditor';
import { fmtDateTime } from "../../../../lib/utils";

type Tone = "positive" | "warning" | "negative" | "neutral";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]",
};

const statusMap: Record<string, { label: string; tone: Tone }> = {
  ACTIVE: { label: 'Нийтэд нээлттэй', tone: 'positive' },
  DRAFT: { label: 'Ноорог', tone: 'neutral' },
  DEPT_PENDING: { label: 'Тэнхимийн хяналтанд', tone: 'warning' },
  PENDING_DEPT_APPROVAL: { label: 'Тэнхимийн хяналтанд', tone: 'warning' },
  APPROVED: { label: 'Батлагдсан', tone: 'positive' },
  REJECTED: { label: 'Татгалзсан', tone: 'negative' },
};

export default function TeacherTopicManagementTab() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || '';

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', titleEn: '', description: '', goal: '', keywords: '', visibility: 'PUBLIC', maxStudents: 1 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }
    topicService.getTopics({ })
      .then(res => setTopics(res.data.filter(t => t.createdById === teacherId)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teacherId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Сэдвийн нэр заавал оруулна уу';
    if (!form.titleEn.trim()) e.titleEn = 'English title is required';
    if (!form.description.trim()) e.description = 'Тайлбар заавал оруулна уу';
    if (!form.goal.trim()) e.goal = 'Судалгааны зорилго заавал оруулна уу';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({ title: '', titleEn: '', description: '', goal: '', keywords: '', visibility: 'PUBLIC', maxStudents: 1 });
    setErrors({});
    setShowForm(false);
  };

  const handleCreate = () => {
    if (!validate()) return;
    setSubmitting(true);
    topicService.createTopic({
      title: form.title,
      titleEn: form.titleEn,
      description: form.description,
      researchGoal: form.goal,
      keywords: form.keywords || undefined,
      createdById: teacherId,
      visibility: form.visibility,
      status: 'ACTIVE',
      maxStudents: form.maxStudents > 0 ? form.maxStudents : 1,
    })
      .then(res => {
        setTopics(prev => [res.data, ...prev]);
        resetForm();
      })
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  const handleSubmitForDeptReview = (topicId: number) => {
    topicService.submitTopicForDeptReview(topicId, teacherId)
      .then(res => setTopics(prev => prev.map(t => t.id === topicId ? res.data : t)))
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-ink-900 tracking-tight">Миний сэдвүүд</h3>
          <p className="text-sm text-ink-500 mt-0.5">Оюутнуудад санал болгох сэдвүүдийг үүсгэж, удирдана уу.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={1.6} /> Шинэ сэдэв үүсгэх
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border border-ink-900">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-ink-900 tracking-tight">
                <BookOpen className="w-4 h-4 text-ink-500" strokeWidth={1.6} /> Шинэ сэдэв үүсгэх
              </CardTitle>
              <button onClick={resetForm} className="p-1 text-ink-400 hover:text-ink-900 rounded-md hover:bg-surface-muted" aria-label="Хаах">
                <X className="w-4 h-4" strokeWidth={1.6} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <FormField label="Сэдвийн нэр" required error={errors.title}>
              <Input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Жишээ: Монгол хэлний NLP систем..."
                className={errors.title ? 'border-[var(--color-dot-negative)]' : ''}
              />
            </FormField>
            <FormField label="Сэдвийн нэр (Англи)" required hint="NUM TMS bilingual requirement" error={errors.titleEn}>
              <Input
                value={form.titleEn}
                onChange={e => setForm({ ...form, titleEn: e.target.value })}
                placeholder="e.g. Mongolian-language NLP system…"
                className={errors.titleEn ? 'border-[var(--color-dot-negative)]' : ''}
              />
            </FormField>
            <FormField label="Сэдвийн тайлбар" required error={errors.description}>
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
                placeholder="Сэдвийн тухай дэлгэрэнгүй тайлбар..."
                minHeight={120}
                disabled={submitting}
                ariaLabel="Сэдвийн тайлбар"
              />
            </FormField>
            <FormField label="Судалгааны зорилго" required error={errors.goal}>
              <RichTextEditor
                value={form.goal}
                onChange={(html) => setForm({ ...form, goal: html })}
                placeholder="Энэхүү судалгаагаар ямар үр дүнд хүрэх вэ?"
                minHeight={110}
                disabled={submitting}
                ariaLabel="Судалгааны зорилго"
              />
            </FormField>
            <FormField label="Түлхүүр үгс" hint="(таслалаар)">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" strokeWidth={1.6} />
                <Input
                  value={form.keywords}
                  onChange={e => setForm({ ...form, keywords: e.target.value })}
                  placeholder="NLP, Machine Learning, AI..."
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField label="Харагдах байдал">
              <select
                value={form.visibility}
                onChange={e => setForm({ ...form, visibility: e.target.value })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink-900 bg-surface"
              >
                <option value="PUBLIC">Нийтэд нээлттэй</option>
                <option value="PRIVATE">Зөвхөн урилгаар</option>
              </select>
            </FormField>
            <FormField label="Сонголт" hint="Хэдэн оюутан энэ сэдвийг сонгож болох вэ?">
              <select
                value={form.maxStudents === 1 ? "single" : "multi"}
                onChange={e => setForm({ ...form, maxStudents: e.target.value === "single" ? 1 : Math.max(2, form.maxStudents) })}
                className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink-900 bg-surface"
              >
                <option value="single">Зөвхөн нэг оюутан</option>
                <option value="multi">Олон оюутан</option>
              </select>
              {form.maxStudents > 1 && (
                <Input
                  type="number"
                  min={2}
                  className="mt-2"
                  value={form.maxStudents}
                  onChange={e => {
                    const n = parseInt(e.target.value, 10);
                    setForm({ ...form, maxStudents: !Number.isFinite(n) || n < 2 ? 2 : n });
                  }}
                />
              )}
            </FormField>
            <div className="flex gap-3 pt-2 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={resetForm} disabled={submitting}>Цуцлах</Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={submitting}
              >
                <Send className="w-4 h-4 mr-2" strokeWidth={1.6} />
                {submitting ? 'Үүсгэж байна...' : 'Сэдэв үүсгэх'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10 text-ink-400 text-sm">Ачааллаж байна...</div>
      ) : topics.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-surface rounded-md border border-dashed border-border-strong">
          <BookOpen className="w-10 h-10 text-ink-200 mx-auto mb-4" strokeWidth={1.4} />
          <p className="text-sm font-medium text-ink-700">Сэдэв байхгүй байна</p>
          <p className="text-sm text-ink-400 mt-1">Оюутнуудад санал болгох сэдэв үүсгэнэ үү.</p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={1.6} /> Сэдэв үүсгэх
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map(t => {
            const s = statusMap[t.status] || { label: t.status, tone: 'neutral' as Tone };
            return (
              <Card key={t.id} className="border border-border hover:border-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${toneDot[s.tone]}`} />
                          {s.label}
                        </span>
                        {t.visibility === 'PUBLIC' && (
                          <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Нийтэд нээлттэй</span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-ink-900 leading-tight tracking-tight">{t.title}</h4>
                      {t.titleEn && (
                        <p className="text-xs italic text-ink-500 mt-0.5 leading-tight">{t.titleEn}</p>
                      )}
                      <RichText
                        html={t.description}
                        className="text-xs text-ink-500 mt-1 line-clamp-2"
                      />
                      {t.rejectionReason && (
                        <div className="text-xs text-ink-700 mt-2 bg-surface-muted border border-border rounded-md px-2 py-1.5">
                          <span className="font-medium">Шалтгаан:</span>{' '}
                          <RichText html={t.rejectionReason} className="inline" />
                        </div>
                      )}
                      {t.keywords && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {t.keywords.split(',').map(k => (
                            <span key={k} className="text-[10px] bg-surface-muted text-ink-600 border border-border rounded-sm px-1.5 py-0.5">{k.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-xs text-ink-400 whitespace-nowrap tabular-nums">
                        {t.createdAt ? fmtDateTime(t.createdAt) : ''}
                      </div>
                      {t.status === "DRAFT" && (
                        <Button variant="outline" size="sm" onClick={() => handleSubmitForDeptReview(t.id)}>
                          <Send className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Тэнхимд илгээх
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormField({ label, required, hint, error, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">
        {label}
        {required && <span className="text-[var(--color-dot-negative)] ml-1">*</span>}
        {hint && <span className="ml-2 normal-case tracking-normal text-ink-400 font-normal">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[var(--color-dot-negative)] mt-1">{error}</p>}
    </div>
  );
}
