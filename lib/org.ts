export function requireOrgId(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("Missing or invalid orgId");
  }
  return n;
}
