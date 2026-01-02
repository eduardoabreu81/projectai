import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/http";
import { isNonEmptyString } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const orgs = await prisma.organization.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
  return ok({ orgs });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  if (!isNonEmptyString(body?.name)) return fail(400, "name is required");

  const org = await prisma.organization.create({
    data: { name: body.name.trim() },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });

  return ok({ org });
}
