import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Users, Eye, FileText, CheckCircle,
  Clock, ChevronRight, FileDown, Calendar,
  FileCheck, ShieldAlert, Award, ArrowLeft, Send, Upload, X
} from "lucide-react";
import { planService, type Plan } from "../../../services/planService";
import { topicService } from "../../../services/topicService";
import { thesisService, type ThesisReport, type ReportFile } from "../../../services/thesisService";
import { userService, type UserRecord } from "../../../services/userService";
import { committeeService } from "../../../services/committeeService";
import { workflowService, type DefenseSession } from "../../../services/workflowService";
import { evaluationService } from "../../../services/evaluationService";
import type { SecretarySubmission, ReviewDocument, DefenseGrade } from "../../../services/evaluationService";
import type { ReviewerAssignment } from "../../../services/committeeService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName, fmtDateTime, isUuid} from "../../../lib/utils";
import { useNavigate, useSearchParams } from "react-router";
import FilePreviewModal from "../../components/FilePreviewModal";
import { RichTextEditor } from "../../components/RichTextEditor";

type Tone = "positive" | "warning" | "negative" | "neutral" | "info";

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
  info:     "bg-[var(--color-dot-info)]",
};

const COMMITTEE_GRADER_ROLES = new Set(["HEAD", "SECRETARY", "MEMBER", "EXTERNAL_EXPERT"]);

const isClosedStatus = (status?: string) => {
  const normalized = (status || "").trim().toUpperCase();
  return normalized === "CLOSED" || normalized === "ХААГДСАН" || normalized === "ДУУССАН";
};

// ── Grading scheme by stage type ─────────────────────────────────────────────
interface GradeCriteria { name: string; max: number; }

const GRADING_SCHEMES: Record<string, { label: string; total: number; criteria: GradeCriteria[] }> = {
  PROGRESS_1: {
    label: "Явц 1-ийн үнэлгээ",
    total: 15,
    criteria: [
      { name: "Судалгааны тайлан", max: 10 },
      { name: "Танилцуулга", max: 5 },
    ],
  },
  PROGRESS_2: {
    label: "Явц 2-ын үнэлгээ",
    total: 20,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 },
    ],
  },
  PRE_DEFENSE: {
    label: "Урьдчилсан хамгаалалтын үнэлгээ",
    total: 25,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 },
      { name: "Гар бичмэл", max: 5 },
    ],
  },
  FINAL_DEFENSE: {
    label: "Эцсийн хамгаалалтын үнэлгээ",
    total: 35,
    criteria: [
      { name: "Судалгаа", max: 6 },
      { name: "Хэрэгжүүлэлт", max: 9 },
      { name: "Танилцуулга", max: 5 },
      { name: "Гар бичмэл", max: 5 },
      { name: "Нэмэлт үнэлгээ", max: 10 },
    ],
  },
};

interface DisplayStudent {
  id: string;
  name: string;
  thesis: string;
  thesisId?: string;
  stage: string;
  status: string;
  progress: number;
  studentId: string;
  sisId?: string;
}

const stageFromStatus = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: "Сэдэв батлагдсан",
    ACTIVE: "Судалгаа явагдаж байна",
    SUBMITTED: "Тайлан илгээсэн",
    PENDING_TEACHER_APPROVAL: "Багшийн батлалт хүлээж байна",
    DEPT_PENDING: "Тэнхимийн батлалт хүлээж байна",
    DRAFT: "Ноорог",
  };
  return map[status] || status;
};

// Aligned to the 5-stage timeline (topic, prog1, prog2, pre, final) so each
// stage = 20%. The student dashboard's "Эрдэм шинжилгээний хуваарь" derives
// its percentage the same way. Without per-student session data here we can
// only credit "topic done" (20%) for APPROVED+; deeper stages need defense
// session lookups that the roster card doesn't load.
const progressFromStatus = (status: string) => {
  const map: Record<string, number> = {
    DRAFT: 0,
    PENDING_TEACHER_APPROVAL: 5,
    DEPT_PENDING: 10,
    APPROVED: 20,        // topic batlagdsan = 1/5 stages done
    ACTIVE: 20,
    SUBMITTED: 20,
  };
  return map[status] ?? 0;
};

