// app/api/customers/[id]/calls/route.ts
// GET: Get customer call history

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const userId = BigInt(id);
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.callrequest.count({
      where: { userId },
    });

    // Fetch call history
    const calls = await prisma.callrequest.findMany({
      where: { userId },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const formattedCalls = calls.map((call) => ({
      id: call.id,
      astrologerId: call.astrologerId?.toString() || null,
      astrologerName: call.astrologer?.name || "N/A",
      astrologerImage: call.astrologer?.profileImage || null,
      callStatus: call.callStatus,
      duration: call.call_duration || call.totalMin || "N/A",
      rate: call.callRate || "N/A",
      deduction: call.deduction?.toString() || "0",
      deductionFromAstrologer:
        call.deductionFromAstrologer?.toString() || "0",
      callType: call.call_type === 1 ? "Video" : "Audio",
      isFreeSession: call.isFreeSession || false,
      channelName: call.channelName,
      createdAt: call.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        calls: formattedCalls,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          perPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching call history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch call history",
        message: error.message,
      },
      { status: 500 }
    );
  }
}