import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Calendar, Clock, MapPin, Users, Award, ChevronDown, ChevronUp,
  Upload, FileText, FileDown, Lock, AlertCircle, X,
} from "lucide-react";
import { evaluationService, type SecretarySubmission, type DefenseGrade } from "../../../services/evaluationService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { committeeService, type CommitteeTeacher } from "../../../services/committeeService";
import { planService } from "../../../services/planService";
import { thesisService, type ThesisReport, type ReportFile } from "../../../services/thesisService";
import { userService } from "../../../services/userService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName, initialsFromName } from "../../../lib/utils";
import FilePreviewModal from "../../components/FilePreviewModal";

const STAGES = [
  { stageType: "PROGRESS_1",    label: "Явцын тайлан 1",         maxPoints: 15, reportType: "PROGRESS_1" },
  { stageType: "PROGRESS_2",    label: "Явцын тайлан 2",         maxPoints: 20, reportType: "PROGRESS_2" },
  { stageType: "PRE_DEFENSE",   label: "Урьдчилсан хамгаалалт",  maxPoints: 25, reportType: "PRE_DEFENSE" },
  { stageType: "FINAL_DEFENSE", label: "Эцсийн хамгаалалт",      maxPoints: 40, reportType: "FINAL_DEFENSE" },
] as const;

type Tone = "positive" | "warning" | "negative" | "neutral" | "accent";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
  accent:   "bg-accent",
};

function fmtDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" });
}
function fmtDateTime(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("mn-MN", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function daysFrom(iso?: string): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export default function StudentEvaluationDeadlines() {
  const user = getStoredUser();
  const studentId = user?.userId || user?.username || "";

  const [supervisorId, setSupervisorId] = useState("");
  const [thesisId, setThesisId] = useState("");
  const [sessionByStage, setSessionByStage] = useState<Record<string, DefenseSession>>({});
  const [membersByCommittee, setMembersByCommittee] = useState<Record<string, CommitteeTeacher[]>>({});
  const [submissions, setSubmissions] = useState<SecretarySubmission[]>([]);
  const [defenseGrades, setDefenseGrades] = useState<DefenseGrade[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [reportsBySession, setReportsBySession] = useState<Record<string, ThesisReport[]>>({});
  const [filesByReport, setFilesByReport] = useState<Record<string, ReportFile[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [uploadSession, setUploadSession] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewFiles, setPreviewFiles] = useState<ReportFile[]>([]);
  const [previewActiveId, setPreviewActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }

    const load = async () => {
      try {
        const planRes = await planService.getMyPlan(studentId).catch(() => ({ data: [] }));
        const plan = planRes.data[0] ?? null;
        const supId = plan?.supervisorId || "";
        const thId = plan?.thesisId || "";
        setSupervisorId(supId);
        setThesisId(thId);

        const cmtRes = await committeeService.getMyCommittees(studentId);
        const cmtIds = (cmtRes.data || []).map(c => c.committeeId).filter(Boolean);

        const [p1Res, cmtSessLists, subsRes, gradesRes, teachersRes, expertsRes] = await Promise.all([
          supId ? workflowService.getDefenseSessions({ supervisorId: supId }) : Promise.resolve({ data: [] as DefenseSession[] }),
          Promise.all(cmtIds.map(id => workflowService.getDefenseSessions({ committeeId: id }))),
          evaluationService.getSecretarySubmissions(studentId),
          evaluationService.getMyDefenseGrades(studentId),
          userService.getTeachers().catch(() => ({ data: [] as any[] })),
          userService.getExternalExperts().catch(() => ({ data: [] as any[] })),
        ]);
        const cmtSessRes = { data: cmtSessLists.flatMap(r => r.data) };

        const uMap: Record<string, string> = {};
        [...(teachersRes.data || []), ...(expertsRes.data || [])].forEach((u: any) => {
          if (u.id) uMap[u.id] = u.displayName || u.name || u.id;
          if (u.username) uMap[u.username] = u.displayName || u.name || u.username;
        });
        setUserMap(uMap);

        // Backend canonicalizes PRE_DEFENSE→PRELIMINARY and FINAL_DEFENSE→FINAL in the DB.
        // Normalize back to the frontend stage names so STAGES lookup hits.
        const normalizeStage = (s: string) =>
          s === "PRELIMINARY" ? "PRE_DEFENSE" : s === "FINAL" ? "FINAL_DEFENSE" : s;

        const map: Record<string, DefenseSession> = {};
        const p1 = p1Res.data.find(s => s.stageType === "PROGRESS_1");
        if (p1) map["PROGRESS_1"] = p1;
        for (const s of cmtSessRes.data) {
          const key = normalizeStage(s.stageType);
          if (key !== "PROGRESS_1") map[key] = s;
        }
        setSessionByStage(map);
        setSubmissions(subsRes.data);
        setDefenseGrades(gradesRes.data);

        cmtIds.forEach(id => {
          committeeService.getMembers(id)
            .then(r => setMembersByCommittee(prev => ({ ...prev, [id]: r.data })))
            .catch(() => {});
        });

        const sessionIds = Object.values(map).map(s => s.id).filter(Boolean);
        await Promise.all(
          sessionIds.map(sid =>
            thesisService.getReportBySession(studentId, sid)
              .then(r => {
                setReportsBySession(prev => ({ ...prev, [sid]: r.data }));
                r.data.forEach(report => {
                  thesisService.getReportFiles(String(report.id))
                    .then(fr => setFilesByReport(prev => ({ ...prev, [String(report.id)]: fr.data })))
                    .catch(() => {});
                });
              }),
          ),
        );
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  const sessionSummary = new Map<string, { avg: number; count: number; submittedAt?: string }>(
    Object.values(sessionByStage).map(s => {
      const sub = submissions.find(x => x.defenseSessionId === s.id);
      if (sub) return [s.id, { avg: sub.averageScore, count: sub.gradedCount, submittedAt: sub.submittedAt }] as const;
      const grades = defenseGrades.filter(g =>
        g.defenseSessionId === s.id && g.isSubmitted && g.evaluatorRole !== "REVIEWER"
      );
      if (grades.length === 0) return [s.id, { avg: NaN, count: 0 }] as const;
      const avg = grades.reduce((sum, g) => sum + g.points, 0) / grades.length;
      const latest = grades.map(g => g.submittedAt).filter(Boolean).sort().pop();
      return [s.id, { avg, count: grades.length, submittedAt: latest }] as const;
    }),
  );

  const upcomingSession = (() => {
    const candidates = STAGES
      .map(st => sessionByStage[st.stageType])
      .filter((s): s is DefenseSession => !!s && s.status !== "CLOSED");
    if (candidates.length === 0) return undefined;
    const now = Date.now();
    const ts = (s: DefenseSession) => s.scheduledDate ? new Date(s.scheduledDate).getTime() : NaN;
    const future = candidates.filter(s => !isNaN(ts(s)) && ts(s) >= now);
    if (future.length > 0) return future.sort((a, b) => ts(a) - ts(b))[0];
    const past = candidates.filter(s => !isNaN(ts(s)));
    if (past.length > 0) return past.sort((a, b) => ts(b) - ts(a))[0];
    return candidates[0];
  })();

  const handleUpload = async (session: DefenseSession, reportType: string) => {
    if (!uploadFile) return;
    setUploadStatus("uploading");
    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("studentId", studentId);
    fd.append("defenseSessionId", session.id);
    fd.append("reportType", reportType);
    if (thesisId) fd.append("thesisId", thesisId);
    try {
      const res = await thesisService.submitReport(fd);
      setReportsBySession(prev => ({
        ...prev,
        [session.id]: [...(prev[session.id] || []), res.data],
      }));
      setUploadStatus("success");
      setTimeout(() => { setUploadSession(null); setUploadFile(null); setUploadStatus("idle"); }, 2000);
    } catch (err: any) {
      console.error("Upload error:", err?.response?.data ?? err);
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-3 text-ink-500">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
          <span className="text-sm">Ачааллаж байна...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Хамгаалалтын хуваарь</h1>
        <p className="text-sm text-ink-500 mt-1">
          Хамгаалалтын 4 шат, хуваарь, байршил болон тайлангийн мэдээлэл
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-4">
          {STAGES.map((stage, idx) => {
            const session = sessionByStage[stage.stageType];
            const summary = session ? sessionSummary.get(session.id) : undefined;
            const avgScore = summary?.avg;
            const isClosed = session?.status === "CLOSED";
            const isGraded = avgScore !== undefined && !isNaN(avgScore);
            const isOpen = session?.status === "OPEN" || session?.status === "ACTIVE";
            const isScheduled = !!session?.scheduledDate && !isOpen && !isClosed;
            const hasSession = !!session;
            const isExp = expanded[stage.stageType] ?? false;

            const days = daysFrom(session?.scheduledDate);
            const daysClosedAt = daysFrom(session?.closedAt);

            const reports = session ? (reportsBySession[session.id] || []) : [];

            const tone: Tone = isGraded ? "positive"
              : isOpen ? "warning"
              : isScheduled ? "accent"
              : isClosed ? "neutral"
              : "neutral";

            const statusLabel = isGraded ? "Үнэлгээ гарсан"
              : isOpen ? "Явцад байна"
              : isClosed ? "Хаагдсан"
              : isScheduled ? "Хуваарьт"
              : "Хүлээгдэж байна";

            return (
              <div key={stage.stageType} className="flex gap-4">
                <div className="flex flex-col items-center pt-5">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 z-10 ${toneDot[tone]}`} />
                  {idx < STAGES.length - 1 && (
                    <div className="w-px flex-1 mt-1 bg-border-strong" />
                  )}
                </div>

                <Card className={`flex-1 mb-2 ${isOpen || isGraded ? "border-ink-900" : ""}`}>
                  <CardHeader
                    className="p-4 pb-3 cursor-pointer select-none"
                    onClick={() => setExpanded(p => ({ ...p, [stage.stageType]: !p[stage.stageType] }))}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-ink-900 tracking-tight">{stage.label}</span>
                          <span className="text-xs text-ink-400 tabular-nums">/ {stage.maxPoints} оноо</span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-600">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot[tone]}`} />
                            {statusLabel}
                          </span>
                          {reports.length > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              <FileText className="w-3 h-3 mr-1" strokeWidth={1.6} />{reports.length} тайлан
                            </Badge>
                          )}
                        </div>

                        {session?.scheduledDate && (
                          <div className="flex items-center gap-4 text-xs text-ink-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" strokeWidth={1.6} />
                              {fmtDateTime(session.scheduledDate)}
                            </span>
                            {session.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" strokeWidth={1.6} />
                                {session.location}
                              </span>
                            )}
                            {days !== null && days >= 0 && days <= 14 && (
                              <span className="inline-flex items-center gap-1.5 font-medium tabular-nums text-ink-700">
                                <span className={`w-1.5 h-1.5 rounded-full ${days <= 3 ? "bg-[var(--color-dot-negative)]" : days <= 7 ? "bg-[var(--color-dot-warning)]" : "bg-accent"}`} />
                                {days === 0 ? "Өнөөдөр" : `${days} хоногийн дараа`}
                              </span>
                            )}
                          </div>
                        )}
                        {!session?.scheduledDate && hasSession && (
                          <p className="text-xs text-ink-400 mt-0.5">Огноо тогтоогдоогүй байна</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {isGraded && (
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500">Оноо</p>
                            <p className="text-lg font-semibold text-ink-900 tabular-nums tracking-tight leading-tight">
                              {avgScore!.toFixed(1)}
                              <span className="text-xs text-ink-400 font-normal">/{stage.maxPoints}</span>
                            </p>
                          </div>
                        )}
                        <button className="text-ink-400 hover:text-ink-900 p-1 transition-colors" aria-label="Дэлгэрэнгүй">
                          {isExp ? <ChevronUp className="w-4 h-4" strokeWidth={1.6} /> : <ChevronDown className="w-4 h-4" strokeWidth={1.6} />}
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExp && (
                    <CardContent className="px-4 pb-4 pt-0 space-y-4 border-t border-border">
                      {session ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                          {session.scheduledDate && (
                            <InfoTile icon={<Calendar className="w-4 h-4 text-ink-700" strokeWidth={1.6} />} label="Огноо, цаг" value={fmtDateTime(session.scheduledDate) ?? "—"} />
                          )}
                          {session.location && (
                            <InfoTile icon={<MapPin className="w-4 h-4 text-ink-700" strokeWidth={1.6} />} label="Байршил / Өрөө" value={session.location} />
                          )}
                          {session.maxPoints && (
                            <InfoTile icon={<Award className="w-4 h-4 text-ink-700" strokeWidth={1.6} />} label="Дээд оноо" value={`${session.maxPoints} оноо`} />
                          )}
                          {session.closedAt && (
                            <InfoTile
                              icon={<Clock className="w-4 h-4 text-ink-700" strokeWidth={1.6} />}
                              label="Хаагдах хугацаа"
                              value={`${fmtDate(session.closedAt)}${daysClosedAt !== null && daysClosedAt >= 0 ? ` (${daysClosedAt} хоног)` : ""}`}
                              tone={daysClosedAt !== null && daysClosedAt <= 3 ? "negative" : undefined}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 py-4 text-ink-400 text-sm">
                          <Lock className="w-4 h-4" strokeWidth={1.6} /> Энэ шатны мэдээлэл одоогоор байхгүй байна.
                        </div>
                      )}

                      {session?.notes && (
                        <div className="p-3 bg-surface-muted border border-border rounded-md text-sm text-ink-700 flex gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-dot-warning)]" strokeWidth={1.6} />
                          <span>{session.notes}</span>
                        </div>
                      )}

                      {isGraded && summary && (
                        <div className="flex items-center gap-4 p-4 bg-surface-muted rounded-md border border-border">
                          <div className="w-10 h-10 rounded-full border border-ink-900 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-ink-900" strokeWidth={1.6} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink-900 tracking-tight">Комиссын дундаж үнэлгээ</p>
                            <p className="text-xs text-ink-500 mt-0.5">
                              {summary.count} гишүүний дундаж{summary.submittedAt ? ` · ${summary.submittedAt.split("T")[0]}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight leading-none">
                              {summary.avg.toFixed(1)}
                            </p>
                            <p className="text-xs text-ink-400 tabular-nums">/{stage.maxPoints}</p>
                          </div>
                        </div>
                      )}

                      {stage.stageType !== "PROGRESS_1" && session?.committeeId && (membersByCommittee[session.committeeId]?.length ?? 0) > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" strokeWidth={1.6} /> Комиссын бүрэлдэхүүн
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(membersByCommittee[session.committeeId!] || []).map(m => {
                              const name = resolveName(m.teacherId, userMap, "Тодорхойгүй");
                              return (
                              <div key={m.id} className="flex items-center gap-2.5 p-2.5 bg-surface-muted border border-border rounded-md">
                                <Avatar className="h-7 w-7 border border-border-strong">
                                  <AvatarFallback className="text-[10px] font-medium">
                                    {initialsFromName(name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className={`text-xs truncate ${m.role === "HEAD" ? "font-semibold text-ink-900" : "text-ink-700"}`}>
                                    {name}
                                  </p>
                                  <p className="text-[10px] text-ink-500">{committeeService.getRoleLabel(m.role)}</p>
                                </div>
                              </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {stage.stageType === "PROGRESS_1" && supervisorId && (() => {
                        const supName = resolveName(supervisorId, userMap, "Удирдагч багш");
                        return (
                        <div className="flex items-center gap-2.5 p-2.5 bg-surface-muted border border-border rounded-md">
                          <Avatar className="h-7 w-7 border border-border-strong">
                            <AvatarFallback className="text-[10px] font-medium">
                              {initialsFromName(supName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium text-ink-900">{supName}</p>
                            <p className="text-[10px] text-ink-500">Удирдагч багш</p>
                          </div>
                        </div>
                        );
                      })()}

                      {session && (
                        <div className="space-y-2">
                          <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" strokeWidth={1.6} /> Тайлан
                          </p>

                          {reports.length > 0 ? (
                            <div className="space-y-2">
                              {reports.map(r => {
                                const files = filesByReport[String(r.id)] || [];
                                const statusTone: Tone =
                                  r.status === "ACCEPTED" || r.status === "REVIEWED" ? "positive"
                                  : r.status === "REVISION_REQUIRED" ? "warning"
                                  : "neutral";
                                return (
                                  <div key={r.id} className="p-3 bg-surface border border-border rounded-md space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-ink-700">{r.reportType}</span>
                                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot[statusTone]}`} />
                                        {r.status}
                                      </span>
                                    </div>
                                    {files.length > 0 && (
                                      <button
                                        onClick={() => { setPreviewFiles(files); setPreviewActiveId(files[0].id); }}
                                        className="flex items-center gap-2 p-2 rounded-md bg-surface-muted border border-border hover:border-ink-900 transition-colors text-xs text-ink-700 hover:text-ink-900 w-full text-left"
                                      >
                                        <FileText className="w-3.5 h-3.5 shrink-0" strokeWidth={1.6} />
                                        <span className="truncate flex-1">{files.length} файл харах</span>
                                        <FileDown className="w-3 h-3 shrink-0 text-ink-400" strokeWidth={1.6} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-ink-400 py-2">Тайлан илгээгээгүй байна.</p>
                          )}

                          {(isOpen || isScheduled || !isClosed) && (
                            uploadSession === session.id ? (
                              <div className="space-y-2 p-3 bg-surface-muted rounded-md border border-border">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                                    onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                                    <Upload className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Файл сонгох
                                  </Button>
                                  {uploadFile && (
                                    <span className="text-xs text-ink-700 flex items-center gap-1 flex-1 min-w-0">
                                      <FileText className="w-3.5 h-3.5 text-ink-500 shrink-0" strokeWidth={1.6} />
                                      <span className="truncate">{uploadFile.name}</span>
                                      <button onClick={() => setUploadFile(null)} className="text-ink-400 hover:text-ink-900 shrink-0">
                                        <X className="w-3 h-3" strokeWidth={1.6} />
                                      </button>
                                    </span>
                                  )}
                                </div>
                                {uploadStatus === "success" && (
                                  <p className="text-xs text-ink-700 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-positive)]" /> Амжилттай байршлаа.
                                  </p>
                                )}
                                {uploadStatus === "error" && (
                                  <p className="text-xs text-ink-700 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)]" /> Алдаа гарлаа. Дахин оролдоно уу.
                                  </p>
                                )}
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm"
                                    onClick={() => { setUploadSession(null); setUploadFile(null); }}>
                                    Цуцлах
                                  </Button>
                                  <Button size="sm"
                                    disabled={!uploadFile || uploadStatus === "uploading"}
                                    onClick={() => handleUpload(session, stage.reportType)}>
                                    {uploadStatus === "uploading" ? "Илгээж байна..." : "Байршуулах"}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm"
                                onClick={() => { setUploadSession(session.id); setUploadFile(null); setUploadStatus("idle"); }}>
                                <Upload className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Тайлан байршуулах
                              </Button>
                            )
                          )}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </div>
            );
          })}
        </div>

        <div className="w-full xl:w-72 shrink-0 space-y-4">
          {upcomingSession ? (
            <Card>
              <div className="h-0.5 bg-accent" />
              <CardHeader className="pb-3">
                <p className="text-[11px] uppercase tracking-wider font-medium text-accent">Дараагийн хамгаалалт</p>
                <h3 className="text-base font-semibold text-ink-900 tracking-tight mt-0.5">
                  {STAGES.find(s => s.stageType === upcomingSession.stageType)?.label}
                </h3>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {upcomingSession.scheduledDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md border border-border-strong flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500">Огноо</p>
                      <p className="text-sm font-medium text-ink-900">{fmtDateTime(upcomingSession.scheduledDate)}</p>
                      {(() => {
                        const d = daysFrom(upcomingSession.scheduledDate);
                        if (d === null) return null;
                        if (d === 0) return <p className="text-xs text-ink-700 flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)]" />Өнөөдөр</p>;
                        if (d > 0) return <p className="text-xs text-ink-500 mt-0.5 tabular-nums">{d} хоногийн дараа</p>;
                        return <p className="text-xs text-ink-400 mt-0.5 tabular-nums">{Math.abs(d)} хоногийн өмнө</p>;
                      })()}
                    </div>
                  </div>
                )}
                {upcomingSession.location && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md border border-border-strong flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500">Байршил</p>
                      <p className="text-sm font-medium text-ink-900">{upcomingSession.location}</p>
                    </div>
                  </div>
                )}
                {(() => {
                  if (upcomingSession.stageType === "PROGRESS_1") return null;
                  const upMembers = upcomingSession.committeeId ? (membersByCommittee[upcomingSession.committeeId] || []) : [];
                  if (upMembers.length === 0) return null;
                  return (
                  <div className="pt-2 border-t border-border">
                    <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2 flex items-center gap-1">
                      <Users className="w-3 h-3" strokeWidth={1.6} /> Комисс ({upMembers.length} гишүүн)
                    </p>
                    <div className="space-y-1.5">
                      {upMembers.slice(0, 4).map(m => {
                        const name = resolveName(m.teacherId, userMap, "Тодорхойгүй");
                        return (
                        <div key={m.id} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-border-strong">
                            <AvatarFallback className="text-[10px] font-medium">
                              {initialsFromName(name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-ink-700 truncate flex-1">{name}</span>
                          <span className="text-[10px] text-ink-400 shrink-0">{committeeService.getRoleLabel(m.role)}</span>
                        </div>
                        );
                      })}
                      {upMembers.length > 4 && (
                        <p className="text-xs text-ink-400 tabular-nums">+{upMembers.length - 4} гишүүн</p>
                      )}
                    </div>
                  </div>
                  );
                })()}
                {upcomingSession.stageType === "PROGRESS_1" && supervisorId && (() => {
                  const supName = resolveName(supervisorId, userMap, "Удирдагч багш");
                  return (
                  <div className="pt-2 border-t border-border">
                    <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2">Удирдагч багш</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-border-strong">
                        <AvatarFallback className="text-[10px] font-medium">
                          {initialsFromName(supName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-ink-900">{supName}</span>
                    </div>
                  </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Calendar className="w-8 h-8 text-ink-300 mx-auto mb-3" strokeWidth={1.4} />
                <p className="text-sm font-medium text-ink-700 mb-1">Хуваарьт хамгаалалт байхгүй</p>
                <p className="text-xs text-ink-500">Хамгаалалтын хуваарь тогтоогдох үед энд харагдана.</p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {previewActiveId && previewFiles.length > 0 && (
        <FilePreviewModal
          files={previewFiles}
          activeId={previewActiveId}
          onClose={() => { setPreviewFiles([]); setPreviewActiveId(null); }}
          onSelect={setPreviewActiveId}
        />
      )}
    </div>
  );
}

function InfoTile({
  icon, label, value, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "negative";
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 bg-surface-muted rounded-md border border-border">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{label}</p>
        <p className={`text-sm font-medium ${tone === "negative" ? "text-ink-900 flex items-center gap-1.5" : "text-ink-900"}`}>
          {tone === "negative" && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)]" />}
          {value}
        </p>
      </div>
    </div>
  );
}
