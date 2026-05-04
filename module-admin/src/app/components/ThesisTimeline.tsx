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
                  ? "bg-[#1455BD]"
                  : "bg-slate-200"
              }`}
            />
          )}
          
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              {stage.status === "completed" ? (
                <div className="h-10 w-10 rounded-full bg-[#1455BD] flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              ) : stage.status === "current" ? (
                <div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-[#1455BD] flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#1455BD]" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Circle className="h-5 w-5 text-slate-400" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <Card className={`flex-1 ${stage.status === "current" ? "border-[#1455BD] shadow-md" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{stage.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{stage.description}</p>
                    {stage.date && (
                      <p className="text-xs text-slate-500 mt-2">
                        {stage.status === "completed" ? "Completed" : "Deadline"}: {stage.date}
                      </p>
                    )}
                  </div>
                  {stage.score && (
                    <div className="ml-4 text-right">
                      <p className="text-sm text-slate-500">Score</p>
                      <p className="text-lg font-bold text-[#1455BD]">{stage.score}</p>
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
