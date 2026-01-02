import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const projectIdInt = parseId(projectId);

  if (!projectIdInt) {
    return NextResponse.json({ ok: false, error: "Invalid projectId" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectIdInt },
    select: { id: true, orgId: true, name: true },
  });

  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const tasks = await prisma.task.findMany({
    where: { projectId: projectIdInt },
    orderBy: [{ position: "asc" }, { id: "asc" }],
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

  return NextResponse.json({ ok: true, project, tasks });
}
