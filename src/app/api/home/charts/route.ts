import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function monthEdges(year: number, monthIndex0: number) {
  // monthIndex0: 0..11
  const from = new Date(year, monthIndex0, 1, 0, 0, 0, 0);
  const to = new Date(year, monthIndex0 + 1, 1, 0, 0, 0, 0);
  return { from, to };
}

export async function GET() {
  try {
    const now = new Date();
    const labels: string[] = [];
    const callData: number[] = [];
    const chatData: number[] = [];
    const earningData: number[] = [];
    const userData: number[] = [];

    // last 12 months inclusive of current month
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const { from, to } = monthEdges(d.getFullYear(), d.getMonth());
      labels.push(
        d.toLocaleString("en-US", { month: "short", year: "numeric" })
      );

      const [callCount, chatCount, userCount, earningAgg] = await Promise.all([
        prisma.callrequest.count({ where: { created_at: { gte: from, lt: to } } }),
        prisma.chatrequest.count({ where: { created_at: { gte: from, lt: to } } }),
        prisma.users.count({ where: { created_at: { gte: from, lt: to } } }),
        prisma.admin_get_commissions.aggregate({
          where: { created_at: { gte: from, lt: to } },
          _sum: { amount: true },
        }),
      ]);

      callData.push(callCount);
      chatData.push(chatCount);
      userData.push(userCount);
      earningData.push(Number(earningAgg._sum.amount ?? 0));
    }

    return NextResponse.json(
      { labels, callData, chatData, earningData, userData },
      { status: 200 }
    );
  } catch (err) {
    console.error("charts error", err);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
