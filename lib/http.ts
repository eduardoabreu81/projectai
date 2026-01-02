import { NextResponse } from "next/server";

export function ok(data: Record<string, unknown> = {}, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data }, init);
}

export function fail(
  status: number,
  message: string,
  data: Record<string, unknown> = {}
) {
  return NextResponse.json({ ok: false, message, ...data }, { status });
}

export function parseIntParam(value: string | null, fieldName: string) {
  if (!value) return { ok: false as const, error: `${fieldName} is required` };
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    return { ok: false as const, error: `${fieldName} must be a positive integer` };
  }
  return { ok: true as const, value: n };
}

export function parseBodyInt(value: unknown, fieldName: string) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    return { ok: false as const, error: `${fieldName} must be a positive integer` };
  }
  return { ok: true as const, value: n };
}
