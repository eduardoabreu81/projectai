import { prisma } from "@/lib/prisma";
import { ok, fail, parseIntParam, parseBodyInt } from "@/lib/http";
import { isNonEmptyString, isOptionalString, isTaskStatus, parseIsoDateOrNull } from "@/lib/validation";

export const runtime = "nodejs";

type Ctx = { params: { taskId: string } };

function orgIdFromQuery(req: Request) {
  const url = new URL(req.url);
  return parseIntParam(url.searchParams.get("orgId"), "orgId");
}

export async function GET(req: Request, ctx: Ctx) {
  const orgIdP = orgIdFromQuery(req);
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const taskIdP = parseIntParam(ctx.params.taskId, "taskId");
  if (!taskIdP.ok) return fail(400, taskIdP.error);

  const task = await prisma.task.findFirst({
    where: { id: taskIdP.value, orgId: orgIdP.value },
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

  if (!task) return fail(404, "Task not found");

  return ok({ orgId: orgIdP.value, taskId: taskIdP.value, task });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const orgIdP = orgIdFromQuery(req);
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const taskIdP = parseIntParam(ctx.params.taskId, "taskId");
  if (!taskIdP.ok) return fail(400, taskIdP.error);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Invalid JSON body");
  }

  // Ensure it exists under org scope
  const existing = await prisma.task.findFirst({
    where: { id: taskIdP.value, orgId: orgIdP.value },
    select: { id: true, orgId: true, projectId: true },
  });
  if (!existing) return fail(404, "Task not found");

  const data: any = {};

  if (body?.title !== undefined) {
    if (!isNonEmptyString(body.title)) return fail(400, "title must be a non-empty string");
    data.title = body.title.trim();
  }
  if (body?.description !== undefined) {
    if (!isOptionalString(body.description)) return fail(400, "description must be a string");
    data.description = body.description ? String(body.description).trim() : null;
  }
  if (body?.status !== undefined) {
    if (!isTaskStatus(body.status)) return fail(400, "status is invalid");
    data.status = body.status;
  }
  if (body?.position !== undefined) {
    const posN = Number(body.position);
    if (!Number.isInteger(posN) || posN < 0) return fail(400, "position must be an integer >= 0");
    data.position = posN;
  }
  if (body?.dueDate !== undefined) {
    const dueDate = parseIsoDateOrNull(body.dueDate);
    if (body.dueDate !== null && !dueDate) return fail(400, "dueDate must be ISO date string or null");
    data.dueDate = dueDate;
  }
  if (body?.projectId !== undefined) {
    const projectIdP = parseBodyInt(body.projectId, "projectId");
    if (!projectIdP.ok) return fail(400, projectIdP.error);

    const project = await prisma.project.findFirst({
      where: { id: projectIdP.value, orgId: orgIdP.value },
      select: { id: true },
    });
    if (!project) return fail(404, "Project not found for this org");

    data.projectId = projectIdP.value;
  }

  try {
    const task = await prisma.task.update({
      where: { id: taskIdP.value },
      data,
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

    return ok({ task });
  } catch (e: any) {
    return fail(409, "Failed to update task", { detail: e?.message });
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const orgIdP = orgIdFromQuery(req);
  if (!orgIdP.ok) return fail(400, orgIdP.error);

  const taskIdP = parseIntParam(ctx.params.taskId, "taskId");
  if (!taskIdP.ok) return fail(400, taskIdP.error);

  const exists = await prisma.task.findFirst({
    where: { id: taskIdP.value, orgId: orgIdP.value },
    select: { id: true },
  });
  if (!exists) return fail(404, "Task not found");

  await prisma.task.delete({ where: { id: taskIdP.value } });
  return ok({ deleted: true, taskId: taskIdP.value });
}
