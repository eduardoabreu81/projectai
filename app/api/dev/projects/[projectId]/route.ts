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
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { projectId } = await context.params;
  const projectIdInt = parseId(projectId);
  if (!projectIdInt) {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectIdInt },
    select: { id: true, orgId: true, name: true, description: true, createdAt: true, updatedAt: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, project });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { projectId } = await context.params;
  const projectIdInt = parseId(projectId);
  if (!projectIdInt) {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const description = typeof body.description === "string" ? body.description.trim() : undefined;

  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id: projectIdInt },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
    },
    select: { id: true, orgId: true, name: true, description: true, createdAt: true, updatedAt: true },
  }).catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, project: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { projectId } = await context.params;
  const projectIdInt = parseId(projectId);
  if (!projectIdInt) {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  const deleted = await prisma.project.delete({
    where: { id: projectIdInt },
    select: { id: true },
  }).catch(() => null);

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deletedId: deleted.id });
}
