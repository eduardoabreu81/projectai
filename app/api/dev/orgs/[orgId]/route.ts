import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { orgId } = await context.params;
  const orgIdInt = parseId(orgId);
  if (!orgIdInt) {
    return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgIdInt },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, org });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { orgId } = await context.params;
  const orgIdInt = parseId(orgId);
  if (!orgIdInt) {
    return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
  }

  const updated = await prisma.organization.update({
    where: { id: orgIdInt },
    data: {
      ...(name !== undefined ? { name } : {}),
    },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  }).catch(() => null);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, org: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ orgId: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { orgId } = await context.params;
  const orgIdInt = parseId(orgId);
  if (!orgIdInt) {
    return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });
  }

  const deleted = await prisma.organization.delete({
    where: { id: orgIdInt },
    select: { id: true },
  }).catch(() => null);

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deletedId: deleted.id });
}