export default function TeacherStudents() {
  const [searchParams] = useSearchParams();
  const committeeId = searchParams.get("committeeId");
  const stageType = searchParams.get("stageType") || "";
  const navigate = useNavigate();

  const search = searchParams.get("q") ?? "";
  const [activeTab, setActiveTab] = useState("roster");
  const [assignedStudents, setAssignedStudents] = useState<DisplayStudent[]>([]);
  const [committeeStudents, setCommitteeStudents] = useState<DisplayStudent[]>([]);
  const [submittedReports, setSubmittedReports] = useState<ThesisReport[]>([]);
  const [studentNameMap, setStudentNameMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Report review state
  const [reviewReportId, setReviewReportId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "success" | "error">("idle");
  const [reviewFiles, setReviewFiles] = useState<ReportFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Grading state
  const [evalStudentId, setEvalStudentId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [evalStatus, setEvalStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [evalError, setEvalError] = useState<string | null>(null);

  // Defense session + teacher role state
  const [defenseSessionId, setDefenseSessionId] = useState<string | null>(null);
  const [teacherRole, setTeacherRole] = useState<string>("MEMBER");

  // Явц 1 schedule state
  const [progress1Session, setProgress1Session] = useState<import('../../../services/workflowService').DefenseSession | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ scheduledDate: '', location: '', notes: '' });
  const [scheduleStatus, setScheduleStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Явц 1 grading state
  const [p1GradeStudentId, setP1GradeStudentId] = useState<string | null>(null);
  const [p1Scores, setP1Scores] = useState<Record<number, number>>({});
  const [p1GradeStatus, setP1GradeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [p1GradeError, setP1GradeError] = useState<string | null>(null);
  const [p1ExistingGrades, setP1ExistingGrades] = useState<Record<string, number>>({});
  const P1_CRITERIA = [{ name: 'Судалгааны тайлан', max: 10 }, { name: 'Танилцуулга', max: 5 }];

  // Secretary state
  const [secretarySubmitting, setSecretarySubmitting] = useState(false);
  const [secretaryDone, setSecretaryDone] = useState(false);
  const [secretaryError, setSecretaryError] = useState<string | null>(null);
  const [closingNote, setClosingNote] = useState("");

  // HEAD reviewer assignment state
  const [committeeMembers, setCommitteeMembers] = useState<Array<{ id: string; teacherId: string; role: string }>>([]);
  const [reviewerAssignments, setReviewerAssignments] = useState<ReviewerAssignment[]>([]);
  const [assigningReviewer, setAssigningReviewer] = useState<Record<string, boolean>>({});
  const [teacherNameMap, setTeacherNameMap] = useState<Record<string, string>>({});

  // Reviewer upload state
  const [reviewUploadStudentId, setReviewUploadStudentId] = useState<string | null>(null);
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const [reviewScore, setReviewScore] = useState<string>("");
  const [reviewUploadStatus, setReviewUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [reviewUploadError, setReviewUploadError] = useState<string | null>(null);
  const [uploadedReviews, setUploadedReviews] = useState<ReviewDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Final grade confirmation state (HEAD + FINAL_DEFENSE)
  const [allSessions, setAllSessions] = useState<DefenseSession[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<Record<string, SecretarySubmission[]>>({});
  const [studentGrades, setStudentGrades] = useState<Record<string, DefenseGrade[]>>({});
  const [confirmState, setConfirmState] = useState<Record<string, {
    headNotes: string; submitting: boolean; done: boolean; error: string | null;
  }>>({});

  // Student thesis-report viewer (Харах button)
  const [viewReportsStudent, setViewReportsStudent] = useState<DisplayStudent | null>(null);
  const [viewReportsFiles, setViewReportsFiles] = useState<ReportFile[]>([]);
  const [viewReportsActiveId, setViewReportsActiveId] = useState<string | null>(null);
  const [viewReportsLoading, setViewReportsLoading] = useState(false);
  const [viewReportsError, setViewReportsError] = useState<string | null>(null);

  // Existing committee grades by this teacher — so re-opening shows prior score
  const [committeeGrades, setCommitteeGrades] = useState<Record<string, number>>({});

  // SECRETARY: all committee grades for this session (to compute averages / show table)
  const [sessionGrades, setSessionGrades] = useState<Array<{
    studentId: string; evaluatorId: string; evaluatorRole: string;
    points: number; maxPoints: number; isSubmitted?: boolean;
  }>>([]);
  const [sessionSubmissions, setSessionSubmissions] = useState<SecretarySubmission[]>([]);
  const [sendAvgStatus, setSendAvgStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});
  const [sendAvgError, setSendAvgError] = useState<Record<string, string>>({});

  const getCommitteeGraders = () => {
    const byEvaluator = new Map<string, { id: string; teacherId: string; role: string }>();
    committeeMembers
      .filter(m => COMMITTEE_GRADER_ROLES.has(m.role))
      .forEach(m => byEvaluator.set(m.teacherId, m));

    sessionGrades
      .filter(g => g.isSubmitted && COMMITTEE_GRADER_ROLES.has(g.evaluatorRole))
      .forEach(g => {
        if (!byEvaluator.has(g.evaluatorId)) {
          byEvaluator.set(g.evaluatorId, {
            id: `grade-${g.evaluatorId}`,
            teacherId: g.evaluatorId,
            role: g.evaluatorRole,
          });
        }
      });

    return Array.from(byEvaluator.values());
  };

  const openStudentReports = async (student: DisplayStudent) => {
    setViewReportsStudent(student);
    setViewReportsLoading(true);
    setViewReportsError(null);
    setViewReportsFiles([]);
    setViewReportsActiveId(null);
    try {
      const reportsRes = await thesisService.getReports({ studentId: student.studentId });
      const reports = reportsRes.data || [];
      if (reports.length === 0) {
        setViewReportsError('Энэ оюутан тайлан илгээгээгүй байна.');
        return;
      }
      const filesLists = await Promise.all(
        reports.map(r => thesisService.getReportFiles(r.id).then(r2 => r2.data).catch(() => []))
      );
      const allFiles = filesLists.flat();
      if (allFiles.length === 0) {
        setViewReportsError('Тайланд файл хавсаргагдаагүй байна.');
        return;
      }
      setViewReportsFiles(allFiles);
      setViewReportsActiveId(allFiles[0].id);
    } catch {
      setViewReportsError('Тайланг ачаалж чадсангүй.');
    } finally {
      setViewReportsLoading(false);
    }
  };

  const closeStudentReports = () => {
    setViewReportsStudent(null);
    setViewReportsFiles([]);
    setViewReportsActiveId(null);
    setViewReportsError(null);
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
  const gradingScheme = stageType ? (GRADING_SCHEMES[stageType] || null) : null;

  // Reviewer's 5pt "Шүүмж" score is captured upfront with the review document
  // upload during PRE_DEFENSE, so blind grading at FINAL_DEFENSE is the same
  // 35pt scheme for every committee member (reviewer included).
  const getEffectiveScheme = (_studentId: string | null) => gradingScheme;

  const user = getStoredUser();
  const teacherId = user?.userId || user?.username || '';

  useEffect(() => {
    if (committeeId && activeTab === "evaluations" && evalStudentId === null) {
      setActiveTab("roster");
    }
  }, [committeeId, activeTab, evalStudentId]);

  // Load main data
  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, usersRes, reportsRes, reqRes, finalGradesRes] = await Promise.all([
          planService.getPlans({ supervisorId: teacherId }),
          userService.getStudents(),
          thesisService.getReports({}),
          topicService.getTopicRequests({ status: 'APPROVED' }).catch(() => ({ data: [] })),
          evaluationService.getFinalGrades().catch(() => ({ data: [] as any[] })),
        ]);
        const plans: Plan[] = plansRes.data;
        const users: UserRecord[] = usersRes.data;
        const userMap: Record<string, string> = {};
        const userCodeMap: Record<string, string> = {};
        users.forEach(u => {
          if (u.username) userMap[u.username] = u.displayName;
          userMap[u.id] = u.displayName;
          const code = u.sisId || u.studentId || u.username || '';
          if (code) {
            userCodeMap[u.id] = code;
            if (u.username) userCodeMap[u.username] = code;
          }
        });
        const codeFor = (id: string) => userCodeMap[id] || (isUuid(id) ? '' : id);
        setStudentNameMap(userMap);
        // Set of studentIds with a confirmed final grade — those are 100%
        // regardless of plan.status (which may not transition to a "done" value).
        const gradedStudentIds = new Set(
          (finalGradesRes.data || []).map((g: any) => g.studentId).filter(Boolean)
        );
        const planStudentIds = new Set(plans.map(p => p.studentId));
        // Students from topic requests approved by this teacher (no plan yet).
        // The backend's mapRequestRow exposes the supervisor as `respondedById`
        // (camelCase of responded_by_id) — that's what we filter on.
        const approvedRequests: any[] = (reqRes.data || []).filter(
          (r: any) =>
            r.status === 'APPROVED' &&
            r.respondedById === teacherId &&
            !planStudentIds.has(r.requestedById)
        );
        const fromRequests: DisplayStudent[] = approvedRequests.map((r: any) => ({
          id: r.requestedById,
          name: resolveName(r.requestedById, userMap, 'Тодорхойгүй оюутан'),
          thesis: 'Гарчиггүй',
          stage: gradedStudentIds.has(r.requestedById) ? 'Дүн гарсан' : 'Сэдэв батлагдсан',
          status: 'APPROVED',
          progress: gradedStudentIds.has(r.requestedById) ? 100 : 5,
          studentId: r.requestedById,
          sisId: codeFor(r.requestedById),
        }));
        const students: DisplayStudent[] = [
          ...plans.map(p => ({
            id: p.studentId,
            name: resolveName(p.studentId, userMap, 'Тодорхойгүй оюутан'),
            thesis: p.title || 'Гарчиггүй',
            stage: gradedStudentIds.has(p.studentId) ? 'Дүн гарсан' : stageFromStatus(p.status),
            status: p.status,
            progress: gradedStudentIds.has(p.studentId) ? 100 : progressFromStatus(p.status),
            studentId: p.studentId,
            sisId: codeFor(p.studentId),
          })),
          ...fromRequests,
        ];
        setAssignedStudents(students);
        const myStudentIds = new Set(students.map(s => s.studentId));
        setSubmittedReports(reportsRes.data.filter(r => r.status === 'SUBMITTED' && myStudentIds.has(r.studentId)));

        // Load existing PROGRESS_1 session for this supervisor
        workflowService.getDefenseSessions({ supervisorId: teacherId })
          .then(r => {
            const s = r.data.find(x => x.stageType === 'PROGRESS_1');
            if (s) {
              setProgress1Session(s);
              setScheduleForm({
                scheduledDate: s.scheduledDate ? s.scheduledDate.slice(0, 16) : '',
                location: s.location || '',
                notes: s.notes || '',
              });
              // Load existing grades for this session
              evaluationService.getDefenseGrades({ defenseSessionId: s.id })
                .then(gr => {
                  const map: Record<string, number> = {};
                  gr.data.forEach((g: any) => { map[g.studentId] = Number(g.points); });
                  setP1ExistingGrades(map);
                }).catch(() => {});
            }
          }).catch(() => {});

        if (committeeId) {
          const cmtRes = await committeeService.getStudents(committeeId).catch(() => ({ data: [] }));
          const cmtStudentIds: string[] = (cmtRes.data as any[]).map((s: any) => s.studentId || s.id);
          // Fetch thesis IDs for committee students
          const thesisMap: Record<string, { id?: string; title?: string }> = {};
          const committeePlanTitleMap: Record<string, string> = {};
          await Promise.all(cmtStudentIds.map(async sid => {
            try {
              const [thesisRes, planRes] = await Promise.all([
                thesisService.getThesisByStudent(sid),
                planService.getPlans({ studentId: sid }).catch(() => ({ data: [] as Plan[] })),
              ]);
              const thesis = thesisRes.data as any;
              if (thesis?.id || thesis?.title) {
                thesisMap[sid] = { id: thesis?.id, title: thesis?.title };
              }
              const ownPlan = (planRes.data || [])[0];
              if (ownPlan?.title) committeePlanTitleMap[sid] = ownPlan.title;
            } catch {}
          }));
          const cmtDisplayStudents: DisplayStudent[] = cmtStudentIds.map(sid => ({
            id: sid,
            name: resolveName(sid, userMap, 'Тодорхойгүй оюутан'),
            thesis: thesisMap[sid]?.title || committeePlanTitleMap[sid] || 'Гарчиггүй',
            thesisId: thesisMap[sid]?.id,
            stage: students.find(s => s.studentId === sid)?.stage || '',
            status: students.find(s => s.studentId === sid)?.status || '',
            progress: students.find(s => s.studentId === sid)?.progress || 0,
            studentId: sid,
            sisId: students.find(s => s.studentId === sid)?.sisId || codeFor(sid),
          }));
          setCommitteeStudents(cmtDisplayStudents);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId, committeeId]);

  // Load defense session + teacher role when committeeId is present
  useEffect(() => {
    if (!committeeId || !teacherId) return;

    committeeService.getMyAssignments(teacherId)
      .then(res => {
        const assignment = res.data.find(a => a.committeeId === committeeId);
        if (assignment?.role) setTeacherRole(assignment.role.toUpperCase());
      })
      .catch(() => {});

    // Reflect committee close-state so button shows "Хаагдсан" after reload.
    committeeService.getById(committeeId)
      .then(res => setSecretaryDone(res.data?.status === 'CLOSED'))
      .catch(() => {});

    // Admin creates a single GLOBAL defense session per stage (committeeId='GLOBAL'),
    // so querying by committeeId won't find it. Query by stageType — backend
    // canonicalizes PRE_DEFENSE→PRELIMINARY and FINAL_DEFENSE→FINAL, so both spellings work.
    if (stageType) {
      workflowService.getDefenseSessions({ stageType })
        .then(res => {
          setAllSessions(res.data);
          const live = res.data.filter(s => !isClosedStatus(s.status));
          // Prefer this committee's own session even if it is PENDING/SCHEDULED.
          // External experts grade against that exact session; falling back to
          // the first ACTIVE session can accidentally read another committee.
          const session =
            live.find(s => s.committeeId === committeeId)
            || live.find(s => s.committeeId === 'GLOBAL')
            || live.find(s => s.status === 'OPEN' || s.status === 'ACTIVE')
            || live[0];
          if (session) {
            setDefenseSessionId(session.id);
            // Reviewer assignment is made once at PRE_DEFENSE and persists for
            // the committee's lifetime, so query by committeeId — not session.
            committeeService.getReviewerAssignments({ committeeId })
              .then(r => setReviewerAssignments(r.data))
              .catch(() => {});
            evaluationService.getReviewDocuments({ defenseSessionId: session.id })
              .then(r => setUploadedReviews(r.data))
              .catch(() => {});
            evaluationService.getDefenseGrades({ defenseSessionId: session.id, evaluatorId: teacherId })
              .then(r => {
                const map: Record<string, number> = {};
                (r.data || []).forEach((g: any) => {
                  if (g.evaluatorId === teacherId) map[g.studentId] = Number(g.points);
                });
                setCommitteeGrades(map);
              })
              .catch(() => {});

            // Full grade table for this session (secretary view).
            // Backend returns all grades when only defenseSessionId is passed.
            evaluationService.getDefenseGrades({ defenseSessionId: session.id })
              .then(r => setSessionGrades((r.data as any[]).map(g => ({
                studentId: g.studentId,
                evaluatorId: g.evaluatorId,
                evaluatorRole: g.evaluatorRole,
                points: Number(g.points),
                maxPoints: Number(g.maxPoints),
                isSubmitted: g.isSubmitted,
              }))))
              .catch(() => {});

            evaluationService.getSessionSubmissions(session.id)
              .then(r => setSessionSubmissions(r.data || []))
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    // Load all committee members (for HEAD to assign reviewers)
    committeeService.getMembers(committeeId)
      .then(res => setCommitteeMembers(res.data as any))
      .catch(() => {});

    // Resolve teacher display names for the reviewer picker.
    Promise.all([
      userService.getTeachers().catch(() => ({ data: [] as UserRecord[] })),
      userService.getExternalExperts().catch(() => ({ data: [] as UserRecord[] })),
    ]).then(([tRes, eRes]) => {
      const map: Record<string, string> = {};
      [...tRes.data, ...eRes.data].forEach(u => {
        map[u.id] = u.displayName;
        if (u.username) map[u.username] = u.displayName;
      });
      setTeacherNameMap(map);
    });
  }, [committeeId, teacherId, stageType]);

  // Load all-stage submissions for HEAD final confirmation
  useEffect(() => {
    if (teacherRole !== 'HEAD' || stageType !== 'FINAL_DEFENSE' || committeeStudents.length === 0) return;
    Promise.all(
      committeeStudents.map(s =>
        evaluationService.getSecretarySubmissions(s.studentId)
          .then(r => [s.studentId, r.data] as [string, SecretarySubmission[]])
      )
    ).then(results => {
      const map: Record<string, SecretarySubmission[]> = {};
      results.forEach(([sid, subs]) => { map[sid] = subs; });
      setStudentSubmissions(map);
    });

    Promise.all(
      committeeStudents.map(s =>
        evaluationService.getDefenseGrades({ studentId: s.studentId })
          .then(r => [s.studentId, r.data] as [string, DefenseGrade[]])
      )
    ).then(results => {
      const map: Record<string, DefenseGrade[]> = {};
      results.forEach(([sid, gs]) => { map[sid] = gs; });
      setStudentGrades(map);
    });

    // Reviewer scores were captured upfront on PRE_DEFENSE upload; load them
    // by student so HEAD's final-grade confirmation has a value to read.
    Promise.all(
      committeeStudents.map(s =>
        evaluationService.getReviewDocuments({ studentId: s.studentId })
          .then(r => r.data)
          .catch(() => [] as ReviewDocument[])
      )
    ).then(lists => {
      const flat = lists.flat();
      setUploadedReviews(prev => {
        const byId = new Map(prev.map(d => [d.id, d]));
        flat.forEach(d => byId.set(d.id, d));
        return Array.from(byId.values());
      });
    });

    // HEAD needs sessions across all 4 stages to map submissions → stageType.
    // The session-loader above only fetches the current stageType.
    Promise.all([
      workflowService.getDefenseSessions({ stageType: 'PROGRESS_1' }),
      workflowService.getDefenseSessions({ stageType: 'PROGRESS_2' }),
      workflowService.getDefenseSessions({ stageType: 'PRE_DEFENSE' }),
      workflowService.getDefenseSessions({ stageType: 'FINAL_DEFENSE' }),
    ]).then(rs => {
      const merged = rs.flatMap(r => r.data);
      setAllSessions(prev => {
        const byId = new Map(prev.map(s => [s.id, s]));
        merged.forEach(s => byId.set(s.id, s));
        return Array.from(byId.values());
      });
    }).catch(() => {});
  }, [teacherRole, stageType, committeeStudents]);

  const handleReviewAction = (action: "revision" | "approve") => {
    if (!reviewReportId) return;
    const decision = action === "approve" ? "ACCEPTED" : "REVISION_REQUIRED";
    thesisService.reviewReport(reviewReportId, teacherId, decision, commentInput || undefined)
      .then(() => {
        setReviewStatus("success");
        setSubmittedReports(prev => prev.filter(r => r.id !== reviewReportId));
        setTimeout(() => { setReviewStatus("idle"); setReviewReportId(null); setCommentInput(""); }, 2000);
      })
      .catch(() => { setReviewStatus("error"); setTimeout(() => setReviewStatus("idle"), 2000); });
  };

  const handleSubmitEvaluation = async () => {
    if (!evalStudentId || !gradingScheme) return;

    const student = rosterStudents.find(s => s.id === evalStudentId);
    const thesisId = student?.thesisId;
    const scheme = getEffectiveScheme(evalStudentId) || gradingScheme;

    if (!defenseSessionId) {
      setEvalError("Идэвхтэй хамгаалалтын сесс олдсонгүй. Admin сессийг нээсэн эсэхийг шалгана уу.");
      return;
    }
    if (!thesisId) {
      setEvalError("Оюутны дипломын ажил олдсонгүй.");
      return;
    }

    setEvalStatus("loading");
    setEvalError(null);

    try {
      const saveRes = await evaluationService.saveGrade({
        defenseSessionId,
        thesisId,
        studentId: evalStudentId,
        evaluatorId: teacherId,
        evaluatorRole: teacherRole,
        points: totalScore,
        maxPoints: scheme.total,
      });

      if (!saveRes.data?.id) {
        throw new Error('Серверийн хариу дээр id олдсонгүй — үнэлгээ хадгалагдаагүй.');
      }

      await evaluationService.submitGrade(saveRes.data.id);

      setCommitteeGrades(prev => ({ ...prev, [evalStudentId]: totalScore }));
      setEvalStatus("success");
      setTimeout(() => {
        setEvalStatus("idle");
        setEvalStudentId(null);
        setScores({});
      }, 2000);
    } catch (err: any) {
      console.error('[saveGrade]', err?.response?.status, err?.response?.data, err?.config?.url, err);
      const status = err?.response?.status;
      const raw = err?.response?.data;
      const msg = raw?.message || raw?.error || (typeof raw === 'string' ? raw : '') || err?.message || '';
      setEvalError(
        status
          ? `HTTP ${status}${msg ? ` — ${msg}` : ''}`
          : (msg || 'Үнэлгээ илгээж чадсангүй. Дахин оролдоно уу.')
      );
      setEvalStatus("error");
      setTimeout(() => setEvalStatus("idle"), 5000);
    }
  };

  // Secretary closes this committee only — the global defense session stays open
  // until admin (or the last committee) closes it. Other committees must be able
  // to keep grading even after this one is done.
  // Before closing, auto-publish average scores for every student who has been fully
  // graded but not yet submitted — otherwise students see no grades on their side.
  const handleCloseCommittee = async () => {
    if (!committeeId) return;
    if (!closingNote.trim()) {
      setSecretaryError("Тайлбараа бичнэ үү.");
      return;
    }
    setSecretarySubmitting(true);
    setSecretaryError(null);
    try {
      const graders = getCommitteeGraders();
      const already = new Set(sessionSubmissions.map(s => s.studentId));
      const toSend = graders.length === 0 ? [] : committeeStudents.filter(stu => {
        if (already.has(stu.studentId)) return false;
        const submittedCount = graders.reduce((n, m) =>
          n + (sessionGrades.some(g => g.studentId === stu.studentId && g.evaluatorId === m.teacherId && g.isSubmitted) ? 1 : 0),
        0);
        return submittedCount === graders.length;
      });
      if (defenseSessionId && toSend.length > 0) {
        const results = await Promise.all(toSend.map(stu =>
          evaluationService.sendAverageScore({
            defenseSessionId, committeeId, studentId: stu.studentId, secretaryId: teacherId,
          }).then(r => r.data).catch(() => null)
        ));
        const fresh = results.filter((x): x is SecretarySubmission => x != null);
        if (fresh.length > 0) {
          setSessionSubmissions(prev => {
            const keep = prev.filter(p => !fresh.some(f => f.studentId === p.studentId));
            return [...keep, ...fresh];
          });
        }
      }
      await committeeService.closeCommittee(committeeId, closingNote.trim());
      setSecretaryDone(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      setSecretaryError(typeof msg === 'string' && msg ? msg : 'Комиссын ажлыг дуусгаж чадсангүй.');
    } finally {
      setSecretarySubmitting(false);
    }
  };

  const handleExportCommitteeGrades = () => {
    const graders = getCommitteeGraders();
    const roleLabel = (r: string) =>
      r === 'HEAD' ? 'Ахлах' :
      r === 'SECRETARY' ? 'Нарийн бичиг' :
      r === 'EXTERNAL_EXPERT' ? 'Зочин шүүгч' : 'Гишүүн';
    const headers = [
      'Оюутан', 'Оюутны ID',
      ...graders.map(m => `${teacherNameMap[m.teacherId] || m.teacherId} (${roleLabel(m.role)})`),
      'Дундаж', 'Хамгийн их', 'Төлөв', 'Илгээсэн огноо',
    ];
    const rows = committeeStudents.map(stu => {
      const displayStudentId = stu.sisId || (isUuid(stu.studentId) ? '' : stu.studentId);
      const cells: string[] = [stu.name || '', displayStudentId];
      let sum = 0, count = 0, maxTotal = 0;
      graders.forEach(m => {
        const g = sessionGrades.find(x => x.studentId === stu.studentId && x.evaluatorId === m.teacherId && x.isSubmitted);
        if (g) { cells.push(`${g.points}/${g.maxPoints}`); sum += g.points; maxTotal = g.maxPoints; count++; }
        else cells.push('—');
      });
      const avg = count > 0 ? (sum / count) : null;
      const sub = sessionSubmissions.find(s => s.studentId === stu.studentId);
      cells.push(avg !== null ? avg.toFixed(2) : '—');
      cells.push(maxTotal ? String(maxTotal) : '—');
      cells.push(sub ? 'Илгээсэн' : (count === graders.length && graders.length > 0 ? 'Бэлэн' : `${count}/${graders.length}`));
      cells.push(sub?.submittedAt ? fmtDateTime(sub.submittedAt) : '—');
      return cells;
    });
    const escape = (v: string) => {
      const s = String(v ?? '');
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = '﻿' + [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `committee-grades-${committeeId || 'session'}-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendAverage = async (studentId: string) => {
    if (!defenseSessionId || !committeeId) return;
    setSendAvgStatus(prev => ({ ...prev, [studentId]: 'loading' }));
    setSendAvgError(prev => ({ ...prev, [studentId]: '' }));
    try {
      const res = await evaluationService.sendAverageScore({
        defenseSessionId, committeeId, studentId, secretaryId: teacherId,
      });
      setSessionSubmissions(prev => [...prev.filter(s => s.studentId !== studentId), res.data]);
      setSendAvgStatus(prev => ({ ...prev, [studentId]: 'success' }));
    } catch (err: any) {
      const status = err?.response?.status;
      const raw = err?.response?.data;
      const msg = raw?.message || raw?.error || (typeof raw === 'string' ? raw : '') || err?.message || '';
      setSendAvgError(prev => ({ ...prev, [studentId]: status ? `HTTP ${status}${msg ? ` — ${msg}` : ''}` : (msg || 'Илгээж чадсангүй.') }));
      setSendAvgStatus(prev => ({ ...prev, [studentId]: 'error' }));
    }
  };

  const handleReviewUpload = async () => {
    if (!reviewUploadStudentId || !reviewFile || !defenseSessionId) return;
    const score = Number(reviewScore);
    if (!Number.isFinite(score) || score < 0 || score > 5) {
      setReviewUploadError("Шүүмжийн оноо 0–5 хооронд байх ёстой.");
      setReviewUploadStatus("error");
      return;
    }
    const student = rosterStudents.find(s => s.id === reviewUploadStudentId);
    const thesisId = student?.thesisId || '';

    setReviewUploadStatus("uploading");
    setReviewUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', reviewFile);
      formData.append('defenseSessionId', defenseSessionId);
      formData.append('thesisId', thesisId);
      formData.append('studentId', reviewUploadStudentId);
      formData.append('reviewerId', teacherId);
      formData.append('reviewerScore', String(score));
      await evaluationService.uploadReviewDocument(formData);
      // Refresh uploaded list so the row flips to "sent" immediately
      const refreshed = await evaluationService.getReviewDocuments({ defenseSessionId });
      setUploadedReviews(refreshed.data);
      setReviewUploadStatus("success");
      setTimeout(() => {
        setReviewUploadStatus("idle");
        setReviewUploadStudentId(null);
        setReviewFile(null);
        setReviewScore("");
      }, 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || '';
      setReviewUploadError(typeof msg === 'string' && msg ? msg : 'Байршуулахад алдаа гарлаа.');
      setReviewUploadStatus("error");
      setTimeout(() => setReviewUploadStatus("idle"), 3000);
    }
  };

  const handleAssignReviewer = async (studentId: string, reviewerId: string) => {
    if (!defenseSessionId || !committeeId) return;
    setAssigningReviewer(prev => ({ ...prev, [studentId]: true }));
    try {
      const res = await committeeService.assignReviewer({
        committeeId,
        defenseSessionId,
        studentId,
        reviewerId,
        assignedBy: teacherId,
      });
      setReviewerAssignments(prev => [...prev.filter(a => a.studentId !== studentId), res.data]);
    } catch {
      // ignore duplicate assignment error
    } finally {
      setAssigningReviewer(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; tone: "positive" | "warning" | "negative" | "neutral" }> = {
      ACTIVE:    { label: "Хийгдэж байна",    tone: "neutral" },
      SUBMITTED: { label: "Хянагдаж байна",   tone: "warning" },
      DRAFT:     { label: "Ноорог",           tone: "neutral" },
      APPROVED:  { label: "Батлагдсан",       tone: "positive" },
    };
    const cfg = map[status] || { label: status, tone: "neutral" as const };
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 whitespace-nowrap">
        <span className={`w-1.5 h-1.5 rounded-full ${toneDot[cfg.tone]}`} />
        {cfg.label}
      </span>
    );
  };

  const rosterStudents = committeeId ? committeeStudents : assignedStudents;
  const studentCode = (student: DisplayStudent) => student.sisId || (isUuid(student.studentId) ? '' : student.studentId);
  const filteredStudents = rosterStudents.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedReport = submittedReports.find(r => r.id === reviewReportId);

  const isSecretary = teacherRole === 'SECRETARY';
  const isHead = teacherRole === 'HEAD';
  // Reviewer's job (document + 5pt grade) must finish during PRE_DEFENSE,
  // before the FINAL_DEFENSE session opens.
  const canUploadReview = stageType === 'PRE_DEFENSE';
  const canAssignReviewer = isHead && stageType === 'PRE_DEFENSE';
  const canConfirmGrade = isHead && stageType === 'FINAL_DEFENSE';

  // Backend canonicalizes PRE_DEFENSE→PRELIMINARY and FINAL_DEFENSE→FINAL in DB.
  const canonicalStage = (s: string) =>
    s === 'PRE_DEFENSE' ? 'PRELIMINARY' : s === 'FINAL_DEFENSE' ? 'FINAL' : s;

  const getStageScore = (studentId: string, stage: string): number | undefined => {
    const target = canonicalStage(stage);
    const subs = studentSubmissions[studentId] || [];
    for (const sub of subs) {
      const sess = allSessions.find(s => s.id === sub.defenseSessionId);
      if (sess && canonicalStage(sess.stageType) === target) return sub.averageScore;
    }
    const grades = studentGrades[studentId] || [];
    const stageSessionIds = allSessions
      .filter(s => canonicalStage(s.stageType) === target)
      .map(s => s.id);
    const matching = grades.filter(g =>
      stageSessionIds.includes(g.defenseSessionId) && g.isSubmitted && g.evaluatorRole !== "REVIEWER"
    );
    if (matching.length === 0) return undefined;
    return matching.reduce((sum, g) => sum + g.points, 0) / matching.length;
  };

  const getReviewerScore = (studentId: string): number | undefined => {
    // Reviewer score now lives on the uploaded review_document (captured at
    // upload time during PRE_DEFENSE). Fallback to legacy REVIEWER-role grade
    // for older sessions that pre-date this flow.
    const doc = uploadedReviews.find(r => r.studentId === studentId && r.reviewerScore != null);
    if (doc && doc.reviewerScore != null) return Number(doc.reviewerScore);
    const grades = studentGrades[studentId] || [];
    const legacy = grades.find(g => g.isSubmitted && g.evaluatorRole === "REVIEWER");
    return legacy?.points;
  };

  // NUM grading scale: A+, A, B+, B, C+, C, D, F.
  const letterFromScore = (total: number): string => {
    if (total >= 95) return 'A+';
    if (total >= 90) return 'A';
    if (total >= 85) return 'B+';
    if (total >= 80) return 'B';
    if (total >= 75) return 'C+';
    if (total >= 70) return 'C';
    if (total >= 60) return 'D';
    return 'F';
  };

  const handleConfirmGrade = async (student: DisplayStudent) => {
    const sid = student.studentId;
    if (!committeeId) return;
    const p1 = getStageScore(sid, 'PROGRESS_1');
    const p2 = getStageScore(sid, 'PROGRESS_2');
    const pre = getStageScore(sid, 'PRE_DEFENSE');
    const fin = getStageScore(sid, 'FINAL_DEFENSE');
    const rev = getReviewerScore(sid);
    const total = (p1 ?? 0) + (p2 ?? 0) + (pre ?? 0) + (fin ?? 0) + (rev ?? 0);
    const state = confirmState[sid] || { headNotes: '', submitting: false, done: false, error: null };

    setConfirmState(prev => ({ ...prev, [sid]: { ...state, submitting: true, error: null } }));
    try {
      await evaluationService.confirmFinalGrade({
        studentId: sid,
        thesisId: student.thesisId || '',
        committeeId,
        confirmedBy: teacherId,
        progress1Score: p1,
        progress2Score: p2,
        preliminaryScore: pre,
        finalCommitteeScore: fin,
        reviewerScore: rev,
        gradeLetter: letterFromScore(total),
        passFail: total >= 50 ? 'PASS' : 'FAIL',
        headNotes: state.headNotes || undefined,
      });
      setConfirmState(prev => ({ ...prev, [sid]: { ...state, submitting: false, done: true, error: null } }));
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message || (err as any)?.response?.data || '';
      setConfirmState(prev => ({
        ...prev,
        [sid]: { ...state, submitting: false, done: false, error: typeof msg === 'string' && msg ? msg : 'Баталгаажуулахад алдаа гарлаа.' },
      }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {committeeId && (
        <div className="flex flex-wrap gap-2 items-center">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Буцах
          </Button>
        </div>
      )}

      {/* Hero card — student-style status pill + title + count tile */}
      <Card>
        <div className="h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md">
          <div className="h-full bg-accent transition-all duration-700" style={{ width: `${committeeId && committeeStudents.length > 0 ? Math.round((Object.keys(committeeGrades).length / committeeStudents.length) * 100) : (rosterStudents.length > 0 ? 100 : 0)}%` }} />
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                  <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                  {committeeId ? "Комиссын үнэлгээ идэвхтэй" : "Удирдсан оюутны жагсаалт"}
                </span>
                {committeeId && teacherRole && (
                  <span className="text-[11px] uppercase tracking-wider font-medium text-accent bg-accent-softer rounded-sm px-2 py-0.5">
                    {teacherRole}
                  </span>
                )}
                {committeeId && gradingScheme && (
                  <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1 tabular-nums">
                    {gradingScheme.total} оноо
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-ink-900 tracking-tight leading-tight">
                {committeeId ? (gradingScheme?.label || "Комиссын оюутнууд") : "Хуваарилагдсан оюутнууд"}
              </h2>
              <p className="text-sm text-ink-500 mt-1">
                {committeeId
                  ? "Комиссын гишүүний хувьд үнэлгээ өгч, шаардлагатай үйлдлээ хийнэ үү."
                  : "Суралцагчдын явцыг хянах, тайланг шалгах, үнэлгээгээ илгээх боломжтой."}
              </p>
            </div>
            <div className="text-right shrink-0 border border-border rounded-md p-3">
              <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{rosterStudents.length}</div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1">Оюутан</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="roster" >
            Оюутны жагсаалт
          </TabsTrigger>
          {!committeeId && (
            <TabsTrigger value="reports" >
              <span className="flex items-center gap-2">
                Илгээсэн тайлангууд
                {submittedReports.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-ink-900 text-white tabular-nums">{submittedReports.length}</span>
                )}
              </span>
            </TabsTrigger>
          )}
          {!committeeId && (
            <TabsTrigger value="schedule" >
              Явц 1 хуваарь
            </TabsTrigger>
          )}
          <TabsTrigger value="evaluations" >
            Үнэлгээний маягт {committeeId && gradingScheme && <span className="ml-1 text-[10px] text-ink-400 tabular-nums">({gradingScheme.total} оноо)</span>}
          </TabsTrigger>
          {isSecretary && committeeId && (
            <TabsTrigger value="secretary" >
              Дундаж оноо илгээх
            </TabsTrigger>
          )}
          {canUploadReview && committeeId && (
            <TabsTrigger value="reviewer" >
              Шүүмж баримт
            </TabsTrigger>
          )}
          {canAssignReviewer && committeeId && (
            <TabsTrigger value="head" >
              Шүүмжлэгч томилох
            </TabsTrigger>
          )}
          {canConfirmGrade && committeeId && (
            <TabsTrigger value="confirm" >
              Дүн баталгаажуулах
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── Roster tab ── */}
        <TabsContent value="roster" className="mt-6">
          {loading ? (
            <div className="text-center py-12 text-ink-400 text-sm">Ачааллаж байна...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-ink-400 text-sm bg-surface-muted rounded-md border border-border">
              {committeeId ? "Комиссын оюутан олдсонгүй." : "Оюутан олдсонгүй."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map(student => (
                <Card key={student.id} className="hover:border-accent transition-colors overflow-hidden">
                  <div className="h-0.5 w-full bg-border-strong">
                    <div className="h-full bg-accent transition-all" style={{ width: `${student.progress}%` }} />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border border-border-strong shrink-0">
                        <AvatarFallback className="text-sm font-medium">
                          {(student.name || '??').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-ink-900 tracking-tight truncate">{student.name}</h3>
                            {studentCode(student) && (
                              <p className="text-[10px] text-ink-400 truncate mt-0.5">{studentCode(student)}</p>
                            )}
                          </div>
                          {getStatusBadge(student.status)}
                        </div>
                        <p className="text-xs text-ink-500 line-clamp-2 mb-3 min-h-[2.5rem]">{student.thesis}</p>
                        <div className="flex items-center justify-between text-xs mb-4 rounded-md border border-border bg-surface-muted px-2.5 py-2">
                          <span className="text-ink-700">Шат: <span className="text-ink-900 font-medium">{student.stage}</span></span>
                          <span className="text-ink-500 tabular-nums">{student.progress}%</span>
                        </div>
                        {committeeId && committeeGrades[student.studentId] !== undefined && gradingScheme && (
                          <div className="mb-3 inline-flex items-center gap-1.5 text-xs text-ink-700">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                            <span>Таны үнэлгээ: <span className="font-medium text-ink-900 tabular-nums">{committeeGrades[student.studentId]}/{gradingScheme.total}</span></span>
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => openStudentReports(student)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Харах
                          </Button>
                          {!committeeId && (
                            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setActiveTab("reports")}>
                              <FileText className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Хянах
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => {
                              if (committeeId) {
                                setActiveTab("evaluations");
                                setEvalStudentId(student.id);
                              } else {
                                setActiveTab("evaluations");
                                setP1GradeStudentId(student.id);
                                setP1Scores({});
                                setP1GradeError(null);
                              }
                            }}
                          >
                            <Award className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} />
                            {committeeId
                              ? (committeeGrades[student.studentId] !== undefined ? 'Засах' : 'Үнэлэх')
                              : (p1ExistingGrades[student.studentId] !== undefined ? 'Засах' : 'Үнэлэх')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Reports tab ── */}
        {!committeeId && (
          <TabsContent value="reports" className="mt-6">
            {reviewReportId === null ? (
              <Card>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle>Тайлан хянах дараалал</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-6 text-center text-ink-400 text-sm">Ачааллаж байна...</div>
                  ) : submittedReports.length === 0 ? (
                    <div className="p-6 text-center text-ink-400 text-sm">Хянах тайлан байхгүй байна.</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {submittedReports.map(report => (
                        <div key={report.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-muted transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 border border-border bg-accent-softer text-accent">
                              <FileText className="w-5 h-5" strokeWidth={1.6} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-ink-900 tracking-tight">{resolveName(report.studentId, studentNameMap, 'Тодорхойгүй оюутан')}</span>
                                <span className="text-[10px] text-ink-500 border border-border rounded-sm uppercase tracking-wide px-1.5 py-0.5">
                                  {report.reportType}
                                </span>
                              </div>
                              <p className="text-xs text-ink-600 flex items-center gap-1.5">
                                <FileDown className="w-3.5 h-3.5" strokeWidth={1.6} /> Дипломын тайлан
                              </p>
                              <p className="text-xs text-ink-400 mt-1 flex items-center gap-1 tabular-nums">
                                <Clock className="w-3 h-3" strokeWidth={1.6} /> Илгээсэн: {fmtDateTime(report.submittedAt) || 'Огноогүй'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                            <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                              Хянах шаардлагатай
                            </span>
                            <Button size="sm" onClick={() => {
                              setReviewReportId(report.id);
                              setReviewFiles([]);
                              setActiveFileId(null);
                              thesisService.getReportFiles(report.id).then(r => {
                                setReviewFiles(r.data);
                                if (r.data.length > 0) setActiveFileId(r.data[0].id);
                              }).catch(() => {});
                            }}>
                              Хянах нээх <ChevronRight className="w-3.5 h-3.5 ml-1" strokeWidth={1.6} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[800px]">
                <Card className="lg:col-span-2 overflow-hidden flex flex-col p-0">
                  {/* File tabs */}
                  {reviewFiles.length > 0 && (
                    <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-surface-muted overflow-x-auto shrink-0">
                      {reviewFiles.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setActiveFileId(f.id)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors shrink-0 ${
                            activeFileId === f.id
                              ? "bg-accent text-white"
                              : "bg-surface border border-border text-ink-700 hover:border-accent"
                          }`}
                        >
                          <FileText className="w-3 h-3" strokeWidth={1.6} />
                          {f.originalFilename.length > 24 ? f.originalFilename.slice(0, 22) + "…" : f.originalFilename}
                        </button>
                      ))}
                      {activeFileId && (
                        <a
                          href={`/api/thesis-reports/files/${activeFileId}/download`}
                          className="ml-auto shrink-0 flex items-center gap-1 text-xs text-ink-500 hover:text-accent px-2 py-1.5"
                        >
                          <FileDown className="w-3.5 h-3.5" strokeWidth={1.6} /> Татах
                        </a>
                      )}
                    </div>
                  )}
                  {/* Preview area */}
                  <div className="flex-1 bg-surface-sunken overflow-hidden">
                    {reviewFiles.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-ink-400 text-sm flex-col gap-2">
                        <FileText className="w-10 h-10 text-ink-200" strokeWidth={1.4} />
                        Хавсаргасан файл байхгүй байна.
                      </div>
                    ) : activeFileId ? (() => {
                      const af = reviewFiles.find(f => f.id === activeFileId);
                      const fn = af?.originalFilename?.toLowerCase() ?? '';
                      const mt = af?.mimeType?.toLowerCase() ?? '';
                      const previewable = mt.includes('pdf') || mt.includes('image/') || fn.endsWith('.pdf') || fn.endsWith('.png') || fn.endsWith('.jpg') || fn.endsWith('.jpeg');
                      return previewable ? (
                        <iframe
                          key={activeFileId}
                          src={`/api/thesis-reports/files/${activeFileId}/view`}
                          className="w-full h-full border-0"
                          title={af?.originalFilename}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-ink-500">
                          <FileText className="w-14 h-14 text-ink-200" strokeWidth={1.4} />
                          <p className="text-sm font-medium">Энэ файлыг шууд харах боломжгүй</p>
                          <a href={`/api/thesis-reports/files/${activeFileId}/download`}
                            className="flex items-center gap-2 bg-accent text-white text-[13px] px-4 py-1.5 rounded-md hover:bg-accent-hover">
                            <FileDown className="w-4 h-4" strokeWidth={1.6} /> Татаж авах
                          </a>
                        </div>
                      );
                    })() : null}
                  </div>
                </Card>
                <Card className="flex flex-col p-0">
                  <div className="p-4 border-b border-border">
                    <Button variant="ghost" size="sm" className="mb-3 -ml-2" onClick={() => { setReviewReportId(null); setCommentInput(""); setReviewStatus("idle"); setReviewFiles([]); setActiveFileId(null); }}>
                      <ChevronRight className="w-3.5 h-3.5 mr-1 rotate-180" strokeWidth={1.6} /> Дараалал руу буцах
                    </Button>
                    <h3 className="text-base font-semibold text-ink-900 tracking-tight">{selectedReport ? resolveName(selectedReport.studentId, studentNameMap, 'Тодорхойгүй оюутан') : ''}</h3>
                    <p className="text-xs text-ink-500 mb-2">{selectedReport?.reportType}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                      Хянах шаардлагатай
                    </span>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-muted">
                    {reviewStatus === "success" && (
                      <div className="border border-border bg-surface p-3 rounded-md flex items-center gap-2 text-sm text-ink-900">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                        Үйлдэл амжилттай бүртгэгдлээ!
                      </div>
                    )}
                    {reviewStatus === "error" && (
                      <div className="border border-border bg-surface p-3 rounded-md flex items-center gap-2 text-sm text-ink-900">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                        Алдаа гарлаа. Дахин оролдоно уу.
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-border space-y-3">
                    <RichTextEditor
                      value={commentInput}
                      onChange={setCommentInput}
                      placeholder="Санал хүсэлтээ бичнэ үү..."
                      minHeight={96}
                      ariaLabel="Тайлангийн санал хүсэлт"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReviewAction("revision")} disabled={reviewStatus !== "idle"}>
                        <ShieldAlert className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Засвар хүсэх
                      </Button>
                      <Button size="sm" onClick={() => handleReviewAction("approve")} disabled={reviewStatus !== "idle"}>
                        <FileCheck className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Зөвшөөрөх
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        )}

        {/* ── Evaluations tab ── */}
        <TabsContent value="evaluations" className="mt-6">
          {!committeeId ? (
            p1GradeStudentId ? (
              (() => {
                const selectedStudent = assignedStudents.find(s => s.id === p1GradeStudentId);
                const p1Total = Object.values(p1Scores).reduce((a, b) => a + b, 0);
                const completedCriteria = P1_CRITERIA.filter((_, idx) => p1Scores[idx] !== undefined && p1Scores[idx] !== null).length;
                const scorePct = Math.min(100, Math.round((p1Total / 15) * 100));
                const setCriterionScore = (idx: number, value: number) => {
                  const max = P1_CRITERIA[idx].max;
                  setP1Scores({ ...p1Scores, [idx]: Math.max(0, Math.min(max, value)) });
                };
                const submitP1Grade = async () => {
                  if (!progress1Session) return;
                  const thesisId = selectedStudent?.thesisId || p1GradeStudentId || '';
                  setP1GradeStatus('loading');
                  setP1GradeError(null);
                  try {
                    const res = await evaluationService.saveGrade({
                      defenseSessionId: progress1Session.id,
                      thesisId,
                      studentId: p1GradeStudentId!,
                      evaluatorId: teacherId,
                      evaluatorRole: 'SUPERVISOR',
                      points: p1Total,
                      maxPoints: 15,
                    });
                    if (!res.data?.id) throw new Error('Серверийн хариу дээр id олдсонгүй.');
                    await evaluationService.submitGrade(res.data.id);
                    setP1ExistingGrades(prev => ({ ...prev, [p1GradeStudentId!]: p1Total }));
                    setP1GradeStatus('success');
                    setTimeout(() => { setP1GradeStudentId(null); setP1Scores({}); setP1GradeStatus('idle'); }, 2000);
                  } catch (err: any) {
                    const status = err?.response?.status;
                    const raw = err?.response?.data;
                    const msg = raw?.message || raw?.error || (typeof raw === 'string' ? raw : '') || err?.message || '';
                    setP1GradeError(status ? `HTTP ${status}${msg ? ` — ${msg}` : ''}` : (msg || 'Алдаа гарлаа.'));
                    setP1GradeStatus('error');
                    setTimeout(() => setP1GradeStatus('idle'), 5000);
                  }
                };
                return (
                  <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
                    <Card className="xl:sticky xl:top-4 overflow-hidden">
                      <div className="h-1 bg-accent" />
                      <CardContent className="p-5 space-y-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-0"
                          onClick={() => { setP1GradeStudentId(null); setP1Scores({}); setP1GradeError(null); }}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.6} />
                          Оюутны жагсаалт
                        </Button>
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 border border-border-strong shrink-0">
                            <AvatarFallback className="text-sm font-medium">
                              {(selectedStudent?.name || '??').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-ink-900 tracking-tight truncate">
                              {selectedStudent?.name || "Оюутан"}
                            </h3>
                            <p className="text-xs text-ink-500 line-clamp-2 mt-1">{selectedStudent?.thesis || "Дипломын сэдэв"}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] uppercase tracking-wider font-medium text-accent bg-accent-softer rounded-sm px-2 py-0.5">PROGRESS_1</span>
                            <span className="text-[11px] uppercase tracking-wider font-medium text-ink-600 bg-surface-muted border border-border rounded-sm px-2 py-0.5">Үүрэг: SUPERVISOR</span>
                          </div>
                          <p className="text-sm font-medium text-ink-900">Явц 1-ийн үнэлгээ</p>
                          <p className="text-xs text-ink-500">{completedCriteria}/{P1_CRITERIA.length} шалгуур бөглөгдсөн</p>
                        </div>
                        <div className="rounded-md border border-border bg-surface-muted p-4">
                          <div className="flex items-end justify-between gap-3">
                            <div>
                              <p className="text-xs text-ink-500 font-medium">Нийт оноо</p>
                              <div className="flex items-baseline gap-1.5 tabular-nums mt-1">
                                <span className="text-4xl font-semibold text-accent">{p1Total}</span>
                                <span className="text-ink-500 text-sm">/ 15</span>
                              </div>
                            </div>
                            <span className="text-xs text-ink-500 tabular-nums">{scorePct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-border overflow-hidden mt-3">
                            <div className="h-full bg-accent transition-all" style={{ width: `${scorePct}%` }} />
                          </div>
                        </div>
                        {p1GradeError && (
                          <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm inline-flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                            {p1GradeError}
                          </div>
                        )}
                        {p1GradeStatus === "success" ? (
                          <div className="border border-border bg-surface text-ink-900 p-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                            Үнэлгээ амжилттай хадгалагдлаа!
                          </div>
                        ) : (
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={submitP1Grade}
                            disabled={!progress1Session || p1GradeStatus === "loading" || p1Total === 0}
                          >
                            {p1GradeStatus === "loading" ? "Илгээж байна..." : <><Send className="w-4 h-4 mr-2" strokeWidth={1.6} />Үнэлгээ илгээх</>}
                          </Button>
                        )}
                        {!progress1Session && (
                          <p className="text-xs text-ink-400">Эхлээд "Явц 1 хуваарь" таб дээр хуваарь үүсгэнэ үү.</p>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="text-base">Явц 1-ийн үнэлгээ</CardTitle>
                        <CardDescription>Шалгуур бүрийн оноог оруулаад нийт оноогоо шалгана уу.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 space-y-3">
                        {P1_CRITERIA.map((criterion, idx) => {
                          const value = p1Scores[idx];
                          const half = Math.floor(criterion.max / 2);
                          return (
                            <div key={idx} className="rounded-md border border-border bg-surface p-4 hover:border-border-strong transition-colors">
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent-softer text-xs font-semibold text-accent tabular-nums">
                                      {idx + 1}
                                    </span>
                                    <p className="text-sm font-semibold text-ink-900 tracking-tight">{criterion.name}</p>
                                  </div>
                                  <p className="text-xs text-ink-500 mt-1 ml-8 tabular-nums">Дээд оноо: {criterion.max}</p>
                                </div>
                                <div className="flex items-center gap-2 md:justify-end">
                                  <input
                                    type="number"
                                    min={0}
                                    max={criterion.max}
                                    step={1}
                                    className="h-11 w-24 border border-border-strong rounded-md px-3 text-center text-base font-semibold focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 bg-surface tabular-nums"
                                    value={value ?? ''}
                                    onChange={(e) => setCriterionScore(idx, Number(e.target.value) || 0)}
                                  />
                                  <span className="text-sm text-ink-500 tabular-nums">/ {criterion.max}</span>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2 pl-0 md:pl-8">
                                {[0, half, criterion.max].map(v => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => setCriterionScore(idx, v)}
                                    className={`h-7 rounded-md border px-2.5 text-xs font-medium transition-colors tabular-nums ${
                                      value === v
                                        ? "border-accent bg-accent-softer text-accent"
                                        : "border-border text-ink-600 hover:border-accent hover:text-accent"
                                    }`}
                                  >
                                    {v} оноо
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                );
              })()
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4">
                    <Users className="w-5 h-5 text-ink-400" strokeWidth={1.6} />
                  </div>
                  <h3 className="text-base font-semibold text-ink-900 tracking-tight">Үнэлэх оюутан сонгоно уу</h3>
                  <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto">
                    "Оюутны жагсаалт" хэсгээс оюутнаа сонгоод "Үнэлэх" товчийг дарна уу.
                  </p>
                </CardContent>
              </Card>
            )
          ) : !gradingScheme ? (
            <Card>
              <CardContent className="text-center py-16">
                <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4">
                  <Award className="w-5 h-5 text-ink-400" strokeWidth={1.6} />
                </div>
                <h3 className="text-base font-semibold text-ink-900 tracking-tight">Комиссоор нэвтрэнэ үү</h3>
                <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto">
                  Үнэлгээний маягтыг ашиглахын тулд "Комисс" хуудаснаас "Үнэлэх" товчийг дарна уу.
                </p>
              </CardContent>
            </Card>
          ) : evalStudentId === null && committeeId ? (
            <Card>
              <CardContent className="text-center py-16">
                <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4">
                  <Users className="w-5 h-5 text-ink-400" strokeWidth={1.6} />
                </div>
                <h3 className="text-base font-semibold text-ink-900 tracking-tight">Үнэлэх оюутан сонгоно уу</h3>
                <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto">
                  "Оюутны жагсаалт" табаас оюутнаа сонгоод "Үнэлэх" товчийг дарна уу.
                </p>
              </CardContent>
            </Card>
          ) : evalStudentId === null ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Award className="w-4 h-4 text-accent" strokeWidth={1.6} />
                    <h3 className="text-base font-semibold text-ink-900 tracking-tight">{gradingScheme.label}</h3>
                    <span className="text-[11px] uppercase tracking-wider font-medium text-accent bg-accent-softer rounded-sm px-2 py-0.5 tabular-nums">{gradingScheme.total} оноо</span>
                    {!defenseSessionId && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                        Идэвхтэй сесс олдсонгүй
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {gradingScheme.criteria.map((c, i) => (
                      <div key={i} className="border border-border rounded-md px-3 py-1.5 text-xs bg-surface">
                        <span className="text-ink-600">{c.name}:</span>
                        <span className="font-semibold text-accent ml-1.5 tabular-nums">{c.max}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(committeeId ? committeeStudents : assignedStudents).map(student => (
                  <Card key={student.id} className="hover:border-accent transition-colors cursor-pointer" onClick={() => setEvalStudentId(student.id)}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border-strong">
                        <AvatarFallback className="text-sm font-medium">
                          {(student.name || '??').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 tracking-tight truncate">{student.name}</p>
                        <p className="text-xs text-ink-500 truncate">{student.thesis}</p>
                      </div>
                      <Button size="sm" className="shrink-0">
                        <Award className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Үнэлэх
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (() => {
            const evalScheme = getEffectiveScheme(evalStudentId) || gradingScheme;
            const selectedStudent = rosterStudents.find(s => s.id === evalStudentId);
            const completedCriteria = evalScheme.criteria.filter((_, idx) => scores[idx] !== undefined && scores[idx] !== null).length;
            const scorePct = Math.min(100, Math.round((totalScore / evalScheme.total) * 100));
            const setCriterionScore = (idx: number, value: number) => {
              const max = evalScheme.criteria[idx].max;
              setScores({ ...scores, [idx]: Math.max(0, Math.min(max, value)) });
            };
            return (
            <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
              <Card className="xl:sticky xl:top-4 overflow-hidden">
                <div className="h-1 bg-accent" />
                <CardContent className="p-5 space-y-5">
                  {!committeeId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-0"
                      onClick={() => { setEvalStudentId(null); setScores({}); setEvalError(null); }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.6} />
                      Оюутны жагсаалт
                    </Button>
                  )}

                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border border-border-strong shrink-0">
                      <AvatarFallback className="text-sm font-medium">
                        {(selectedStudent?.name || '??').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-ink-900 tracking-tight truncate">
                        {selectedStudent?.name || "Оюутан"}
                      </h3>
                      <p className="text-xs text-ink-500 line-clamp-2 mt-1">{selectedStudent?.thesis || "Дипломын сэдэв"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {stageType && (
                        <span className="text-[11px] uppercase tracking-wider font-medium text-accent bg-accent-softer rounded-sm px-2 py-0.5">{stageType}</span>
                      )}
                      <span className="text-[11px] uppercase tracking-wider font-medium text-ink-600 bg-surface-muted border border-border rounded-sm px-2 py-0.5">Үүрэг: {teacherRole}</span>
                    </div>
                    <p className="text-sm font-medium text-ink-900">{evalScheme.label}</p>
                    <p className="text-xs text-ink-500">{completedCriteria}/{evalScheme.criteria.length} шалгуур бөглөгдсөн</p>
                  </div>

                  <div className="rounded-md border border-border bg-surface-muted p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-ink-500 font-medium">Нийт оноо</p>
                        <div className="flex items-baseline gap-1.5 tabular-nums mt-1">
                          <span className={`text-4xl font-semibold ${totalScore > evalScheme.total ? 'text-[var(--color-dot-negative)]' : 'text-accent'}`}>{totalScore}</span>
                          <span className="text-ink-500 text-sm">/ {evalScheme.total}</span>
                        </div>
                      </div>
                      <span className="text-xs text-ink-500 tabular-nums">{scorePct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden mt-3">
                      <div
                        className={`h-full ${totalScore > evalScheme.total ? 'bg-[var(--color-dot-negative)]' : 'bg-accent'} transition-all`}
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                  </div>

                  {selectedStudent && (
                    <Button variant="outline" className="w-full" onClick={() => openStudentReports(selectedStudent)}>
                      <Eye className="w-4 h-4 mr-2" strokeWidth={1.6} />
                      Тайлан харах
                    </Button>
                  )}

                  {evalError && (
                    <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm inline-flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                      {evalError}
                    </div>
                  )}

                  {evalStatus === "success" ? (
                    <div className="border border-border bg-surface text-ink-900 p-4 rounded-md flex items-center justify-center gap-2 text-sm font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                      Үнэлгээ амжилттай хадгалагдлаа!
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmitEvaluation}
                      disabled={evalStatus === "loading" || totalScore > evalScheme.total || totalScore === 0}
                    >
                      {evalStatus === "loading" ? (
                        <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Илгээж байна...</span>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" strokeWidth={1.6} />Үнэлгээ илгээх</>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">{evalScheme.label}</CardTitle>
                  <CardDescription>Шалгуур бүрийн оноог оруулаад нийт оноогоо шалгана уу.</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {evalScheme.criteria.map((criterion, idx) => {
                    const value = scores[idx];
                    const half = Math.floor(criterion.max / 2);
                    return (
                      <div key={idx} className="rounded-md border border-border bg-surface p-4 hover:border-border-strong transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent-softer text-xs font-semibold text-accent tabular-nums">
                                {idx + 1}
                              </span>
                              <p className="text-sm font-semibold text-ink-900 tracking-tight">{criterion.name}</p>
                            </div>
                            <p className="text-xs text-ink-500 mt-1 ml-8 tabular-nums">Дээд оноо: {criterion.max}</p>
                          </div>

                          <div className="flex items-center gap-2 md:justify-end">
                            <input
                              type="number"
                              min={0}
                              max={criterion.max}
                              step={1}
                              className="h-11 w-24 border border-border-strong rounded-md px-3 text-center text-base font-semibold focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 bg-surface tabular-nums"
                              value={value ?? ''}
                              onChange={(e) => setCriterionScore(idx, Number(e.target.value) || 0)}
                            />
                            <span className="text-sm text-ink-500 tabular-nums">/ {criterion.max}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 pl-0 md:pl-8">
                          {[0, half, criterion.max].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setCriterionScore(idx, v)}
                              className={`h-7 rounded-md border px-2.5 text-xs font-medium transition-colors tabular-nums ${
                                value === v
                                  ? "border-accent bg-accent-softer text-accent"
                                  : "border-border text-ink-600 hover:border-accent hover:text-accent"
                              }`}
                            >
                              {v} оноо
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
            );
          })()}
        </TabsContent>

        {/* ── Secretary tab ── */}
        {isSecretary && committeeId && (
          <TabsContent value="secretary" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-base font-semibold text-ink-900 tracking-tight flex items-center gap-2 mb-2">
                    <Send className="w-4 h-4 text-accent" strokeWidth={1.6} /> Нарийн бичгийн даргын үүрэг
                  </h3>
                  <p className="text-sm text-ink-700">
                    Комиссын хамгаалалт бүрэн дууссаны дараа доорх товчийг дарж хамгаалалтын сессийг хаана уу. Энэ үйлдлийг буцаах боломжгүй.
                  </p>
                  {!defenseSessionId && (
                    <p className="text-xs text-ink-700 mt-2 inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                      Идэвхтэй хамгаалалтын сесс олдсонгүй.
                    </p>
                  )}
                </CardContent>
              </Card>

              {secretaryError && (
                <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm inline-flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                  {secretaryError}
                </div>
              )}

              <Card>
                <CardContent className="p-4">
                  {(() => {
                    // Committee members who grade (exclude REVIEWER — they grade separately)
                    const committeeGraders = getCommitteeGraders();
                    const roleLabel = (r: string) =>
                      r === 'HEAD' ? 'Ахлах' :
                      r === 'SECRETARY' ? 'Нарийн бичиг' :
                      r === 'EXTERNAL_EXPERT' ? 'Зочин шүүгч' : 'Гишүүн';
                    const submissionFor = (sid: string) =>
                      sessionSubmissions.find(s => s.studentId === sid);

                    if (committeeStudents.length === 0) {
                      return <div className="py-4 text-center text-ink-400 text-sm">Оюутан олдсонгүй.</div>;
                    }
                    if (committeeGraders.length === 0) {
                      return <div className="py-4 text-center text-ink-400 text-sm">Комиссийн гишүүд бүртгэгдээгүй байна.</div>;
                    }

                    return (
                      <div className="overflow-x-auto mb-5">
                        <table className="w-full text-[13px] border-separate border-spacing-0">
                          <thead>
                            <tr>
                              <th className="text-left text-[11px] uppercase tracking-wider font-medium text-ink-500 px-3 py-2 bg-surface-muted border-b border-border sticky left-0 z-10">Оюутан</th>
                              {committeeGraders.map(m => (
                                <th key={m.id} className="text-center px-3 py-2 bg-surface-muted border-b border-border whitespace-nowrap">
                                  <div className="text-xs text-ink-700 font-medium">{teacherNameMap[m.teacherId] || m.teacherId.slice(0, 8)}</div>
                                  <div className="text-[10px] text-ink-400 font-normal mt-0.5">{roleLabel(m.role)}</div>
                                </th>
                              ))}
                              <th className="text-center text-[11px] uppercase tracking-wider font-medium text-ink-500 px-3 py-2 bg-surface-muted border-b border-border whitespace-nowrap">Дундаж</th>
                              <th className="text-center text-[11px] uppercase tracking-wider font-medium text-ink-500 px-3 py-2 bg-surface-muted border-b border-border">Төлөв</th>
                              <th className="text-right text-[11px] uppercase tracking-wider font-medium text-ink-500 px-3 py-2 bg-surface-muted border-b border-border">Үйлдэл</th>
                            </tr>
                          </thead>
                          <tbody>
                            {committeeStudents.map(student => {
                              const gradesForStudent = committeeGraders.map(m =>
                                sessionGrades.find(g =>
                                  g.studentId === student.studentId && g.evaluatorId === m.teacherId && g.isSubmitted
                                )
                              );
                              const graded = gradesForStudent.filter(Boolean) as NonNullable<typeof gradesForStudent[0]>[];
                              const allGraded = graded.length === committeeGraders.length;
                              const avg = graded.length > 0
                                ? graded.reduce((sum, g) => sum + g.points, 0) / graded.length
                                : null;
                              const sub = submissionFor(student.studentId);
                              const status = sendAvgStatus[student.studentId] || 'idle';
                              const err = sendAvgError[student.studentId];

                              return (
                                <tr key={student.id} className="hover:bg-surface-muted">
                                  <td className="px-3 py-2 border-b border-border sticky left-0 bg-surface hover:bg-surface-muted z-10">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Avatar className="h-8 w-8 shrink-0 border border-border-strong">
                                        <AvatarFallback className="text-[11px] font-medium">
                                          {(student.name || '??').substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-ink-900 tracking-tight truncate">{student.name}</p>
                                        {studentCode(student) && (
                                          <p className="text-[10px] text-ink-400 truncate">{studentCode(student)}</p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  {gradesForStudent.map((g, i) => (
                                    <td key={i} className="text-center px-3 py-2 border-b border-border tabular-nums">
                                      {g ? (
                                        <span className="text-sm font-medium text-ink-900">{g.points}<span className="text-ink-400 font-normal">/{g.maxPoints}</span></span>
                                      ) : (
                                        <span className="text-ink-300">—</span>
                                      )}
                                    </td>
                                  ))}
                                  <td className="text-center px-3 py-2 border-b border-border">
                                    {avg !== null ? (
                                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 tabular-nums">
                                        <span className={`w-1.5 h-1.5 rounded-full ${allGraded ? toneDot.positive : toneDot.neutral}`} />
                                        {avg.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-ink-300">—</span>
                                    )}
                                  </td>
                                  <td className="text-center px-3 py-2 border-b border-border">
                                    {sub ? (
                                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                                        Илгээсэн
                                      </span>
                                    ) : allGraded ? (
                                      <span className="inline-flex items-center gap-1.5 text-xs text-accent">
                                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.info}`} />
                                        Бэлэн
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 tabular-nums">
                                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                                        {graded.length}/{committeeGraders.length}
                                      </span>
                                    )}
                                  </td>
                                  <td className="text-right px-3 py-2 border-b border-border">
                                    {sub ? (
                                      <span className="text-xs text-ink-500 tabular-nums">{fmtDateTime(sub.submittedAt) || '—'}</span>
                                    ) : (
                                      <div className="flex flex-col items-end gap-1">
                                        <Button size="sm"
                                          disabled={!allGraded || status === 'loading'}
                                          onClick={() => handleSendAverage(student.studentId)}
                                        >
                                          {status === 'loading' ? 'Илгээж...' : 'Илгээх'}
                                        </Button>
                                        {err && <span className="text-[10px] text-[var(--color-dot-negative)] max-w-[160px] truncate" title={err}>{err}</span>}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {!secretaryDone && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-ink-900 tracking-tight">
                        Комиссын дүгнэлт / тайлбар
                      </label>
                      <RichTextEditor
                        value={closingNote}
                        onChange={setClosingNote}
                        placeholder="Комиссын ерөнхий дүгнэлт, шийдвэр, цаашдын зөвлөмжөө бичнэ үү..."
                        minHeight={160}
                        disabled={secretarySubmitting}
                        ariaLabel="Комиссын дүгнэлт"
                      />
                      <p className="text-xs text-ink-500">
                        Хадгалсаны дараа уг тайлбар "Дууссан үнэлгээнүүд" хэсэгт харагдана.
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      disabled={committeeStudents.length === 0}
                      onClick={handleExportCommitteeGrades}
                    >
                      <FileDown className="w-4 h-4 mr-2" strokeWidth={1.6} /> Excel татах
                    </Button>
                    {secretaryDone ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-ink-900 font-medium px-4 py-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                        Комиссын ажил дууссан
                      </span>
                    ) : (
                      <Button
                        disabled={!committeeId || secretarySubmitting || !closingNote.trim()}
                        onClick={handleCloseCommittee}
                      >
                        {secretarySubmitting ? (
                          <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Хадгалж байна...</span>
                        ) : (
                          <><CheckCircle className="w-4 h-4 mr-2" strokeWidth={1.6} />Хамгаалалт дуусгах</>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* ── Reviewer tab ── */}
        {canUploadReview && committeeId && (() => {
          // Only show students where this teacher is assigned as reviewer.
          // HEAD assigns reviewers per-student; a teacher may have 0, 1, or many.
          const myAssignedStudents = committeeStudents.filter(s =>
            reviewerAssignments.some(a => a.studentId === s.studentId && a.reviewerId === teacherId)
          );
          const hasReviewFor = (studentId: string) =>
            uploadedReviews.find(r => r.studentId === studentId && r.reviewerId === teacherId);

          return (
          <TabsContent value="reviewer" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-base font-semibold text-ink-900 tracking-tight flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-accent" strokeWidth={1.6} /> Шүүмжлэгчийн үүрэг
                  </h3>
                  <p className="text-sm text-ink-700">
                    Танд шүүмжлэгчээр томилогдсон оюутны дипломын ажлыг уншиж шүүмжилсэн баримт бичиг байршуулна уу. Үүний хамт 0–5 онооны шүүмжийн оноо (эцсийн дүнгийн 5%) өгнө. Энэ үйл явц <strong>Эцсийн хамгаалалт эхлэхээс өмнө</strong> дуусгах ёстой.
                  </p>
                  {!defenseSessionId && (
                    <p className="text-xs text-ink-700 mt-2 inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                      Идэвхтэй хамгаалалтын сесс олдсонгүй.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  {myAssignedStudents.length === 0 ? (
                    <div className="p-8 text-center text-ink-400 text-sm">
                      Танд шүүмжлэх оюутан томилогдоогүй байна. Комиссийн дарга томилсон бол энд харагдана.
                    </div>
                  ) : myAssignedStudents.map(student => {
                    const sent = hasReviewFor(student.studentId);
                    return (
                    <div key={student.id} className="p-4 border-b border-border last:border-b-0">
                      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9 border border-border-strong">
                            <AvatarFallback className="text-xs font-medium">
                              {(student.name || '??').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink-900 tracking-tight truncate">{student.name}</p>
                            <p className="text-xs text-ink-500 truncate max-w-[220px]">{student.thesis}</p>
                          </div>
                        </div>
                        {sent ? (
                          <span className="inline-flex items-center gap-2 text-xs text-ink-700 flex-wrap">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                              Илгээсэн: <span className="text-ink-500 truncate max-w-[160px]">{sent.originalFilename}</span>
                            </span>
                            {sent.reviewerScore != null && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-border bg-surface-muted tabular-nums">
                                Шүүмж: <strong className="text-ink-900">{Number(sent.reviewerScore).toFixed(1)} / 5</strong>
                              </span>
                            )}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!defenseSessionId}
                            onClick={() => {
                              setReviewUploadStudentId(student.studentId);
                              setReviewFile(null);
                              setReviewScore("");
                              setReviewUploadError(null);
                              setReviewUploadStatus("idle");
                            }}
                          >
                            <Upload className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Шүүмж байршуулж илгээх
                          </Button>
                        )}
                      </div>
                      {reviewUploadStudentId === student.studentId && (
                        <div className="bg-surface-muted rounded-md p-4 border border-border space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={e => setReviewFile(e.target.files?.[0] || null)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.6} /> Файл сонгох
                            </Button>
                            {reviewFile && (
                              <span className="text-xs text-ink-700 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-accent" strokeWidth={1.6} /> {reviewFile.name}
                                <button onClick={() => setReviewFile(null)} className="text-ink-400 hover:text-[var(--color-dot-negative)]" aria-label="Файлыг устгах">
                                  <X className="w-3.5 h-3.5" strokeWidth={1.6} />
                                </button>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-ink-900 tracking-tight">
                              Шүүмжийн оноо <span className="text-ink-500 font-normal">(0–5, эцсийн дүнгийн 5%)</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                inputMode="decimal"
                                min={0}
                                max={5}
                                step={0.5}
                                placeholder="0.0 – 5.0"
                                value={reviewScore}
                                onChange={e => setReviewScore(e.target.value)}
                                className="w-32 rounded-md border border-border bg-surface px-3 py-2 text-sm tabular-nums text-ink-900 focus:outline-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900"
                                disabled={reviewUploadStatus === "uploading"}
                              />
                              <span className="text-xs text-ink-500">/ 5</span>
                            </div>
                          </div>
                          {reviewUploadStatus === "success" && (
                            <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                              Шүүмж болон оноо амжилттай хадгалагдлаа.
                            </div>
                          )}
                          {reviewUploadStatus === "error" && (
                            <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                              {reviewUploadError || "Байршуулахад алдаа гарлаа. Дахин оролдоно уу."}
                            </div>
                          )}
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setReviewUploadStudentId(null); setReviewFile(null); setReviewScore(""); setReviewUploadError(null); }}
                            >
                              Цуцлах
                            </Button>
                            <Button
                              size="sm"
                              disabled={
                                !reviewFile || !defenseSessionId || reviewUploadStatus === "uploading" ||
                                reviewScore.trim() === "" ||
                                !Number.isFinite(Number(reviewScore)) ||
                                Number(reviewScore) < 0 || Number(reviewScore) > 5
                              }
                              onClick={handleReviewUpload}
                            >
                              {reviewUploadStatus === "uploading" ? "Илгээж байна..." : "Оюутанд илгээх"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          );
        })()}
        {/* ── HEAD reviewer assignment tab ── */}
        {canAssignReviewer && committeeId && (
          <TabsContent value="head" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-base font-semibold text-ink-900 tracking-tight flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-accent" strokeWidth={1.6} /> Комиссийн даргын үүрэг
                  </h3>
                  <p className="text-sm text-ink-700">
                    Урьдчилсан хамгаалалтын үеэр оюутан бүрт шүүмжлэгч (шүүмжилсэн баримт бичих гишүүн) томилно уу.
                  </p>
                  {!defenseSessionId && (
                    <p className="text-xs text-ink-700 mt-2 inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                      Идэвхтэй хамгаалалтын сесс олдсонгүй.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  {committeeStudents.length === 0 ? (
                    <div className="p-8 text-center text-ink-400 text-sm">Оюутан олдсонгүй.</div>
                  ) : committeeStudents.map(student => {
                    const existing = reviewerAssignments.find(a => a.studentId === student.studentId);
                    const roleLabel = (role: string) => {
                      if (role === 'HEAD') return 'Ахлах';
                      if (role === 'SECRETARY') return 'Нарийн бичиг';
                      if (role === 'EXTERNAL_EXPERT') return 'Зочин шүүгч';
                      return 'Гишүүн';
                    };
                    return (
                      <div key={student.id} className="p-4 border-b border-border last:border-b-0">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 border border-border-strong">
                              <AvatarFallback className="text-xs font-medium">
                                {(student.name || '??').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink-900 tracking-tight truncate">{student.name}</p>
                              <p className="text-xs text-ink-500 truncate max-w-[220px]">{student.thesis}</p>
                            </div>
                          </div>
                          {existing ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                              Шүүмжлэгч: <span className="text-ink-900 font-medium">{teacherNameMap[existing.reviewerId] || existing.reviewerId}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.neutral}`} />
                              Томилогдоогүй
                            </span>
                          )}
                        </div>
                        {!existing && (
                          <div className="flex items-center gap-2">
                            <select
                              className="flex-1 border border-border rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:border-accent bg-surface disabled:bg-surface-muted disabled:text-ink-400"
                              defaultValue=""
                              onChange={async e => {
                                if (e.target.value) {
                                  await handleAssignReviewer(student.studentId, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              disabled={!defenseSessionId || assigningReviewer[student.studentId]}
                            >
                              <option value="">— Шүүмжлэгч сонгох —</option>
                              {committeeMembers
                                // External experts cannot be reviewers; everyone else
                                // (HEAD/SECRETARY/MEMBER) is eligible — HEAD may even
                                // self-assign for a student.
                                .filter(m => m.role !== 'EXTERNAL_EXPERT')
                                .map(m => (
                                  <option key={m.teacherId} value={m.teacherId}>
                                    {teacherNameMap[m.teacherId] || m.teacherId} ({roleLabel(m.role)})
                                    {m.teacherId === teacherId ? ' (та)' : ''}
                                  </option>
                                ))}
                            </select>
                            {assigningReviewer[student.studentId] && (
                              <span className="text-xs text-ink-400">Томилж байна...</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* ── Final grade confirmation tab (HEAD + FINAL_DEFENSE) ── */}
        {canConfirmGrade && committeeId && (
          <TabsContent value="confirm" className="mt-6">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-base font-semibold text-ink-900 tracking-tight flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-accent" strokeWidth={1.6} /> Комиссийн даргын эцсийн баталгаажуулалт
                  </h3>
                  <p className="text-sm text-ink-700">
                    Бүх шатны нарийн бичгийн дундаж оноонууд автоматаар татагдана. Дүнгийн үсгийг шалгаж, тэмдэглэл нэмээд баталгаажуулна уу. Баталгаажуулсны дараа Admin нийтэлнэ.
                  </p>
                  {!defenseSessionId && (
                    <p className="text-xs text-ink-700 mt-2 inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                      Идэвхтэй FINAL_DEFENSE сесс олдсонгүй.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {committeeStudents.length === 0 ? (
                  <div className="text-center py-8 text-ink-400 text-sm bg-surface-muted rounded-md border border-border">Оюутан олдсонгүй.</div>
                ) : committeeStudents.map(student => {
                  const sid = student.studentId;
                  const p1 = getStageScore(sid, 'PROGRESS_1');
                  const p2 = getStageScore(sid, 'PROGRESS_2');
                  const pre = getStageScore(sid, 'PRE_DEFENSE');
                  const fin = getStageScore(sid, 'FINAL_DEFENSE');
                  const rev = getReviewerScore(sid);
                  const total = (p1 ?? 0) + (p2 ?? 0) + (pre ?? 0) + (fin ?? 0) + (rev ?? 0);
                  const cs = confirmState[sid] || { headNotes: '', submitting: false, done: false, error: null };
                  const missingStages: string[] = [];
                  if (p1 === undefined) missingStages.push("Явц 1");
                  if (p2 === undefined) missingStages.push("Явц 2");
                  if (pre === undefined) missingStages.push("Урьдчилсан");
                  if (fin === undefined) missingStages.push("Эцсийн");
                  if (rev === undefined) missingStages.push("Шүүмж");
                  const allScoresReady = missingStages.length === 0;

                  return (
                    <Card key={sid} className={cs.done ? 'bg-surface-muted' : ''}>
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border-strong">
                              <AvatarFallback className="text-sm font-medium">
                                {(student.name || '??').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-ink-900 tracking-tight">{student.name}</p>
                              <p className="text-xs text-ink-500 truncate max-w-[220px]">{student.thesis}</p>
                            </div>
                          </div>
                          {cs.done && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                              <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                              Баталгаажсан
                            </span>
                          )}
                        </div>

                        {/* Per-stage scores */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {[
                            { label: "Явц 1", score: p1, max: 15 },
                            { label: "Явц 2", score: p2, max: 20 },
                            { label: "Урьдч.", score: pre, max: 25 },
                            { label: "Эцсийн", score: fin, max: 35 },
                            { label: "Шүүмж", score: rev, max: 5 },
                          ].map(item => (
                            <div key={item.label} className={`rounded-md p-3 text-center tabular-nums ${item.score !== undefined ? 'bg-surface border border-border' : 'bg-surface-muted border border-dashed border-border-strong'}`}>
                              <p className="text-[10px] font-medium uppercase tracking-wider text-ink-500 mb-1">{item.label}</p>
                              {item.score !== undefined ? (
                                <p className="text-xl font-semibold text-ink-900">{item.score.toFixed(1)}<span className="text-xs text-ink-400 font-normal">/{item.max}</span></p>
                              ) : (
                                <p className="text-sm text-ink-400">—</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="flex items-center justify-between bg-surface-muted rounded-md px-4 py-3 border border-border tabular-nums">
                          <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Нийт оноо</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-2xl font-semibold ${total >= 80 ? 'text-[var(--color-dot-positive)]' : total >= 60 ? 'text-[var(--color-dot-warning)]' : 'text-[var(--color-dot-negative)]'}`}>{total.toFixed(1)}</span>
                            <span className="text-ink-400 text-sm">/100</span>
                          </div>
                        </div>

                        {!allScoresReady && (
                          <p className="text-xs text-ink-700 bg-surface-muted border border-border rounded-md px-3 py-2 inline-flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.warning}`} />
                            Дутуу шат: {missingStages.join(", ")}. Боломжтой бол ирээгүй оноог 0-ээр тоолж баталгаажуулж болно.
                          </p>
                        )}

                        {!cs.done && (
                          <div>
                            <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 block mb-1.5">Даргын тэмдэглэл (заавал биш)</label>
                            <input
                              type="text"
                              className="w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-surface"
                              placeholder="Нэмэлт тэмдэглэл..."
                              value={cs.headNotes}
                              onChange={e => setConfirmState(prev => ({
                                ...prev,
                                [sid]: { ...cs, headNotes: e.target.value },
                              }))}
                            />
                          </div>
                        )}

                        {cs.error && (
                          <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm inline-flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                            {cs.error}
                          </div>
                        )}

                        {!cs.done && (
                          <Button
                            className="w-full"
                            disabled={cs.submitting}
                            onClick={() => handleConfirmGrade(student)}
                          >
                            {cs.submitting ? (
                              <span className="flex items-center gap-2">
                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Баталгаажуулж байна...
                              </span>
                            ) : (
                              <><CheckCircle className="w-4 h-4 mr-2" strokeWidth={1.6} />Эцсийн дүн баталгаажуулах</>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        )}

        {/* ── Явц 1 Schedule tab ── */}
        {!committeeId && (
          <TabsContent value="schedule" className="mt-6">
            <div className="max-w-3xl">
              <Card>
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" strokeWidth={1.6} />
                    {progress1Session ? 'Явц 1 хуваарийг засах' : 'Явц 1 хуваарь үүсгэх'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">Огноо, цаг</label>
                    <input
                      type="datetime-local"
                      className="w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-surface"
                      value={scheduleForm.scheduledDate}
                      onChange={e => setScheduleForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">Байршил / Өрөө</label>
                    <input
                      type="text"
                      placeholder="Жнь: 305 тоот, A байр"
                      className="w-full border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-accent bg-surface"
                      value={scheduleForm.location}
                      onChange={e => setScheduleForm(f => ({ ...f, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5">Нэмэлт тэмдэглэл</label>
                    <RichTextEditor
                      value={scheduleForm.notes}
                      onChange={(html) => setScheduleForm(f => ({ ...f, notes: html }))}
                      placeholder="Оюутнуудад мэдэгдэх мэдээлэл..."
                      minHeight={110}
                      ariaLabel="Хуваарийн нэмэлт тэмдэглэл"
                    />
                  </div>
                  {scheduleStatus === 'success' && (
                    <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.positive}`} />
                      Хуваарь амжилттай хадгалагдлаа!
                    </div>
                  )}
                  {scheduleStatus === 'error' && (
                    <div className="border border-border bg-surface text-ink-900 p-3 rounded-md text-sm flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDot.negative}`} />
                      Алдаа гарлаа. Дахин оролдоно уу.
                    </div>
                  )}
                  <Button
                    className="w-full"
                    disabled={!scheduleForm.scheduledDate || scheduleStatus === 'saving'}
                    onClick={async () => {
                      setScheduleStatus('saving');
                      try {
                        const payload = {
                          scheduledDate: scheduleForm.scheduledDate ? new Date(scheduleForm.scheduledDate).toISOString().replace('Z', '') : undefined,
                          location: scheduleForm.location || undefined,
                          notes: scheduleForm.notes || undefined,
                        };
                        let session;
                        if (progress1Session) {
                          const r = await workflowService.updateDefenseSession(progress1Session.id, payload);
                          session = r.data;
                        } else {
                          const r = await workflowService.createDefenseSession({ stageType: 'PROGRESS_1', supervisorId: teacherId, ...payload });
                          session = r.data;
                        }
                        setProgress1Session(session);
                        setScheduleStatus('success');
                        setTimeout(() => setScheduleStatus('idle'), 3000);
                      } catch {
                        setScheduleStatus('error');
                        setTimeout(() => setScheduleStatus('idle'), 3000);
                      }
                    }}
                  >
                    {scheduleStatus === 'saving' ? 'Хадгалж байна...' : progress1Session ? 'Шинэчлэх' : 'Хуваарь үүсгэх'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {viewReportsStudent && (viewReportsLoading || viewReportsError) && (
        <div
          className="fixed inset-0 bg-ink-900/40 z-50 flex items-center justify-center p-4"
          onClick={closeStudentReports}
        >
          <div
            className="bg-surface rounded-md border border-border p-8 max-w-sm w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-ink-900 tracking-tight mb-1">{viewReportsStudent.name}</h3>
            {studentCode(viewReportsStudent) && (
              <p className="text-xs text-ink-500 mb-4">{studentCode(viewReportsStudent)}</p>
            )}
            {viewReportsLoading ? (
              <div className="flex flex-col items-center gap-3 py-4 text-ink-500 text-sm">
                <span className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
                Тайланг ачаалж байна...
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3 py-4 text-ink-600 text-sm">
                  <FileText className="w-10 h-10 text-ink-300" strokeWidth={1.4} />
                  {viewReportsError}
                </div>
                <Button size="sm" variant="outline" onClick={closeStudentReports}>Хаах</Button>
              </>
            )}
          </div>
        </div>
      )}

      {viewReportsStudent && viewReportsFiles.length > 0 && viewReportsActiveId && (
        <FilePreviewModal
          files={viewReportsFiles}
          activeId={viewReportsActiveId}
          onClose={closeStudentReports}
          onSelect={setViewReportsActiveId}
        />
      )}
    </div>
  );
}
