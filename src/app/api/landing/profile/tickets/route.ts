import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { serializeProfile } from "@/lib/profile/index";
import {prisma} from "@/lib/prisma"


export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value || 
      request.headers.get("authorization")?.replace("Bearer ", "");
    if (!sessionToken) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const session = await verifySession(sessionToken);
    if (!session.valid || !session.userId) return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      prisma.tickets.findMany({
        where: { userId: session.userId, isActive: true, isDelete: false },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: { help_support: { select: { id: true, name: true } } },
      }),
      prisma.tickets.count({ where: { userId: session.userId, isActive: true, isDelete: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { tickets: serializeProfile(tickets), pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}