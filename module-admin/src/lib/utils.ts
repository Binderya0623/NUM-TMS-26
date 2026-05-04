import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: string | null | undefined): boolean {
  return !!s && UUID_RE.test(s);
}

export function resolveName(
  id: string | null | undefined,
  map: Record<string, string> = {},
  fallback = "Тодорхойгүй"
): string {
  if (!id) return fallback;
  const name = map[id];
  if (name) return name;
  return UUID_RE.test(id) ? fallback : id;
}

export function initialsFromName(name?: string | null): string {
  if (!name) return "??";
  if (UUID_RE.test(name)) return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.map(p => p[0]).join("").toUpperCase();
  return letters.substring(0, 2) || "??";
}
