// src/app/api/home/live/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [chatOnline, callOnline, liveAstroSessions] = await Promise.all([
      prisma.astrologers.findMany({
        where: { chatStatus: "Online" },
        select: { id: true, name: true, email: true, contactNo: true },
        orderBy: { id: "desc" },
        take: 50,
      }),
      prisma.astrologers.findMany({
        where: { callStatus: "Online" },
        select: { id: true, name: true, email: true, contactNo: true },
        orderBy: { id: "desc" },
        take: 50,
      }),
      prisma.liveastro.findMany({
        where: { isActive: 1 },
        select: { id: true, astrologerId: true, isActive: true, created_at: true },
        orderBy: { id: "desc" },
        take: 50,
      }),
    ]);

    const mapAstro = (a: { id: number | bigint; name: string | null; email: string | null; contactNo: string | null }) => ({
      id: typeof a.id === "bigint" ? Number(a.id) : a.id,
      name: a.name,
      email: a.email,
      phone: a.contactNo ?? null,
    });

    const mapLive = (s: {
      id: number | bigint;
      astrologerId: number | bigint | null;
      isActive: number | null;
      created_at: Date | null;
    }) => ({
      id: typeof s.id === "bigint" ? Number(s.id) : s.id,
      astrologerId:
        s.astrologerId == null ? null : typeof s.astrologerId === "bigint" ? Number(s.astrologerId) : s.astrologerId,
      isActive: s.isActive,
      started_at: s.created_at,
    });

    return NextResponse.json(
      {
        totals: {
          chatOnline: chatOnline.length,
          callOnline: callOnline.length,
          liveAstro: liveAstroSessions.length,
        },
        samples: {
          chatOnline: chatOnline.map(mapAstro),
          callOnline: callOnline.map(mapAstro),
          liveAstro: liveAstroSessions.map(mapLive),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("live/summary error", err);
    return NextResponse.json({ error: "Failed to fetch live summary" }, { status: 500 });
  }
}
