import { prisma } from "@/lib/prisma";
import { ok, fail, parseIntParam } from "@/lib/http";

export const runtime = "nodejs";

type Ctx = { params: { orgId: string } };

export async function GET(req: Request, ctx: Ctx) {
  const orgIdP = parseIntParam(ctx.params.orgId, "orgId");
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const url = new URL(req.url);
  const projectIdRaw = url.searchParams.get("projectId");

  const where: any = { orgId: orgIdP.value };
  if (projectIdRaw) {
    const p = parseIntParam(projectIdRaw, "projectId");
    if (!p.ok) return fail(400, p.error);
    where.projectId = p.value;
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ projectId: "asc" }, { position: "asc" }, { id: "asc" }],
    select: {
      id: true,
      orgId: true,
      projectId: true,
      title: true,
      description: true,
      status: true,
      position: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return ok({ orgId: orgIdP.value, tasks });
}
