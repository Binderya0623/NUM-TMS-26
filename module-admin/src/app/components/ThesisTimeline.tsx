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
          {/* Connecting Line */}
          {index < stages.length - 1 && (
            <div
              className={`absolute left-5 top-12 bottom-0 w-0.5 ${
                stage.status === "completed"
                  ? "bg-accent"
                  : "bg-border"
              }`}
            />
          )}
          
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              {stage.status === "completed" ? (
                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              ) : stage.status === "current" ? (
                <div className="h-10 w-10 rounded-full bg-accent-softer border-2 border-accent flex items-center justify-center">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-surface-sunken flex items-center justify-center">
                  <Circle className="h-5 w-5 text-ink-400" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <Card className={`flex-1 ${stage.status === "current" ? "border-accent shadow-[0_3px_10px_rgba(16,32,51,0.10)]" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink-900">{stage.title}</h3>
                    <p className="text-sm text-ink-600 mt-1">{stage.description}</p>
                    {stage.date && (
                      <p className="text-xs text-ink-500 mt-2">
                        {stage.status === "completed" ? "Completed" : "Deadline"}: {stage.date}
                      </p>
                    )}
                  </div>
                  {stage.score && (
                    <div className="ml-4 text-right">
                      <p className="text-sm text-ink-500">Score</p>
                      <p className="text-lg font-bold text-accent">{stage.score}</p>
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
