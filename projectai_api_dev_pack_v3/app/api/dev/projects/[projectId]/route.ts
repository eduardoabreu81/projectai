import { prisma } from "@/lib/prisma";
import { ok, fail, parseIntParam } from "@/lib/http";
import { isNonEmptyString, isOptionalString } from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: { projectId: string } };

function orgIdFromQuery(req: Request) {
  const url = new URL(req.url);
  return parseIntParam(url.searchParams.get("orgId"), "orgId");
}

export async function GET(req: Request, ctx: Ctx) {
  const orgIdP = orgIdFromQuery(req);
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const projectIdP = parseIntParam(ctx.params.projectId, "projectId");
  if (!projectIdP.ok) return fail(400, projectIdP.error);

  const project = await prisma.project.findFirst({
    where: { id: projectIdP.value, orgId: orgIdP.value },
    select: { id: true, orgId: true, name: true, description: true, createdAt: true, updatedAt: true },
  });

  if (!project) return fail(404, "Project not found");

  return ok({ orgId: orgIdP.value, projectId: projectIdP.value, project });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const orgIdP = orgIdFromQuery(req);
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const projectIdP = parseIntParam(ctx.params.projectId, "projectId");
  if (!projectIdP.ok) return fail(400, projectIdP.error);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  const data: any = {};
  if (body?.name !== undefined) {
    if (!isNonEmptyString(body.name)) return fail(400, "name must be a non-empty string");
    data.name = body.name.trim();
  }
  if (body?.description !== undefined) {
    if (!isOptionalString(body.description)) return fail(400, "description must be a string");
    data.description = body.description ? String(body.description).trim() : null;
  }

  // Enforce org scope on update
  const exists = await prisma.project.findFirst({
    where: { id: projectIdP.value, orgId: orgIdP.value },
    select: { id: true },
  });
  if (!exists) return fail(404, "Project not found");

  const project = await prisma.project.update({
    where: { id: projectIdP.value },
    data,
    select: { id: true, orgId: true, name: true, description: true, createdAt: true, updatedAt: true },
  });

  return ok({ project });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const orgIdP = orgIdFromQuery(req);
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const projectIdP = parseIntParam(ctx.params.projectId, "projectId");
  if (!projectIdP.ok) return fail(400, projectIdP.error);

  const exists = await prisma.project.findFirst({
    where: { id: projectIdP.value, orgId: orgIdP.value },
    select: { id: true },
  });
  if (!exists) return fail(404, "Project not found");

  await prisma.project.delete({ where: { id: projectIdP.value } });
  return ok({ deleted: true, projectId: projectIdP.value });
}
