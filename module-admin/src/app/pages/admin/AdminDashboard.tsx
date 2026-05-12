import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, GraduationCap, BookOpen, Clock, UserCheck, ShieldCheck, CircleDot } from "lucide-react";
import { userService, type UserRecord } from "../../../services/userService";
import { planService, type Plan } from "../../../services/planService";
import { topicService, type Topic } from "../../../services/topicService";
import { committeeService, type Committee } from "../../../services/committeeService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { fmtDate, isUuid } from "../../../lib/utils";

// Navy-rooted brand ramp (deep to light).
const MONO_SHADES = ["#1f4f82", "#4f759c", "#86a4c2", "#c5d3e2", "#e8f0f8"];
const ACCENT = "#1f4f82";
const ACCENT_LIGHT = "#86a4c2";
// 2025–2026 academic year: September → May (summer 6/7/8 excluded).
// Index 0 = September of the start year, index 8 = May of the end year.
const ACADEMIC_YEAR_START = 2025;
const ACADEMIC_YEAR_END   = 2026;
const MONTHS = [
  "9-р сар", "10-р сар", "11-р сар", "12-р сар",
  "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар",
];

/** Map (year, month) → MONTHS index for the academic year, or -1 if outside. */
function academicMonthIndex(year: number, month: number): number {
  if (year === ACADEMIC_YEAR_START && month >= 9 && month <= 12) return month - 9;       // 0..3
  if (year === ACADEMIC_YEAR_END   && month >= 1 && month <= 5)  return month + 3;       // 4..8
  return -1;
}
const AXIS_TICK = { fontSize: 11, fill: "#6f8195" } as const;
const GRID_STROKE = "#d9e3ee";

type Tone = "positive" | "warning" | "negative" | "neutral";
const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
};

const COMMITTEE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Идэвхтэй",
  CLOSED: "Хаагдсан",
  PENDING: "Хүлээгдэж буй",
  SCHEDULED: "Хуваарьт",
  OPEN: "Нээлттэй",
};

const COMMITTEE_STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "positive",
  OPEN: "positive",
  PENDING: "warning",
  SCHEDULED: "warning",
  CLOSED: "neutral",
};

const STAGE_STEPS = [
  { key: "PROGRESS_1", label: "Явц 1", points: 15 },
  { key: "PROGRESS_2", label: "Явц 2", points: 20 },
  { key: "PRE_DEFENSE", label: "Урьдчилсан", points: 25 },
  { key: "FINAL_DEFENSE", label: "Эцсийн", points: 35 },
] as const;
const DEFENSE_STAGE_STEPS = STAGE_STEPS.filter(stage => stage.key !== "PROGRESS_1");

const normalizeStage = (stage?: string) =>
  stage === "PRELIMINARY" ? "PRE_DEFENSE" : stage === "FINAL" ? "FINAL_DEFENSE" : (stage || "");

