type Status = "Submitted" | "Resubmitted" | "Approved" | "Revision Required" | "Finalized" | "Closed" | "Pending" | "In Progress";
type Tone = "positive" | "warning" | "negative" | "neutral";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusMap: Record<Status, { label: string; tone: Tone }> = {
  "Submitted":         { label: "Submitted",         tone: "neutral"  },
  "Resubmitted":       { label: "Resubmitted",       tone: "warning"  },
  "Approved":          { label: "Approved",          tone: "positive" },
  "Revision Required": { label: "Revision Required", tone: "negative" },
  "Finalized":         { label: "Finalized",         tone: "positive" },
  "Closed":            { label: "Closed",            tone: "neutral"  },
  "Pending":           { label: "Pending",           tone: "warning"  },
  "In Progress":       { label: "In Progress",       tone: "neutral"  },
};

const toneDot: Record<Tone, string> = {
  positive: "bg-[var(--color-dot-positive)]",
  warning:  "bg-[var(--color-dot-warning)]",
  negative: "bg-[var(--color-dot-negative)]",
  neutral:  "bg-[var(--color-dot-neutral)]",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const entry = statusMap[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium tracking-tight ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${toneDot[entry.tone]}`} />
      {entry.label}
    </span>
  );
}
