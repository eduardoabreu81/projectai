import { TaskStatus } from "@prisma/client";

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function isOptionalString(v: unknown): v is string | undefined {
  return v === undefined || v === null || typeof v === "string";
}

export function isTaskStatus(v: unknown): v is TaskStatus {
  return typeof v === "string" && Object.values(TaskStatus).includes(v as TaskStatus);
}

export function parseIsoDateOrNull(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string") return null;

  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;

  return d;
}

/**
 * Parses a positive integer from unknown input.
 * Returns null when invalid.
 */
export function parsePositiveInt(v: unknown): number | null {
  if (v === null || v === undefined) return null;

  const raw = typeof v === "string" ? v.trim() : v;
  if (raw === "") return null;

  const n = typeof raw === "number" ? raw : Number(raw);

  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n <= 0) return null;

  return n;
}
