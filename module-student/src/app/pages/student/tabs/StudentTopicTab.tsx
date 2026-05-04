import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../../../components/ui/dialog";
import {
  Search, BookOpen, X, Send, Edit2, Trash2, Tag, Plus, AlertCircle,
} from "lucide-react";
import { topicService } from "../../../../services/topicService";
import type { Topic, TopicRequest } from "../../../../services/topicService";
import { getStoredUser } from "../../../../lib/authGuard";
import { userService } from "../../../../services/userService";
import type { UserRecord } from "../../../../services/userService";
import { isUuid } from "../../../../lib/utils";

type Tone = "positive" | "warning" | "negative" | "neutral" | "accent";
const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
  accent:   "bg-accent",
};

const requestStatusMap: Record<string, { label: string; tone: Tone }> = {
  PENDING:      { label: "Багш хянаж байна",     tone: "accent" },
  APPROVED:     { label: "Батлагдсан",           tone: "positive" },
  REJECTED:     { label: "Татгалзсан",           tone: "negative" },
  pending:      { label: "Багш хянаж байна",     tone: "accent" },
  dept_review:  { label: "Тэнхим хяналтанд",     tone: "warning" },
  approved:     { label: "Батлагдсан",           tone: "positive" },
  rejected:     { label: "Татгалзсан",           tone: "negative" },
};

const proposalStatusMap: Record<string, { label: string; tone: Tone }> = {
  DRAFT:                    { label: "Ноорог",                  tone: "neutral" },
  PENDING_TEACHER_APPROVAL: { label: "Багш хянаж байна",        tone: "accent" },
  DEPT_PENDING:             { label: "Тэнхим хяналтанд",        tone: "warning" },
  PENDING_DEPT_APPROVAL:    { label: "Тэнхим хяналтанд",        tone: "warning" },
  APPROVED:                 { label: "Батлагдсан",              tone: "positive" },
  REJECTED:                 { label: "Татгалзсан",              tone: "negative" },
};

