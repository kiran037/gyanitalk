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

    const [
      total,
      unverified,
      liveChat,
      liveCall,
      liveAstroSessions,
      todayNew,
    ] = await Promise.all([
      prisma.astrologers.count(),
      prisma.astrologers.count({ where: { isVerified: false } }),
      prisma.astrologers.count({ where: { chatStatus: "Online" } }),
      prisma.astrologers.count({ where: { callStatus: "Online" } }),
      prisma.liveastro.count({ where: { isActive: 1 } }),
      prisma.astrologers.count({ where: { created_at: { gte: start, lte: end } } }),
    ]);

    return NextResponse.json(
      {
        total,
        unverified,
        liveChat,
        liveCall,
        liveAstro: liveAstroSessions,
        todayNew,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("astrologers/stats error", err);
    return NextResponse.json(
      { error: "Failed to fetch astrologer stats" },
      { status: 500 }
    );
  }
}
