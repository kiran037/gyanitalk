// src/app/api/home/earnings/by-month/route.ts
import { NextResponse } from "next/server";
import dayjs from "dayjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = dayjs();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) months.push(today.subtract(i, "month").format("YYYY-MM"));

    const labels: string[] = [];
    const earningData: number[] = [];

    for (const monthStr of months) {
      const [year, month] = monthStr.split("-").map(Number);
      const fromDate = new Date(year, month - 1, 1);
      const toDate = new Date(year, month, 1);

      const agg = await prisma.admin_get_commissions.aggregate({
        where: { created_at: { gte: fromDate, lt: toDate } },
        _sum: { amount: true },
      });

      labels.push(dayjs(fromDate).format("MMM YYYY"));
      earningData.push(Number(agg._sum.amount ?? 0));
    }

    return NextResponse.json({ labels, earningData }, { status: 200 });
  } catch (err) {
    console.error("earnings/by-month error", err);
    return NextResponse.json({ error: "Failed to fetch monthly earnings" }, { status: 500 });
  }
}
