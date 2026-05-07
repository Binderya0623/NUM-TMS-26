import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Users, FileText, CheckCircle2, Calendar, Clock, ArrowRight,
  Award, MessageSquare, TrendingUp, MapPin,
} from "lucide-react";
import { planService } from "../../../services/planService";
import { topicService } from "../../../services/topicService";
import { thesisService, type ThesisReport } from "../../../services/thesisService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { committeeService, type Committee } from "../../../services/committeeService";
import { userService } from "../../../services/userService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName, initialsFromName } from "../../../lib/utils";
import { useNavigate } from "react-router";

type Tone = "positive" | "warning" | "negative" | "neutral";
const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
};

const STAGE_DEFS = [
  { key: "PROGRESS_1",    title: "Явц 1" },
  { key: "PROGRESS_2",    title: "Явц 2" },
  { key: "PRE_DEFENSE",   title: "Урьдчилсан" },
  { key: "FINAL_DEFENSE", title: "Эцсийн хамгаалалт" },
];

const stageLabel = (stageType: string) => {
  const map: Record<string, string> = {
    PROGRESS_1: "Явц 1-ийн хяналт",
    PROGRESS_2: "Явц 2-ын хяналт",
    PRE_DEFENSE: "Урьдчилсан хамгаалалт",
    FINAL_DEFENSE: "Эцсийн хамгаалалт",
  };
  return map[stageType] || stageType;
};

type StageState = "done" | "active" | "upcoming";

