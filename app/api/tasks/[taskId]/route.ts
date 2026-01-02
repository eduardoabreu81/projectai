import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ taskId: string }> };

function parsePositiveInt(raw: string | null) {
  const n = raw ? Number(raw) : NaN;
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function GET(_req: NextRequest, context: Context) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { taskId: taskIdRaw } = await context.params;
  const taskId = parsePositiveInt(taskIdRaw);
  if (!taskId) {
    return NextResponse.json({ ok: false, error: "Invalid taskId" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
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
    return NextResponse.json({ ok: false, error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, task });
}

export async function PATCH(req: NextRequest, context: Context) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { taskId: taskIdRaw } = await context.params;
  const taskId = parsePositiveInt(taskIdRaw);
  if (!taskId) {
    return NextResponse.json({ ok: false, error: "Invalid taskId" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const data: any = {};

  if ("title" in body) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json({ ok: false, error: "Invalid title" }, { status: 400 });
    }
    data.title = body.title.trim();
  }

  if ("description" in body) {
    if (body.description !== null && typeof body.description !== "string") {
      return NextResponse.json({ ok: false, error: "Invalid description" }, { status: 400 });
    }
    data.description = body.description;
  }

  if ("status" in body) {
    const allowed = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"];
    if (typeof body.status !== "string" || !allowed.includes(body.status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }

  if ("position" in body) {
    const pos = Number(body.position);
    if (!Number.isInteger(pos) || pos < 0) {
      return NextResponse.json({ ok: false, error: "Invalid position" }, { status: 400 });
    }
    data.position = pos;
  }

  if ("dueDate" in body) {
    if (body.dueDate === null) {
      data.dueDate = null;
    } else if (typeof body.dueDate === "string") {
      const d = new Date(body.dueDate);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ ok: false, error: "Invalid dueDate" }, { status: 400 });
      }
      data.dueDate = d;
    } else {
      return NextResponse.json({ ok: false, error: "Invalid dueDate" }, { status: 400 });
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "No fields to update" }, { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
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

  return NextResponse.json({ ok: true, task });
}

export async function DELETE(_req: NextRequest, context: Context) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { taskId: taskIdRaw } = await context.params;
  const taskId = parsePositiveInt(taskIdRaw);
  if (!taskId) {
    return NextResponse.json({ ok: false, error: "Invalid taskId" }, { status: 400 });
  }

  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}
