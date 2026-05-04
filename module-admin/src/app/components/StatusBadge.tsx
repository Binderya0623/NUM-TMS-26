type Status = "Submitted" | "Resubmitted" | "Approved" | "Revision Required" | "Finalized" | "Closed" | "Pending" | "In Progress";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

/**
 * Subtle, monochrome status indicator: a small semantic dot + label.
 * No filled backgrounds, no loud colors. The only color in the UI is
 * the dot — the label itself stays in neutral ink.
 */
const dotColor: Record<Status, string> = {
  "Approved":          "bg-[var(--color-dot-positive)]",
  "Finalized":         "bg-[var(--color-dot-positive)]",
  "Resubmitted":       "bg-[var(--color-dot-warning)]",
  "Pending":           "bg-[var(--color-dot-warning)]",
  "Revision Required": "bg-[var(--color-dot-negative)]",
  "Submitted":         "bg-[var(--color-dot-neutral)]",
  "In Progress":       "bg-[var(--color-dot-neutral)]",
  "Closed":            "bg-[var(--color-ink-300)]",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium tracking-tight text-ink-700 ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status]}`} />
      {status}
    </span>
  );
}
