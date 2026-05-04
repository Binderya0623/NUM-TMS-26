import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Users, FileText, CheckCircle2, Calendar, Clock, ArrowRight,
  Award, MessageSquare, TrendingUp,
} from "lucide-react";
import { planService } from "../../../services/planService";
import { topicService } from "../../../services/topicService";
import { thesisService, type ThesisReport } from "../../../services/thesisService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
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

function TermTimeline({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="relative">
      <div className="absolute top-[18px] left-[10%] w-[80%] h-px bg-border-strong" />
      <div
        className="absolute top-[18px] left-[10%] h-px bg-accent transition-all duration-700"
        style={{ width: `${Math.min((activeIndex / (STAGE_DEFS.length - 1)) * 80, 80)}%` }}
      />
      <div className="flex justify-between relative">
        {STAGE_DEFS.map((stage, idx) => {
          const done = idx < activeIndex;
          const active = idx === activeIndex;
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
                  <span className="text-xs font-semibold tabular-nums">{idx + 1}</span>
                )}
              </div>
              <p className={`mt-3 text-[11px] text-center tracking-tight ${active ? "text-accent font-semibold" : "text-ink-600"}`}>
                {stage.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [pendingReports, setPendingReports] = useState<ThesisReport[]>([]);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState<DefenseSession[]>([]);
  const [allSessions, setAllSessions] = useState<DefenseSession[]>([]);
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
        const [plansRes, reportsRes, sessionsRes, reqRes, usersRes] = await Promise.all([
          planService.getPlans({ supervisorId: teacherId }),
          thesisService.getReports({}),
          workflowService.getDefenseSessions({ status: "OPEN" }).catch(() => ({ data: [] as DefenseSession[] })),
          topicService.getTopicRequests({ status: "APPROVED" }).catch(() => ({ data: [] as any[] })),
          userService.getStudents().catch(() => ({ data: [] as any[] })),
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
        setUpcomingSessions(sessionsRes.data.slice(0, 3));
        setAllSessions(sessionsRes.data);
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

  // Heuristic: pick the latest known active stage from open sessions
  const stageOrder = ["PROGRESS_1", "PROGRESS_2", "PRE_DEFENSE", "FINAL_DEFENSE"];
  const knownStages = new Set(allSessions.map(s => s.stageType).filter(Boolean));
  const activeIndex = (() => {
    let idx = 0;
    for (let i = 0; i < stageOrder.length; i++) {
      if (knownStages.has(stageOrder[i])) idx = i;
    }
    return idx;
  })();

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
                      {stageLabel(STAGE_DEFS[activeIndex]?.key || "PROGRESS_1")}
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
              <TermTimeline activeIndex={activeIndex} />
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
                  { label: "Удахгүй болох үнэлгээ", value: upcomingSessions.length },
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

        {/* Sidebar — Upcoming + Quick view */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" strokeWidth={1.6} />
                Удахгүй болох үнэлгээ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <p className="text-sm text-ink-400 text-center py-4">Ачааллаж байна...</p>
              ) : upcomingSessions.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-4">Удахгүй болох үнэлгээ байхгүй.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="p-3 rounded-md border border-border bg-surface hover:border-accent transition-colors group cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                          <Clock className="w-3 h-3" strokeWidth={1.6} />
                          {session.startedAt?.split("T")[0] || "—"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-accent" strokeWidth={1.6} />
                      </div>
                      <h4 className="text-sm font-semibold text-ink-900 tracking-tight leading-snug">
                        {stageLabel(session.stageType)}
                      </h4>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate("/teacher/committee")}>
                Бүх хуваарийг харах
              </Button>
            </CardContent>
          </Card>

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
