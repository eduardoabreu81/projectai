import { headers } from "next/headers";

export type RequestContext = {
  orgId: number;
  userId: number;
};

function toInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  const orgId = toInt(h.get("x-org-id"));
  const userId = toInt(h.get("x-user-id"));

  if (orgId && userId) return { orgId, userId };

  if (process.env.NODE_ENV !== "production") return { orgId: 1, userId: 1 };

  throw new Error("Missing x-org-id or x-user-id");
}
