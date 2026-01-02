import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { taskId } = await context.params;
  const taskIdInt = parseId(taskId);
  if (!taskIdInt) {
    return NextResponse.json({ error: "Invalid taskId" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({
    where: { id: taskIdInt },
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

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, task });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { taskId } = await context.params;
  const taskIdInt = parseId(taskId);
  if (!taskIdInt) {
    return NextResponse.json({ error: "Invalid taskId" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const description = typeof body.description === "string" ? body.description.trim() : undefined;
  const status = typeof body.status === "string" ? body.status : undefined;
  const position = Number.isInteger(body.position) ? body.position : undefined;

  let dueDate: Date | null | undefined = undefined;
  if (body.dueDate === null) dueDate = null;
  if (typeof body.dueDate === "string") {
    const d = new Date(body.dueDate);
    if (!Number.isNaN(d.getTime())) dueDate = d;
  }

  if (title !== undefined && title.length === 0) {
    return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
  }

  const updated = await prisma.task.update({
    where: { id: taskIdInt },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(position !== undefined ? { position } : {}),
      ...(dueDate !== undefined ? { dueDate } : {}),
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
  }).catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, task: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { taskId } = await context.params;
  const taskIdInt = parseId(taskId);
  if (!taskIdInt) {
    return NextResponse.json({ error: "Invalid taskId" }, { status: 400 });
  }

  const deleted = await prisma.task.delete({
    where: { id: taskIdInt },
    select: { id: true },
  }).catch(() => null);

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deletedId: deleted.id });
}