function TermTimeline({ stageState }: { stageState: Record<string, { state: StageState; date?: string }> }) {
  const activeIndex = (() => {
    const i = STAGE_DEFS.findIndex(s => stageState[s.key]?.state === "active");
    if (i >= 0) return i;
    let lastDone = -1;
    STAGE_DEFS.forEach((s, idx) => { if (stageState[s.key]?.state === "done") lastDone = idx; });
    return lastDone + 1;
  })();
  return (
    <div className="relative">
      <div className="absolute top-[18px] left-[10%] w-[80%] h-px bg-border-strong" />
      <div
        className="absolute top-[18px] left-[10%] h-px bg-accent transition-all duration-700"
        style={{ width: `${Math.min((activeIndex / (STAGE_DEFS.length - 1)) * 80, 80)}%` }}
      />
      <div className="flex justify-between relative">
        {STAGE_DEFS.map((stage) => {
          const info = stageState[stage.key] || { state: "upcoming" as StageState };
          const done = info.state === "done";
          const active = info.state === "active";
          return (
            <div key={stage.key} className="flex flex-col items-center w-1/4">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  done
                    ? "bg-accent text-white border border-accent"
                    : active
                    ? "bg-surface text-accent border border-accent"
                    : "bg-surface text-ink-400 border border-border-strong"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.8} />
                ) : active ? (
                  <span className="w-2 h-2 bg-accent rounded-full" />
                ) : (
                  <span className="text-xs font-semibold tabular-nums">{STAGE_DEFS.indexOf(stage) + 1}</span>
                )}
              </div>
              <p className={`mt-3 text-[11px] text-center tracking-tight ${active ? "text-accent font-semibold" : "text-ink-600"}`}>
                {stage.title}
              </p>
              <p className="text-[10px] text-ink-500 tabular-nums mt-0.5">
                {info.date ? info.date.split("T")[0] : "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CommitteeWithRole extends Committee { role: string; }

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [pendingReports, setPendingReports] = useState<ThesisReport[]>([]);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [mySessions, setMySessions] = useState<DefenseSession[]>([]);
  const [myCommittees, setMyCommittees] = useState<CommitteeWithRole[]>([]);
  const [studentMap, setStudentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    const teacherId = user?.userId || user?.username || "";

    if (user?.systemRole === "EXTERNAL_EXPERT") {
      navigate("/teacher/expert", { replace: true });
      return;
    }

    const load = async () => {
      try {
        const [plansRes, reportsRes, reqRes, usersRes, assignmentsRes] = await Promise.all([
          planService.getPlans({ supervisorId: teacherId }),
          thesisService.getReports({}),
          topicService.getTopicRequests({ status: "APPROVED" }).catch(() => ({ data: [] as any[] })),
          userService.getStudents().catch(() => ({ data: [] as any[] })),
          committeeService.getMyAssignments(teacherId).catch(() => ({ data: [] as any[] })),
        ]);
        const map: Record<string, string> = {};
        (usersRes.data || []).forEach((u: any) => {
          if (u.id) map[u.id] = u.displayName || u.name || u.id;
          if (u.username) map[u.username] = u.displayName || u.name || u.username;
        });
        setStudentMap(map);

        const uniqueStudents = new Set(plansRes.data.map(p => p.studentId));
        const approvedReqs: any[] = (reqRes.data || []).filter(
          (r: any) => r.respondedById === teacherId
        );
        approvedReqs.forEach((r: any) => uniqueStudents.add(r.requestedById));
        setStudentCount(uniqueStudents.size);
        const myStudentIds = new Set(uniqueStudents);
        const myReports = reportsRes.data.filter(r => myStudentIds.has(r.studentId));
        setPendingReports(myReports.filter(r => r.status === "SUBMITTED"));
        setReviewedCount(myReports.filter(r => r.status === "REVIEWED" || r.status === "APPROVED").length);

        const assignments: any[] = assignmentsRes.data || [];
        const committeeIds = [...new Set(assignments.map(a => a.committeeId))];
        const committees = await Promise.all(
          committeeIds.map(id => committeeService.getById(id).then(r => r.data).catch(() => null))
        );
        const withRole: CommitteeWithRole[] = committees
          .filter((c): c is Committee => c !== null)
          .map(c => ({
            ...c,
            role: assignments.find(a => a.committeeId === c.id)?.role || "MEMBER",
          }));
        setMyCommittees(withRole);

        if (committeeIds.length > 0) {
          const sessionsResults = await Promise.all(
            committeeIds.map(id =>
              workflowService.getDefenseSessions({ committeeId: id })
                .catch(() => ({ data: [] as DefenseSession[] }))
            )
          );
          setMySessions(sessionsResults.flatMap(r => r.data));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reviewedRatio =
    reviewedCount + pendingReports.length > 0
      ? Math.round((reviewedCount / (reviewedCount + pendingReports.length)) * 100)
      : 0;

  // Hide sessions whose parent committee is closed. Closed committee = stale work.
  const activeCommitteeIds = new Set(
    myCommittees.filter(c => c.status === "ACTIVE" || c.status === "Идэвхтэй").map(c => c.id)
  );
  const liveSessions = mySessions.filter(s => !s.committeeId || activeCommitteeIds.has(s.committeeId));
  const committeeMap = new Map(myCommittees.map(c => [c.id, c]));

  const sessionDate = (s: DefenseSession) => s.scheduledDate || s.startedAt || "";
  const sortedSessions = [...liveSessions].sort((a, b) => sessionDate(a).localeCompare(sessionDate(b)));
  const todayMs = new Date().setHours(0, 0, 0, 0);
  const isPast = (s: DefenseSession) => {
    const st = (s.status || "").toUpperCase();
    if (st === "CLOSED" || st === "COMPLETED") return true;
    const d = sessionDate(s);
    return !!d && new Date(d).getTime() < todayMs;
  };
  const upcomingSchedule = sortedSessions.filter(s => !isPast(s));
  const pastSchedule = sortedSessions.filter(isPast);

  const sessionStatusTone = (status: string): Tone => {
    const s = (status || "").toUpperCase();
    if (s === "OPEN" || s === "SCHEDULED") return "warning";
    if (s === "CLOSED" || s === "COMPLETED") return "positive";
    return "neutral";
  };

  // Backend canonicalizes PRE_DEFENSE→PRELIMINARY and FINAL_DEFENSE→FINAL when
  // it stores the row. Sessions returned via the API carry the canonical name,
  // so comparing raw STAGE_DEFS keys would never match those two stages and
  // they'd stay "upcoming" even after every committee closes.
  const canonicalStage = (s?: string) =>
    s === 'PRE_DEFENSE' ? 'PRELIMINARY'
    : s === 'FINAL_DEFENSE' ? 'FINAL'
    : (s ?? '');

  // Real timeline: latest session per stage type drives done/active/upcoming + date.
  const stageState: Record<string, { state: StageState; date?: string }> = {};
  STAGE_DEFS.forEach(stage => {
    const target = canonicalStage(stage.key);
    const matches = mySessions.filter(s => canonicalStage(s.stageType) === target);
    if (matches.length === 0) { stageState[stage.key] = { state: "upcoming" }; return; }
    matches.sort((a, b) => sessionDate(b).localeCompare(sessionDate(a)));
    const latest = matches[0];
    const st = (latest.status || "").toUpperCase();
    let state: StageState = "upcoming";
    if (st === "CLOSED" || st === "COMPLETED") state = "done";
    else if (st === "OPEN" || st === "ACTIVE") state = "active";
    stageState[stage.key] = { state, date: sessionDate(latest) };
  });

  const renderScheduleRow = (session: DefenseSession) => {
    const committee = session.committeeId ? committeeMap.get(session.committeeId) : undefined;
    const dateStr = sessionDate(session);
    const [datePart, timePart] = dateStr.split("T");
    const month = datePart?.split("-")[1] || "—";
    const day = datePart?.split("-")[2] || "—";
    const time = timePart?.substring(0, 5);
    return (
      <div key={session.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-surface-muted transition-colors">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-md border border-border-strong bg-surface-muted flex flex-col items-center justify-center shrink-0 tabular-nums">
            <span className="text-[10px] font-medium text-ink-500 leading-none">{month}/</span>
            <span className="text-base font-semibold text-ink-900 leading-none mt-0.5">{day}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-ink-900 tracking-tight truncate">{stageLabel(session.stageType)}</h3>
            <p className="text-xs text-ink-600 mt-0.5 truncate">
              {committee ? `${committee.name} · ${committee.role}` : "—"}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-ink-500 flex-wrap">
              {time && (
                <span className="flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3" strokeWidth={1.6} />{time}
                </span>
              )}
              {session.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" strokeWidth={1.6} />{session.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-ink-700">
                <span className={`w-1.5 h-1.5 rounded-full ${toneDot[sessionStatusTone(session.status)]}`} />
                {session.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const heroStageEntry = STAGE_DEFS.find(s => stageState[s.key]?.state === "active")
    || STAGE_DEFS.slice().reverse().find(s => stageState[s.key]?.state === "done")
    || STAGE_DEFS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Action row — like StudentDashboard */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => navigate("/teacher/students")}>
          <Users className="h-4 w-4" strokeWidth={1.6} /> Оюутнууд
        </Button>
        <Button variant="outline" onClick={() => navigate("/teacher/students")}>
          <FileText className="h-4 w-4" strokeWidth={1.6} /> Хүлээгдэж буй тайлан
        </Button>
        <Button variant="outline" onClick={() => navigate("/teacher/messages")}>
          <MessageSquare className="h-4 w-4" strokeWidth={1.6} /> Мессеж
        </Button>
        <Button variant="outline" onClick={() => navigate("/teacher/committee")}>
          <Calendar className="h-4 w-4" strokeWidth={1.6} /> Хуваарь шалгах
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Hero card — progress strip + headline metric */}
          <Card>
            <div className="h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md">
              <div className="h-full bg-accent transition-all duration-700" style={{ width: `${reviewedRatio}%` }} />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                      <span className={`w-1.5 h-1.5 rounded-full ${pendingReports.length > 0 ? toneDot.warning : toneDot.positive}`} />
                      {pendingReports.length > 0 ? `${pendingReports.length} тайлан хянах` : "Тайлан бүгд хянагдсан"}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={1.6} />
                      {stageLabel(heroStageEntry.key)}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-ink-900 tracking-tight leading-tight">
                    Энэ улирлын удирдсан оюутнуудын явц
                  </h2>
                  <p className="text-sm text-ink-500 mt-1">
                    Оюутны тайлан, үнэлгээ, хуваарийн товч мэдээллийг доороос харна уу.
                  </p>
                </div>
                <div className="text-right shrink-0 border border-border rounded-md p-3">
                  <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{reviewedRatio}%</div>
                  <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1">Хянагдсан</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Term timeline — mirrors StudentDashboard.StageTimeline */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" strokeWidth={1.6} />
                Улирлын хуваарь
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TermTimeline stageState={stageState} />
            </CardContent>
          </Card>

          {/* Schedule — moved from TeacherCommittee. Hides closed committees. */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" strokeWidth={1.6} />
                Хамгаалалтын хуваарь
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-center text-ink-400 text-sm">Ачааллаж байна...</div>
              ) : liveSessions.length === 0 ? (
                <div className="p-6 text-center text-ink-400 text-sm">Идэвхтэй комиссын хамгаалалт алга.</div>
              ) : (
                <>
                  <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider font-medium text-ink-500">
                    Удахгүй болох ({upcomingSchedule.length})
                  </div>
                  {upcomingSchedule.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-ink-400">Удахгүй болох хамгаалалт алга.</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {upcomingSchedule.map(renderScheduleRow)}
                    </div>
                  )}
                  {pastSchedule.length > 0 && (
                    <>
                      <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wider font-medium text-ink-500 border-t border-border">
                        Өнгөрсөн ({pastSchedule.length})
                      </div>
                      <div className="divide-y divide-border">
                        {pastSchedule.map(renderScheduleRow)}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Info grid — 4 stat cells */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-4 h-4 text-accent" strokeWidth={1.6} />
                Тойм мэдээлэл
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Удирдаж буй оюутан",  value: studentCount },
                  { label: "Хүлээгдэж буй тайлан", value: pendingReports.length },
                  { label: "Удахгүй болох үнэлгээ", value: upcomingSchedule.length },
                  { label: "Дууссан хяналт",       value: reviewedCount },
                ].map(item => (
                  <div key={item.label} className="border border-border rounded-md p-3 bg-surface-muted">
                    <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1">{item.label}</p>
                    <p className="text-xl font-semibold text-ink-900 tracking-tight tabular-nums">
                      {loading ? "—" : item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending reports list — preserved from before but restyled */}
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" strokeWidth={1.6} />
                Хянах шаардлагатай тайлан
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-center text-ink-400 text-sm">Ачааллаж байна...</div>
              ) : pendingReports.length === 0 ? (
                <div className="p-6 text-center text-ink-400 text-sm">Хянах тайлан байхгүй байна.</div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingReports.map((report) => (
                    <div key={report.id} className="p-4 hover:bg-surface-muted transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border-strong">
                          <AvatarFallback className="text-xs font-medium">
                            {initialsFromName(resolveName(report.studentId, studentMap, "Оюутан"))}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-ink-900 tracking-tight">{resolveName(report.studentId, studentMap, "Тодорхойгүй оюутан")}</p>
                          <p className="text-xs text-ink-500 mt-0.5 tabular-nums">
                            {report.reportType} • {report.submittedAt?.split("T")[0] || "Огноогүй"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate("/teacher/students")}>
                        Одоо хянах
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" strokeWidth={1.6} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — Quick view */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" strokeWidth={1.6} />
                Хурдан харагдац
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {[
                { label: "Удирдаж буй", value: studentCount },
                { label: "Хүлээгдэж буй", value: pendingReports.length },
                { label: "Хянагдсан",    value: reviewedCount },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-ink-500">{item.label}</span>
                  <span className="text-xs font-semibold text-ink-900 tracking-tight tabular-nums">
                    {loading ? "—" : item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
