// src/app/api/home/transactions/wallet/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const type  = (searchParams.get("type") || "").trim() || undefined;
    const q     = (searchParams.get("search") || "").trim();
    const start = searchParams.get("startDate");
    const end   = searchParams.get("endDate");

    const createdFilter =
      start && end ? { gte: new Date(start), lte: new Date(end) }
      : start     ? { gte: new Date(start) }
      : end       ? { lte: new Date(end) }
                  : undefined;

    const where: any = {};
    if (type) where.transactionType = type;
    if (createdFilter) where.created_at = createdFilter;

    if (q) {
      const num = Number(q);
      if (Number.isFinite(num)) {
        where.OR = [{ id: BigInt(num) }, { userId: BigInt(num) }];
      }
    }

    const rows = await prisma.wallettransaction.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 5000,
      select: {
        id: true,
        userId: true,
        amount: true,
        transactionType: true,
        created_at: true,
      },
    });

    const header = ["ID", "User ID", "Amount", "Type", "Created At"];
    const lines = [
      header.join(","),
      ...rows.map(r =>
        [
          typeof r.id === "bigint" ? Number(r.id) : (r.id as any),
          r.userId == null ? "" : (typeof r.userId === "bigint" ? Number(r.userId) : (r.userId as any)),
          Number(r.amount ?? 0).toFixed(2),
          r.transactionType ?? "",
          r.created_at ? r.created_at.toISOString() : "",
        ].join(",")
      ),
    ].join("\n");

    const filename = `wallet_tx_export_${new Date().toISOString().slice(0,10)}.csv`;

    return new NextResponse(lines, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("transactions/wallet/export error", err);
    return NextResponse.json({ error: "Failed to export wallet transactions" }, { status: 500 });
  }
}
