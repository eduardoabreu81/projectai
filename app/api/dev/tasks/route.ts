import { prisma } from "@/lib/prisma";
import { ok, fail, parseIntParam, parseBodyInt } from "@/lib/http";
import { isNonEmptyString, isOptionalString, isTaskStatus, parseIsoDateOrNull } from "@/lib/validation";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orgIdP = parseIntParam(url.searchParams.get("orgId"), "orgId");
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const projectIdRaw = url.searchParams.get("projectId");
  const statusRaw = url.searchParams.get("status");

  const where: Prisma.TaskWhereInput = { orgId: orgIdP.value };

  if (projectIdRaw) {
    const p = parseIntParam(projectIdRaw, "projectId");
    if (!p.ok) return fail(400, p.error);
    where.projectId = p.value;
  }
  if (statusRaw) {
    if (!isTaskStatus(statusRaw)) return fail(400, "status is invalid");
    where.status = statusRaw;
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

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  const orgIdP = parseBodyInt(body?.orgId, "orgId");
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const projectIdP = parseBodyInt(body?.projectId, "projectId");
  if (!projectIdP.ok) return fail(400, projectIdP.error);

  if (!isNonEmptyString(body?.title)) return fail(400, "title is required");
  if (!isOptionalString(body?.description)) return fail(400, "description must be a string");

  const status = body?.status ?? "TODO";
  if (!isTaskStatus(status)) return fail(400, "status is invalid");

  const position = body?.position ?? 0;
  const posN = Number(position);
  if (!Number.isInteger(posN) || posN < 0) return fail(400, "position must be an integer >= 0");

  const dueDate = parseIsoDateOrNull(body?.dueDate);
  if (body?.dueDate !== undefined && body?.dueDate !== null && !dueDate) {
    return fail(400, "dueDate must be ISO date string or null");
  }

  // Verify project belongs to org (gives cleaner error than DB constraint)
  const project = await prisma.project.findFirst({
    where: { id: projectIdP.value, orgId: orgIdP.value },
    select: { id: true, orgId: true },
  });
  if (!project) return fail(404, "Project not found for this org");

  try {
    const task = await prisma.task.create({
      data: {
        orgId: orgIdP.value,
        projectId: projectIdP.value,
        title: body.title.trim(),
        description: body.description?.trim?.() ?? body.description ?? null,
        status,
        position: posN,
        dueDate,
      },
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

    return ok({ taskId: task.id, task });
  } catch (e: any) {
    return fail(409, "Failed to create task", { detail: e?.message });
  }
}
