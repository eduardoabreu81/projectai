import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const email = "edu@local.dev";

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: "Edu" },
    create: { email, name: "Edu" },
  });

  const org = await prisma.organization.upsert({
    where: { id: 1 },
    update: { name: "ProjectAI Dev Org" },
    create: { name: "ProjectAI Dev Org" },
  });

  await prisma.orgUser.upsert({
    where: { orgId_userId: { orgId: org.id, userId: user.id } },
    update: { role: "admin" },
    create: { orgId: org.id, userId: user.id, role: "admin" },
  });

  const project = await prisma.project.upsert({
    where: { id: 1 },
    update: { name: "Demo Project", orgId: org.id },
    create: { orgId: org.id, name: "Demo Project", description: "Seeded project for local dev" },
  });

  const existing = await prisma.task.count({ where: { orgId: org.id, projectId: project.id } });
  if (existing === 0) {
    await prisma.task.createMany({
      data: [
        { orgId: org.id, projectId: project.id, title: "Define scope for weeks 1-4", status: "TODO", position: 10 },
        { orgId: org.id, projectId: project.id, title: "Create org and org_users tables", status: "IN_PROGRESS", position: 20 },
        { orgId: org.id, projectId: project.id, title: "Build Kanban UI", status: "TODO", position: 30 },
        { orgId: org.id, projectId: project.id, title: "Add deterministic status report endpoint", status: "TODO", position: 40 },
      ],
    });
  }

  return NextResponse.json({ ok: true, userId: user.id, orgId: org.id, projectId: project.id });
}
