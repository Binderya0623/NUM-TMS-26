import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { FileText, MessageSquare, Calendar, TrendingUp, Upload, Eye, BookOpen, CheckCircle2, Clock, MapPin, Users } from "lucide-react";
import { thesisService, type ThesisInfo, type ThesisReport } from "../../../services/thesisService";
import { topicService } from "../../../services/topicService";
import { planService, type Plan } from "../../../services/planService";
import { userService } from "../../../services/userService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { committeeService } from "../../../services/committeeService";
import { evaluationService } from "../../../services/evaluationService";
import { getStoredUser } from "../../../lib/authGuard";
import { isUuid, initialsFromName, resolveName } from "../../../lib/utils";
import { useNavigate } from "react-router";

type StageState = "done" | "active" | "upcoming";

const STAGE_LABELS: { key: string; label: string; sessionType?: string }[] = [
  { key: "topic", label: "Сэдвийн санал" },
  { key: "prog1", label: "Явцын тайлан 1",      sessionType: "PROGRESS_1" },
  { key: "prog2", label: "Явцын тайлан 2",      sessionType: "PROGRESS_2" },
  { key: "pre",   label: "Урьдчилсан хамгаалалт", sessionType: "PRE_DEFENSE" },
  { key: "final", label: "Эцсийн хамгаалалт",     sessionType: "FINAL_DEFENSE" },
];

