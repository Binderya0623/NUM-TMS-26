import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogHeader, DialogBody, DialogFooter } from "../../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import {
  CheckCircle2, ToggleLeft, ToggleRight,
  Plus, Trash2, BookOpen, Users, FileText,
  Shield, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { workflowService, type ExecutionSession, type DefenseSession } from "../../../services/workflowService";
import { selectionSessionService, type SelectionSession } from "../../../services/selectionSessionService";
import { committeeService, type Committee } from "../../../services/committeeService";

// ─── Session type definitions ─────────────────────────────────────────────────

type SessionKind = "TOPIC_CREATION" | "TOPIC_SELECTION" | "THESIS_EXECUTION" | "PROGRESS_1" | "PROGRESS_2" | "PRE_DEFENSE" | "FINAL_DEFENSE";

interface SessionMeta {
  label: string;
  icon: React.ElementType;
  description: string;
  isDefense: boolean;
  needsCommittee: boolean;
  hasExternalExpert: boolean;
  stageType?: string;
  defaultDurationWeeks?: number;
}

const SESSION_META: Record<SessionKind, SessionMeta> = {
  TOPIC_CREATION: {
    label: "Сэдэв бүртгэлийн сесс",
    icon: BookOpen,
    description: "Багш нар дипломын сэдэв бүртгэх хугацааны цонх",
    isDefense: false,
    needsCommittee: false,
    hasExternalExpert: false,
  },
  TOPIC_SELECTION: {
    label: "Сэдэв сонголтын сесс",
    icon: FileText,
    description: "Оюутнууд сэдэв сонгох 5 хоногийн цонх",
    isDefense: false,
    needsCommittee: false,
    hasExternalExpert: false,
    defaultDurationWeeks: 1,
  },
  THESIS_EXECUTION: {
    label: "Дипломын ажил гүйцэтгэх сесс",
    icon: Users,
    description: "Дипломын ажил гүйцэтгэх 14 долоо хоногийн хугацаа",
    isDefense: false,
    needsCommittee: false,
    hasExternalExpert: false,
    defaultDurationWeeks: 14,
  },
  PROGRESS_1: {
    label: "Явц 1 — Хамгаалалт",
    icon: Shield,
    description: "1-р явцын хамгаалалт — Удирдагч үнэлнэ (15 оноо)",
    isDefense: true,
    needsCommittee: false,
    hasExternalExpert: false,
    stageType: "PROGRESS_1",
  },
  PROGRESS_2: {
    label: "Явц 2 — Хамгаалалт",
    icon: Shield,
    description: "Комиссын гишүүд дүрэм сохроор үнэлнэ (20 оноо)",
    isDefense: true,
    needsCommittee: false,
    hasExternalExpert: false,
    stageType: "PROGRESS_2",
  },
  PRE_DEFENSE: {
    label: "Урьдчилсан хамгаалалт",
    icon: Shield,
    description: "Комисс + Гадаад эксперт сохроор үнэлнэ (25 оноо)",
    isDefense: true,
    needsCommittee: false,
    hasExternalExpert: true,
    stageType: "PRE_DEFENSE",
  },
  FINAL_DEFENSE: {
    label: "Эцсийн хамгаалалт",
    icon: Shield,
    description: "Комисс + Гадаад эксперт сохроор үнэлнэ (35 + 5 оноо)",
    isDefense: true,
    needsCommittee: false,
    hasExternalExpert: true,
    stageType: "FINAL_DEFENSE",
  },
};

const SESSION_ORDER: SessionKind[] = [
  "TOPIC_CREATION", "TOPIC_SELECTION",
  "PROGRESS_1", "PROGRESS_2", "PRE_DEFENSE", "FINAL_DEFENSE",
];

// ─── Grading scheme ───────────────────────────────────────────────────────────

interface GradeCriteria { id: string; name: string; points: number; }
interface GradingScheme { sessionKind: SessionKind; totalPoints: number; criteria: GradeCriteria[]; }

