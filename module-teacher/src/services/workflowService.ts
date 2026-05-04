import { workflowApi } from '../lib/apiClient';

export interface DefenseSession {
  id: string;
  committeeId?: string;
  supervisorId?: string;
  departmentId?: string;
  stageType: string;
  status: string;
  maxPoints?: number;
  scheduledDate?: string;
  location?: string;
  notes?: string;
  startedBy?: string;
  startedAt?: string;
  closedAt?: string;
  createdAt?: string;
}

export interface ExecutionSession {
  id: string;
  departmentId?: string;
  academicYear?: string;
  semester?: string;
  durationWeeks?: number;
  status: string;
  notes?: string;
  startedBy?: string;
  startedAt?: string;
  closedBy?: string;
  closedAt?: string;
  createdAt?: string;
  // Some admin pages still read these — kept optional for compatibility.
  stageType?: string;
}

export interface WorkflowStageItem {
  stageId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  weightPercent: number;
  status: string;
  allowedEvaluatorRoles?: string[];
  criteria?: Array<{ criterionId: string; name: string; maxScore: number; description?: string }>;
}

export interface Workflow {
  workflowId: string;
  departmentId?: string;
  title: string;
  status: string;
  stages: WorkflowStageItem[];
}

export const workflowService = {
  // ── Workflow primitives (kept) ─────────────────────────────────────────
  createWorkflow: (body: { departmentId: string; title: string }) =>
    workflowApi.post<Workflow>('/api/workflows', body),

  addStage: (workflowId: string, body: {
    name: string;
    startDate?: string;
    endDate?: string;
    weightPercent: number;
    stageOrder: number;
    criteria?: Array<{ name: string; maxScore: number; description?: string }>;
    allowedEvaluatorRoles?: string[];
  }) => workflowApi.post<Workflow>(`/api/workflows/${workflowId}/stages`, body),

  activateStage: (workflowId: string, stageId: string) =>
    workflowApi.patch<Workflow>(`/api/workflows/${workflowId}/stages/${stageId}/activate`),

  closeStage: (workflowId: string, stageId: string) =>
    workflowApi.patch<Workflow>(`/api/workflows/${workflowId}/stages/${stageId}/close`),

  // ── Defense sessions ──────────────────────────────────────────────────
  getDefenseSessions: (params?: {
    committeeId?: string;
    departmentId?: string;
    status?: string;
    supervisorId?: string;
    stageType?: string;
  }) =>
    workflowApi.get<DefenseSession[]>('/api/defense-sessions', { params })
      .catch(() => ({ data: [] as DefenseSession[] })),

  getDefenseSession: (id: string) =>
    workflowApi.get<DefenseSession>(`/api/defense-sessions/${id}`)
      .catch(() => ({ data: null as unknown as DefenseSession })),

  getDefenseSessionByCommitteeStage: (committeeId: string, stageType: string) =>
    workflowApi.get<DefenseSession>('/api/defense-sessions/by-committee-stage', {
      params: { committeeId, stageType },
    }).catch(() => ({ data: null as unknown as DefenseSession })),

  createDefenseSession: (body: {
    stageType: string;
    supervisorId?: string;
    committeeId?: string;
    departmentId?: string;
    maxPoints?: number;
    scheduledDate?: string;
    location?: string;
    notes?: string;
  }) => workflowApi.post<DefenseSession>('/api/defense-sessions', body),

  updateDefenseSession: (id: string, body: {
    scheduledDate?: string;
    location?: string;
    notes?: string;
  }) => workflowApi.patch<DefenseSession>(`/api/defense-sessions/${id}`, body),

  openDefenseSession: (id: string, actorId?: string) =>
    workflowApi.patch<DefenseSession>(`/api/defense-sessions/${id}/open`, { actorId }),

  closeDefenseSession: (id: string, actorId?: string) =>
    workflowApi.patch<DefenseSession>(`/api/defense-sessions/${id}/close`, { actorId }),

  // ── Execution sessions ────────────────────────────────────────────────
  getExecutionSessions: (params?: { departmentId?: string; status?: string }) =>
    workflowApi.get<ExecutionSession[]>('/api/execution-sessions', { params })
      .catch(() => ({ data: [] as ExecutionSession[] })),

  getActiveExecutionSession: (departmentId?: string) =>
    workflowApi.get<ExecutionSession>('/api/execution-sessions/active', {
      params: departmentId ? { departmentId } : {},
    }).catch(() => ({ data: null as unknown as ExecutionSession })),

  createExecutionSession: (body: {
    departmentId?: string;
    academicYear?: string;
    semester?: string;
    durationWeeks?: number;
    notes?: string;
  }) => workflowApi.post<ExecutionSession>('/api/execution-sessions', body),

  openExecutionSession: (id: string, actorId?: string) =>
    workflowApi.patch<ExecutionSession>(`/api/execution-sessions/${id}/open`, { actorId }),

  closeExecutionSession: (id: string, actorId?: string) =>
    workflowApi.patch<ExecutionSession>(`/api/execution-sessions/${id}/close`, { actorId }),
};
