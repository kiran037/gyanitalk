// app/api/customers/[id]/gifts/route.ts
// GET: Get customer gifts (sent)

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
    const totalCount = await prisma.astrologer_gifts.count({
      where: { userId, isActive: true, isDelete: false },
    });

    // Fetch gifts
    const gifts = await prisma.astrologer_gifts.findMany({
      where: { userId, isActive: true, isDelete: false },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        gift: {
          select: {
            id: true,
            name: true,
            image: true,
            amount: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const formattedGifts = gifts.map((gift) => ({
      id: gift.id.toString(),
      giftId: gift.giftId.toString(),
      giftName: gift.gift?.name || "N/A",
      giftImage: gift.gift?.image || null,
      giftAmount: gift.giftAmount?.toString() || gift.gift?.amount?.toString() || "0",
      astrologerId: gift.astrologerId.toString(),
      astrologerName: gift.astrologer?.name || "N/A",
      astrologerImage: gift.astrologer?.profileImage || null,
      sentAt: gift.created_at,
    }));

    // Calculate total spent on gifts
    const totalSpent = await prisma.astrologer_gifts.aggregate({
      where: { userId, isActive: true, isDelete: false },
      _sum: {
        giftAmount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        gifts: formattedGifts,
        totalSpent: totalSpent._sum.giftAmount?.toString() || "0",
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          perPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching gifts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gifts",
        message: error.message,
      },
      { status: 500 }
    );
  }
}