// src/app/api/home/communications/calls/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, completedRows, rejected, pending] = await Promise.all([
      prisma.callrequest.count(),
      prisma.callrequest.findMany({
        where: { callStatus: "Completed" },
        select: { totalMin: true },
      }),
      prisma.callrequest.count({ where: { callStatus: "Rejected" } }),
      prisma.callrequest.count({ where: { callStatus: "Pending" as any } }),
    ]);

    const completedCount = completedRows.length;
    const completedMinutes = completedRows.reduce((acc, r) => acc + (parseInt(r.totalMin || "0", 10) || 0), 0);

    return NextResponse.json(
      {
        total,
        completed: { count: completedCount, minutes: completedMinutes },
        rejected,
        pending,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("communications/calls/stats error", err);
    return NextResponse.json({ error: "Failed to fetch call stats" }, { status: 500 });
  }
}
