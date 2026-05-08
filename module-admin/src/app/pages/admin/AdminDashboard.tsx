import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Users, GraduationCap, BookOpen, Clock, FileText } from "lucide-react";
import { userService, type UserRecord } from "../../../services/userService";
import { planService, type Plan } from "../../../services/planService";
import { topicService, type Topic } from "../../../services/topicService";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { isUuid, initialsFromName, resolveName } from "../../../lib/utils";

// Navy-rooted brand ramp (deep → light) — matches student/teacher accent #1455bd
const MONO_SHADES = ["#1455bd", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"];
const ACCENT = "#1455bd";
const ACCENT_LIGHT = "#60a5fa";
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
const AXIS_TICK = { fontSize: 11, fill: "#737373" } as const;
const GRID_STROKE = "#e5e5e5";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Ноорог",
  PENDING_TEACHER_APPROVAL: "Багшийн батлалт",
  DEPT_PENDING: "Тэнхимийн батлалт",
  APPROVED: "Батлагдсан",
  ACTIVE: "Хийгдэж байна",
  SUBMITTED: "Хянагдаж байна",
};

type Tone = "positive" | "warning" | "negative" | "neutral";
const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "neutral", SUBMITTED: "warning", APPROVED: "positive", DRAFT: "neutral",
};
const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
};

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState<UserRecord[]>([]);
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getTeachers(),
      userService.getStudents(),
      planService.getPlans(),
      topicService.getTopics(),
      userService.getDepartments().catch(() => ({ data: [] as any[] })),
    ]).then(([tr, sr, pr, tor, dr]) => {
      setTeachers(tr.data);
      setStudents(sr.data);
      setPlans(pr.data);
      setTopics(tor.data);
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
  const studentNameMap: Record<string, string> = {};
  students.forEach(s => {
    if (s.id) studentNameMap[s.id] = s.displayName;
    if (s.username) studentNameMap[s.username] = s.displayName;
  });
  const deptData = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const recentPlans = [...plans]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 6);

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

  const topTeachers = teachers.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Нийт багш нар",        value: loading ? "—" : teachers.length, icon: Users },
          { label: "Идэвхтэй оюутнууд",     value: loading ? "—" : students.length, icon: GraduationCap },
          { label: "Нийт дипломын ажил",   value: loading ? "—" : plans.length,    icon: BookOpen },
          { label: "Хүлээгдэж буй тайлан", value: loading ? "—" : (statusCounts['SUBMITTED'] || 0), icon: Clock },
        ].map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-4 h-4 text-ink-500" strokeWidth={1.6} />
                </div>
                <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{card.label}</p>
                <p className="text-2xl font-semibold text-ink-900 mt-1.5 tabular-nums tracking-tight">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Сэдвийн илгээлт</CardTitle>
              <p className="text-xs text-ink-400 mt-1">{ACADEMIC_YEAR_START}–{ACADEMIC_YEAR_END} оны хичээлийн жил</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-ink-500">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Дипломын байдлын тойм</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['ACTIVE', 'SUBMITTED', 'APPROVED', 'DRAFT'].map(s => {
                const count = statusCounts[s] || 0;
                const total = plans.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-ink-700">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot[STATUS_TONE[s] || 'neutral']}`} />
                        {STATUS_LABEL[s] || s}
                      </span>
                      <span className="text-xs text-ink-500 font-medium tabular-nums">{count}</span>
                    </div>
                    <div className="w-full h-1 bg-surface-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mb-3">Статусын харьцаа</p>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={Object.entries(statusCounts).map(([name, value]) => ({ name: STATUS_LABEL[name] || name, value }))} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#737373" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#737373" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px", border: "1px solid #e5e5e5" }} cursor={{ fill: "rgba(20,85,189,0.06)" }} />
                  <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Сүүлийн дипломын ажлууд</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-ink-400 text-sm">Ачааллаж байна...</div>
            ) : recentPlans.length === 0 ? (
              <div className="text-center py-8 text-ink-400 text-sm">Дипломын ажил байхгүй</div>
            ) : (
              <div className="space-y-4">
                {recentPlans.map(p => {
                  const tone = STATUS_TONE[p.status] || 'neutral';
                  return (
                    <div key={p.id} className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-ink-400 shrink-0 mt-0.5" strokeWidth={1.6} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-800 leading-tight truncate">{p.title || resolveName(p.studentId, studentNameMap, 'Гарчиггүй ажил')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-600">
                            <span className={`w-1 h-1 rounded-full ${toneDot[tone]}`} />
                            {STATUS_LABEL[p.status] || p.status}
                          </span>
                          <span className="text-[11px] text-ink-400 tabular-nums">· {p.createdAt?.split('T')[0] || 'Огноогүй'}</span>
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
          <CardHeader><CardTitle>Удирдагч багш нар</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-ink-400 text-sm">Ачааллаж байна...</div>
            ) : topTeachers.length === 0 ? (
              <div className="text-center py-8 text-ink-400 text-sm">Багш байхгүй</div>
            ) : (
              <div className="space-y-3">
                {topTeachers.map((t, idx) => {
                  const name = t.displayName || 'Тодорхойгүй';
                  const dept = deptLabel(t.departmentId);
                  return (
                  <div key={t.id} className="flex items-center gap-3">
                    <span className="text-xs text-ink-400 w-4 shrink-0 text-center tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="w-8 h-8 border border-border-strong bg-surface rounded-full flex items-center justify-center text-ink-900 text-[11px] font-medium shrink-0">
                      {initialsFromName(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-900 font-medium truncate tracking-tight">{name}</p>
                      {dept && <p className="text-xs text-ink-400 truncate">{dept}</p>}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
