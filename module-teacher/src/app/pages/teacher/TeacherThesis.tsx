/**
 * TeacherThesis.tsx
 *
 * Provides a local interface for managing teacher topics,
 * reviewing requests, and reviewing student plans.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

import TeacherTopicManagementTab from './tabs/TeacherTopicManagementTab';
import TeacherTopicRequestsTab from './tabs/TeacherTopicRequestsTab';
import TeacherStudentProposalsTab from './tabs/TeacherStudentProposalsTab';
import TeacherPlanReviewTab from './tabs/TeacherPlanReviewTab';

import { topicService } from '../../../services/topicService';
import { planService } from '../../../services/planService';
import { getStoredUser } from '../../../lib/authGuard';

export default function TeacherThesis() {
  const [activeTab, setActiveTab] = useState('topics');
  const [counts, setCounts] = useState({ topics: 0, requests: 0, proposals: 0, plans: 0 });

  useEffect(() => {
    const user = getStoredUser();
    const teacherId = user?.userId || user?.username || '';
    if (!teacherId) return;
    Promise.all([
      topicService.getTopics().catch(() => ({ data: [] as any[] })),
      topicService.getTopicRequests({ status: 'PENDING' }).catch(() => ({ data: [] as any[] })),
      topicService.getStudentProposals(teacherId).catch(() => ({ data: [] as any[] })),
      planService.getPlans({ supervisorId: teacherId, status: 'SUBMITTED' }).catch(() => ({ data: [] as any[] })),
    ]).then(([tr, rr, pr, plr]) => {
      const myTopics = (tr.data || []).filter((t: any) => t.createdById === teacherId);
      const myProposals = (pr.data || []).filter((p: any) => p.status === 'PENDING_TEACHER_APPROVAL');
      setCounts({
        topics: myTopics.length,
        requests: (rr.data || []).length,
        proposals: myProposals.length,
        plans: (plr.data || []).length,
      });
    });
  }, []);

  const pendingTotal = counts.requests + counts.proposals + counts.plans;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Hero card — matches TeacherStudents pattern */}
      <Card>
        <div className="h-0.5 w-full bg-border-strong relative overflow-hidden rounded-t-md">
          <div
            className="h-full bg-accent transition-all duration-700"
            style={{ width: `${counts.topics > 0 ? 100 : 30}%` }}
          />
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight">
                  <span className={`w-1.5 h-1.5 rounded-full ${pendingTotal > 0 ? 'bg-[var(--color-dot-warning)]' : 'bg-[var(--color-dot-positive)]'}`} />
                  {pendingTotal > 0 ? `${pendingTotal} ажил хүлээгдэж байна` : 'Хүлээгдэж буй ажил алга'}
                </span>
                <span className="text-[11px] uppercase tracking-wider font-medium text-ink-500 inline-flex items-center gap-1">
                  Сэдэв ба төлөвлөгөө
                </span>
              </div>
              <h2 className="text-lg font-semibold text-ink-900 tracking-tight leading-tight">Дипломын сэдэв удирдлага</h2>
              <p className="text-sm text-ink-500 mt-1">
                Сэдвээ үүсгэх, оюутнуудын хүсэлт хүлээн авах, төлөвлөгөө хянах үйлдлүүдийг доороос гүйцэтгэнэ.
              </p>
            </div>
            <div className="text-right shrink-0 border border-border rounded-md p-3">
              <div className="text-2xl font-semibold text-ink-900 tabular-nums tracking-tight">{counts.topics}</div>
              <p className="text-[10px] uppercase tracking-wider font-medium text-ink-500 mt-1">Сэдэв</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="topics">
            <span className="flex items-center gap-2">
              Миний сэдвүүд
              {counts.topics > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-surface-muted text-ink-700 border border-border tabular-nums">
                  {counts.topics}
                </span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger value="requests">
            <span className="flex items-center gap-2">
              Сэдвийн хүсэлтүүд
              {counts.requests > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-ink-900 text-white tabular-nums">
                  {counts.requests}
                </span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger value="proposals">
            <span className="flex items-center gap-2">
              Оюутны дэвшүүлсэн
              {counts.proposals > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-ink-900 text-white tabular-nums">
                  {counts.proposals}
                </span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger value="plans">
            <span className="flex items-center gap-2">
              Төлөвлөгөө хянах
              {counts.plans > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-ink-900 text-white tabular-nums">
                  {counts.plans}
                </span>
              )}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics"><TeacherTopicManagementTab /></TabsContent>
        <TabsContent value="requests"><TeacherTopicRequestsTab /></TabsContent>
        <TabsContent value="proposals"><TeacherStudentProposalsTab /></TabsContent>
        <TabsContent value="plans"><TeacherPlanReviewTab /></TabsContent>
      </Tabs>
    </div>
  );
}
