import { ok } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  return ok({ ts: new Date().toISOString() });
}
