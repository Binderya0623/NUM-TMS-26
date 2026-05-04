import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface TimelineStage {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
  date?: string;
  score?: string;
}

interface ThesisTimelineProps {
  stages: TimelineStage[];
}

export function ThesisTimeline({ stages }: ThesisTimelineProps) {
  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={stage.id} className="relative">
          {index < stages.length - 1 && (
            <div
              className={`absolute left-5 top-12 bottom-0 w-px ${
                stage.status === "completed" ? "bg-ink-900" : "bg-border-strong"
              }`}
            />
          )}

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {stage.status === "completed" ? (
                <div className="h-10 w-10 rounded-full bg-ink-900 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={1.8} />
                </div>
              ) : stage.status === "current" ? (
                <div className="h-10 w-10 rounded-full bg-surface border border-accent flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" strokeWidth={1.8} />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-surface border border-border-strong flex items-center justify-center">
                  <Circle className="h-4 w-4 text-ink-400" strokeWidth={1.6} />
                </div>
              )}
            </div>

            <Card className={`flex-1 ${stage.status === "current" ? "border-accent" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-ink-900 tracking-tight">{stage.title}</h3>
                    <p className="text-sm text-ink-600 mt-1">{stage.description}</p>
                    {stage.date && (
                      <p className="text-xs text-ink-500 mt-2 tabular-nums">
                        {stage.status === "completed" ? "Completed" : "Deadline"}: {stage.date}
                      </p>
                    )}
                  </div>
                  {stage.score && (
                    <div className="text-right shrink-0">
                      <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">Score</p>
                      <p className="text-lg font-semibold text-ink-900 tabular-nums tracking-tight">{stage.score}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}
