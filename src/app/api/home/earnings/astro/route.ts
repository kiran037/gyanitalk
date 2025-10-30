// src/app/api/home/earnings/astro/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: string | null, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 200) : d;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = toInt(searchParams.get("limit"), 20);
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const range =
      start && end
        ? { gte: new Date(start), lte: new Date(end) }
        : start
        ? { gte: new Date(start) }
        : end
        ? { lte: new Date(end) }
        : undefined;

    // 1) Astrologer user IDs (roleId = 2) — keep as bigint[]
    const astroRole = await prisma.user_roles.findMany({
      where: { roleId: 2 },
      select: { userId: true },
    });
    const astroIds: bigint[] = astroRole
      .map((r) => r.userId)
      .filter((id): id is bigint => typeof id === "bigint");

    // 2) Total across all astrologers
    const totalAgg = await prisma.wallettransaction.aggregate({
      where: { userId: { in: astroIds }, ...(range ? { created_at: range } : {}) },
      _sum: { amount: true },
    });

    // 3) Top astrologers by earnings
    const grouped = await prisma.wallettransaction.groupBy({
      by: ["userId"],
      where: { userId: { in: astroIds }, ...(range ? { created_at: range } : {}) },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: limit,
    });

    // 4) Collect bigint userIds (no invalid predicates)
    const idsToFetchBig: bigint[] = grouped
      .map((g) => g.userId)
      .filter((id): id is bigint => typeof id === "bigint");

    // 5) Fetch astrologer meta (by bigint userId)
    const astrologers = await prisma.astrologers.findMany({
      where: { userId: { in: idsToFetchBig } },
      select: { userId: true, name: true, contactNo: true, email: true },
    });

    // Map meta by numeric key for response shaping
    const astroMetaByNum = new Map<
      number,
      { name: string | null; phone: string | null; email: string | null }
    >();
    astrologers.forEach((a) => {
      if (typeof a.userId === "bigint") {
        const key = Number(a.userId);
        astroMetaByNum.set(key, {
          name: a.name,
          phone: a.contactNo ?? null,
          email: a.email ?? null,
        });
      }
    });

    // 6) Build top list (skip null userId rows defensively)
    const top = grouped
      .filter((g) => typeof g.userId === "bigint")
      .map((g) => {
        const uidNum = Number(g.userId as bigint);
        const meta = astroMetaByNum.get(uidNum);
        return {
          userId: uidNum,
          amount: Number(g._sum.amount ?? 0),
          name: meta?.name ?? null,
          phone: meta?.phone ?? null,
          email: meta?.email ?? null,
        };
      });

    return NextResponse.json(
      { totalAstroEarning: Number(totalAgg._sum.amount ?? 0), top },
      { status: 200 }
    );
  } catch (err) {
    console.error("earnings/astro error", err);
    return NextResponse.json({ error: "Failed to fetch astro earnings" }, { status: 500 });
  }
}