const defaultSchemes: GradingScheme[] = [
  {
    sessionKind: "PROGRESS_1", totalPoints: 15,
    criteria: [{ id: "p1_1", name: "Судалгааны тайлан", points: 10 }, { id: "p1_2", name: "Танилцуулга", points: 5 }],
  },
  {
    sessionKind: "PROGRESS_2", totalPoints: 20,
    criteria: [{ id: "p2_1", name: "Судалгаа", points: 6 }, { id: "p2_2", name: "Хэрэгжүүлэлт", points: 9 }, { id: "p2_3", name: "Танилцуулга", points: 5 }],
  },
  {
    sessionKind: "PRE_DEFENSE", totalPoints: 25,
    criteria: [{ id: "pd_1", name: "Судалгаа", points: 6 }, { id: "pd_2", name: "Хэрэгжүүлэлт", points: 9 }, { id: "pd_3", name: "Танилцуулга", points: 5 }, { id: "pd_4", name: "Гар бичмэл", points: 5 }],
  },
  {
    sessionKind: "FINAL_DEFENSE", totalPoints: 40,
    criteria: [{ id: "fd_1", name: "Судалгаа", points: 6 }, { id: "fd_2", name: "Хэрэгжүүлэлт", points: 9 }, { id: "fd_3", name: "Танилцуулга", points: 5 }, { id: "fd_4", name: "Гар бичмэл", points: 5 }, { id: "fd_5", name: "Шүүмжлэгчийн үнэлгээ", points: 5 }, { id: "fd_6", name: "Нэмэлт үнэлгээ (Эксперт)", points: 10 }],
  },
];

// ─── Unified session row ──────────────────────────────────────────────────────

interface UnifiedSession {
  kind: SessionKind;
  id?: string;
  selectionId?: number;
  status?: string;
  committeeId?: string;
  startedAt?: string;
  closedAt?: string;
  durationWeeks?: number;
  raw?: ExecutionSession | DefenseSession | SelectionSession;
}

// ─── Tiny state dot ───────────────────────────────────────────────────────────

function StateDot({ state }: { state: "open" | "closed" | "none" }) {
  const color =
    state === "open"  ? "bg-[var(--color-dot-positive)]" :
    state === "closed" ? "bg-ink-300" :
                         "bg-ink-200";
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />;
}

// ─── Create session modal ─────────────────────────────────────────────────────