const stageDateLabel = (sessions: DefenseSession[]) => {
  const dates = sessions
    .map(s => fmtDate(s.scheduledDate || s.startedAt || s.createdAt))
    .filter(Boolean)
    .sort();
  if (dates.length === 0) return "Огноо товлоогүй";
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first === last ? first : `${first} - ${last}`;
};

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<UserRecord[]>([]);
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [committeeStats, setCommitteeStats] = useState<Record<string, { students: number; members: number }>>({});
  const [defenseSessions, setDefenseSessions] = useState<DefenseSession[]>([]);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getTeachers(),
      userService.getStudents(),
      planService.getPlans(),
      topicService.getTopics(),
      committeeService.getCommittees().catch(() => ({ data: [] as Committee[] })),
      workflowService.getDefenseSessions().catch(() => ({ data: [] as DefenseSession[] })),
      userService.getDepartments().catch(() => ({ data: [] as any[] })),
    ]).then(async ([tr, sr, pr, tor, cr, wr, dr]) => {
      setTeachers(tr.data);
      setStudents(sr.data);
      setPlans(pr.data);
      setTopics(tor.data);
      setCommittees(cr.data);
      setDefenseSessions(wr.data);
      const statsEntries = await Promise.all(
        cr.data.map(async c => {
          const [studentsRes, membersRes] = await Promise.all([
            committeeService.getStudents(c.id).catch(() => ({ data: [] })),
            committeeService.getMembers(c.id).catch(() => ({ data: [] })),
          ]);
          return [c.id, { students: studentsRes.data.length, members: membersRes.data.length }] as const;
        })
      );
      setCommitteeStats(Object.fromEntries(statsEntries));
      const map: Record<string, string> = {};
      (dr.data || []).forEach((d: any) => { if (d.id) map[d.id] = d.departmentName || d.id; });
      setDepartmentMap(map);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deptLabel = (id?: string) => {
    if (!id) return "";
    return departmentMap[id] || (isUuid(id) ? "" : id);
  };

  const statusCounts: Record<string, number> = {};
  plans.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });

  const deptMap: Record<string, number> = {};
  students.forEach(s => {
    const dept = deptLabel(s.departmentId) || 'Бусад';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptData = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const trendMap: Record<string, { submitted: number; approved: number }> = {};
  MONTHS.forEach(m => { trendMap[m] = { submitted: 0, approved: 0 }; });
  topics.forEach(t => {
    if (!t.createdAt) return;
    const datePart = t.createdAt.split('T')[0];      // "YYYY-MM-DD"
    const [yStr, mStr] = datePart.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const idx = academicMonthIndex(year, month);
    if (idx < 0) return;                              // outside the 2025–2026 academic year
    const label = MONTHS[idx];
    trendMap[label].submitted++;
    if (t.status === 'APPROVED') trendMap[label].approved++;
  });
  const submissionTrend = MONTHS.map(m => ({ month: m, ...trendMap[m] }));

  const activeCommittees = committees.filter(c => c.status !== "CLOSED");
  const committeeSummary = [
    { label: "Нийт комисс", value: committees.length, tone: "neutral" as Tone },
    { label: "Идэвхтэй", value: activeCommittees.length, tone: "positive" as Tone },
    { label: "Хаагдсан", value: committees.filter(c => c.status === "CLOSED").length, tone: "neutral" as Tone },
  ];
  const visibleCommittees = [...committees]
    .sort((a, b) => {
      const aActive = a.status === "ACTIVE" ? 1 : 0;
      const bActive = b.status === "ACTIVE" ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    })
    .slice(0, 6);

  const stageRows = DEFENSE_STAGE_STEPS.map(stage => {
    const sessions = defenseSessions.filter(s => normalizeStage(s.stageType) === stage.key);
    const active = sessions.filter(s => s.status === "ACTIVE" || s.status === "OPEN").length;
    const scheduled = sessions.filter(s => s.status === "PENDING" || s.status === "SCHEDULED").length;
    const closed = sessions.filter(s => s.status === "CLOSED").length;
    const total = sessions.length;
    return { ...stage, active, scheduled, closed, total, dates: stageDateLabel(sessions) };
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Нийт багш нар",        value: loading ? "—" : teachers.length, icon: Users },
          { label: "Идэвхтэй оюутнууд",     value: loading ? "—" : students.length, icon: GraduationCap },
          { label: "Нийт дипломын ажил",   value: loading ? "—" : plans.length,    icon: BookOpen },
          { label: "Хүлээгдэж буй тайлан", value: loading ? "—" : (statusCounts['SUBMITTED'] || 0), icon: Clock },
        ].map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-4 h-4 text-ink-500" strokeWidth={1.6} />
                </div>
                <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{card.label}</p>
                <p className="text-xl md:text-2xl font-semibold text-ink-900 mt-1.5 tabular-nums tracking-tight">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Сэдвийн илгээлт</CardTitle>
              <p className="text-xs text-ink-400 mt-1">{ACADEMIC_YEAR_START}–{ACADEMIC_YEAR_END} оны хичээлийн жил</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-ink-500">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />Илгээсэн</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT_LIGHT }} />Зөвшөөрлөгдсөн</div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={submissionTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.22} /><stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT_LIGHT} stopOpacity={0.18} /><stop offset="95%" stopColor={ACCENT_LIGHT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: "6px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="submitted" stroke={ACCENT} strokeWidth={1.8} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="approved" stroke={ACCENT_LIGHT} strokeWidth={1.8} fill="url(#colorApp)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тэнхимийн тархалт</CardTitle>
            <p className="text-xs text-ink-400 mt-1">Оюутнуудаар</p>
          </CardHeader>
          <CardContent>
            {deptData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-ink-400 text-sm">Өгөгдөл байхгүй</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value" stroke="#fff" strokeWidth={2}>
                      {deptData.map((_, i) => <Cell key={i} fill={MONO_SHADES[i % MONO_SHADES.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "6px", border: "1px solid #e5e5e5" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-3">
                  {deptData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: MONO_SHADES[idx] }} />
                        <span className="text-ink-600 truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <span className="text-ink-900 font-medium tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Комиссын мэдээлэл</CardTitle>
              <p className="text-xs text-ink-400 mt-1">Идэвхтэй комисс, гишүүн болон оюутны багтаамж</p>
            </div>
            <UserCheck className="w-4 h-4 text-ink-500 shrink-0" strokeWidth={1.6} />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {committeeSummary.map(item => (
                <div key={item.label} className="rounded-md border border-border bg-surface-muted px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-600">
                    <span className={`w-1.5 h-1.5 rounded-full ${toneDot[item.tone]}`} />
                    {item.label}
                  </span>
                  <p className="text-xl font-semibold text-ink-900 mt-1 tabular-nums">{loading ? "—" : item.value}</p>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-8 text-ink-400 text-sm">Ачааллаж байна...</div>
            ) : visibleCommittees.length === 0 ? (
              <div className="text-center py-8 text-ink-400 text-sm">Комисс бүртгэгдээгүй байна.</div>
            ) : (
              <div className="divide-y divide-border">
                {visibleCommittees.map(c => {
                  const stats = committeeStats[c.id] || { students: 0, members: 0 };
                  const stage = STAGE_STEPS.find(s => s.key === normalizeStage(c.stageType));
                  const statusTone = COMMITTEE_STATUS_TONE[c.status] || "neutral";
                  return (
                    <div key={c.id} className="py-3 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-ink-900 tracking-tight break-words">{c.name}</p>
                          <span className="text-[10px] uppercase tracking-wider font-medium text-accent bg-accent-softer rounded-sm px-2 py-0.5">
                            {stage?.label || c.stageType || "Шатгүй"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-ink-500">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot[statusTone]}`} />
                            {COMMITTEE_STATUS_LABEL[c.status] || c.status}
                          </span>
                          {deptLabel(c.departmentId) && <span>{deptLabel(c.departmentId)}</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 shrink-0 w-full lg:w-auto lg:min-w-[180px]">
                        <div className="rounded-md border border-border bg-surface px-3 py-2 text-center">
                          <p className="text-base font-semibold text-ink-900 tabular-nums">{stats.members}</p>
                          <p className="text-[10px] uppercase tracking-wider text-ink-500">Гишүүн</p>
                        </div>
                        <div className="rounded-md border border-border bg-surface px-3 py-2 text-center">
                          <p className="text-base font-semibold text-ink-900 tabular-nums">{stats.students}</p>
                          <p className="text-[10px] uppercase tracking-wider text-ink-500">Оюутан</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Хамгаалалтын шатуудын товч диаграм</CardTitle>
            <p className="text-xs text-ink-400 mt-1">Сессийн төлөвөөр</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stageRows.map((stage, idx) => {
                const pct = stage.total > 0 ? Math.round(((stage.active + stage.closed) / stage.total) * 100) : 0;
                return (
                  <div key={stage.key} className="relative">
                    {idx < stageRows.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-[-18px] w-px bg-border" />
                    )}
                    <div className="flex gap-3">
                      <div className="relative z-10 w-8 h-8 rounded-full border border-border-strong bg-surface flex items-center justify-center shrink-0">
                        {stage.active > 0 ? (
                          <CircleDot className="w-4 h-4 text-accent" strokeWidth={1.7} />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-ink-400" strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm font-semibold text-ink-900 tracking-tight">{stage.label}</p>
                            <p className="text-[11px] text-ink-500 tabular-nums">{stage.points} оноо · {stage.total} сесс</p>
                            <p className="text-[11px] text-ink-500 tabular-nums mt-0.5">{stage.dates}</p>
                          </div>
                          <span className="text-xs font-medium text-ink-700 tabular-nums">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 mt-2 text-[10px] text-ink-500">
                          <span className="inline-flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                            Хүлээгдэж {stage.scheduled}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                            Идэвхтэй {stage.active}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.neutral}`} />
                            Дууссан {stage.closed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
