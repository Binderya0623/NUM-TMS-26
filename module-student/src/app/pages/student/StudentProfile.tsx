import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Mail, MapPin, GraduationCap, BookOpen, User, Calendar } from "lucide-react";
import { getStoredUser } from "../../../lib/authGuard";
import { isUuid, initialsFromName } from "../../../lib/utils";
import { userService, type UserRecord } from "../../../services/userService";
import { thesisService, type ThesisInfo } from "../../../services/thesisService";

type Tone = "positive" | "warning" | "negative" | "neutral" | "accent";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
  accent:   "bg-accent",
};

const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  ACTIVE:                   { label: "Хийгдэж байна",                tone: "accent" },
  SUBMITTED:                { label: "Хянагдаж байна",               tone: "warning" },
  APPROVED:                 { label: "Батлагдсан",                   tone: "positive" },
  REVISION_REQUIRED:        { label: "Засвар шаардлагатай",          tone: "warning" },
  PENDING_TEACHER_APPROVAL: { label: "Багшийн батлалт хүлээж байна", tone: "neutral" },
  DEPT_PENDING:             { label: "Тэнхимийн батлалт хүлээж байна", tone: "neutral" },
};

function stageFromStatus(status?: string): string {
  if (!status) return "—";
  const s = status.toUpperCase();
  if (s.includes("FINAL"))  return "Эцсийн хамгаалалт";
  if (s.includes("PRE"))    return "Урьдчилсан хамгаалалт";
  if (s.includes("PROG") && s.includes("2")) return "Явц 2";
  if (s.includes("PROG"))   return "Явц 1";
  if (s === "ACTIVE")       return "Судалгаа явагдаж байна";
  if (s === "SUBMITTED")    return "Тайлан илгэж хянагдаж байна";
  return status;
}

