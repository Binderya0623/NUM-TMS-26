import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../../../components/ui/dialog";
import {
  Send, Plus, Edit2, Trash2, Save, CalendarDays, Lock, ChevronDown, ChevronUp, AlertCircle,
} from "lucide-react";
import { planService } from "../../../../services/planService";
import type { Plan, PlanWeek, PlanReview } from "../../../../services/planService";
import { topicService } from "../../../../services/topicService";
import { getStoredUser } from "../../../../lib/authGuard";
import { RichText } from "../../../components/RichText";
import { RichTextEditor } from "../../../components/RichTextEditor";

type Tone = "positive" | "warning" | "negative" | "neutral" | "accent";
const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
  accent:   "bg-accent",
};

const planStatusMap: Record<string, { label: string; tone: Tone; alert?: string }> = {
  DRAFT:              { label: "Ноорог", tone: "neutral" },
  draft:              { label: "Ноорог", tone: "neutral" },
  SUBMITTED:          { label: "Илгээсэн", tone: "accent" },
  submitted:          { label: "Илгээсэн", tone: "accent" },
  REVISION_REQUIRED:  { label: "Засвар шаардлагатай", tone: "warning", alert: "Багш засвар шаардсан байна. Доорх долоо хоногуудыг шалгана уу." },
  revision:           { label: "Засвар шаардлагатай", tone: "warning", alert: "Багш засвар шаардсан байна." },
  APPROVED:           { label: "Багш баталсан", tone: "positive" },
  teacher_approved:   { label: "Багш баталсан", tone: "positive" },
  DEPT_APPROVED:      { label: "Тэнхим баталсан", tone: "positive" },
  department_approved:{ label: "Тэнхим баталсан", tone: "positive" },
};

const weeks = Array.from({ length: 15 }, (_, i) => i + 1);
const weekStartDates: Record<number, string> = {
  1: "2026-02-16", 2: "2026-02-23", 3: "2026-03-02", 4: "2026-03-09",
  5: "2026-03-16", 6: "2026-03-23", 7: "2026-03-30", 8: "2026-04-06",
  9: "2026-04-13", 10: "2026-04-20", 11: "2026-04-27", 12: "2026-05-04",
  13: "2026-05-11", 14: "2026-05-18", 15: "2026-05-25",
};

