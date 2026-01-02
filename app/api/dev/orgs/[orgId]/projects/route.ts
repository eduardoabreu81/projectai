import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePositiveInt } from "@/lib/validation";

type Context = { params: Promise<{ orgId: string }> };

export async function GET(_req: NextRequest, context: Context) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { orgId } = await context.params;
  const orgIdInt = parsePositiveInt(orgId);

  if (!orgIdInt) {
    return NextResponse.json({ error: "Invalid orgId" }, { status: 400 });
  }

  const projects = await prisma.project.findMany({
    where: { orgId: orgIdInt },
    orderBy: { id: "asc" },
    select: { id: true, orgId: true, name: true, description: true },
  });

  return NextResponse.json({ ok: true, orgId: orgIdInt, projects });
}
