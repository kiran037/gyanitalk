// app/api/astrologers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  // BigInt -> string
  if (typeof obj === "bigint") return obj.toString();

  // Prisma Decimal -> number
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  // Date -> ISO string
  if (obj instanceof Date) return obj.toISOString();

  // primitives
  if (typeof obj !== "object") return obj;

  // arrays
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  // objects
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";
    const isVerified = searchParams.get("isVerified");
    const isActive = searchParams.get("isActive");
    const skill = searchParams.get("skill");
    const chatStatus = searchParams.get("chatStatus");
    const callStatus = searchParams.get("callStatus");

    // Build where clause
    const where: any = {
      isDelete: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { contactNo: { contains: search } },
      ];
    }

    if (isVerified !== null && isVerified !== undefined && isVerified !== "") {
      where.isVerified = isVerified === "true";
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    if (skill) {
      where.OR = [
        { primarySkill: { contains: skill } },
        { allSkill: { contains: skill } },
      ];
    }

    if (chatStatus) {
      where.chatStatus = chatStatus;
    }

    if (callStatus) {
      where.callStatus = callStatus;
    }

    // Get astrologers with related data (WITHOUT pagination first for sorting)
    const [allAstrologers, total] = await Promise.all([
      prisma.astrologers.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          profileImage: true,
          isVerified: true,
          isActive: true,
          chatStatus: true,
          callStatus: true,
          isLiveOff: true,
          charge: true,
          videoCallRate: true,
          experienceInYears: true,
          primarySkill: true,
          allSkill: true,
          languageKnown: true,
          totalOrder: true,
          top_select: true,
          featured_select: true,
          created_at: true,
          users: {
            select: {
              name: true,
              email: true,
              contactNo: true,
            },
          },
          followers: {
            where: { isDelete: false, isActive: true },
            select: { id: true },
          },
          walletTransactions: {
            select: {
              amount: true,
              isCredit: true,
            },
          },
        },
      }),
      prisma.astrologers.count({ where }),
    ]);

    // Calculate wallet balance for each astrologer
    const astrologersWithWallet = allAstrologers.map((astrologer) => {
      const walletBalance = astrologer.walletTransactions.reduce(
        (sum: number, transaction: any) => {
          const amountNum = Number(transaction.amount || 0);
          return transaction.isCredit ? sum + amountNum : sum - amountNum;
        },
        0
      );

      return {
        ...astrologer,
        followerCount: astrologer.followers.length,
        walletBalance: walletBalance.toFixed(2),
        walletTransactions: undefined,
        followers: undefined,
      };
    });

    // Custom sorting logic:
    // 1. Top badge + Verified (top_select=1 AND isVerified=true)
    // 2. Only Verified (isVerified=true AND top_select=0)
    // 3. Remaining astrologers
    // Within each group: sort by follower count (highest first), then by date
    const sortedAstrologers = astrologersWithWallet.sort((a, b) => {
      const aTopAndVerified = a.top_select === 1 && a.isVerified;
      const bTopAndVerified = b.top_select === 1 && b.isVerified;
      
      const aOnlyVerified = a.isVerified && a.top_select === 0;
      const bOnlyVerified = b.isVerified && b.top_select === 0;

      // Priority 1: Top + Verified first
      if (aTopAndVerified && !bTopAndVerified) return -1;
      if (!aTopAndVerified && bTopAndVerified) return 1;

      // Priority 2: Only Verified second
      if (aOnlyVerified && !bOnlyVerified && !bTopAndVerified) return -1;
      if (!aOnlyVerified && bOnlyVerified && !aTopAndVerified) return 1;

      // Priority 3: Within same category, sort by follower count (highest first)
      if (b.followerCount !== a.followerCount) {
        return b.followerCount - a.followerCount;
      }

      // Priority 4: If same followers, sort by created_at (newest first)
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bDate - aDate;
    });

    // Calculate stats from ALL filtered astrologers (before pagination)
    const stats = {
      totalVerified: sortedAstrologers.filter((a) => a.isVerified).length,
      totalActive: sortedAstrologers.filter((a) => a.isActive).length,
      totalOnline: sortedAstrologers.filter((a) => a.chatStatus === "online").length,
      totalCallOnline: sortedAstrologers.filter((a) => a.callStatus === "online").length,
    };

    // Apply pagination AFTER sorting
    const paginatedAstrologers = sortedAstrologers.slice(skip, skip + limit);

    // Convert all BigInt/Decimal/Date before sending
    const safeData = convertPrismaTypes(paginatedAstrologers);
    const safeStats = convertPrismaTypes(stats);

    return NextResponse.json({
      success: true,
      data: safeData,
      stats: safeStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching astrologers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch astrologers",
        message: error.message,
      },
      { status: 500 }
    );
  }
}