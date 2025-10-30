// /src/components/astrologer_group/helpers.ts

// ---------- Types shared across components ----------
export type GroupItem = {
  id: number;
  name: string | null;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
  astrologerassign_count?: number;
};

export type RawAstroRow = {
  id: number | bigint;
  group_id: number | bigint;
  astrologer_id?: number | bigint | null;
  astrologer_name?: string | null;
  index?: number | bigint | null;
};

export type AstroRow = {
  id: number;
  group_id: number;
  astrologer_id: number;
  astrologer_name: string;
  index: number;
};

export type RawAstrologerLite = { id: number | bigint; name: string };

// ---------- Sanitizers (fix bigint/undefined) ----------
export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function sanitizeMembers(rows: unknown): AstroRow[] {
  const list = Array.isArray(rows) ? (rows as RawAstroRow[]) : [];
  return list
    .map((r, i) => {
      const aid = r?.astrologer_id ?? null;
      const astrologer_id = aid == null ? NaN : toNumber(aid, NaN);
      const id = toNumber(r?.id, i + 1);
      const group_id = toNumber(r?.group_id);
      const index = toNumber(r?.index ?? i + 1);
      const astrologer_name = (r?.astrologer_name ?? "Unknown") || "Unknown";
      return { id, group_id, astrologer_id, astrologer_name, index };
    })
    .filter((r) => Number.isFinite(r.astrologer_id)) as AstroRow[];
}

export function sanitizeAstrologerLite(
  rows: unknown
): { id: number; name: string }[] {
  const list = Array.isArray(rows) ? (rows as RawAstrologerLite[]) : [];
  return list.map((r) => ({
    id: toNumber(r.id),
    name: r.name ?? "",
  }));
}
