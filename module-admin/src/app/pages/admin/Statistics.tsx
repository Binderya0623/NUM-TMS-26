import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity } from "lucide-react";
import { userService, type UserRecord } from "../../../services/userService";
import { planService, type Plan } from "../../../services/planService";
import { evaluationService, type FinalGrade, type ReviewDocument } from "../../../services/evaluationService";
import { thesisReportService, type ThesisReport } from "../../../services/thesisReportService";

// Navy-rooted brand ramp (deep → light) — matches student/teacher accent #1455bd
const MONO_SHADES = ["#1455bd", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
const BAR_FILL = "#1455bd";
const GRID_STROKE = "#e5e5e5";
const AXIS_TICK = { fontSize: 11, fill: "#737373" } as const;

export default function Statistics() {
  const [teachers, setTeachers] = useState<UserRecord[]>([]);
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [finalGrades, setFinalGrades] = useState<FinalGrade[]>([]);
  const [reviewDocs, setReviewDocs] = useState<ReviewDocument[]>([]);
  const [reports, setReports] = useState<ThesisReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getTeachers(),
      userService.getStudents(),
      planService.getPlans(),
      evaluationService.getFinalGrades(),
      evaluationService.getReviewDocuments({}),
      thesisReportService.getReports().catch(() => ({ data: [] as ThesisReport[] })),
    ]).then(([tr, sr, pr, fr, rv, rep]) => {
      setTeachers(tr.data);
      setStudents(sr.data);
      setPlans(pr.data);
      setFinalGrades(fr.data);
      setReviewDocs(rv.data);
      setReports(rep.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deptMap: Record<string, number> = {};
  students.forEach(s => {
    const dept = s.departmentId || 'Бусад';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptData = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const teacherPlanMap: Record<string, number> = {};
  plans.forEach(p => {
    if (p.supervisorId) teacherPlanMap[p.supervisorId] = (teacherPlanMap[p.supervisorId] || 0) + 1;
  });
  const teacherWorkload = teachers
    .map(t => ({
      name: t.displayName?.split(' ').slice(-1)[0] || t.id,
      plans: teacherPlanMap[t.id] || teacherPlanMap[t.username || ''] || 0,
    }))
    .filter(t => t.plans > 0)
    .sort((a, b) => b.plans - a.plans);

  const statusMap: Record<string, number> = {};
  plans.forEach(p => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  const approvedCount = plans.filter(p => p.status === 'APPROVED').length;
  const approvalRate = plans.length > 0 ? ((approvedCount / plans.length) * 100).toFixed(0) : '0';

  // Stage-level reality (status = APPROVED already means topic batlagdsan, plus
  // anything past it). DRAFT / *_PENDING are pre-approval.
  const POST_APPROVAL: ReadonlyArray<string> = ['APPROVED', 'ACTIVE', 'SUBMITTED'];
  const approvedTheses     = plans.filter(p => POST_APPROVAL.includes(p.status)).length;
  const evaluationsDone    = reviewDocs.length;
  const gradesCalculated   = finalGrades.length;
  const workflowsCompleted = finalGrades.filter(g => g.isPublished).length;
  const reportsSubmitted   = reports.filter(r => r.status === 'SUBMITTED' || r.submittedAt).length;

  // "Active" = a thesis in progress (post-approval, not yet finalized with a
  // confirmed grade). We exclude students whose final grade is already in.
  const finalizedStudentIds = new Set(finalGrades.map(g => g.studentId).filter(Boolean));
  const activeTheses = plans.filter(p =>
    POST_APPROVAL.includes(p.status) && !finalizedStudentIds.has(p.studentId)
  ).length;

  // Avg supervisor load: plans/unique-supervisors is more meaningful than
  // students/teachers (most teachers don't supervise; not all students have a
  // thesis). Falls back to "—" if no plans yet.
  const supervisedPlans = plans.filter(p => !!p.supervisorId).length;
  const uniqueSupervisors = new Set(plans.map(p => p.supervisorId).filter(Boolean)).size;
  const avgStudentsPerTeacher = uniqueSupervisors > 0
    ? (supervisedPlans / uniqueSupervisors).toFixed(1)
    : '—';

  if (loading) {
    return <div className="text-center py-16 text-ink-400 text-sm">Ачааллаж байна...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Нийт багш нар",      value: teachers.length,       sub: "Бүртгэлтэй багш нар" },
          { label: "Нийт оюутнууд",      value: students.length,       sub: "Бүртгэлтэй оюутнууд" },
          { label: "Нийт дипломын ажил", value: plans.length,          sub: "Бүх илгээлтууд" },
          { label: "Батлагдсан хувь",    value: `${approvalRate}%`,    sub: "Зөвшөөрлөгдсөн дипломууд" },
        ].map(card => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{card.value}</div>
              <p className="text-xs text-ink-400 mt-1.5">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Тэнхимийн оюутнууд</CardTitle>
          </CardHeader>
          <CardContent>
            {deptData.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-8">Өгөгдөл байхгүй</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="name" tick={AXIS_TICK} stroke={GRID_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={GRID_STROKE} />
                  <Tooltip cursor={{ fill: "rgba(20,85,189,0.06)" }} />
                  <Bar dataKey="count" fill={BAR_FILL} name="Оюутны тоо" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Дипломын байдлын тархалт</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-8">Өгөгдөл байхгүй</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={240}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={90} stroke="#fff" strokeWidth={2}>
                      {statusData.map((_, i) => <Cell key={i} fill={MONO_SHADES[i % MONO_SHADES.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 text-xs flex-1">
                  {statusData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: MONO_SHADES[i % MONO_SHADES.length] }} />
                      <span className="text-ink-600 truncate max-w-[100px]">{d.name}</span>
                      <span className="font-semibold text-ink-900 ml-auto tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Багшны ачаалалтын тархалт</CardTitle>
        </CardHeader>
        <CardContent>
          {teacherWorkload.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-8">Өгөгдөл байхгүй</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(280, teacherWorkload.length * 28 + 40)}>
              <BarChart data={teacherWorkload} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} stroke={GRID_STROKE} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={AXIS_TICK} stroke={GRID_STROKE} width={120} />
                <Tooltip cursor={{ fill: "rgba(20,85,189,0.06)" }} />
                <Bar dataKey="plans" fill={BAR_FILL} name="Дипломын ажлын тоо" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Дундаж оюутан/багш",   value: avgStudentsPerTeacher },
          { label: "Нийт идэвхтэй диплом", value: activeTheses },
          { label: "Тайлан илгээсэн",       value: reportsSubmitted },
        ].map(m => (
          <Card key={m.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{m.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{m.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Activity className="h-4 w-4 text-ink-500" strokeWidth={1.6} />
          <CardTitle>Системийн үйл ажиллагаа</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { label: "Батлагдсан сэдвүүд", value: approvedTheses },
              { label: "Дүгнэлт хийгдсэн",   value: evaluationsDone },
              { label: "Дүн тооцоолсон",     value: gradesCalculated },
              { label: "Workflow дууссан",   value: workflowsCompleted },
              { label: "Тайлан илгээсэн",     value: reportsSubmitted },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-md border border-border p-4 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-ink-500">{label}</span>
                <span className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
