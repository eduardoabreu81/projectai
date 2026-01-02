import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function requireIntQuery(req: NextRequest, key: string) {
  const raw = req.nextUrl.searchParams.get(key);
  const n = raw ? Number(raw) : NaN;
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const orgId = requireIntQuery(req, "orgId");
  if (!orgId) {
    return NextResponse.json({ ok: false, error: "Missing or invalid orgId" }, { status: 400 });
  }

  const projects = await prisma.project.findMany({
    where: { orgId },
    orderBy: { id: "asc" },
    select: { id: true, orgId: true, name: true, description: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, orgId, projects });
}
