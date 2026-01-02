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

  const tasks = await prisma.task.findMany({
    where: { orgId: orgIdInt },
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

  return NextResponse.json({ ok: true, orgId: orgIdInt, tasks });
}
