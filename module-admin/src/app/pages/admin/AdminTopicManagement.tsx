import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, FileText, MessageSquare, Eye, Clock, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../../components/ui/dialog";
import { topicService, type Topic } from "../../../services/topicService";
import { userService } from "../../../services/userService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName, isUuid } from "../../../lib/utils";
import { RichText } from "../../components/RichText";
import { RichTextEditor } from "../../components/RichTextEditor";

type StatusFilter = "ALL" | "DEPT_PENDING" | "APPROVED" | "REJECTED" | "TEACHER_PENDING";

const STATUS_LABEL: Record<string, string> = {
  DEPT_PENDING:             "Тэнхимийн хүлээлт",
  PENDING_DEPT_APPROVAL:    "Тэнхимийн хүлээлт",
  PENDING_TEACHER_APPROVAL: "Багшийн хүлээлт",
  APPROVED:                 "Батлагдсан",
  REJECTED:                 "Татгалзсан",
  DRAFT:                    "Ноорог",
};

type Tone = "positive" | "warning" | "negative" | "neutral";
const STATUS_TONE: Record<string, Tone> = {
  DEPT_PENDING:             "warning",
  PENDING_DEPT_APPROVAL:    "warning",
  PENDING_TEACHER_APPROVAL: "neutral",
  APPROVED:                 "positive",
  REJECTED:                 "negative",
  DRAFT:                    "neutral",
};
const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
};

function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] || "neutral";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
      <span className={`w-1.5 h-1.5 rounded-full ${toneDot[tone]}`} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

const isDeptPending = (status: string) =>
  status === "DEPT_PENDING" || status === "PENDING_DEPT_APPROVAL";

