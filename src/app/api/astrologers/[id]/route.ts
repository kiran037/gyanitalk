// app/api/astrologers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date -> JSON-safe
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") return obj.toString();

  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  if (obj instanceof Date) return obj.toISOString();

  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: idStr } = await context.params;

    if (!idStr) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    const astrologerId = BigInt(idStr);

    const astrologer = await prisma.astrologers.findFirst({
      where: { id: astrologerId, isDelete: false },
      include: {
        users: {
          select: {
            name: true,
            email: true,
            contactNo: true,
            profile: true,
            birthDate: true,
            birthPlace: true,
            location: true,
            addressLine1: true,
            addressLine2: true,
            pincode: true,
            gender: true,
            created_at: true,
          },
        },
        followers: {
          where: { isDelete: false, isActive: true },
          select: {
            id: true,
            userId: true,
            created_at: true,
            user: {
              select: {
                name: true,
                profile: true,
                email: true,
              },
            },
          },
        },
        walletTransactions: {
          select: {
            id: true,
            amount: true,
            transactionType: true,
            isCredit: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 5,
        },
      },
    });

    if (!astrologer) {
      return NextResponse.json(
        {
          success: false,
          error: "Astrologer not found",
        },
        { status: 404 }
      );
    }

    // 🔹 Resolve skills from astrologer.allSkill (comma-separated IDs) + skills table
    let primarySkillName: string | null = null;
    let allSkillNames: string[] = [];

    if (astrologer.allSkill) {
      const skillIdStrings = astrologer.allSkill
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (skillIdStrings.length > 0) {
        const skillIds = skillIdStrings.map((id) => BigInt(id));

        const skills = await prisma.skills.findMany({
          where: {
            id: { in: skillIds },
            isDelete: false,
          },
          select: {
            id: true,
            name: true,
          },
        });

        allSkillNames = skills.map((s) => s.name);

        // Primary skill: use primarySkill (id) if present, else just first skill
        if (astrologer.primarySkill) {
          const primary = skills.find(
            (s) => s.id.toString() === astrologer.primarySkill
          );
          primarySkillName = primary?.name ?? astrologer.primarySkill;
        } else if (skills.length > 0) {
          primarySkillName = skills[0].name;
        }
      } else if (astrologer.primarySkill) {
        // Fallback: no valid list but single primarySkill value
        primarySkillName = astrologer.primarySkill;
      }
    } else if (astrologer.primarySkill) {
      // Fallback if allSkill is empty but primarySkill has something
      primarySkillName = astrologer.primarySkill;
    }

    // 🔹 Languages (languages table, from comma-separated IDs on astrologer.languageKnown)
    let languageNames: string[] = [];
    if (astrologer.languageKnown) {
      const languageIds = astrologer.languageKnown
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (languageIds.length > 0) {
        const languages = await prisma.languages.findMany({
          where: {
            id: {
              in: languageIds.map((id) => BigInt(id)),
            },
          },
          select: {
            id: true,
            languageName: true,
          },
        });

        languageNames = languages.map((l) => l.languageName);
      }
    }

    // 🔹 Calculate wallet balance
    const allTransactions = await prisma.wallettransaction.findMany({
      where: { astrologerId },
      select: {
        amount: true,
        isCredit: true,
      },
    });

    const walletBalance = allTransactions.reduce(
      (sum: number, transaction: any) => {
        return transaction.isCredit
          ? sum + (transaction.amount || 0)
          : sum - (transaction.amount || 0);
      },
      0
    );

    // 🔹 Chat count
    const chatCount = await prisma.chatrequest.count({
      where: { astrologerId },
    });

    // 🔹 Call count
    const callCount = await prisma.callrequest.count({
      where: { astrologerId },
    });

    // 🔹 Average rating
    const reviews = await prisma.user_reviews.findMany({
      where: { astrologerId, isDelete: false },
      select: { rating: true },
    });

    const averageRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const safe = convertPrismaTypes({
      success: true,
      data: {
        ...astrologer,
        followerCount: astrologer.followers.length,
        walletBalance: walletBalance.toFixed(2),
        chatCount,
        callCount,
        averageRating: averageRating.toFixed(1),
        reviewCount: reviews.length,
        // ✅ human-readable fields
        primarySkillName,
        allSkillNames,
        languageNames,
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching astrologer details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch astrologer details",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id: idStr } = await context.params;

    if (!idStr) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    const astrologerId = BigInt(idStr);

    const deletedAstrologer = await prisma.astrologers.update({
      where: { id: astrologerId },
      data: {
        isDelete: true,
        isActive: false,
        deleted_at: new Date(),
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Astrologer deleted successfully",
      data: deletedAstrologer,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error deleting astrologer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete astrologer",
        message: error.message,
      },
      { status: 500 }
    );
  }
}