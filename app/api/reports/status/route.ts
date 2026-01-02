import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestContext } from "@/lib/request-context";

export async function GET() {
  try {
    const { orgId } = await getRequestContext();

    const totalProjects = await prisma.project.count({ where: { orgId } });
    const totalTasks = await prisma.task.count({ where: { orgId } });

    const byStatus = await prisma.task.groupBy({
      by: ["status"],
      where: { orgId },
      _count: { _all: true },
    });

    const now = new Date();
    const overdue = await prisma.task.count({
      where: {
        orgId,
        dueDate: { lt: now },
        status: { not: "DONE" },
      },
    });

    const statusCounts = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all]));

    return NextResponse.json({
      ok: true,
      report: {
        totalProjects,
        totalTasks,
        overdueOpenTasks: overdue,
        statusCounts,
        generatedAt: now.toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 401 });
  }
}
