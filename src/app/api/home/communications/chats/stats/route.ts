// src/app/api/home/communications/chats/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, completedRows, rejected, pending] = await Promise.all([
      prisma.chatrequest.count(),
      prisma.chatrequest.findMany({
        where: { chatStatus: "Completed" },
        select: { totalMin: true },
      }),
      prisma.chatrequest.count({ where: { chatStatus: "Rejected" } }),
      prisma.chatrequest.count({ where: { chatStatus: "Pending" as any } }),
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
    console.error("communications/chats/stats error", err);
    return NextResponse.json({ error: "Failed to fetch chat stats" }, { status: 500 });
  }
}
