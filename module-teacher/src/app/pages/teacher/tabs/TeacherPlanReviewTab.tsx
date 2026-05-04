import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../../../components/ui/dialog";
import {
  FileText, Users, CheckCircle2, AlertCircle,
  XCircle, CalendarDays, ChevronDown, ChevronUp,
} from "lucide-react";
import { planService, type Plan, type PlanWeek } from "../../../../services/planService";
import { userService } from "../../../../services/userService";
import { getStoredUser } from "../../../../lib/authGuard";
import { resolveName, initialsFromName } from "../../../../lib/utils";

type Tone = "positive" | "warning" | "negative" | "neutral";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning: "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral: "bg-[var(--color-dot-neutral)]",
};

const PLAN_STATUS_LABEL: Record<string, string> = {
  SUBMITTED:         "Илгээсэн",
  REVISION_REQUIRED: "Засвар шаардлагатай",
  APPROVED:          "Батлагдсан",
  DRAFT:             "Ноорог",
};

export default function TeacherPlanReviewTab() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || '';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planWeeks, setPlanWeeks] = useState<PlanWeek[]>([]);
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  const [showConfirmModal, setShowConfirmModal] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  useEffect(() => {
    planService.getPlans({ supervisorId: teacherId, status: 'SUBMITTED' })
      .then(res => setPlans(res.data))
      .catch(() => {})
      .finally(() => setLoadingPlans(false));

    userService.getStudents().then(res => {
      const map: Record<string, string> = {};
      (res.data || []).forEach((u: any) => {
        if (u.id) map[u.id] = u.displayName || u.name || u.id;
        if (u.username) map[u.username] = u.displayName || u.name || u.username;
      });
      setUserMap(map);
    }).catch(() => {});
  }, [teacherId]);

  const studentName = (id?: string) => resolveName(id, userMap, "Тодорхойгүй оюутан");

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanWeeks([]);
    setExpandedWeeks(new Set());
    setLoadingWeeks(true);
    planService.getPlanWeeks(plan.id)
      .then(res => setPlanWeeks(res.data))
      .catch(() => {})
      .finally(() => setLoadingWeeks(false));
  };

  const toggleWeek = (id: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleReview = () => {
    if (!selectedPlan || !showConfirmModal) return;
    if (showConfirmModal === "reject" && !rejectionReason.trim()) return;
    setSubmitting(true);
    const decision = showConfirmModal === "approve" ? "APPROVED" : "REVISION_REQUIRED";
    planService.reviewPlan(selectedPlan.id, {
      reviewedBy: teacherId,
      decision,
      comment: rejectionReason.trim() || undefined,
    })
      .then(() => {
        setPlans(prev => prev.filter(p => p.id !== selectedPlan.id));
        setSelectedPlan(null);
        setPlanWeeks([]);
        setShowConfirmModal(null);
        setRejectionReason("");
      })
      .catch(() => {})
      .finally(() => setSubmitting(false));
  };

  const resetModal = () => {
    setShowConfirmModal(null);
    setRejectionReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student list */}
          <Card className="lg:col-span-1 border border-border h-fit">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-ink-900 tracking-tight">
                <Users className="w-4 h-4 text-ink-500" strokeWidth={1.6} /> Хянах хүлээгдэж буй
              </CardTitle>
            </CardHeader>
            <div className="p-2 space-y-1">
              {loadingPlans ? (
                <div className="text-center p-4 text-ink-400 text-sm">Ачааллаж байна...</div>
              ) : plans.length === 0 ? (
                <div className="text-center p-6 text-ink-400 text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-ink-200" strokeWidth={1.4} />
                  Бүх төлөвлөгөө хянагдсан байна.
                </div>
              ) : plans.map(p => {
                const active = selectedPlan?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPlan(p)}
                    className={`w-full text-left p-3 rounded-md transition-colors border ${
                      active
                        ? "bg-accent-soft border-accent"
                        : "hover:bg-surface-muted border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border-strong shrink-0">
                        <AvatarFallback className="text-[10px] font-medium">
                          {initialsFromName(studentName(p.studentId))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900 truncate tracking-tight">
                          {studentName(p.studentId)}
                        </p>
                        <p className="text-xs text-ink-500 truncate">{p.title || `Төлөвлөгөө #${p.id}`}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-[11px]">
                      <span className="inline-flex items-center gap-1.5 text-ink-700">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                        {PLAN_STATUS_LABEL[p.status] || p.status}
                      </span>
                      <span className="text-ink-400 tabular-nums">
                        {p.submittedAt?.split("T")[0] || "Огноогүй"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Plan detail */}
          <div className="lg:col-span-2">
            {!selectedPlan ? (
              <Card className="border border-dashed border-border-strong h-96 flex flex-col items-center justify-center bg-surface">
                <FileText className="w-10 h-10 text-ink-200 mb-3" strokeWidth={1.4} />
                <p className="text-ink-500 text-sm">Зүүн талаас оюутан сонгоно уу.</p>
              </Card>
            ) : (
              <Card className="border border-border">
                <CardHeader className="border-b border-border pb-5">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <h3 className="text-base font-semibold text-ink-900 tracking-tight">{studentName(selectedPlan.studentId)}</h3>
                      <p className="text-sm text-ink-600 mt-0.5">{selectedPlan.title || `Төлөвлөгөө #${selectedPlan.id}`}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-ink-500">
                        <span className="flex items-center gap-1 tabular-nums">
                          <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.6} />
                          Илгээсэн: {selectedPlan.submittedAt?.split("T")[0] || "Огноогүй"}
                        </span>
                        {(selectedPlan.revisionCount ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-ink-700">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                            Засварын тоо: <span className="tabular-nums">{selectedPlan.revisionCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" onClick={() => setShowConfirmModal("reject")}>
                        <XCircle className="w-4 h-4 mr-1.5" strokeWidth={1.6} /> Засварт буцаах
                      </Button>
                      <Button onClick={() => setShowConfirmModal("approve")}>
                        <CheckCircle2 className="w-4 h-4 mr-1.5" strokeWidth={1.6} /> Батлах
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5">
                  <h4 className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-3 flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.6} />
                    Долоо хоногийн төлөвлөгөө
                    {planWeeks.length > 0 && (
                      <span className="text-ink-400 normal-case tracking-normal tabular-nums">({planWeeks.length} долоо хоног)</span>
                    )}
                  </h4>

                  {loadingWeeks ? (
                    <p className="text-sm text-ink-400 py-4 text-center">Ачааллаж байна...</p>
                  ) : planWeeks.length === 0 ? (
                    <div className="text-center py-6 text-ink-400 text-sm bg-surface-muted rounded-md border border-border">
                      Долоо хоногийн төлөвлөгөө оруулаагүй байна.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {planWeeks
                        .sort((a, b) => a.weekNumber - b.weekNumber)
                        .map(week => {
                          const isOpen = expandedWeeks.has(week.id);
                          return (
                            <div key={week.id} className="border border-border rounded-md overflow-hidden">
                              <button
                                onClick={() => toggleWeek(week.id)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-muted transition-colors text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-7 h-7 rounded-md border border-border-strong bg-surface-muted text-ink-900 text-xs font-semibold flex items-center justify-center shrink-0 tabular-nums">
                                    {week.weekNumber}
                                  </span>
                                  <span className="text-sm font-medium text-ink-900 tracking-tight">
                                    {week.weekNumber}-р долоо хоног
                                  </span>
                                  {week.completionRate != null && (
                                    <span className="text-xs text-ink-500 tabular-nums">{week.completionRate}%</span>
                                  )}
                                </div>
                                {isOpen
                                  ? <ChevronUp className="w-4 h-4 text-ink-400" strokeWidth={1.6} />
                                  : <ChevronDown className="w-4 h-4 text-ink-400" strokeWidth={1.6} />}
                              </button>
                              {isOpen && (
                                <div className="px-4 py-3 space-y-3 border-t border-border bg-surface-muted">
                                  {week.description && (
                                    <div>
                                      <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1">Тайлбар</p>
                                      <p className="text-sm text-ink-700">{week.description}</p>
                                    </div>
                                  )}
                                  {week.plannedTasks && (
                                    <div>
                                      <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1">Төлөвлөсөн ажлууд</p>
                                      <p className="text-sm text-ink-700 whitespace-pre-line">{week.plannedTasks}</p>
                                    </div>
                                  )}
                                  {week.completedTasks && (
                                    <div>
                                      <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1 flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                                        Гүйцэтгэсэн ажлууд
                                      </p>
                                      <p className="text-sm text-ink-700 whitespace-pre-line">{week.completedTasks}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={!!showConfirmModal} onClose={resetModal}>
        <DialogHeader
          title={showConfirmModal === "approve" ? "Төлөвлөгөө батлах" : "Засварт буцаах"}
          icon={showConfirmModal === "approve"
            ? <CheckCircle2 className="w-5 h-5 text-ink-900" strokeWidth={1.6} />
            : <AlertCircle className="w-5 h-5 text-ink-900" strokeWidth={1.6} />}
          onClose={resetModal}
        />
        <DialogBody>
          {showConfirmModal === "approve" ? (
            <p className="text-sm text-ink-700 leading-relaxed">
              Та <span className="font-medium text-ink-900">{studentName(selectedPlan?.studentId)}</span>-ийн төлөвлөгөөг батлах гэж байна. Баталсны дараа оюутан дипломын ажлаа эхлэх боломжтой болно.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink-700 leading-relaxed">
                Та <span className="font-medium text-ink-900">{studentName(selectedPlan?.studentId)}</span>-ийн төлөвлөгөөг засварт буцаах гэж байна.
              </p>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">
                  Засварт буцаах шалтгаан <span className="text-[var(--color-dot-negative)]">*</span>
                </label>
                <textarea
                  className="w-full border border-border rounded-md px-3 py-2 text-sm text-ink-900 resize-none focus:outline-none focus:border-ink-900 bg-surface"
                  rows={3}
                  placeholder="Засварт буцаах шалтгаан, зөвлөмжөө бичнэ үү..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
                {!rejectionReason.trim() && (
                  <p className="text-xs text-ink-500 mt-1">Шалтгаан заавал бичих шаардлагатай.</p>
                )}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={resetModal}>Цуцлах</Button>
          <Button
            disabled={
              submitting ||
              (showConfirmModal === "reject" && !rejectionReason.trim())
            }
            onClick={handleReview}
          >
            {submitting
              ? "Боловсруулж байна..."
              : showConfirmModal === "approve" ? "Батлах" : "Засварт буцаах"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