export default function StudentWeeklyPlanTab() {
  const user = getStoredUser();
  const studentId = user?.userId || user?.username || "";

  const [plan, setPlan] = useState<Plan | null>(null);
  const [planWeeks, setPlanWeeks] = useState<PlanWeek[]>([]);
  const [reviews, setReviews] = useState<PlanReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1, 2, 3]));

  const [editingWeek, setEditingWeek] = useState<PlanWeek | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRevisionSubmitModal, setShowRevisionSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({ plannedTasks: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    const load = async () => {
      try {
        const planRes = await planService.getMyPlan(studentId);
        const plans: Plan[] = planRes.data;
        if (plans.length > 0) {
          const p = plans[0];
          setPlan(p);
          const [weeksRes, reviewsRes] = await Promise.all([
            planService.getPlanWeeks(p.id),
            planService.getPlanReviews(p.id),
          ]);
          setPlanWeeks(weeksRes.data);
          setReviews(reviewsRes.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [studentId]);

  const toggleWeek = (week: number) => {
    const next = new Set(expandedWeeks);
    if (next.has(week)) next.delete(week);
    else next.add(week);
    setExpandedWeeks(next);
  };

  const validateTask = () => {
    const e: Record<string, string> = {};
    if (!formData.plannedTasks.trim()) e.plannedTasks = "Ажлын нэр оруулна уу";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveTask = () => {
    if (!selectedWeek || !validateTask() || !plan) return;
    setSubmitting(true);
    const body: Partial<PlanWeek> = {
      weekNumber: selectedWeek,
      plannedTasks: formData.plannedTasks,
      description: formData.description,
    };

    const call = editingWeek
      ? planService.updateWeek(plan.id, editingWeek.id, body)
      : planService.upsertWeek(plan.id, body);

    call.then(res => {
      if (editingWeek) {
        setPlanWeeks(planWeeks.map(w => w.id === editingWeek.id ? res.data : w));
      } else {
        setPlanWeeks([...planWeeks, res.data]);
      }
      setFormData({ plannedTasks: "", description: "" });
      setShowTaskForm(false);
      setEditingWeek(null);
    })
    .catch(() => {})
    .finally(() => setSubmitting(false));
  };

  const handleDeleteTask = (weekId: number) => {
    if (!plan) return;
    planService.deleteWeek(plan.id, weekId)
      .then(() => {
        setPlanWeeks(planWeeks.filter(w => w.id !== weekId));
        setDeleteConfirm(null);
      })
      .catch(() => setDeleteConfirm(null));
  };

  const handleSubmitPlan = () => {
    if (!plan) return;
    setSubmitting(true);
    planService.submitPlan(plan.id)
      .then(res => {
        setPlan(res.data);
        setShowSubmitModal(false);
        setShowRevisionSubmitModal(false);
      })
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  const handleCreatePlan = async () => {
    setSubmitting(true);
    setCreateError(null);
    try {
      // The backend requires a fully-resolved topic_request before a plan can
      // be created. The auto-link from admin approval already inserts an
      // APPROVED topic_request — we just need to find it.
      const reqs = await topicService.getMyRequests(studentId);
      const approved = (reqs.data || []).find((r: any) => r.status === 'APPROVED');
      if (!approved) {
        setCreateError(
          "Сэдвийг тэнхимээс батлуулсны дараа төлөвлөгөө үүсгэж болно. " +
          "Та сэдэвтэй болоод тэнхимийн зөвшөөрөл авсныг шалгана уу."
        );
        return;
      }
      const res = await planService.createPlan({
        topicRequestId: approved.id,
        topicId: approved.topicId,
        studentId,
        supervisorId: (approved as any).respondedById ?? (approved as any).reviewedBy ?? "",
      });
      setPlan(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Төлөвлөгөө үүсгэхэд алдаа гарлаа.";
      setCreateError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48 text-ink-400 text-sm">
          Ачааллаж байна...
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-64 text-center p-8">
          <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-ink-400" strokeWidth={1.4} />
          </div>
          <h3 className="text-base font-semibold text-ink-900 mb-2 tracking-tight">Үечилсэн төлөвлөгөө байхгүй</h3>
          <p className="text-sm text-ink-500 max-w-sm mb-5">
            Сэдвийг батлуулсны дараа 15 долоо хоногийн төлөвлөгөө үүсгэх боломжтой.
          </p>
          <Button disabled={submitting} onClick={handleCreatePlan}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={1.6} /> Төлөвлөгөө үүсгэх
          </Button>
          {createError && (
            <p className="text-xs text-[var(--color-dot-negative)] mt-4 max-w-md inline-flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)] mt-1.5 shrink-0" />
              <span>{createError}</span>
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const planStatus = plan.status;
  const statusCfg = planStatusMap[planStatus] || { label: planStatus, tone: "neutral" as Tone };
  const isLocked = planStatus === "SUBMITTED" || planStatus === "submitted"
    || planStatus === "APPROVED" || planStatus === "teacher_approved"
    || planStatus === "DEPT_APPROVED" || planStatus === "department_approved";
  const isRevision = planStatus === "REVISION_REQUIRED" || planStatus === "revision";

  const latestReview = reviews.length > 0 ? reviews[reviews.length - 1] : null;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="bg-surface border-b border-border flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4 sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <CardTitle className="text-base font-semibold text-ink-900 tracking-tight">15 долоо хоногийн төлөвлөгөө</CardTitle>
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
              <span className={`w-1.5 h-1.5 rounded-full ${toneDot[statusCfg.tone]}`} />
              {statusCfg.label}
            </span>
          </div>
          <CardDescription className="text-xs text-ink-500">
            Дипломын ажлын хүрээнд 15 долоо хоногийн турш хийгдэх ажлын төлөвлөгөө
          </CardDescription>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {!isLocked && !isRevision && (
            <Button className="flex-1 md:flex-none" onClick={() => setShowSubmitModal(true)}>
              <Send className="w-4 h-4 mr-2" strokeWidth={1.6} />
              Багш руу илгээх
            </Button>
          )}
          {!isLocked && isRevision && (
            <Button className="flex-1 md:flex-none" onClick={() => setShowRevisionSubmitModal(true)}>
              <Send className="w-4 h-4 mr-2" strokeWidth={1.6} />
              Засварыг илгээх
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 md:p-6 bg-surface-sunken min-h-[500px]">
          {isRevision && latestReview && (
            <div className="mb-6 p-4 bg-surface-muted border border-border rounded-md flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[var(--color-dot-warning)] shrink-0 mt-0.5" strokeWidth={1.6} />
              <div>
                <h4 className="text-sm font-semibold text-ink-900 tracking-tight mb-0.5">Засвар шаардлагатай</h4>
                <RichText
                  html={latestReview.comment}
                  className="text-sm text-ink-700"
                  fallback={<p className="text-sm text-ink-700">{statusCfg.alert}</p>}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {weeks.map((week) => {
              const weekEntry = planWeeks.find(w => w.weekNumber === week);
              const isExpanded = expandedWeeks.has(week);

              const completionTone: Tone | null = weekEntry
                ? weekEntry.completionRate === 100 ? "positive"
                  : weekEntry.completionRate && weekEntry.completionRate > 0 ? "accent"
                  : "neutral"
                : null;

              return (
                <div
                  key={week}
                  className={`border rounded-md overflow-hidden transition-[border-color,box-shadow,background-color] bg-surface ${
                    isExpanded ? "border-accent shadow-[0_2px_8px_rgba(16,32,51,0.08)]" : "border-border hover:border-border-strong"
                  }`}
                >
                  <div
                    className="flex flex-wrap items-center justify-between p-3 sm:p-4 cursor-pointer gap-2"
                    onClick={() => toggleWeek(week)}
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-surface-muted border border-border text-sm font-semibold text-ink-900 tabular-nums shrink-0">
                        {week}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-ink-900 tracking-tight truncate">Долоо хоног {week}</h4>
                        <p className="text-[11px] text-ink-500 font-medium tabular-nums flex items-center gap-1 mt-0.5">
                          <CalendarDays className="w-3 h-3" strokeWidth={1.6} />
                          Эхлэх {weekStartDates[week]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {weekEntry && completionTone && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-ink-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${toneDot[completionTone]}`} />
                          {weekEntry.completionRate ? `${weekEntry.completionRate}%` : "Хийгдэх"}
                        </span>
                      )}
                      {!isLocked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWeek(week);
                            setFormData({ plannedTasks: weekEntry?.plannedTasks || "", description: weekEntry?.description || "" });
                            setEditingWeek(weekEntry || null);
                            setShowTaskForm(true);
                            setExpandedWeeks(new Set([...expandedWeeks, week]));
                          }}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={1.6} />
                          {weekEntry ? "Засах" : "Ажил нэмэх"}
                        </Button>
                      )}
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center rounded-md text-ink-400 hover:text-ink-900 hover:bg-accent-softer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/15"
                        aria-label="Дэлгэрэнгүй"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" strokeWidth={1.6} /> : <ChevronDown className="w-4 h-4" strokeWidth={1.6} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 sm:p-5 border-t border-border bg-surface-muted space-y-4">
                      {showTaskForm && selectedWeek === week && !isLocked && (
                        <Card>
                          <CardHeader className="py-3 px-4 border-b border-border">
                            <CardTitle className="text-sm font-semibold text-ink-900 tracking-tight flex items-center gap-2">
                              <Edit2 className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                              {editingWeek ? "Ажил засах" : "Шинэ ажил нэмэх"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 space-y-4">
                            <div>
                              <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2 block">Хийх ажлууд</label>
                              <Input
                                value={formData.plannedTasks}
                                onChange={(e) => setFormData({ ...formData, plannedTasks: e.target.value })}
                                placeholder="Жишээ: Өгөгдөл цуглуулах..."
                              />
                              {errors.plannedTasks && <p className="text-xs text-[var(--color-dot-negative)] mt-1">{errors.plannedTasks}</p>}
                            </div>
                            <div>
                              <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2 block">Тайлбар ба үр дүн</label>
                              <RichTextEditor
                                value={formData.description}
                                onChange={(html) => setFormData({ ...formData, description: html })}
                                placeholder="Тухайн ажилд хийгдэх алхмууд болон хүлээгдэж буй үр дүн..."
                                minHeight={110}
                                ariaLabel="Тайлбар ба үр дүн"
                              />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                              <Button variant="outline" size="sm" onClick={() => { setShowTaskForm(false); setEditingWeek(null); }}>Цуцлах</Button>
                              <Button size="sm" disabled={submitting} onClick={handleSaveTask}>
                                <Save className="w-4 h-4 mr-2" strokeWidth={1.6} /> Хадгалах
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {!weekEntry ? (
                        !showTaskForm && (
                          <div className="text-center py-6 bg-surface rounded-md border border-dashed border-border-strong">
                            <p className="text-ink-500 text-sm">Энэ долоо хоногт ажил төлөвлөөгүй байна.</p>
                          </div>
                        )
                      ) : (
                        <div className="bg-surface border border-border p-4 rounded-md">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-semibold text-ink-900 tracking-tight leading-tight mb-2">
                                {weekEntry.plannedTasks}
                              </h5>
                              {weekEntry.description && (
                                <RichText
                                  html={weekEntry.description}
                                  className="text-sm text-ink-600 leading-relaxed bg-surface-muted p-3 rounded-md border border-border"
                                />
                              )}
                              {weekEntry.completedTasks && (
                                <div className="mt-2 text-sm text-ink-700 bg-surface-muted p-3 rounded-md border border-border flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-positive)] mt-1.5 shrink-0" />
                                  <div>
                                    <span className="font-semibold text-ink-900">Гүйцэтгэсэн:</span> {weekEntry.completedTasks}
                                  </div>
                                </div>
                              )}
                            </div>
                            {!isLocked && (
                              <div className="flex items-start gap-1 justify-end shrink-0 sm:border-l sm:border-border sm:pl-3">
                                <Button
                                  variant="ghost" size="icon"
                                  onClick={() => setDeleteConfirm(weekEntry.id)}
                                  aria-label="Устгах"
                                >
                                  <Trash2 className="w-4 h-4" strokeWidth={1.6} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <Dialog open={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
        <DialogHeader title="Төлөвлөгөө илгээх" onClose={() => setShowSubmitModal(false)} />
        <DialogBody>
          <p className="text-sm text-ink-700">Та 15 долоо хоногийн төлөвлөгөөгөө багш руу илгээхдээ итгэлтэй байна уу?</p>
          <div className="bg-surface-muted text-ink-700 text-xs p-3 rounded-md mt-4 border border-border">
            Илгээсний дараа багш хариу өгөх хүртэл та төлөвлөгөөнд өөрчлөлт оруулах боломжгүй болно.
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Цуцлах</Button>
          <Button disabled={submitting} onClick={handleSubmitPlan}>Илгээх</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={showRevisionSubmitModal} onClose={() => setShowRevisionSubmitModal(false)}>
        <DialogHeader title="Засварыг дахин илгээх" onClose={() => setShowRevisionSubmitModal(false)} />
        <DialogBody>
          <p className="text-sm text-ink-700">Та засварласан төлөвлөгөө болон засварын хариугаа батлуулахаар илгээх гэж байна.</p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRevisionSubmitModal(false)}>Цуцлах</Button>
          <Button disabled={submitting} onClick={handleSubmitPlan}>Засварыг илгээх</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogHeader title="Ажил устгах" onClose={() => setDeleteConfirm(null)} />
        <DialogBody>
          <p className="text-sm text-ink-700">Энэ үйлдлийг буцаах боломжгүй. Ажлыг устгахдаа итгэлтэй байна уу?</p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Цуцлах</Button>
          <Button onClick={() => { if (deleteConfirm) handleDeleteTask(deleteConfirm); }}>Устгах</Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}
