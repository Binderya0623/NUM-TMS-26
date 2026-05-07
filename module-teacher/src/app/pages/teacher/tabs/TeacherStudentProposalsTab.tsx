import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../../../components/ui/dialog";
import { BookOpen, CheckCircle2, XCircle, Calendar, Bookmark, AlertCircle } from "lucide-react";
import { topicService, type Topic } from "../../../../services/topicService";
import { userService } from "../../../../services/userService";
import { getStoredUser } from "../../../../lib/authGuard";
import { resolveName, initialsFromName } from "../../../../lib/utils";
import { RichTextEditor, RichText } from "../../../components/RichTextEditor";

export default function TeacherStudentProposalsTab() {
  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || '';

  const [proposals, setProposals] = useState<Topic[]>([]);
  const [selectedProp, setSelectedProp] = useState<Topic | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }
    Promise.all([
      topicService.getStudentProposals(teacherId).catch(() => ({ data: [] as Topic[] })),
      userService.getStudents().catch(() => ({ data: [] as any[] })),
    ]).then(([res, usersRes]) => {
      setProposals(res.data.filter(p => p.status === 'PENDING_TEACHER_APPROVAL'));
      const map: Record<string, string> = {};
      (usersRes.data || []).forEach((u: any) => {
        if (u.id) map[u.id] = u.displayName || u.name || u.id;
        if (u.username) map[u.username] = u.displayName || u.name || u.username;
      });
      setUserMap(map);
    }).finally(() => setLoading(false));
  }, [teacherId]);

  const studentName = (id?: string) => resolveName(id, userMap, "Тодорхойгүй оюутан");

  const closeModal = () => {
    setShowConfirmModal(null);
    setRejectionReason("");
    setErrMsg(null);
  };

  const handleAction = () => {
    if (!selectedProp || !showConfirmModal) return;
    setSubmitting(true);
    setErrMsg(null);

    const promise = showConfirmModal === "approve"
      ? topicService.submitTopicForDeptReview(selectedProp.id, teacherId)
      : topicService.rejectProposal(selectedProp.id, teacherId, rejectionReason.trim() || 'Багш татгалзсан');

    promise
      .then(() => {
        // Either way, the topic leaves the PENDING_TEACHER_APPROVAL bucket.
        setProposals(prev => prev.filter(p => p.id !== selectedProp.id));
        setSelectedProp(null);
        closeModal();
      })
      .catch(err => {
        const msg = err?.response?.data?.error || err?.message || 'Үйлдэл амжилтгүй боллоо.';
        setErrMsg(msg);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Proposals List */}
        <Card className="lg:col-span-1 border border-border h-fit">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2 text-ink-900 tracking-tight">
              <Bookmark className="w-4 h-4 text-ink-500" strokeWidth={1.6} />
              Оюутны дэвшүүлсэн сэдэв
              <span className="ml-auto text-xs text-ink-500 tabular-nums">{proposals.length}</span>
            </CardTitle>
          </CardHeader>
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="text-center p-6 text-ink-400 text-sm">Ачааллаж байна...</div>
            ) : proposals.length === 0 ? (
              <div className="text-center p-6 text-ink-500 text-sm">Одоогоор хүлээгдэж буй сэдэв алга байна.</div>
            ) : (
              proposals.map(p => {
                const active = selectedProp?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProp(p)}
                    className={`w-full text-left p-3 rounded-md transition-colors border ${
                      active
                        ? "bg-accent-soft border-accent"
                        : "hover:bg-surface-muted border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border-strong">
                        <AvatarFallback className="text-xs font-medium">
                          {initialsFromName(studentName(p.createdById))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate tracking-tight ${active ? "text-ink-900" : "text-ink-900"}`}>
                          {studentName(p.createdById)}
                        </p>
                        <p className="text-xs text-ink-500 truncate mt-0.5">{p.title}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex justify-between items-center text-[11px] text-ink-500">
                      <span className="flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3 h-3" strokeWidth={1.6} /> {p.createdAt?.split("T")[0] || "Огноогүй"}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider">{p.status}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Area: Proposal Details */}
        <div className="lg:col-span-2">
          {!selectedProp ? (
            <Card className="border border-dashed border-border-strong h-96 flex flex-col items-center justify-center bg-surface">
              <BookOpen className="w-10 h-10 text-ink-200 mb-4" strokeWidth={1.4} />
              <p className="text-ink-500 text-sm">Зүүн талаас сэдвийг сонгоно уу.</p>
            </Card>
          ) : (
            <Card className="border border-border">
              <CardHeader className="border-b border-border pb-5">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-border-strong">
                      <AvatarFallback className="text-sm font-medium">
                        {initialsFromName(studentName(selectedProp.createdById))}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-ink-900 tracking-tight mb-0.5">{studentName(selectedProp.createdById)}</h3>
                      <p className="text-xs text-ink-500">{selectedProp.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {(selectedProp.status === "PENDING_TEACHER_APPROVAL" || selectedProp.status === "DRAFT") && (
                      <>
                        <Button variant="outline" onClick={() => setShowConfirmModal("reject")}>
                          <XCircle className="w-4 h-4 mr-2" strokeWidth={1.6} /> Татгалзах
                        </Button>
                        <Button onClick={() => setShowConfirmModal("approve")}>
                          <CheckCircle2 className="w-4 h-4 mr-2" strokeWidth={1.6} /> Батлах
                        </Button>
                      </>
                    )}
                    {(selectedProp.status === "DEPT_PENDING" || selectedProp.status === "PENDING_DEPT_APPROVAL") && (
                      <span className="inline-flex items-center gap-2 px-3 h-9 rounded-md border border-border bg-surface-muted text-xs text-ink-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-warning)]" />
                        Тэнхим батлах хүлээгдэж байна
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="border border-border rounded-md p-5 bg-surface-muted">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2">Сэдвийн нэр</p>
                  <h4 className="text-lg font-semibold text-ink-900 tracking-tight">{selectedProp.title}</h4>
                  {selectedProp.titleEn && (
                    <p className="text-sm italic text-ink-600 mt-1 mb-2">{selectedProp.titleEn}</p>
                  )}
                  {selectedProp.keywords && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {selectedProp.keywords.split(",").map(kw => (
                        <span key={kw} className="text-[11px] px-2 py-0.5 bg-surface text-ink-700 rounded-sm border border-border">{kw.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2">Судалгааны зорилго</h5>
                  <RichText
                    html={selectedProp.researchGoal}
                    className="text-sm text-ink-700 leading-relaxed p-4 rounded-md border border-border bg-surface"
                    fallback={<p className="text-sm text-ink-700 leading-relaxed p-4 rounded-md border border-border bg-surface">Тодорхойлоогүй</p>}
                  />
                </div>

                <div>
                  <h5 className="text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2">Сэдвийн дэлгэрэнгүй тайлбар</h5>
                  <RichText
                    html={selectedProp.description}
                    className="text-sm text-ink-700 leading-relaxed p-4 rounded-md border border-border bg-surface"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!showConfirmModal} onClose={closeModal}>
        <DialogHeader
          title={showConfirmModal === "approve" ? "Сэдвийг батлах" : "Сэдвээс татгалзах"}
          icon={showConfirmModal === "approve" ? <CheckCircle2 className="w-5 h-5 text-ink-900" strokeWidth={1.6} /> : <AlertCircle className="w-5 h-5 text-ink-900" strokeWidth={1.6} />}
          onClose={closeModal}
        />
        <DialogBody>
          {showConfirmModal === "approve" ? (
            <p className="text-sm text-ink-700 leading-relaxed">
              Та <span className="font-medium text-ink-900">{studentName(selectedProp?.createdById)}</span>-ийн дэвшүүлсэн сэдвийг батлахдаа итгэлтэй байна уу? Сэдэв тэнхимийн батлалтад шилжих болно.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink-700 leading-relaxed">
                Та <span className="font-medium text-ink-900">{studentName(selectedProp?.createdById)}</span>-ийн сэдвээс татгалзах гэж байна.
              </p>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">
                  Татгалзах шалтгаан <span className="text-[var(--color-dot-negative)]">*</span>
                </label>
                <RichTextEditor
                  value={rejectionReason}
                  onChange={setRejectionReason}
                  placeholder="Шалтгаанаа товч бичнэ үү..."
                  minHeight={110}
                  ariaLabel="Татгалзах шалтгаан"
                />
              </div>
            </div>
          )}
          {errMsg && (
            <p className="text-xs text-[var(--color-dot-negative)] mt-3 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)]" />
              {errMsg}
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal} disabled={submitting}>Цуцлах</Button>
          <Button
            onClick={handleAction}
            disabled={submitting || (showConfirmModal === "reject" && !rejectionReason.trim())}
          >
            {submitting
              ? "Боловсруулж байна..."
              : showConfirmModal === "approve" ? "Батлах" : "Татгалзах"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
