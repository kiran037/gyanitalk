
// app/(astrologers)/astrologers/page.tsx
import { getAstrologers } from "@/app/(astrologers)/astrologers/fetch";
import AstrologersClient from "./AstrologersClient";

// — deep serializer (match Customers page style) —
function toPlain(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val === "bigint") return val.toString();
  if (typeof val !== "object") return val;

  const ctorName = val?.constructor?.name;
  if (
    ctorName === "Decimal" ||
    (typeof val?.toNumber === "function" && typeof val?.toString === "function")
  ) {
    try {
      return val.toNumber();
    } catch {
      return Number(val.toString());
    }
  }

  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) return val.map(toPlain);

  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) out[k] = toPlain(v);
  return out;
}

export default async function AstrologersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    isVerified?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>;
}) {
  const params = await searchParams;

  const page = Number.parseInt(params.page ?? "1", 10);
  const search = params.search ?? "";
  const isVerified = params.isVerified;

  const sortBy = params.sortBy ?? "";
  const sortOrder = (params.sortOrder as "asc" | "desc") ?? "asc";

  const { astrologers, totalPages, currentPage } = await getAstrologers({
    page,
    limit: 15,
    search,
    sortBy,
    // keep old behavior: ignore sortOrder when sorting by "isVerified"
    sortOrder: sortBy === "isVerified" ? "" : sortOrder,
    isVerifiedKey: isVerified,
  });

  return (
    <AstrologersClient
      data={toPlain(astrologers)}
      totalPages={toPlain(totalPages)}
      currentPage={toPlain(currentPage)}
      search={toPlain(search)}
      isVerified={toPlain(isVerified)}
      sortBy={toPlain(sortBy)}
      sortOrder={toPlain(sortOrder)}
    />
  );
}
