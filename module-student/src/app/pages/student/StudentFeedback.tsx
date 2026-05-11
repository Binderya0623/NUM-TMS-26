import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  MessageSquare, ChevronDown, ChevronUp, FileText, Download, AlertCircle,
} from "lucide-react";
import { thesisService, type ThesisReport } from "../../../services/thesisService";
import { evaluationService, type ReviewDocument } from "../../../services/evaluationService";
import { userService } from "../../../services/userService";
import { getStoredUser } from "../../../lib/authGuard";
import { resolveName, isUuid, initialsFromName, fmtDateTime} from "../../../lib/utils";
import { RichText } from "../../components/RichText";

const reportTypeLabel = (t: string) => {
  const map: Record<string, string> = {
    EXECUTION_PROGRESS: "Явцын тайлан",
    PROGRESS_1: "Явц 1-ийн тайлан",
    PROGRESS_2: "Явц 2-ын тайлан",
    PRELIMINARY: "Урьдчилсан хамгаалалт",
    FINAL: "Эцсийн хамгаалалт",
  };
  return map[t] || t;
};

export default function StudentFeedback() {
  const user = getStoredUser();
  const studentId = user?.userId || user?.username || "";

  const [reports, setReports] = useState<ThesisReport[]>([]);
  const [reviewDocs, setReviewDocs] = useState<ReviewDocument[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    Promise.all([
      thesisService.getMyReports(studentId).catch(() => ({ data: [] as ThesisReport[] })),
      evaluationService.getMyReviewDocuments(studentId),
    ])
      .then(async ([reportsRes, docsRes]) => {
        const reviewed = (reportsRes.data || []).filter(r =>
          (r.status === "REVISION_REQUIRED" || r.status === "REVIEWED" || r.status === "APPROVED") &&
          (r.supervisorNotes || r.reviewComment),
        );
        setReports(reviewed);
        setReviewDocs(docsRes.data || []);
        if (reviewed.length > 0) setExpandedIds(new Set([reviewed[0].id]));

        const ids = new Set<string>();
        reviewed.forEach(r => { if (r.supervisorId) ids.add(r.supervisorId); if (r.reviewedBy && isUuid(r.reviewedBy)) ids.add(r.reviewedBy); });
        (docsRes.data || []).forEach(d => { if (d.reviewerId) ids.add(d.reviewerId); });
        const map: Record<string, string> = {};
        await Promise.all(Array.from(ids).map(id =>
          userService.getById(id).then(res => { if (res.data?.displayName) map[id] = res.data.displayName; }).catch(() => {})
        ));
        setUserMap(map);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pendingCount = reports.filter(r => r.status === "REVISION_REQUIRED").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Удирдагчийн санал хүсэлт</h1>
          <p className="text-sm text-ink-500 mt-1">Тайлбар, зөвлөмжийг харж, засваруудынхаа дэвшлийг хянах.</p>
        </div>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-2 text-xs text-ink-700 border border-border-strong rounded-md px-3 h-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-dot-warning)]" />
            {pendingCount} хүлээгдэж буй засвар
          </span>
        )}
      </div>

      {reviewDocs.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-ink-900 tracking-tight flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-ink-700" strokeWidth={1.6} /> Шүүмжлэгчийн шүүмж
            </h2>
            <p className="text-xs text-ink-500 mb-4">
              Комиссын шүүмжлэгч танай дипломын ажилд шүүмж бичсэн байна. Доороос татаж авна уу.
            </p>
            <div className="space-y-2">
              {reviewDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-surface-muted rounded-md p-3 border border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-ink-500 shrink-0" strokeWidth={1.6} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate tracking-tight">{doc.originalFilename}</p>
                      <p className="text-xs text-ink-500 tabular-nums">
                        {fmtDateTime(doc.uploadedAt) || "Огноогүй"} · Шүүмжлэгч: {resolveName(doc.reviewerId, userMap, "Тодорхойгүй")}
                      </p>
                    </div>
                  </div>
                  <a
                    href={evaluationService.reviewDocumentDownloadUrl(doc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700 border border-border-strong rounded-md px-3 h-8 hover:border-ink-900 hover:text-ink-900 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={1.6} /> Татах
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-ink-400 text-sm">Ачааллаж байна...</div>
      ) : reports.length === 0 && reviewDocs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-5 h-5 text-ink-400" strokeWidth={1.4} />
            </div>
            <h3 className="text-base font-semibold text-ink-900 mb-2 tracking-tight">Санал хүсэлт байхгүй</h3>
            <p className="text-sm text-ink-500 max-w-sm mx-auto">
              Таны тайлануудад удирдагч тайлбар үлдээсний дараа энд харагдана.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-surface rounded-md border border-border p-6 sm:p-8">
          <div className="relative border-l border-border space-y-6 pb-4 ml-4 sm:ml-6">
            {reports.map((report) => {
              const isExpanded = expandedIds.has(report.id);
              const isRevision = report.status === "REVISION_REQUIRED";
              const comment = report.supervisorNotes || report.reviewComment || "";

              return (
                <div key={report.id} className="relative pl-6 sm:pl-8">
                  <div className={`absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full ${
                    isRevision ? "bg-[var(--color-dot-warning)]" : "bg-[var(--color-dot-positive)]"
                  }`} />

                  <Card className={isRevision ? "border-ink-900" : ""}>
                    <CardContent className="p-0">
                      <div
                        className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer"
                        onClick={() => toggleExpand(report.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border border-border-strong mt-0.5">
                            <AvatarFallback className="text-xs font-medium">
                              {initialsFromName(resolveName(report.supervisorId, userMap, "Удирдагч багш"))}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-ink-900 tracking-tight">
                                {resolveName(report.reviewedBy || report.supervisorId, userMap, "Удирдагч багш")}
                              </h3>
                              <span className="text-xs text-ink-500 tabular-nums">
                                {fmtDateTime(report.reviewedAt) || "Огноогүй"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-[10px]">{reportTypeLabel(report.reportType)}</Badge>
                              <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  isRevision ? "bg-[var(--color-dot-warning)]" : "bg-[var(--color-dot-positive)]"
                                }`} />
                                {isRevision ? "Засвар шаардлагатай" : "Хянагдсан"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          className="shrink-0 text-ink-400 hover:text-ink-900 p-1 transition-colors self-end sm:self-start"
                          aria-label="Дэлгэрэнгүй"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" strokeWidth={1.6} /> : <ChevronDown className="w-4 h-4" strokeWidth={1.6} />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-0 border-t border-border">
                          <div className="bg-surface-muted rounded-md p-4 my-4 text-sm text-ink-700 leading-relaxed border border-border">
                            <RichText
                              html={comment}
                              fallback={<span>Тайлбар байхгүй.</span>}
                            />
                          </div>

                          {isRevision && (
                            <div className="bg-surface-muted border border-border rounded-md p-3 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-[var(--color-dot-warning)] shrink-0 mt-0.5" strokeWidth={1.6} />
                              <div>
                                <p className="text-xs font-semibold text-ink-900 tracking-tight">Засвар шаардлагатай</p>
                                <p className="text-xs text-ink-500 mt-0.5">
                                  Дипломын тайлан хэсгээс тайлангаа засварлан дахин илгээх боломжтой.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            <div className="relative pl-8 pt-4">
              <div className="absolute -left-[5px] top-[18px] w-2.5 h-2.5 rounded-full bg-border-strong" />
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500 pl-2">Диплом эхэлсэн</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
