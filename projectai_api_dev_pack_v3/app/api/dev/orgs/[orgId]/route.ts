import { prisma } from "@/lib/prisma";
import { ok, fail, parseIntParam } from "@/lib/http";
import { isNonEmptyString } from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: { orgId: string } };

export async function GET(_req: Request, ctx: Ctx) {
  const orgIdP = parseIntParam(ctx.params.orgId, "orgId");
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const org = await prisma.organization.findUnique({
    where: { id: orgIdP.value },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });

  if (!org) return fail(404, "Organization not found");

  return ok({ orgId: org.id, org });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const orgIdP = parseIntParam(ctx.params.orgId, "orgId");
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  if (!isNonEmptyString(body?.name)) return fail(400, "name is required");

  try {
    const org = await prisma.organization.update({
      where: { id: orgIdP.value },
      data: { name: body.name.trim() },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return ok({ org });
  } catch {
    return fail(404, "Organization not found");
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const orgIdP = parseIntParam(ctx.params.orgId, "orgId");
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  try {
    await prisma.organization.delete({ where: { id: orgIdP.value } });
    return ok({ deleted: true, orgId: orgIdP.value });
  } catch {
    return fail(404, "Organization not found");
  }
}
