// src/app/api/home/communications/calls/today/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

function istTodayRange() {
  const todayIST = new Date(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  );
  return { start: startOfDay(todayIST), end: endOfDay(todayIST) };
}

export async function GET() {
  try {
    const { start, end } = istTodayRange();

    const [requests, completedRows, rejected] = await Promise.all([
      prisma.callrequest.count({ where: { created_at: { gte: start, lte: end } } }),
      prisma.callrequest.findMany({
        where: { callStatus: "Completed", created_at: { gte: start, lte: end } },
        select: { totalMin: true },
      }),
      prisma.callrequest.count({
        where: { callStatus: "Rejected", created_at: { gte: start, lte: end } },
      }),
    ]);

    const minutes = completedRows.reduce((acc, r) => acc + (parseInt(r.totalMin || "0", 10) || 0), 0);

    return NextResponse.json(
      {
        requests,
        completedMinutes: minutes,
        rejected,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("communications/calls/today error", err);
    return NextResponse.json({ error: "Failed to fetch today's call stats" }, { status: 500 });
  }
}