export default function StudentTopicTab() {
  const [subTab, setSubTab] = useState<"all" | "my" | "propose">("all");

  const [sessionOpen, setSessionOpen] = useState<boolean | null>(null);

  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);

  const [myRequests, setMyRequests] = useState<TopicRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [proposals, setProposals] = useState<Topic[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", goal: "", keywords: "", supervisorId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [teachers, setTeachers] = useState<UserRecord[]>([]);

  const user = getStoredUser();
  const studentId = user?.userId || user?.username || "";

  useEffect(() => {
    topicService.getActiveSession()
      .then(res => setSessionOpen(!!res.data))
      .catch(() => setSessionOpen(false));
  }, []);

  useEffect(() => {
    topicService.getPublicTopics()
      .then(res => setAvailableTopics(res.data))
      .catch(() => {})
      .finally(() => setLoadingTopics(false));
  }, []);

  useEffect(() => {
    if (!studentId) { setLoadingRequests(false); return; }
    topicService.getMyRequests(studentId)
      .then(res => setMyRequests(res.data))
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, [studentId]);

  useEffect(() => {
    if (!studentId) { setLoadingProposals(false); return; }
    topicService.getMyProposals(studentId)
      .then(res => setProposals(res.data))
      .catch(() => {})
      .finally(() => setLoadingProposals(false));
  }, [studentId]);

  useEffect(() => {
    userService.getTeachers()
      .then(res => setTeachers(res.data))
      .catch(() => {});
  }, []);

  const filteredTopics = availableTopics.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.supervisorId || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const hasRequested = (topicId: number) => myRequests.some(r => r.topicId === topicId);

  const handleRequestConfirm = () => {
    if (!selectedTopic || !studentId) return;
    setRequestError(null);
    topicService.submitRequest(selectedTopic.id, studentId, undefined, motivation || undefined)
      .then(res => {
        setMyRequests([...myRequests, res.data]);
        setShowModal(false);
        setMotivation("");
        setSubTab("my");
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.response?.data || "";
        if (typeof msg === "string" && msg.includes("selection session")) {
          setRequestError("Сэдэв сонгох сесс одоогоор нээлттэй биш байна. Админ сессийг нээх хүртэл хүлээнэ үү.");
          setSessionOpen(false);
        } else {
          setRequestError("Хүсэлт илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
        }
      });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Сэдвийн нэр заавал оруулна уу";
    if (!formData.description.trim()) newErrors.description = "Тайлбар заавал оруулна уу";
    if (!formData.goal.trim()) newErrors.goal = "Судалгааны зорилго заавал оруулна уу";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", goal: "", keywords: "", supervisorId: "" });
    setErrors({});
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmitProposal = (mode: "draft" | "submit") => {
    if (mode === "submit" && !validate()) return;
    if (mode === "draft" && !formData.title.trim()) {
      setErrors({ title: "Ноорог хадгалахын тулд сэдвийн нэр оруулна уу" });
      return;
    }
    setSubmitting(true);
    const body = {
      title: formData.title,
      description: formData.description,
      researchGoal: formData.goal,
      keywords: formData.keywords || undefined,
      createdById: studentId,
      supervisorId: formData.supervisorId || undefined,
      status: mode === "draft" ? "DRAFT" : "PENDING_TEACHER_APPROVAL",
    };

    const call = editingId
      ? topicService.updateProposal(editingId, body)
      : topicService.submitProposal(body as any);

    call.then(res => {
      if (editingId) {
        setProposals(proposals.map(p => p.id === editingId ? res.data : p));
      } else {
        setProposals([...proposals, res.data]);
      }
      resetForm();
      setSubTab("propose");
    })
    .catch(() => {})
    .finally(() => setSubmitting(false));
  };

  const handleDeleteProposal = (id: number) => {
    setProposals(proposals.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex bg-surface-muted p-1 rounded-md border border-border">
        {[
          { k: "all" as const,     label: "Бүх сэдвүүд" },
          { k: "my" as const,      label: "Миний сэдэв" },
          { k: "propose" as const, label: "Сэдэв дэвшүүлэх" },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setSubTab(t.k)}
            className={`px-4 h-8 text-sm rounded-md transition-colors ${
              subTab === t.k
                ? "bg-surface text-ink-900 font-semibold border border-border-strong"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "all" && (
        <div className="space-y-4">
          {sessionOpen === false && (
            <div className="flex items-start gap-3 bg-surface-muted border border-border rounded-md px-4 py-3 text-sm text-ink-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-dot-warning)]" strokeWidth={1.6} />
              <span>Сэдэв сонгох сесс одоогоор нээлттэй биш байна. Админ сессийг нээх хүртэл хүлээнэ үү.</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" strokeWidth={1.6} />
              <Input placeholder="Сэдэв, багшийн нэрээр хайх..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {loadingTopics ? (
            <div className="text-center py-12 text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => {
                const requested = hasRequested(topic.id);
                return (
                  <Card key={topic.id} className="flex flex-col h-full hover:border-ink-900 transition-colors">
                    <CardHeader className="pb-3 border-b border-border">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px]">{topic.departmentId || "Тэнхим"}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{topic.status}</Badge>
                      </div>
                      <CardTitle className="text-base font-semibold leading-tight text-ink-900 tracking-tight line-clamp-2">
                        {topic.title}
                      </CardTitle>
                      {topic.supervisorId && (() => {
                        const t = teachers.find(x => x.id === topic.supervisorId);
                        const name = t?.displayName || (isUuid(topic.supervisorId) ? null : topic.supervisorId);
                        return name ? (
                          <CardDescription className="text-xs text-ink-600 mt-2">
                            Удирдагч: {name}
                          </CardDescription>
                        ) : null;
                      })()}
                    </CardHeader>
                    <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-ink-700 line-clamp-3 mb-4 leading-relaxed">{topic.description}</p>
                        {topic.keywords && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {topic.keywords.split(",").map(kw => (
                              <span key={kw} className="text-[10px] px-2 py-0.5 bg-surface-muted text-ink-600 rounded-md border border-border">
                                {kw.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant={requested || sessionOpen === false ? "secondary" : "outline"}
                        className="w-full"
                        disabled={requested || sessionOpen === false}
                        onClick={() => { setSelectedTopic(topic); setRequestError(null); setShowModal(true); }}
                      >
                        {requested ? "Хүсэлт илгээсэн" : sessionOpen === false ? "Сесс хаалттай" : "Хүсэлт илгээх"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredTopics.length === 0 && (
                <div className="col-span-3 text-center py-16 text-ink-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-3" strokeWidth={1.4} />
                  <p className="text-sm">Сэдэв олдсонгүй</p>
                </div>
              )}
            </div>
          )}

          <Dialog open={showModal} onClose={() => setShowModal(false)}>
            <DialogHeader title="Сэдэв сонгох хүсэлт илгээх" onClose={() => setShowModal(false)} />
            <DialogBody>
              <p className="text-sm text-ink-700 leading-relaxed mb-4">
                Та <span className="font-semibold text-ink-900">{selectedTopic?.title}</span> сэдвийг сонгох хүсэлт илгээхдээ итгэлтэй байна уу?
              </p>
              <div>
                <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2 block">Сэдэв сонгох шалтгаан (заавал биш)</label>
                <Textarea
                  placeholder="Энэ сэдвийг яагаад сонирхож байна вэ?"
                  rows={3}
                  className="resize-none"
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                />
              </div>
              <div className="bg-surface-muted rounded-md p-3 mt-4 border border-border">
                <p className="text-xs text-ink-700">
                  <span className="font-semibold">Анхаарах:</span> Багш хүсэлтийг баталгаажуулсны дараа таны сэдэв албан ёсоор батлагдана.
                </p>
              </div>
              {requestError && (
                <div className="flex items-start gap-2 bg-surface-muted border border-border rounded-md p-3 mt-3 text-sm text-ink-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--color-dot-negative)]" strokeWidth={1.6} />
                  <span>{requestError}</span>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowModal(false); setRequestError(null); }}>Цуцлах</Button>
              <Button onClick={handleRequestConfirm}>Хүсэлт илгээх</Button>
            </DialogFooter>
          </Dialog>
        </div>
      )}

      {subTab === "my" && (
        <div className="space-y-4">
          {loadingRequests ? (
            <div className="text-center py-12 text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : myRequests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-5 h-5 text-ink-400" strokeWidth={1.4} />
                </div>
                <h3 className="text-base font-semibold text-ink-900 mb-2 tracking-tight">Сэдэв сонгоогүй байна</h3>
                <p className="text-sm text-ink-500">Та “Бүх сэдвүүд” хэсгээс сэдэв сонгох эсвэл шинэ сэдэв дэвшүүлнэ үү.</p>
                <Button className="mt-5" onClick={() => setSubTab("all")}>Сэдэв хайх</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => {
                const topic = availableTopics.find(t => t.id === req.topicId);
                const info = requestStatusMap[req.status] || requestStatusMap.PENDING;
                return (
                  <Card key={req.id}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <span className="text-xs text-ink-500 tabular-nums">
                          Хүсэлт илгээсэн: {req.requestedAt?.split("T")[0] || "—"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${toneDot[info.tone]}`} />
                          {info.label}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-ink-900 mb-1.5 tracking-tight">
                        {topic?.title || `Сэдэв #${req.topicId}`}
                      </h3>
                      {topic?.description && (
                        <p className="text-sm text-ink-600 mb-3 leading-relaxed">{topic.description}</p>
                      )}
                      {req.motivation && (
                        <div className="bg-surface-muted rounded-md p-3 border border-border text-sm text-ink-700">
                          <span className="font-semibold">Шалтгаан:</span> {req.motivation}
                        </div>
                      )}
                      {req.rejectionReason && (info.tone === "negative") && (
                        <div className="mt-3 bg-surface-muted rounded-md p-3 border border-border text-sm text-ink-700">
                          <span className="font-semibold">Татгалзсан шалтгаан:</span> {req.rejectionReason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {subTab === "propose" && (
        <div className="space-y-6">
          {!showForm && (
            <div className="flex justify-end">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" strokeWidth={1.6} /> Шинэ сэдэв дэвшүүлэх
              </Button>
            </div>
          )}

          {showForm && (
            <Card>
              <CardHeader className="border-b border-border pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-semibold text-ink-900 tracking-tight">
                    {editingId ? "Сэдэв засварлах" : "Шинэ сэдэв дэвшүүлэх"}
                  </CardTitle>
                  <button onClick={resetForm} className="text-ink-400 hover:text-ink-900 p-1 transition-colors" aria-label="Хаах">
                    <X className="w-4 h-4" strokeWidth={1.6} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <FormField label="Сэдвийн нэр" required error={errors.title}>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Жишээ: Монгол хэлний дуу таних систем..." />
                </FormField>
                <FormField label="Сэдвийн тайлбар" required error={errors.description}>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Сэдвийн тухай дэлгэрэнгүй тайлбар..." rows={4} className="resize-none" />
                </FormField>
                <FormField label="Судалгааны зорилго" required error={errors.goal}>
                  <Input value={formData.goal} onChange={(e) => setFormData({ ...formData, goal: e.target.value })} placeholder="Энэ судалгаагаар ямар үр дүнд хүрэх вэ?" />
                </FormField>
                <FormField label="Түлхүүр үгс" hint="Таслалаар тусгаарлах">
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 w-4 h-4" strokeWidth={1.6} />
                    <Input value={formData.keywords} onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} placeholder="NLP, Speech Recognition, AI..." className="pl-9" />
                  </div>
                </FormField>
                <FormField label="Удирдагч багш сонгох" hint="Заавал биш">
                  <select
                    value={formData.supervisorId}
                    onChange={e => setFormData({ ...formData, supervisorId: e.target.value })}
                    className="w-full h-9 border border-border-strong rounded-md px-3 text-sm bg-surface focus:outline-none focus:border-ink-900"
                  >
                    <option value="">— Багш сонгоно уу —</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.displayName}{t.departmentId ? ` (${t.departmentId})` : ""}</option>
                    ))}
                  </select>
                </FormField>
                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <Button variant="outline" disabled={submitting} onClick={() => handleSubmitProposal("draft")}>Ноорог хадгалах</Button>
                  <Button disabled={submitting} onClick={() => handleSubmitProposal("submit")}>
                    <Send className="w-4 h-4 mr-2" strokeWidth={1.6} /> {submitting ? "Илгээж байна..." : "Илгээх"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {loadingProposals ? (
              <div className="text-center py-8 text-ink-400 text-sm">Ачааллаж байна...</div>
            ) : proposals.length === 0 && !showForm ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-5 h-5 text-ink-400" strokeWidth={1.4} />
                  </div>
                  <p className="text-sm text-ink-500">Та одоогоор өөрийн сэдэв дэвшүүлээгүй байна.</p>
                </CardContent>
              </Card>
            ) : (
              proposals.map((p) => {
                const info = proposalStatusMap[p.status] || proposalStatusMap.DRAFT;
                return (
                  <Card key={p.id}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${toneDot[info.tone]}`} />
                          {info.label}
                        </span>
                        <div className="text-xs text-ink-500 tabular-nums">{p.createdAt ? `Илгээсэн: ${p.createdAt.split("T")[0]}` : "Ноорог"}</div>
                      </div>
                      <h3 className="text-base font-semibold text-ink-900 mb-2 tracking-tight">{p.title}</h3>
                      <p className="text-sm text-ink-600 mb-3 leading-relaxed">{p.description}</p>
                      {p.researchGoal && (
                        <div className="bg-surface-muted rounded-md p-3 text-sm border border-border">
                          <span className="font-semibold text-ink-900">Зорилго:</span> <span className="text-ink-700">{p.researchGoal}</span>
                        </div>
                      )}
                      {p.rejectionReason && (
                        <div className="mt-3 bg-surface-muted rounded-md p-3 text-sm border border-border text-ink-700">
                          <span className="font-semibold">Татгалзсан шалтгаан:</span> {p.rejectionReason}
                        </div>
                      )}
                      {(p.status === "DRAFT" || p.status === "REJECTED") && (
                        <div className="mt-4 pt-4 border-t border-border flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => {
                            setFormData({ title: p.title, description: p.description || "", goal: p.researchGoal || "", keywords: p.keywords || "", supervisorId: p.supervisorId || "" });
                            setEditingId(p.id);
                            setShowForm(true);
                          }}>
                            <Edit2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Засах
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteProposal(p.id)}>
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Устгах
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label, required, hint, error, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2 flex items-center gap-1.5">
        {label}
        {required && <span className="text-[var(--color-dot-negative)]">*</span>}
        {hint && <span className="text-ink-400 normal-case tracking-normal font-normal">· {hint}</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[var(--color-dot-negative)] mt-1">{error}</p>}
    </div>
  );
}