function CreateSessionModal({
  kind, committees, onClose, onCreate,
}: {
  kind: SessionKind;
  committees: Committee[];
  onClose: () => void;
  onCreate: (kind: SessionKind, durationWeeks?: number, committeeId?: string) => Promise<void>;
}) {
  const meta = SESSION_META[kind];
  const [weeks, setWeeks] = useState(meta.defaultDurationWeeks || 1);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const relevantCommittees = committees.filter(c =>
    (c.status === 'ACTIVE' || c.status === 'Идэвхтэй') &&
    (!meta.stageType || c.stageType === meta.stageType)
  );

  const canSubmit = !meta.needsCommittee || !!selectedCommitteeId;

  const submit = async () => {
    if (!canSubmit) { setError("Комисс сонгоно уу."); return; }
    setCreating(true);
    await onCreate(kind, weeks, selectedCommitteeId || undefined);
    setCreating(false);
  };

  const Icon = meta.icon;

  return (
    <Dialog open onClose={onClose} maxWidth="max-w-md">
      <DialogHeader title={meta.label} icon={<Icon className="w-4 h-4" strokeWidth={1.6} />} onClose={onClose} />
      <DialogBody className="space-y-5">
        <p className="text-sm text-ink-500 leading-relaxed -mt-1">{meta.description}</p>

        {!meta.isDefense && (
          <div>
            <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">
              Үргэлжлэх хугацаа (долоо хоног)
            </label>
            <input
              type="number" min={1} value={weeks}
              onChange={e => setWeeks(parseInt(e.target.value) || 1)}
              className="w-full h-9 border border-border-strong rounded-md px-3 text-sm text-ink-900 focus:outline-none focus:border-ink-900"
            />
          </div>
        )}

        {meta.needsCommittee && (
          <div>
            <label className="text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-1.5 block">
              Комисс сонгох
            </label>
            {relevantCommittees.length === 0 ? (
              <p className="text-sm text-ink-600 border-l-2 border-ink-300 pl-3 py-1">
                <strong className="text-ink-900">{meta.label}</strong> төрлийн идэвхтэй комисс олдсонгүй.
                Эхлээд "Комиссууд" хэсэгт комисс үүсгэнэ үү.
              </p>
            ) : (
              <select
                className={`w-full h-9 border rounded-md px-3 text-sm text-ink-900 bg-white focus:outline-none focus:border-ink-900 ${
                  error ? 'border-[var(--color-dot-negative)]' : 'border-border-strong'
                }`}
                value={selectedCommitteeId}
                onChange={e => { setSelectedCommitteeId(e.target.value); setError(""); }}
              >
                <option value="">— Комисс сонгох —</option>
                {relevantCommittees.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            {error && <p className="text-[var(--color-dot-negative)] text-xs mt-1">{error}</p>}
          </div>
        )}

        {meta.hasExternalExpert && (
          <p className="text-xs text-ink-600 leading-relaxed border-l-2 border-ink-300 pl-3 py-1">
            Энэ хамгаалалтад <strong className="text-ink-900">Гадаад эксперт</strong> оролцоно.
            Сонгосон комисст EXTERNAL_EXPERT үүрэгтэй гишүүн байгаа эсэхийг шалгана уу.
          </p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={creating}>Цуцлах</Button>
        <Button
          onClick={submit}
          disabled={creating || (meta.needsCommittee && relevantCommittees.length === 0)}
        >
          {creating ? "Үүсгэж байна..." : "Сесс үүсгэх"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

// ─── Grading scheme editor ────────────────────────────────────────────────────

function GradingSchemeCard({ scheme, onChange }: { scheme: GradingScheme; onChange: (s: GradingScheme) => void }) {
  const [expanded, setExpanded] = useState(false);
  const meta = SESSION_META[scheme.sessionKind];
  const usedPoints = scheme.criteria.reduce((a, b) => a + b.points, 0);
  const valid = usedPoints === scheme.totalPoints;
  const Icon = meta.icon;

  return (
    <Card>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left hover:bg-surface-muted transition-colors"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-ink-500" strokeWidth={1.6} />
            <div>
              <p className="text-[13px] font-semibold text-ink-900 tracking-tight">{meta.label}</p>
              <p className="text-xs text-ink-500 mt-0.5">Нийт: {scheme.totalPoints} оноо</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-medium tracking-tight ${valid ? 'text-ink-900' : 'text-[var(--color-dot-warning)]'}`}>
              {usedPoints} / {scheme.totalPoints}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="divide-y divide-border">
            {scheme.criteria.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-6 py-2.5">
                <input
                  type="text" value={c.name}
                  onChange={e => onChange({ ...scheme, criteria: scheme.criteria.map(x => x.id === c.id ? { ...x, name: e.target.value } : x) })}
                  className="flex-1 text-sm text-ink-900 bg-transparent border-b border-transparent hover:border-border focus:border-ink-900 focus:outline-none py-1"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number" min={0} value={c.points}
                    onChange={e => onChange({ ...scheme, criteria: scheme.criteria.map(x => x.id === c.id ? { ...x, points: parseInt(e.target.value) || 0 } : x) })}
                    className="w-14 h-8 border border-border-strong rounded-md px-2 text-sm text-center text-ink-900 focus:outline-none focus:border-ink-900"
                  />
                  <span className="text-[11px] text-ink-400 w-8">оноо</span>
                  <button
                    type="button"
                    onClick={() => onChange({ ...scheme, criteria: scheme.criteria.filter(x => x.id !== c.id) })}
                    className="text-ink-300 hover:text-ink-900 ml-1 transition-colors"
                    aria-label="Устгах"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <button
              type="button"
              onClick={() => onChange({ ...scheme, criteria: [...scheme.criteria, { id: `c_${Date.now()}`, name: "Шинэ шалгуур", points: 0 }] })}
              className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-ink-900 font-medium tracking-tight"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.8} /> Шалгуур нэмэх
            </button>
            <span className={`text-xs font-medium tracking-tight ${valid ? 'text-ink-900' : 'text-[var(--color-dot-warning)]'}`}>
              Нийт: {usedPoints} / {scheme.totalPoints}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Neutral toast ────────────────────────────────────────────────────────────

function Toast({ message, onClose, tone = "neutral" }: { message: string; onClose: () => void; tone?: "neutral" | "negative" }) {
  const dot = tone === "negative" ? "bg-[var(--color-dot-negative)]" : "bg-ink-900";
  return (
    <div className="fixed bottom-6 right-6 bg-surface border border-border-strong rounded-md px-4 py-3 flex items-center gap-3 z-50 max-w-sm">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span className="text-sm text-ink-900 flex-1">{message}</span>
      <button onClick={onClose} className="text-ink-400 hover:text-ink-900 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminEvaluationProcess() {
  const [executionSessions, setExecutionSessions] = useState<ExecutionSession[]>([]);
  const [defenseSessions, setDefenseSessions] = useState<DefenseSession[]>([]);
  const [selectionSessions, setSelectionSessions] = useState<SelectionSession[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stages" | "methods">("stages");
  const [creatingKind, setCreatingKind] = useState<SessionKind | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<GradingScheme[]>(defaultSchemes);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const loadAll = async () => {
    setLoading(true);
    try {
      const [execRes, defRes, selRes, commRes] = await Promise.all([
        workflowService.getExecutionSessions().catch(() => ({ data: [] as ExecutionSession[] })),
        workflowService.getDefenseSessions().catch(() => ({ data: [] as DefenseSession[] })),
        selectionSessionService.listSessions().catch(() => ({ data: [] as SelectionSession[] })),
        committeeService.getCommittees().catch(() => ({ data: [] as Committee[] })),
      ]);
      let sessions: SelectionSession[] = Array.isArray(selRes.data) ? selRes.data : [];
      if (sessions.length === 0) {
        try {
          const now = new Date();
          const end = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          const fmt = (d: Date) => d.toISOString().replace('Z', '');
          const res = await selectionSessionService.createSession({
            academicYear: '2025-2026', semester: 'SPRING',
            durationDays: 365, createdBy: 'admin',
            startDate: fmt(now), endDate: fmt(end),
          });
          if (res.data) sessions = [res.data as SelectionSession];
        } catch {}
      }
      setExecutionSessions(execRes.data);
      setDefenseSessions(defRes.data);
      setSelectionSessions(sessions);
      setCommittees(commRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Map each SessionKind to its current session
  const sessionMap: Partial<Record<SessionKind, UnifiedSession>> = {};

  const activeSel = selectionSessions.find(s => s.status === 'ACTIVE');
  const latestSel = activeSel || selectionSessions[0];
  if (latestSel) {
    const selStatus = latestSel.status === 'ACTIVE' ? 'OPEN' : latestSel.status;
    sessionMap['TOPIC_CREATION'] = {
      kind: 'TOPIC_CREATION', selectionId: latestSel.id,
      status: selStatus, startedAt: latestSel.createdAt, closedAt: latestSel.closedAt, raw: latestSel,
    };
    sessionMap['TOPIC_SELECTION'] = {
      kind: 'TOPIC_SELECTION', selectionId: latestSel.id,
      status: selStatus, startedAt: latestSel.createdAt, closedAt: latestSel.closedAt, raw: latestSel,
    };
  }

  const thesisExec = executionSessions.find(s => (s.durationWeeks || 0) >= 4);
  if (thesisExec) {
    sessionMap['THESIS_EXECUTION'] = {
      kind: 'THESIS_EXECUTION', id: thesisExec.id,
      status: (thesisExec.status === 'ACTIVE' || thesisExec.status === 'OPEN') ? 'OPEN' : thesisExec.status,
      startedAt: thesisExec.startedAt, closedAt: thesisExec.closedAt,
      durationWeeks: thesisExec.durationWeeks, raw: thesisExec,
    };
  }

  const toSessionKind = (stageType: string): SessionKind | null => {
    if (stageType === 'PRELIMINARY') return 'PRE_DEFENSE';
    if (stageType === 'FINAL') return 'FINAL_DEFENSE';
    return (SESSION_META[stageType as SessionKind] ? stageType : null) as SessionKind | null;
  };

  defenseSessions.forEach(s => {
    const kind = toSessionKind(s.stageType);
    if (kind) {
      if (!sessionMap[kind] || sessionMap[kind]!.status !== 'OPEN') {
        sessionMap[kind] = {
          kind, id: s.id,
          status: (s.status === 'ACTIVE' || s.status === 'OPEN') ? 'OPEN' : s.status,
          committeeId: s.committeeId,
          startedAt: s.startedAt, closedAt: s.closedAt, raw: s,
        };
      }
    }
  });

  const handleCreate = async (kind: SessionKind, durationWeeks?: number, committeeId?: string) => {
    const meta = SESSION_META[kind];
    setCreateError(null);
    try {
      if (meta.isDefense && meta.stageType) {
        const defPoints: Record<string, number> = {
          PROGRESS_1: 15, PROGRESS_2: 20, PRE_DEFENSE: 25, FINAL_DEFENSE: 40,
        };
        const res = await workflowService.createDefenseSession({
          committeeId: committeeId || 'GLOBAL',
          stageType: meta.stageType,
          maxPoints: defPoints[meta.stageType] || 25,
        });
        const opened = await workflowService.openDefenseSession(res.data.id);
        setDefenseSessions(prev => [...prev.filter(s => s.id !== opened.data.id), opened.data]);
      } else if (kind === 'TOPIC_SELECTION' || kind === 'TOPIC_CREATION') {
        const durationDays = durationWeeks ? durationWeeks * 7 : 5;
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
        const fmt = (d: Date) => d.toISOString().replace('Z', '');
        const res = await selectionSessionService.createSession({
          academicYear: '2025-2026', semester: 'SPRING',
          durationDays, createdBy: 'admin',
          startDate: fmt(startDate), endDate: fmt(endDate),
        });
        if (res.data) setSelectionSessions(prev => [...prev, res.data as SelectionSession]);
      } else {
        const res = await workflowService.createExecutionSession({
          departmentId: 'GLOBAL', academicYear: '2025-2026',
          semester: 'SPRING', durationWeeks,
        });
        setExecutionSessions(prev => [...prev.filter(s => s.id !== res.data.id), res.data]);
      }
      setCreatingKind(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      const msg = e?.response?.data?.error || e?.response?.data?.message || 'Сесс үүсгэхэд алдаа гарлаа.';
      setCreateError(typeof msg === 'string' ? msg : 'Сесс үүсгэхэд алдаа гарлаа.');
    }
  };

  const toggleSession = async (unified: UnifiedSession) => {
    const isOpen = unified.status === 'OPEN';
    const meta = SESSION_META[unified.kind];
    try {
      if ((unified.kind === 'PRE_DEFENSE' || unified.kind === 'FINAL_DEFENSE') && !unified.id && !isOpen) {
        const defPoints: Record<string, number> = { PRE_DEFENSE: 25, FINAL_DEFENSE: 40 };
        const created = await workflowService.createDefenseSession({
          committeeId: 'GLOBAL',
          stageType: meta.stageType!,
          maxPoints: defPoints[unified.kind],
        });
        const opened = await workflowService.openDefenseSession(created.data.id);
        setDefenseSessions(prev => [...prev.filter(s => s.id !== opened.data.id), opened.data]);
        return;
      }
      if (unified.kind === 'TOPIC_SELECTION' || unified.kind === 'TOPIC_CREATION') {
        if (!unified.selectionId) return;
        const res = isOpen
          ? await selectionSessionService.closeSession(unified.selectionId)
          : await selectionSessionService.openSession(unified.selectionId);
        if (res.data) setSelectionSessions(prev => prev.map(s => s.id === unified.selectionId ? res.data as SelectionSession : s));
      } else if (meta.isDefense) {
        if (!unified.id) return;
        const res = await (isOpen ? workflowService.closeDefenseSession(unified.id) : workflowService.openDefenseSession(unified.id));
        setDefenseSessions(prev => prev.map(s => s.id === unified.id ? res.data : s));
      } else {
        if (!unified.id) return;
        const res = await (isOpen ? workflowService.closeExecutionSession(unified.id) : workflowService.openExecutionSession(unified.id));
        setExecutionSessions(prev => prev.map(s => s.id === unified.id ? res.data : s));
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      const msg = e?.response?.data?.error || e?.response?.data?.message || '';
      if (msg) setCreateError(typeof msg === 'string' ? msg : 'Алдаа гарлаа.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "stages" | "methods")}>
        <TabsList>
          <TabsTrigger value="stages">Сессийн удирдлага</TabsTrigger>
          <TabsTrigger value="methods">Оноолох арга</TabsTrigger>
        </TabsList>

        <TabsContent value="stages">
          {loading && <div className="text-center py-12 text-ink-400 text-sm">Ачааллаж байна...</div>}

          {!loading && (
            <div className="border border-border rounded-md bg-surface divide-y divide-border">
              {SESSION_ORDER.map((kind, idx) => {
                const meta = SESSION_META[kind];
                const unified = sessionMap[kind];
                const isOpen = unified?.status === 'OPEN';
                const exists = !!unified?.id || !!unified?.selectionId;
                const Icon = meta.icon;
                const committeeName =
                  unified?.committeeId && unified.committeeId !== 'GLOBAL'
                    ? committees.find(c => c.id === unified.committeeId)?.name
                    : null;
                const stateKey: "open" | "closed" | "none" = isOpen ? "open" : exists ? "closed" : "none";

                return (
                  <div key={kind} className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <span className="text-[11px] font-medium text-ink-400 tabular-nums tracking-wider mt-0.5 w-4">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <Icon className="w-4 h-4 text-ink-500 mt-0.5 shrink-0" strokeWidth={1.6} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-[14px] font-semibold text-ink-900 tracking-tight leading-none">
                              {meta.label}
                            </h3>
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-600">
                              <StateDot state={stateKey} />
                              {isOpen ? "Идэвхтэй" : exists ? "Хаалттай" : "Тохиргоогүй"}
                            </span>
                            {meta.hasExternalExpert && (
                              <span className="text-[10px] uppercase tracking-wider text-ink-500 border border-border-strong rounded-sm px-1.5 py-0.5">
                                Эксперт
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-500 mt-1.5 leading-relaxed">{meta.description}</p>
                          {(unified?.startedAt || committeeName) && (
                            <p className="text-[11px] text-ink-400 mt-2 tabular-nums">
                              {unified?.startedAt && <>Эхэлсэн: {unified.startedAt.split('T')[0]}</>}
                              {unified?.closedAt && <> · Дууссан: {unified.closedAt.split('T')[0]}</>}
                              {committeeName && <span className="text-ink-600"> · {committeeName}</span>}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(!exists && kind !== 'TOPIC_CREATION' && kind !== 'PRE_DEFENSE' && kind !== 'FINAL_DEFENSE') ? (
                          <Button size="sm" onClick={() => setCreatingKind(kind)}>
                            <Plus className="w-3.5 h-3.5" strokeWidth={1.8} /> Сесс үүсгэх
                          </Button>
                        ) : (unified || kind === 'PRE_DEFENSE' || kind === 'FINAL_DEFENSE') ? (
                          <button
                            type="button"
                            onClick={() => toggleSession(unified ?? { kind, status: 'CLOSED' })}
                            className="flex items-center gap-2 text-ink-700 hover:text-ink-900 transition-colors group"
                          >
                            {isOpen
                              ? <><ToggleRight className="w-6 h-6 text-ink-900" strokeWidth={1.6} /><span className="text-xs font-medium tracking-tight">Идэвхтэй</span></>
                              : <><ToggleLeft className="w-6 h-6 text-ink-400 group-hover:text-ink-700" strokeWidth={1.6} /><span className="text-xs font-medium tracking-tight">Идэвхжүүлэх</span></>
                            }
                          </button>
                        ) : null}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {!loading && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Хамгаалалтын шатуудын товч диаграм</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="relative">
                  <div className="absolute left-0 right-0 top-[11px] h-px bg-border" />
                  <div className="flex justify-between relative">
                    {(["PROGRESS_1", "PROGRESS_2", "PRE_DEFENSE", "FINAL_DEFENSE"] as const).map((kind, idx) => {
                      const meta = SESSION_META[kind];
                      const unified = sessionMap[kind];
                      const active = unified?.status === 'OPEN';
                      const stateKey: "open" | "closed" | "none" = active ? "open" : unified ? "closed" : "none";
                      return (
                        <div key={kind} className="flex flex-col items-center gap-3 w-[22%]">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium tracking-tight bg-surface border-2 ${
                            active ? "border-ink-900 text-ink-900" : "border-border-strong text-ink-400"
                          }`}>
                            {idx + 1}
                          </div>
                          <p className="text-xs font-medium text-center text-ink-800 leading-tight tracking-tight">
                            {meta.label.split('—')[0].trim()}
                          </p>
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-ink-500">
                            <StateDot state={stateKey} />
                            {active ? "Идэвхтэй" : unified ? "Хаалттай" : "Тохиргоогүй"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="methods">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-500">Хамгаалалтын шатуудын оноог тохируулна уу.</p>
              <Button size="sm" onClick={() => { setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 2000); }}>
                {saveStatus === "saved" ? <><CheckCircle2 className="w-3.5 h-3.5" /> Хадгалагдлаа</> : "Хадгалах"}
              </Button>
            </div>
            <div className="space-y-3">
              {schemes.map(scheme => (
                <GradingSchemeCard
                  key={scheme.sessionKind}
                  scheme={scheme}
                  onChange={updated => setSchemes(prev => prev.map(s => s.sessionKind === updated.sessionKind ? updated : s))}
                />
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Гадаад экспертийн оролцоо</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-ink-600 leading-relaxed">
                <p>
                  <strong className="text-ink-900">Урьдчилсан хамгаалалт.</strong> Гадаад эксперт комиссын
                  гишүүнтэй тэгш эрхтэй үнэлнэ (сохор). Нарийн бичгийн дарга дундажийг нийтэлнэ.
                </p>
                <p>
                  <strong className="text-ink-900">Эцсийн хамгаалалт.</strong> Гадаад эксперт нэмэлт 10 оноо
                  үнэлнэ, комиссын нийт үнэлгээний дүнд оролцоно.
                </p>
                <p>
                  Эксперт нь <strong className="text-ink-900">багшийн эрхээр</strong> нэвтэрч,
                  EXTERNAL_EXPERT үүрэгтэй комиссын гишүүн байна.
                </p>
                <p className="text-xs text-ink-400 pt-2">
                  Нэвтрэх нэр, нууц үгийг Тэнхимийн админ урьдчилан тохируулсан байна.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {creatingKind && (
        <CreateSessionModal
          kind={creatingKind}
          committees={committees}
          onClose={() => setCreatingKind(null)}
          onCreate={handleCreate}
        />
      )}

      {saveStatus === "saved" && (
        <Toast message="Тохиргоо хадгалагдлаа" onClose={() => setSaveStatus("idle")} />
      )}
      {createError && <Toast message={createError} onClose={() => setCreateError(null)} tone="negative" />}
    </div>
  );
}
