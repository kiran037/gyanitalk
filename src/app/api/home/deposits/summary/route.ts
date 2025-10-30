// src/app/api/home/deposits/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const grouped = await prisma.payment.groupBy({
      by: ["paymentStatus"],
      _sum: { amount: true },
    });

    const sumBy = (status: string) =>
      Number(grouped.find(g => g.paymentStatus === status)?._sum.amount ?? 0);

    return NextResponse.json(
      {
        total: Number(grouped.reduce((acc, g) => acc + Number(g._sum.amount ?? 0), 0)),
        success: sumBy("success"),
        pending: sumBy("pending"),
        failed:  sumBy("failed"),
        breakdown: grouped.map(g => ({
          status: g.paymentStatus,
          amount: Number(g._sum.amount ?? 0),
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("deposits/summary error", err);
    return NextResponse.json({ error: "Failed to fetch deposits summary" }, { status: 500 });
  }
}
