// src/app/api/home/withdrawals/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const status = (searchParams.get("status") || "").trim() || undefined;
    const q = (searchParams.get("search") || "").trim();
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const createdFilter =
      start && end
        ? { gte: new Date(start), lte: new Date(end) }
        : start
        ? { gte: new Date(start) }
        : end
        ? { lte: new Date(end) }
        : undefined;

    // Build where without unknown fields
    const where: any = {};
    if (status) where.status = status;
    if (createdFilter) where.created_at = createdFilter;

    // Optional numeric search only on primary key (id)
    if (q) {
      const numQ = Number(q);
      if (Number.isFinite(numQ)) {
        where.id = BigInt(numQ);
      }
    }

    const rows = await prisma.withdrawrequest.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 5000, // sensible cap for export
      select: {
        id: true,
        withdrawAmount: true,
        status: true,
        created_at: true,
        // include extra fields that exist on your model (per earlier errors dump)
        accountHolderName: true,
        accountNumber: true,
        ifscCode: true,
      },
    });

    const header = [
      "ID",
      "Amount",
      "Status",
      "Created At",
      "Account Holder Name",
      "Account Number",
      "IFSC Code",
    ];

    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          typeof r.id === "bigint" ? Number(r.id) : (r.id as any),
          Number(r.withdrawAmount ?? 0).toFixed(2),
          r.status ?? "",
          r.created_at ? r.created_at.toISOString() : "",
          (r.accountHolderName ?? "").replaceAll(",", " "),
          (r.accountNumber ?? "").toString().replaceAll(",", " "),
          (r.ifscCode ?? "").toString().replaceAll(",", " "),
        ].join(",")
      ),
    ].join("\n");

    const filename = `withdrawals_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    return new NextResponse(lines, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("withdrawals/export error", err);
    return NextResponse.json({ error: "Failed to export withdrawals" }, { status: 500 });
  }
}
