// src/app/api/home/astrologers/live/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [chatOnline, callOnline, liveAstroSessions] = await Promise.all([
      prisma.astrologers.findMany({
        where: { chatStatus: "Online" },
        select: { id: true, name: true, email: true, contactNo: true },
        orderBy: { id: "desc" },
        take: 200, // safety cap
      }),
      prisma.astrologers.findMany({
        where: { callStatus: "Online" },
        select: { id: true, name: true, email: true, contactNo: true },
        orderBy: { id: "desc" },
        take: 200,
      }),
      prisma.liveastro.findMany({
        where: { isActive: 1 },
        // `started_at` is not in your schema; use `created_at` and map it
        select: { id: true, astrologerId: true, isActive: true, created_at: true },
        orderBy: { id: "desc" },
        take: 200,
      }),
    ]);

    const toSafe = (a: { id: bigint | number; name: string | null; email: string | null; contactNo: string | null }) => ({
      id: typeof a.id === "bigint" ? Number(a.id) : a.id,
      name: a.name,
      email: a.email,
      phone: a.contactNo ?? null,
    });

    const toSafeLive = (s: {
      id: bigint | number;
      astrologerId: bigint | number | null;
      isActive: number | null;
      created_at: Date | null;
    }) => ({
      id: typeof s.id === "bigint" ? Number(s.id) : s.id,
      astrologerId: s.astrologerId == null ? null : typeof s.astrologerId === "bigint" ? Number(s.astrologerId) : s.astrologerId,
      isActive: s.isActive, // keep as-is (likely tinyint 0/1)
      // expose as `started_at` to match your previous response shape
      started_at: s.created_at,
    });

    return NextResponse.json(
      {
        chatOnline: chatOnline.map(toSafe),
        callOnline: callOnline.map(toSafe),
        liveAstro: liveAstroSessions.map(toSafeLive),
        totals: {
          chatOnline: chatOnline.length,
          callOnline: callOnline.length,
          liveAstro: liveAstroSessions.length,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("astrologers/live error", err);
    return NextResponse.json(
      { error: "Failed to fetch live astrologer data" },
      { status: 500 }
    );
  }
}
