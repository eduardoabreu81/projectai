import { prisma } from "@/lib/prisma";
import { ok, fail, parseIntParam, parseBodyInt } from "@/lib/http";
import { isNonEmptyString, isOptionalString } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orgIdP = parseIntParam(url.searchParams.get("orgId"), "orgId");
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const projects = await prisma.project.findMany({
    where: { orgId: orgIdP.value },
    orderBy: { id: "asc" },
    select: { id: true, orgId: true, name: true, description: true, createdAt: true, updatedAt: true },
  });

  return ok({ orgId: orgIdP.value, projects });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  const orgIdP = parseBodyInt(body?.orgId, "orgId");
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  if (!isNonEmptyString(body?.name)) return fail(400, "name is required");
  if (!isOptionalString(body?.description)) return fail(400, "description must be a string");

  // Make sure org exists
  const org = await prisma.organization.findUnique({ where: { id: orgIdP.value }, select: { id: true } });
  if (!org) return fail(404, "Organization not found");

  const project = await prisma.project.create({
    data: {
      orgId: orgIdP.value,
      name: body.name.trim(),
      description: body.description?.trim?.() ?? body.description ?? null,
    },
    select: { id: true, orgId: true, name: true, description: true, createdAt: true, updatedAt: true },
  });

  return ok({ projectId: project.id, project });
}
