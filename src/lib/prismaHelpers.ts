// lib/prismaHelpers.ts
export function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'bigint') return obj.toString();

  if (obj instanceof Date) return obj.toISOString();

  if (
    typeof obj === 'object' &&
    (obj as any).constructor &&
    (obj as any).constructor.name === 'Decimal'
  ) {
    const asNum = Number((obj as any).toString());
    return Number.isFinite(asNum) ? asNum : 0;
  }

  // primitives
  if (typeof obj !== 'object') return obj;

  // arrays
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  // objects: recurse
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}
