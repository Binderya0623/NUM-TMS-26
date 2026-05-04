import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../../../components/ui/dialog";
import { BookOpen, CheckCircle2, XCircle, Calendar, AlertCircle, Bookmark } from "lucide-react";
import { topicService, type TopicRequest } from "../../../../services/topicService";
import { userService } from "../../../../services/userService";
import { getStoredUser } from "../../../../lib/authGuard";
import { resolveName, initialsFromName } from "../../../../lib/utils";

export default function TeacherTopicRequestsTab() {
  const [activeRequests, setActiveRequests] = useState<TopicRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TopicRequest | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [topicMap, setTopicMap] = useState<Record<string | number, string>>({});

  useEffect(() => {
    Promise.all([
      topicService.getTopicRequests({ status: 'PENDING' }).catch(() => ({ data: [] as TopicRequest[] })),
      userService.getStudents().catch(() => ({ data: [] as any[] })),
      topicService.getTopics().catch(() => ({ data: [] as any[] })),
    ]).then(([reqRes, userRes, topicRes]) => {
      setActiveRequests(reqRes.data || []);
      const map: Record<string, string> = {};
      (userRes.data || []).forEach((u: any) => {
        if (u.id) map[u.id] = u.displayName || u.name || u.id;
        if (u.username) map[u.username] = u.displayName || u.name || u.username;
      });
      setUserMap(map);
      const tmap: Record<string | number, string> = {};
      (topicRes.data || []).forEach((t: any) => {
        if (t.id != null) tmap[t.id] = t.title || `Сэдэв #${t.id}`;
      });
      setTopicMap(tmap);
    }).finally(() => setLoading(false));
  }, []);

  const studentName = (id?: string) => resolveName(id, userMap, "Тодорхойгүй оюутан");
  const topicTitle = (id?: string | number) => (id != null && topicMap[id]) || `Сэдэв #${id}`;

  const handleAction = () => {
    if (!selectedRequest || !showConfirmModal) return;
    if (showConfirmModal === 'reject' && !rejectionReason.trim()) return;
    const user = getStoredUser();
    const teacherId = user?.userId || user?.username || 'teacher';
    const action = showConfirmModal === 'approve'
      ? topicService.approveRequest(selectedRequest.id, teacherId)
      : topicService.rejectRequest(selectedRequest.id, teacherId, rejectionReason.trim());
    action
      .then(() => {
        setActiveRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
        setShowConfirmModal(null);
        setSelectedRequest(null);
        setRejectionReason("");
      })
      .catch(() => {
        setShowConfirmModal(null);
        setSelectedRequest(null);
        setRejectionReason("");
      });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Requests List */}
        <Card className="lg:col-span-1 border border-border h-fit">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2 text-ink-900 tracking-tight">
              <Bookmark className="w-4 h-4 text-ink-500" strokeWidth={1.6} />
              Ирсэн хүсэлтүүд
              <span className="ml-auto text-xs text-ink-500 tabular-nums">{activeRequests.length}</span>
            </CardTitle>
          </CardHeader>
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="text-center p-6 text-ink-400 text-sm">Ачааллаж байна...</div>
            ) : activeRequests.length === 0 ? (
              <div className="text-center p-6 text-ink-500 text-sm">Шинэ хүсэлт байхгүй байна.</div>
            ) : (
              activeRequests.map(r => {
                const active = selectedRequest?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRequest(r)}
                    className={`w-full text-left p-3 rounded-md transition-colors border ${
                      active
                        ? "bg-accent-soft border-accent"
                        : "hover:bg-surface-muted border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border-strong">
                        <AvatarFallback className="text-xs font-medium">
                          {initialsFromName(studentName(r.requestedById))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900 truncate tracking-tight">
                          {studentName(r.requestedById)}
                        </p>
                        <p className="text-xs text-ink-500 truncate mt-0.5">{topicTitle(r.topicId)}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex justify-between items-center text-[11px] text-ink-500">
                      <span className="flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3 h-3" strokeWidth={1.6} /> {r.requestedAt?.split("T")[0] || "Огноогүй"}
                      </span>
                      <span className="uppercase tracking-wider">{r.status}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Area: Request Details */}
        <div className="lg:col-span-2">
          {!selectedRequest ? (
            <Card className="border border-dashed border-border-strong h-96 flex flex-col items-center justify-center bg-surface">
              <BookOpen className="w-10 h-10 text-ink-200 mb-4" strokeWidth={1.4} />
              <p className="text-ink-500 text-sm">Зүүн талаас хүсэлт сонгож дэлгэрэнгүй мэдээллийг харна уу.</p>
            </Card>
          ) : (
            <Card className="border border-border">
              <CardHeader className="border-b border-border pb-5">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-border-strong">
                      <AvatarFallback className="text-sm font-medium">
                        {initialsFromName(studentName(selectedRequest.requestedById))}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-ink-900 tracking-tight mb-0.5">{studentName(selectedRequest.requestedById)}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" onClick={() => setShowConfirmModal("reject")}>
                      <XCircle className="w-4 h-4 mr-2" strokeWidth={1.6} /> Татгалзах
                    </Button>
                    <Button onClick={() => setShowConfirmModal("approve")}>
                      <CheckCircle2 className="w-4 h-4 mr-2" strokeWidth={1.6} /> Батлах
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="border border-border rounded-md p-5 bg-surface-muted">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2">Хүсэлт гаргасан сэдэв</p>
                  <h4 className="text-base font-semibold text-ink-900 tracking-tight mb-2">{topicTitle(selectedRequest.topicId)}</h4>
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-warning)]" />
                    {selectedRequest.status}
                  </span>
                </div>

                {selectedRequest.motivation && (
                  <div>
                    <h5 className="text-[11px] font-medium uppercase tracking-wider text-ink-500 mb-2">Сэдвийг сонгох шалтгаан</h5>
                    <p className="text-sm text-ink-700 leading-relaxed p-4 rounded-md border border-border bg-surface italic">
                      “{selectedRequest.motivation}”
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md p-3 border border-border bg-surface-muted">
                    <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">Илгээсэн огноо</p>
                    <p className="text-sm font-medium text-ink-900 tabular-nums">{selectedRequest.requestedAt?.split("T")[0] || "Огноогүй"}</p>
                  </div>
                  <div className="rounded-md p-3 border border-border bg-surface-muted">
                    <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">Статус</p>
                    <p className="text-sm font-medium text-ink-900">{selectedRequest.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!showConfirmModal} onClose={() => { setShowConfirmModal(null); setRejectionReason(""); }}>
        <DialogHeader
          title={showConfirmModal === "approve" ? "Хүсэлтийг батлах" : "Хүсэлтээс татгалзах"}
          icon={showConfirmModal === "approve" ? <CheckCircle2 className="w-5 h-5 text-ink-900" strokeWidth={1.6} /> : <AlertCircle className="w-5 h-5 text-ink-900" strokeWidth={1.6} />}
          onClose={() => { setShowConfirmModal(null); setRejectionReason(""); }}
        />
        <DialogBody>
          {showConfirmModal === "approve" ? (
            <p className="text-sm text-ink-700 leading-relaxed">
              Та <span className="font-medium text-ink-900">{studentName(selectedRequest?.requestedById)}</span>-ийн сонгосон хүсэлтийг батлахдаа итгэлтэй байна уу? Баталсны дараа оюутан таны удирдсан оюутнуудын жагсаалтад орно.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink-700 leading-relaxed">
                Та <span className="font-medium text-ink-900">{studentName(selectedRequest?.requestedById)}</span>-ийн хүсэлтээс татгалзах гэж байна.
              </p>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">
                  Татгалзах шалтгаан <span className="text-[var(--color-dot-negative)]">*</span>
                </label>
                <textarea
                  className="w-full border border-border rounded-md px-3 py-2 text-sm text-ink-900 resize-none focus:outline-none focus:border-ink-900 bg-surface"
                  rows={3}
                  placeholder="Татгалзах шалтгааныг тайлбарлана уу..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
                {rejectionReason.trim() === "" && (
                  <p className="text-xs text-ink-500 mt-1">Шалтгаан заавал бичих шаардлагатай.</p>
                )}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowConfirmModal(null); setRejectionReason(""); }}>Цуцлах</Button>
          <Button
            onClick={handleAction}
            disabled={showConfirmModal === "reject" && !rejectionReason.trim()}
          >
            {showConfirmModal === "approve" ? "Баталгаажуулах" : "Татгалзах"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