// Helpers for the "Дараагийн хамгаалалт" card. Same shape as the deadlines page.
function fmtLocaleDateTime(iso?: string): string | null {
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
const stageLabel = (s?: string) => {
  const m: Record<string, string> = {
    PROGRESS_1: "Явцын тайлан 1",
    PROGRESS_2: "Явцын тайлан 2",
    PRELIMINARY: "Урьдчилсан хамгаалалт",
    PRE_DEFENSE: "Урьдчилсан хамгаалалт",
    FINAL: "Эцсийн хамгаалалт",
    FINAL_DEFENSE: "Эцсийн хамгаалалт",
  };
  return (s && m[s]) || s || "";
};

const planStatusLabel: Record<string, string> = {
  DRAFT: 'Ноорог',
  SUBMITTED: 'Илгээсэн',
  REVISION_REQUIRED: 'Засвар шаардлагатай',
  APPROVED: 'Багш баталсан',
  DEPT_APPROVED: 'Тэнхим баталсан',
};

function StageTimeline({ stageState }: { stageState: Record<string, { state: StageState; date?: string }> }) {
  const activeIndex = (() => {
    const i = STAGE_LABELS.findIndex(s => stageState[s.key]?.state === "active");
    if (i >= 0) return i;
    let lastDone = -1;
    STAGE_LABELS.forEach((s, idx) => { if (stageState[s.key]?.state === "done") lastDone = idx; });
    return lastDone + 1;
  })();
  const pct = Math.min((activeIndex / (STAGE_LABELS.length - 1)) * 80, 80);
  return (
    <div className="relative">
      <div className="absolute top-[18px] left-[10%] w-[80%] h-px bg-border-strong" />
      <div
        className="absolute top-[18px] left-[10%] h-px bg-accent transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
      <div className="flex justify-between relative">
        {STAGE_LABELS.map((stage, idx) => {
          const info = stageState[stage.key] || { state: "upcoming" as StageState };
          const done = info.state === "done";
          const active = info.state === "active";
          return (
            <div key={stage.key} className="flex flex-col items-center w-1/5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  done
                    ? 'bg-ink-900 text-white border border-ink-900'
                    : active
                    ? 'bg-surface text-accent border border-accent'
                    : 'bg-surface text-ink-400 border border-border-strong'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.8} />
                ) : active ? (
                  <span className="w-2 h-2 bg-accent rounded-full" />
                ) : (
                  <span className="text-xs font-semibold tabular-nums">{idx + 1}</span>
                )}
              </div>
              <p className={`mt-3 text-[11px] text-center tracking-tight ${active ? 'text-accent font-semibold' : 'text-ink-600'}`}>
                {stage.label}
              </p>
              <p className="text-[10px] text-ink-500 tabular-nums mt-0.5">
                {info.date ? fmtLocaleDateTime(info.date) : '—'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Backend canonicalizes PRE_DEFENSE→PRELIMINARY and FINAL_DEFENSE→FINAL when
// storing the defense_session row. Sessions returned via the API therefore
// carry the canonical names, but the frontend timeline keys use PRE_DEFENSE
// and FINAL_DEFENSE. Without this normalization those two stages never match
// any session and stay "upcoming" even after the committee closes.
const canonicalStage = (s?: string) =>
  s === 'PRE_DEFENSE' ? 'PRELIMINARY'
  : s === 'FINAL_DEFENSE' ? 'FINAL'
  : (s ?? '');

function buildStageState(opts: {
  hasTopic: boolean;
  thesisStatus?: string;
  sessions: DefenseSession[];
}): Record<string, { state: StageState; date?: string }> {
  const out: Record<string, { state: StageState; date?: string }> = {};
  out.topic = { state: opts.hasTopic ? "done" : "active" };

  STAGE_LABELS.filter(s => s.sessionType).forEach(stage => {
    const target = canonicalStage(stage.sessionType);
    const matches = opts.sessions.filter(s => canonicalStage(s.stageType) === target);
    if (matches.length === 0) {
      out[stage.key] = { state: "upcoming" };
      return;
    }
    matches.sort((a, b) =>
      (b.scheduledDate || b.startedAt || '').localeCompare(a.scheduledDate || a.startedAt || '')
    );
    const latest = matches[0];
    const st = (latest.status || '').toUpperCase();
    let state: StageState = "upcoming";
    if (st === "CLOSED" || st === "COMPLETED") state = "done";
    else if (st === "OPEN" || st === "ACTIVE") state = "active";
    out[stage.key] = { state, date: latest.scheduledDate || latest.startedAt };
  });

  // Fall back to thesis.status when no sessions are wired yet — keeps the
  // student's current stage visible even if the workflow hasn't created
  // defense sessions for them.
  if (opts.thesisStatus) {
    const s = opts.thesisStatus.toUpperCase();
    const fallbackKey =
      s.includes("FINAL")                       ? "final" :
      s.includes("PRE")                         ? "pre"   :
      (s.includes("PROG") && s.includes("2"))   ? "prog2" :
      s.includes("PROG")                        ? "prog1" :
      null;
    if (fallbackKey && out[fallbackKey].state === "upcoming") {
      out[fallbackKey] = { ...out[fallbackKey], state: "active" };
    }
  }
  return out;
}

function NoThesisState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 border border-border-strong rounded-full flex items-center justify-center mb-5">
        <BookOpen className="w-6 h-6 text-ink-400" strokeWidth={1.4} />
      </div>
      <h2 className="text-lg font-semibold text-ink-900 tracking-tight mb-2">Дипломын сэдэв сонгоогүй байна</h2>
      <p className="text-ink-500 max-w-sm mb-6 text-sm leading-relaxed">
        Та эхлээд дипломын сэдвээ сонгох эсвэл дэвшүүлэх шаардлагатай. Хянах самбар сэдэв баталснаас хойш идэвхжинэ.
      </p>
      <Button onClick={() => navigate('/student/thesis?tab=topic')}>
        Сэдэв сонгох хэсэг рүү очих
      </Button>
    </div>
  );
}

function ApprovedTopicState({ topicTitle, topicTitleEn, supervisorName, plan, stageState }: {
  topicTitle?: string;
  topicTitleEn?: string;
  supervisorName?: string;
  plan?: Plan | null;
  stageState: Record<string, { state: StageState; date?: string }>;
}) {
  const navigate = useNavigate();
  const doneCount = STAGE_LABELS.filter(s => stageState[s.key]?.state === "done").length;
  const progressPct = Math.round((doneCount / STAGE_LABELS.length) * 100);
  const currentStage = STAGE_LABELS.find(s => stageState[s.key]?.state === "active")
    || STAGE_LABELS.slice().reverse().find(s => stageState[s.key]?.state === "done")
    || STAGE_LABELS[0];

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => navigate('/student/thesis?tab=weekly-plan')}>
          <Calendar className="h-4 w-4" strokeWidth={1.6} /> Долоо хоногийн төлөвлөгөө
        </Button>
        <Button variant="outline" onClick={() => navigate('/student/thesis?tab=topic')}>
          <BookOpen className="h-4 w-4" strokeWidth={1.6} /> Сэдвийн дэлгэрэнгүй
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-positive)]" />
                      Сэдэв батлагдсан
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">
                      Гүйцэтгэх шатанд
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-ink-900 tracking-tight leading-tight">
                    {topicTitle || 'Дипломын ажил'}
                  </h2>
                  {topicTitleEn && (
                    <p className="text-sm italic text-ink-500 mt-0.5">{topicTitleEn}</p>
                  )}
                </div>
                <div className="text-right shrink-0 border border-border rounded-md p-3">
                  <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{progressPct}%</div>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1">Дууссан</p>
                </div>
              </div>
              {supervisorName && (
                <div className="flex items-center gap-2 text-sm mt-5 pt-4 border-t border-border">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>{initialsFromName(supervisorName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-ink-500">Удирдагч багш:</span>
                  <span className="font-medium text-ink-900 tracking-tight">{supervisorName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Эрдэм шинжилгээний хуваарь
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <StageTimeline stageState={stageState} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <FileText className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Төлөвлөгөөний байдал
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {plan ? (
                <>
                  <div className="flex items-center justify-between py-1.5 border-b border-border">
                    <span className="text-xs text-ink-500">Статус</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-neutral)]" />
                      {planStatusLabel[plan.status] || plan.status}
                    </span>
                  </div>
                  <Button className="w-full mt-2" size="sm" onClick={() => navigate('/student/thesis?tab=weekly-plan')}>
                    Төлөвлөгөө засах
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-ink-500">Төлөвлөгөө үүсгэгдээгүй байна.</p>
                  <Button className="w-full" size="sm" onClick={() => navigate('/student/thesis?tab=topic')}>
                    Төлөвлөгөө үүсгэх
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <MessageSquare className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Хурдан харагдац
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {[
                { label: 'Явц',           value: `${progressPct}%` },
                { label: 'Одоогийн шат',  value: currentStage.label },
                { label: 'Удирдагч',      value: supervisorName || 'Хуваарилагдаагүй' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-ink-500">{item.label}</span>
                  <span className="text-xs font-semibold text-ink-900 tracking-tight">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const studentId = user?.userId || user?.username || '';

  const [thesis, setThesis] = useState<ThesisInfo | null>(null);
  const [approvedTopicTitle, setApprovedTopicTitle] = useState<string | undefined>();
  const [approvedTopicTitleEn, setApprovedTopicTitleEn] = useState<string | undefined>();
  const [supervisorName, setSupervisorName] = useState<string>('');
  const [departmentLabel, setDepartmentLabel] = useState<string>('');
  const [myPlan, setMyPlan] = useState<Plan | null>(null);
  const [hasApprovedRequest, setHasApprovedRequest] = useState(false);
  const [reports, setReports] = useState<ThesisReport[]>([]);
  const [defenseSessions, setDefenseSessions] = useState<DefenseSession[]>([]);
  const [hasFinalGrade, setHasFinalGrade] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState<Record<string, { id: string; teacherId: string; role: string }[]>>({});
  const [teacherNameMap, setTeacherNameMap] = useState<Record<string, string>>({});
  const [resolvedSupervisorId, setResolvedSupervisorId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    const username = user?.username || '';
    Promise.all([
      thesisService.getMyThesis(studentId).then(r => r.data || null).catch(() => null),
      topicService.getMyRequests(studentId).catch(() => ({ data: [] as any[] })),
      username !== studentId
        ? topicService.getMyRequests(username).catch(() => ({ data: [] as any[] }))
        : Promise.resolve({ data: [] as any[] }),
      planService.getMyPlan(studentId).catch(() => ({ data: [] as any[] })),
      userService.getDepartments().catch(() => ({ data: [] as any[] })),
      userService.getById(studentId).catch(() => ({ data: null as any })),
      thesisService.getMyReports(studentId).catch(() => ({ data: [] as ThesisReport[] })),
      evaluationService.getMyFinalGrade(studentId).catch(() => ({ data: null as any })),
    ]).then(async ([thesisData, reqRes1, reqRes2, planRes, deptRes, profileRes, reportsRes, finalGradeRes]) => {
      setHasFinalGrade(!!finalGradeRes.data?.id);
      setReports(reportsRes.data || []);
      setThesis(thesisData);
      const deptMap: Record<string, string> = {};
      (deptRes.data || []).forEach((d: any) => { if (d.id) deptMap[d.id] = d.departmentName || d.id; });
      const allRequests = [...(reqRes1.data || []), ...(reqRes2.data || [])];
      const approved = allRequests.find((r: any) => r.status === 'APPROVED');
      let supervisorId: string | undefined;
      if (approved) {
        setHasApprovedRequest(true);
        supervisorId = approved.respondedById;
        try {
          const tr = await topicService.getPublicTopics();
          const t = (tr.data || []).find((tp: any) => tp.id === approved.topicId);
          if (t) {
            setApprovedTopicTitle(t.title);
            setApprovedTopicTitleEn(t.titleEn);
          }
        } catch {}
      }
      supervisorId = thesisData?.supervisorId || supervisorId;
      if (supervisorId) {
        const sup = await userService.getById(supervisorId).catch(() => ({ data: null as any }));
        if (sup.data?.displayName) setSupervisorName(sup.data.displayName);
        else if (!isUuid(supervisorId)) setSupervisorName(supervisorId);
      }
      const dept = thesisData?.departmentId || profileRes.data?.departmentId;
      if (dept) {
        const label = deptMap[dept] || (!isUuid(dept) ? dept : '');
        if (label) setDepartmentLabel(label);
      }
      const plans = planRes.data || [];
      setMyPlan(plans.length > 0 ? plans[0] : null);

      // Defense sessions feed the timeline. Use the same scoping the teacher
      // dashboard uses: per-committee for stages 2–4 (since the student and
      // teacher are members of the same committee for each stage) plus a
      // per-supervisor query for PROGRESS_1 (committeeId is the supervisor for
      // that stage). Department-scope querying missed GLOBAL sessions admin
      // creates and produced the wrong "current stage" on the timeline.
      const cmtRes = await committeeService.getMyCommittees(studentId).catch(() => ({ data: [] as any[] }));
      const cmtIds = (cmtRes.data || []).map((c: any) => c.committeeId).filter(Boolean);
      const [p1Res, cmtSessLists] = await Promise.all([
        supervisorId
          ? workflowService.getDefenseSessions({ supervisorId }).catch(() => ({ data: [] as DefenseSession[] }))
          : Promise.resolve({ data: [] as DefenseSession[] }),
        Promise.all(
          cmtIds.map((id: string) =>
            workflowService.getDefenseSessions({ committeeId: id }).catch(() => ({ data: [] as DefenseSession[] }))
          )
        ),
      ]);
      const allSessions: DefenseSession[] = [
        ...(p1Res.data || []),
        ...cmtSessLists.flatMap(r => r.data),
      ];
      // Dedupe by id in case the same session shows up under multiple queries.
      const byId = new Map<string, DefenseSession>();
      allSessions.forEach(s => { if (s.id) byId.set(s.id, s); });
      setDefenseSessions(Array.from(byId.values()));
      if (supervisorId) setResolvedSupervisorId(supervisorId);

      // Committee membership + teacher name lookup feed the
      // "Дараагийн хамгаалалт" card on this dashboard. Same source as the
      // dedicated /student/deadlines page.
      Promise.all(
        cmtIds.map((id: string) =>
          committeeService.getMembers(id)
            .then(r => [id, r.data] as const)
            .catch(() => [id, [] as any[]] as const),
        ),
      ).then(pairs => {
        const map: Record<string, { id: string; teacherId: string; role: string }[]> = {};
        pairs.forEach(([id, members]) => { map[id] = members as any; });
        setCommitteeMembers(map);
      });
      Promise.all([
        userService.getTeachers().catch(() => ({ data: [] as any[] })),
        userService.getExternalExperts().catch(() => ({ data: [] as any[] })),
      ]).then(([tRes, eRes]) => {
        const m: Record<string, string> = {};
        [...(tRes.data || []), ...(eRes.data || [])].forEach((u: any) => {
          if (u.id) m[u.id] = u.displayName || u.name || u.id;
          if (u.username) m[u.username] = u.displayName || u.name || u.username;
        });
        setTeacherNameMap(m);
      });
    }).finally(() => setLoading(false));
  }, [studentId]);

  // Pick the next defense session for the upcoming-card.
  // Logic mirrors StudentEvaluationDeadlines.upcomingSession.
  const upcomingSession = (() => {
    const candidates = defenseSessions.filter(
      s => s.status !== "CLOSED" && s.scheduledDate,
    );
    if (candidates.length === 0) return undefined;
    const now = Date.now();
    const ts = (s: DefenseSession) =>
      s.scheduledDate ? new Date(s.scheduledDate).getTime() : NaN;
    const future = candidates.filter(s => !isNaN(ts(s)) && ts(s) >= now);
    if (future.length > 0) return future.sort((a, b) => ts(a) - ts(b))[0];
    return candidates.sort((a, b) => ts(b) - ts(a))[0];
  })();

  if (loading) {
    return <div className="text-center py-24 text-sm text-ink-400">Ачааллаж байна...</div>;
  }

  const stageState = buildStageState({
    hasTopic: hasApprovedRequest || !!thesis,
    thesisStatus: thesis?.status,
    sessions: defenseSessions,
  });

  if (!thesis) {
    if (hasApprovedRequest || myPlan) {
      return <ApprovedTopicState topicTitle={approvedTopicTitle || myPlan?.title} topicTitleEn={approvedTopicTitleEn} supervisorName={supervisorName} plan={myPlan} stageState={stageState} />;
    }
    return <NoThesisState />;
  }

  // Progress is derived from real stage state (same source as the timeline),
  // not the legacy thesis.progress field which the backend rarely keeps fresh.
  // When a final grade exists the workflow is over — force 100% even if a
  // session row never landed in defense_session (real life: admins close
  // committees without creating per-stage sessions for every committee).
  const doneStages = STAGE_LABELS.filter(s => stageState[s.key]?.state === "done").length;
  const progress = hasFinalGrade ? 100 : Math.round((doneStages / STAGE_LABELS.length) * 100);
  const currentStage = STAGE_LABELS.find(s => stageState[s.key]?.state === "active")
    || STAGE_LABELS.slice().reverse().find(s => stageState[s.key]?.state === "done")
    || STAGE_LABELS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => navigate('/student/thesis')}>
          <Eye className="h-4 w-4" strokeWidth={1.6} /> Дипломоо харах
        </Button>
        <Button variant="outline" onClick={() => navigate('/student/thesis?tab=reports')}>
          <Upload className="h-4 w-4" strokeWidth={1.6} /> Тайлан оруулах
        </Button>
        <Button variant="outline" onClick={() => navigate('/student/feedback')}>
          <MessageSquare className="h-4 w-4" strokeWidth={1.6} /> Санал хүсэлт харах
        </Button>
        <Button variant="outline" onClick={() => navigate('/student/evaluation')}>
          <Calendar className="h-4 w-4" strokeWidth={1.6} /> Эцсийн хугацааг шалгах
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <div className="h-0.5 w-full bg-border-strong relative overflow-hidden">
              <div className="h-full bg-accent transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-neutral)]" />
                      {thesis.status || "Явцалдаа"}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={1.6} />
                      {currentStage.label}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-ink-900 tracking-tight leading-tight">
                    {thesis.title || myPlan?.title || approvedTopicTitle || "Дипломын ажил"}
                  </h2>
                  {approvedTopicTitleEn && (
                    <p className="text-sm italic text-ink-500 mt-1">{approvedTopicTitleEn}</p>
                  )}
                </div>
                <div className="text-right shrink-0 border border-border rounded-md p-3">
                  <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{progress}%</div>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1">Дууссан</p>
                </div>
              </div>

              {(supervisorName || thesis.supervisorId) && (
                <div className="flex items-center gap-2 text-sm mt-5 pt-4 border-t border-border">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>{initialsFromName(supervisorName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-ink-500">Удирдагч багш:</span>
                  <span className="font-medium text-ink-900 tracking-tight">{supervisorName || 'Хуваарилагдаагүй'}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Эрдэм шинжилгээний хуваарь
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <StageTimeline stageState={stageState} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Дипломын ажлын мэдээлэл
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Удирдагч багш",   value: supervisorName || "Хуваарилагдаагүй" },
                  { label: "Тэнхим",          value: departmentLabel || "Тодорхойгүй" },
                  { label: "Эхэлсэн огноо",   value: fmtLocaleDateTime(thesis.createdAt) || "Тодорхойгүй" },
                  { label: "Хүлээлгэх огноо", value: fmtLocaleDateTime(thesis.submissionDate) || "Тодорхойгүй" },
                ].map(item => (
                  <div key={item.label} className="border border-border rounded-md p-3 bg-surface-muted">
                    <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-ink-900 tracking-tight tabular-nums">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Илгээсэн тайлангууд
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {reports.length === 0 ? (
                <div className="text-center py-6 text-ink-400 text-sm">Одоогоор тайлан илгээгүй байна.</div>
              ) : (
                <div className="divide-y divide-border">
                  {reports.map(r => (
                    <div key={r.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink-900 tracking-tight">{r.reportType}</p>
                        <p className="text-xs text-ink-500 tabular-nums">{fmtLocaleDateTime(r.submittedAt) || 'Огноогүй'}</p>
                      </div>
                      <span className="text-xs text-ink-700">{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Удахгүй болох хамгаалалт
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {upcomingSession ? (
                <>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-medium text-accent">Дараагийн хамгаалалт</p>
                    <h3 className="text-base font-semibold text-ink-900 tracking-tight mt-0.5">
                      {stageLabel(upcomingSession.stageType)}
                    </h3>
                  </div>
                  {upcomingSession.scheduledDate && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md border border-border-strong flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500">Огноо</p>
                        <p className="text-sm font-medium text-ink-900">{fmtLocaleDateTime(upcomingSession.scheduledDate)}</p>
                        {(() => {
                          const d = daysFrom(upcomingSession.scheduledDate);
                          if (d === null) return null;
                          if (d === 0) return <p className="text-xs text-ink-700 flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-negative)]" />Өнөөдөр</p>;
                          if (d > 0)  return <p className="text-xs text-ink-500 mt-0.5 tabular-nums">{d} хоногийн дараа</p>;
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
                  {upcomingSession.stageType !== "PROGRESS_1" && upcomingSession.committeeId && (() => {
                    const upMembers = committeeMembers[upcomingSession.committeeId] || [];
                    if (upMembers.length === 0) return null;
                    return (
                      <div className="pt-2 border-t border-border">
                        <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-2 flex items-center gap-1">
                          <Users className="w-3 h-3" strokeWidth={1.6} /> Комисс ({upMembers.length} гишүүн)
                        </p>
                        <div className="space-y-1.5">
                          {upMembers.slice(0, 4).map(m => {
                            const name = resolveName(m.teacherId, teacherNameMap, "Тодорхойгүй");
                            return (
                              <div key={m.id} className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 border border-border-strong">
                                  <AvatarFallback className="text-[10px] font-medium">
                                    {initialsFromName(name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-ink-700 truncate flex-1">{name}</span>
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
                  {upcomingSession.stageType === "PROGRESS_1" && resolvedSupervisorId && (() => {
                    const supName = resolveName(resolvedSupervisorId, teacherNameMap, supervisorName || "Удирдагч багш");
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
                </>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-7 h-7 text-ink-300 mx-auto mb-2" strokeWidth={1.4} />
                  <p className="text-sm font-medium text-ink-700">Хуваарьт хамгаалалт байхгүй</p>
                  <p className="text-xs text-ink-500 mt-0.5">Тогтоогдох үед энд харагдана.</p>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => navigate('/student/deadlines')}>
                Бүх хуваарь харах
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <MessageSquare className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Хурдан харагдац
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {[
                { label: "Явц",           value: `${progress}%` },
                { label: "Одоогийн шат",  value: currentStage.label },
                { label: "Удирдагч",      value: supervisorName || "Хуваарилагдаагүй" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-ink-500">{item.label}</span>
                  <span className="text-xs font-semibold text-ink-900 tracking-tight">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
