// src/app/api/home/deposits/today/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

function istRange() {
  const d = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
  return { start: startOfDay(d), end: endOfDay(d) };
}

export async function GET() {
  try {
    const { start, end } = istRange();

    const grouped = await prisma.payment.groupBy({
      by: ["paymentStatus"],
      where: { created_at: { gte: start, lte: end } },
      _sum: { amount: true },
    });

    const sumBy = (status: string) =>
      Number(grouped.find(g => g.paymentStatus === status)?._sum.amount ?? 0);

    return NextResponse.json(
      {
        date: start.toISOString().slice(0,10),
        total: Number(grouped.reduce((acc, g) => acc + Number(g._sum.amount ?? 0), 0)),
        success: sumBy("success"),
        pending: sumBy("pending"),
        failed:  sumBy("failed"),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("deposits/today error", err);
    return NextResponse.json({ error: "Failed to fetch today's deposits" }, { status: 500 });
  }
}
