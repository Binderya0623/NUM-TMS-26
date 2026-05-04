import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max width class, default "max-w-md" */
  maxWidth?: string;
  /** If true dialog is wider with a fixed height scroll container */
  scrollable?: boolean;
  /** Close when clicking the backdrop overlay */
  closeOnOverlayClick?: boolean;
}

/**
 * Minimalist modal. Flat 1px border, no glow. Subtle backdrop.
 */
export function Dialog({
  open,
  onClose,
  children,
  maxWidth = "max-w-md",
  scrollable = false,
  closeOnOverlayClick = true,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10,10,10,0.32)" }}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={`relative w-full ${maxWidth} bg-surface border border-border-strong rounded-md ${scrollable ? "max-h-[90vh] overflow-hidden flex flex-col" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

interface DialogHeaderProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
}

export function DialogHeader({ title, icon, onClose }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-ink-700 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>}
        <h2 className="text-[15px] font-semibold text-ink-900 tracking-tight">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="text-ink-400 hover:text-ink-900 hover:bg-accent-softer rounded-md p-1.5 transition-colors"
        aria-label="Хаах"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function DialogBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 ${className}`}>{children}</div>
  );
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 justify-end px-6 py-4 border-t border-border shrink-0">
      {children}
    </div>
  );
}

/** Confirmation dialog. Variants retained for API compat but rendered monochrome. */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger" | "warning";
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel = "Баталгаажуулах", cancelLabel = "Цуцлах",
  variant = "primary", icon,
}: ConfirmDialogProps) {
  // All variants render monochrome; a subtle dot differentiates severity.
  const dotColor =
    variant === "danger"  ? "bg-[var(--color-dot-negative)]" :
    variant === "warning" ? "bg-[var(--color-dot-warning)]"  :
                             "bg-ink-900";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="max-w-sm">
      <DialogBody className="py-7">
        <div className="flex items-start gap-3">
          {icon ? (
            <div className="w-10 h-10 border border-border-strong rounded-md flex items-center justify-center shrink-0 text-ink-700 [&>svg]:w-5 [&>svg]:h-5">
              {icon}
            </div>
          ) : (
            <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${dotColor}`} />
          )}
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-ink-900 tracking-tight mb-1">{title}</h3>
            {description && <p className="text-sm text-ink-500 leading-relaxed">{description}</p>}
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <button
          onClick={onClose}
          className="px-4 h-9 border border-border-strong rounded-md text-sm font-medium text-ink-700 hover:border-ink-900 hover:text-ink-900 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="px-4 h-9 rounded-md text-sm font-medium bg-ink-900 text-white hover:bg-black transition-colors"
        >
          {confirmLabel}
        </button>
      </DialogFooter>
    </Dialog>
  );
}

/** Slide-in right-side panel (drawer) */
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, children, width = "max-w-md" }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(10,10,10,0.28)" }}
        onClick={onClose}
      />
      <div className={`fixed right-0 top-0 h-full w-full ${width} bg-surface border-l border-border-strong z-50 flex flex-col`}>
        {children}
      </div>
    </>
  );
}
