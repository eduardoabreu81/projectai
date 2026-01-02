import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __prismaFkOn: boolean | undefined;
}

function createClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return client;
}

export const prisma: PrismaClient = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// SQLite foreign keys are connection level. We force-enable it once per dev runtime.
async function ensureSqliteForeignKeysOn() {
  if (globalThis.__prismaFkOn) return;

  const url = process.env.DATABASE_URL ?? "";
  const isSqlite = url.startsWith("file:") || url.includes("sqlite");

  if (!isSqlite) {
    globalThis.__prismaFkOn = true;
    return;
  }

  try {
    // Works on SQLite only. Safe to ignore if driver blocks it.
    await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");
  } catch {
    // Ignore. We still do app-level org checks anyway.
  } finally {
    globalThis.__prismaFkOn = true;
  }
}

ensureSqliteForeignKeysOn().catch(() => {});
