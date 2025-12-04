// app/api/customers/[id]/following/route.ts
// GET: Get customer following list

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
    const totalCount = await prisma.astrologer_followers.count({
      where: { userId, isActive: true, isDelete: false },
    });

    // Fetch following list
    const following = await prisma.astrologer_followers.findMany({
      where: { userId, isActive: true, isDelete: false },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            primarySkill: true,
            charge: true,
            experienceInYears: true,
            isVerified: true,
          },
        },
        aiAstrologer: {
          select: {
            id: true,
            name: true,
            image: true,
            primary_skill: true,
            chat_charge: true,
            experience: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const formattedFollowing = following.map((follow) => {
      const isAI = follow.aiAstrologerId !== BigInt(0);
      const astro = isAI ? follow.aiAstrologer : follow.astrologer;

      return {
        id: follow.id.toString(),
        astrologerId: isAI
          ? follow.aiAstrologerId.toString()
          : follow.astrologerId.toString(),
        name: astro?.name || "N/A",
        profileImage: isAI
          ? follow.aiAstrologer?.image
          : follow.astrologer?.profileImage,
        primarySkill: isAI
          ? follow.aiAstrologer?.primary_skill
          : follow.astrologer?.primarySkill,
        charge: isAI
          ? follow.aiAstrologer?.chat_charge
          : follow.astrologer?.charge?.toString(),
        experience: isAI
          ? follow.aiAstrologer?.experience
          : follow.astrologer?.experienceInYears?.toString(),
        isVerified: follow.astrologer?.isVerified || false,
        isAI,
        followedAt: follow.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        following: formattedFollowing,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          perPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching following list:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch following list",
        message: error.message,
      },
      { status: 500 }
    );
  }
}