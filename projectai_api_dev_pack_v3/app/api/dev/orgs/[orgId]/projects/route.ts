import { prisma } from "@/lib/prisma";
import { ok, fail, parseIntParam } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: { orgId: string } };

export async function GET(_req: Request, ctx: Ctx) {
  const orgIdP = parseIntParam(ctx.params.orgId, "orgId");
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const projects = await prisma.project.findMany({
    where: { orgId: orgIdP.value },
    orderBy: { id: "asc" },
    select: { id: true, orgId: true, name: true, description: true, createdAt: true, updatedAt: true },
  });

  return ok({ orgId: orgIdP.value, projects });
}