export default function StudentProfile() {
  const storedUser = getStoredUser();
  const studentId = storedUser?.userId || storedUser?.username || "";

  const [profile, setProfile] = useState<UserRecord | null>(null);
  const [thesis, setThesis]   = useState<ThesisInfo | null>(null);
  const [supervisor, setSupervisor] = useState<UserRecord | null>(null);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    Promise.all([
      userService.getById(studentId),
      thesisService.getMyThesis(studentId).catch(() => ({ data: null })),
      userService.getDepartments().catch(() => ({ data: [] as any[] })),
    ]).then(async ([userRes, thesisRes, deptRes]) => {
      setProfile(userRes.data);
      const t = thesisRes.data as ThesisInfo | null;
      setThesis(t);
      const map: Record<string, string> = {};
      (deptRes.data || []).forEach((d: any) => { if (d.id) map[d.id] = d.departmentName || d.id; });
      setDepartmentMap(map);
      if (t?.supervisorId) {
        const supRes = await userService.getById(t.supervisorId).catch(() => ({ data: null }));
        setSupervisor(supRes.data);
      }
    }).finally(() => setLoading(false));
  }, [studentId]);

  const deptLabel = (id?: string) => {
    if (!id) return "";
    return departmentMap[id] || (isUuid(id) ? "" : id);
  };

  const initials = (name?: string) => initialsFromName(name);

  const usernameLabel = storedUser?.username && !isUuid(storedUser.username) ? storedUser.username : "";
  const displayName = profile?.displayName || usernameLabel || "Оюутан";
  const profileDept = deptLabel(profile?.departmentId);
  const supervisorDept = deptLabel(supervisor?.departmentId);
  const supervisorName = supervisor?.displayName
    || (thesis?.supervisorId && !isUuid(thesis.supervisorId) ? thesis.supervisorId : "Хуваарилагдаагүй");
  const progress = thesis?.progress ?? 0;
  const statusCfg = STATUS_MAP[thesis?.status || ""] || { label: thesis?.status || "—", tone: "neutral" as Tone };

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
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Card>
        <CardContent className="px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="h-16 w-16 border border-border-strong shrink-0">
              <AvatarFallback className="text-base font-medium">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-ink-900 tracking-tight">{displayName}</h2>
              {usernameLabel && <p className="text-sm text-ink-500 tabular-nums">{usernameLabel}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px]">Оюутан</Badge>
                {profileDept && (
                  <Badge variant="outline" className="text-[10px]">{profileDept}</Badge>
                )}
                {thesis && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                    <span className={`w-1.5 h-1.5 rounded-full ${toneDot[statusCfg.tone]}`} />
                    {statusCfg.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
            {profile?.email && (
              <div className="flex items-center gap-2 text-sm text-ink-700">
                <Mail className="h-4 w-4 text-ink-400 shrink-0" strokeWidth={1.6} />
                <span className="truncate">{profile.email}</span>
              </div>
            )}
            {profileDept && (
              <div className="flex items-center gap-2 text-sm text-ink-700">
                <MapPin className="h-4 w-4 text-ink-400 shrink-0" strokeWidth={1.6} />
                <span>{profileDept}</span>
              </div>
            )}
            {usernameLabel && (
              <div className="flex items-center gap-2 text-sm text-ink-700">
                <User className="h-4 w-4 text-ink-400 shrink-0" strokeWidth={1.6} />
                <span>Хэрэглэгч: <span className="tabular-nums">{usernameLabel}</span></span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Дэвшил</p>
                  <BookOpen className="h-4 w-4 text-ink-400" strokeWidth={1.6} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{progress}%</div>
                <div className="w-full bg-border-strong rounded-full h-0.5 mt-3">
                  <div className="h-0.5 bg-accent rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Одоогийн шат</p>
                  <GraduationCap className="h-4 w-4 text-ink-400" strokeWidth={1.6} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-semibold text-ink-900 leading-snug tracking-tight">
                  {stageFromStatus(thesis?.status)}
                </div>
              </CardContent>
            </Card>
          </div>

          {thesis ? (
            <Card>
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-sm font-semibold text-ink-900 tracking-tight">Дипломын ажлын мэдээлэл</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1">Гарчиг</p>
                  <p className="text-sm font-medium text-ink-900 leading-snug tracking-tight">{thesis.title || "—"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Удирдагч багш", value: supervisorName },
                    { label: "Тэнхим", value: deptLabel(thesis.departmentId) || profileDept || "Тодорхойгүй" },
                    { label: "Эхэлсэн огноо", value: thesis.createdAt?.split("T")[0] || "Тодорхойгүй" },
                    { label: "Хүлээлгэх огноо", value: thesis.submissionDate?.split("T")[0] || "Тодорхойгүй" },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 bg-surface-muted rounded-md border border-border">
                      <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{label}</p>
                      <p className="text-sm font-medium text-ink-900 tabular-nums tracking-tight mt-0.5 truncate">{value}</p>
                    </div>
                  ))}
                </div>
                {thesis.submissionDate && (
                  <div className="flex items-center gap-2 text-xs text-ink-700 bg-surface-muted border border-border rounded-md px-3 py-2">
                    <Calendar className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.6} />
                    Эцсийн хугацаа: <span className="font-semibold text-ink-900 tabular-nums">{new Date(thesis.submissionDate).toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-10 text-center">
                <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-5 h-5 text-ink-400" strokeWidth={1.4} />
                </div>
                <p className="text-sm font-semibold text-ink-900 tracking-tight">Дипломын ажил бүртгэгдээгүй</p>
                <p className="text-xs text-ink-500 mt-1">Сэдвийн санал гаргасны дараа энд харагдана.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold text-ink-900 tracking-tight">Удирдагч багш</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {supervisor || thesis?.supervisorId ? (
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-border-strong shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {initials(supervisor?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate tracking-tight">
                      {supervisorName}
                    </p>
                    {supervisorDept && (
                      <p className="text-xs text-ink-500 mt-0.5">{supervisorDept}</p>
                    )}
                    {supervisor?.email && (
                      <p className="text-xs text-ink-500 mt-1 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" strokeWidth={1.6} />
                        <span className="truncate">{supervisor.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-400 text-center py-4">Удирдагч багш хуваарилагдаагүй байна.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold text-ink-900 tracking-tight">Бүртгэлийн мэдээлэл</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {[
                { label: "Хэрэглэгчийн нэр", value: usernameLabel || "Тодорхойгүй" },
                { label: "И-мэйл",            value: profile?.email || "Тодорхойгүй" },
                { label: "Үүрэг",            value: storedUser?.role === "teacher" ? "Багш" : "Оюутан" },
                { label: "Тэнхим",           value: profileDept || "Тодорхойгүй" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                  <span className="text-ink-500">{label}</span>
                  <span className="font-medium text-ink-900 truncate max-w-[140px] text-right tabular-nums">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" strokeWidth={1.6} />
                Дипломын хэсэг рүү очих
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="w-4 h-4 mr-2" strokeWidth={1.6} />
                Эцсийн дүн харах
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