export default function AdminTopicManagement() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      topicService.getTopics().catch(() => ({ data: [] as Topic[] })),
      userService.getStudents().catch(() => ({ data: [] as any[] })),
      userService.getTeachers().catch(() => ({ data: [] as any[] })),
      userService.getDepartments().catch(() => ({ data: [] as any[] })),
    ]).then(([tr, sr, teacherRes, dr]) => {
      setTopics(tr.data);
      const map: Record<string, string> = {};
      [...(sr.data || []), ...(teacherRes.data || [])].forEach((u: any) => {
        if (u.id) map[u.id] = u.displayName || u.name || u.id;
        if (u.username) map[u.username] = u.displayName || u.name || u.username;
      });
      setUserMap(map);
      const dmap: Record<string, string> = {};
      (dr.data || []).forEach((d: any) => { if (d.id) dmap[d.id] = d.departmentName || d.id; });
      setDepartmentMap(dmap);
    }).finally(() => setLoading(false));
  }, []);

  const deptLabel = (id?: string) => {
    if (!id) return "";
    return departmentMap[id] || (isUuid(id) ? "" : id);
  };

  const counts = {
    all: topics.length,
    pending: topics.filter(t => isDeptPending(t.status)).length,
    teacherPending: topics.filter(t => t.status === "PENDING_TEACHER_APPROVAL").length,
    approved: topics.filter(t => t.status === "APPROVED").length,
    rejected: topics.filter(t => t.status === "REJECTED").length,
  };

  const filtered = topics.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.createdById || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.supervisorId || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "DEPT_PENDING" && isDeptPending(t.status)) ||
      (statusFilter === "TEACHER_PENDING" && t.status === "PENDING_TEACHER_APPROVAL") ||
      (statusFilter === "APPROVED" && t.status === "APPROVED") ||
      (statusFilter === "REJECTED" && t.status === "REJECTED");

    return matchesSearch && matchesStatus;
  });

  const reloadTopics = () =>
    topicService.getTopics().then(r => setTopics(r.data)).catch(() => {});

  const handleApprove = (id: number) => {
    const user = getStoredUser();
    const reviewedBy = user?.userId || user?.username || "admin";
    setActionLoading(true);
    topicService.deptDecision(id, { decision: "APPROVE", reviewedBy })
      .then(() => {
        setSelectedTopic(null);
        setRejectionReason("");
        return reloadTopics();
      })
      .catch(() => {})
      .finally(() => setActionLoading(false));
  };

  const handleReject = (id: number) => {
    if (!rejectionReason.trim()) return;
    const user = getStoredUser();
    setActionLoading(true);
    topicService.deptDecision(id, {
      decision: "REJECT",
      reviewedBy: user?.userId || user?.username || "admin",
      rejectionReason: rejectionReason.trim(),
    })
      .then(() => {
        setSelectedTopic(null);
        setRejectionReason("");
        return reloadTopics();
      })
      .catch(() => {})
      .finally(() => setActionLoading(false));
  };

  const TAB_FILTERS: { key: StatusFilter; label: string; count: number }[] = [
    { key: "ALL",            label: "Бүгд",               count: counts.all },
    { key: "DEPT_PENDING",   label: "Тэнхимийн хүлээлт",  count: counts.pending },
    { key: "TEACHER_PENDING",label: "Багшийн хүлээлт",    count: counts.teacherPending },
    { key: "APPROVED",       label: "Батлагдсан",          count: counts.approved },
    { key: "REJECTED",       label: "Татгалзсан",          count: counts.rejected },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-sm text-ink-500">
          Багш болон оюутны дэвшүүлсэн дипломын сэдвүүдийг хянах, батлах нэгдсэн самбар
        </p>
        {counts.pending > 0 && (
          <div className="flex items-center gap-2 text-sm text-ink-700 border-l-2 border-[var(--color-dot-warning)] pl-3 py-1 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.6} />
            <span><strong className="text-ink-900 font-medium">{counts.pending}</strong> сэдэв тэнхимийн шийдвэр хүлээж байна</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Нийт сэдэв",    value: counts.all },
          { label: "Хүлээгдэж буй",  value: counts.pending },
          { label: "Батлагдсан",     value: counts.approved },
          { label: "Татгалзсан",     value: counts.rejected },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{s.label}</p>
              <p className="text-2xl font-semibold text-ink-900 mt-2 tabular-nums tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              placeholder="Сэдвийн нэр, багшийн нэрээр хайх..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 h-9 text-sm border border-border-strong rounded-md text-ink-900 bg-surface focus:outline-none focus:border-ink-900"
            />
          </div>
        </div>

        <div className="flex gap-1 px-4 pt-1 overflow-x-auto border-b border-border">
          {TAB_FILTERS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium tracking-tight whitespace-nowrap border-b-2 transition-colors ${
                statusFilter === tab.key
                  ? "border-ink-900 text-ink-900"
                  : "border-transparent text-ink-500 hover:text-ink-900"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`tabular-nums px-1.5 py-0.5 rounded-sm text-[10px] font-medium ${
                  statusFilter === tab.key ? "bg-ink-900 text-white" : "bg-surface-muted text-ink-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-12 text-center text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Сэдвийн нэр", "Дэвшүүлсэн", "Удирдагч / Бүтээгч", "Огноо", "Статус"].map(h => (
                    <th key={h} className="px-6 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider">{h}</th>
                  ))}
                  <th className="px-6 py-3 text-[11px] font-medium text-ink-500 uppercase tracking-wider text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(topic => (
                  <tr key={topic.id} className="border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink-900 line-clamp-2 max-w-xs tracking-tight">{topic.title}</p>
                      {topic.titleEn && (
                        <p className="text-[11px] italic text-ink-500 line-clamp-1 max-w-xs">{topic.titleEn}</p>
                      )}
                      <p className="text-[11px] text-ink-400 mt-0.5 tabular-nums">#{topic.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-ink-700 border border-border-strong rounded-sm px-2 py-0.5">
                        {topic.createdByType === "TEACHER" ? "Багш" : "Оюутан"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-ink-900 font-medium tracking-tight">{resolveName(topic.supervisorId || topic.createdById, userMap, "Тодорхойгүй")}</p>
                      {deptLabel(topic.departmentId) && (
                        <p className="text-[11px] text-ink-400 mt-0.5">{deptLabel(topic.departmentId)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-ink-500 whitespace-nowrap text-sm tabular-nums">
                      {topic.createdAt?.split("T")[0] || "Огноогүй"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={topic.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isDeptPending(topic.status) ? (
                        <Button size="sm" onClick={() => { setSelectedTopic(topic); setRejectionReason(""); }}>
                          <Eye className="w-3.5 h-3.5 mr-1" strokeWidth={1.8} /> Шийдвэрлэх
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => { setSelectedTopic(topic); setRejectionReason(""); }}>
                          <Eye className="w-3.5 h-3.5 mr-1" strokeWidth={1.8} /> Харах
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <FileText className="h-8 w-8 mx-auto text-ink-300 mb-3" strokeWidth={1.5} />
                      <p className="text-ink-400 text-sm">Илэрц олдсонгүй</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {selectedTopic && (
        <Dialog open onClose={() => { setSelectedTopic(null); setRejectionReason(""); }} maxWidth="max-w-2xl" scrollable>
          <DialogHeader
            title={selectedTopic.title}
            icon={<FileText className="w-4 h-4" strokeWidth={1.6} />}
            onClose={() => { setSelectedTopic(null); setRejectionReason(""); }}
          />
          <div className="flex-1 overflow-y-auto">
            <DialogBody className="space-y-6">
              {selectedTopic.titleEn && (
                <p className="text-sm italic text-ink-600 -mt-2">{selectedTopic.titleEn}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] text-ink-400 tabular-nums">#{selectedTopic.id}</span>
                <StatusBadge status={selectedTopic.status} />
                <span className="text-xs text-ink-700 border border-border-strong rounded-sm px-2 py-0.5">
                  {selectedTopic.createdByType === "TEACHER" ? "Багш" : "Оюутан"} дэвшүүлсэн
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">Удирдагч багш</p>
                  <p className="text-sm font-medium text-ink-900 tracking-tight">{resolveName(selectedTopic.supervisorId || selectedTopic.createdById, userMap, "Тодорхойгүй")}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1">Тэнхим</p>
                  <p className="text-sm font-medium text-ink-900 tracking-tight">{deptLabel(selectedTopic.departmentId) || "Тодорхойгүй"}</p>
                </div>
              </div>

              {selectedTopic.researchGoal && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2">Судалгааны зорилго</p>
                  <RichText
                    html={selectedTopic.researchGoal}
                    className="text-sm text-ink-700 leading-relaxed"
                  />
                </div>
              )}

              {selectedTopic.description && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2">Дэлгэрэнгүй тайлбар</p>
                  <RichText
                    html={selectedTopic.description}
                    className="text-sm text-ink-700 leading-relaxed"
                  />
                </div>
              )}

              {selectedTopic.keywords && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2">Түлхүүр үгс</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTopic.keywords.split(",").map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 border border-border-strong rounded-sm text-xs text-ink-700">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedTopic.rejectionReason && (
                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" strokeWidth={1.8} /> Татгалзсан шалтгаан
                  </p>
                  <RichText
                    html={selectedTopic.rejectionReason}
                    className="text-sm text-ink-700 border-l-2 border-[var(--color-dot-negative)] pl-3 py-1"
                  />
                </div>
              )}

              {selectedTopic.status === "PENDING_TEACHER_APPROVAL" && (
                <div className="flex items-start gap-2.5 text-sm text-ink-600 border-l-2 border-ink-300 pl-3 py-1">
                  <Clock className="w-3.5 h-3.5 text-ink-400 mt-0.5 shrink-0" strokeWidth={1.6} />
                  <span>
                    Энэ сэдэв одоогоор удирдагч багшийн зөвшөөрлийг хүлээж байна. Багш батласны дараа тэнхимийн шийдвэр шаардагдана.
                  </span>
                </div>
              )}

              {isDeptPending(selectedTopic.status) && (
                <div className="pt-4 border-t border-border">
                  <label className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">
                    Татгалзах шалтгаан <span className="text-[var(--color-dot-negative)] normal-case">*</span>
                    <span className="text-[10px] text-ink-400 font-normal ml-1 normal-case">(зөвхөн татгалзах тохиолдолд шаардагдана)</span>
                  </label>
                  <RichTextEditor
                    value={rejectionReason}
                    onChange={setRejectionReason}
                    placeholder="Татгалзах шалтгаанаа энд бичнэ үү..."
                    minHeight={110}
                    ariaLabel="Татгалзах шалтгаан"
                  />
                </div>
              )}
            </DialogBody>
          </div>

          {isDeptPending(selectedTopic.status) && (
            <DialogFooter>
              <Button
                variant="outline"
                disabled={!rejectionReason.trim() || actionLoading}
                onClick={() => handleReject(selectedTopic.id)}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.8} /> Татгалзах
              </Button>
              <Button disabled={actionLoading} onClick={() => handleApprove(selectedTopic.id)}>
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.8} /> Сэдвийг батлах
              </Button>
            </DialogFooter>
          )}
        </Dialog>
      )}
    </div>
  );
}
