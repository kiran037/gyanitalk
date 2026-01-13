import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (typeof obj === "object" && (obj as any).constructor && (obj as any).constructor.name === "Decimal") {
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get detailed information about a blocked astrologer
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: idStr } = await context.params;
    const blockId = parseInt(idStr, 10);

    // 1. Fetch Block Record (Raw)
    const blockRecord = await prisma.blockastrologer.findUnique({
      where: { id: blockId },
    });

    if (!blockRecord) {
      return NextResponse.json({ success: false, error: "Block record not found" }, { status: 404 });
    }

    // 2. Manual Fetch: Astrologer
    let astroData: any = null;
    if (blockRecord.astrologerId) {
      const astro = await prisma.astrologers.findUnique({
        where: { id: blockRecord.astrologerId },
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          profileImage: true,
          primarySkill: true,
          allSkill: true,
          languageKnown: true,
          experienceInYears: true,
          charge: true,
          isVerified: true,
          totalOrder: true,
          users: { select: { profile: true } } // Fallback image
        }
      });
      if (astro) {
        // Resolve image
        const img = astro.profileImage || astro.users?.profile || null;
        astroData = { ...astro, profileImage: img, users: undefined };
      }
    }

    // 3. Manual Fetch: User
    let userData: any = null;
    if (blockRecord.userId) {
      userData = await prisma.users.findUnique({
        where: { id: blockRecord.userId },
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          profile: true,
          gender: true,
          birthDate: true,
        },
      });
    }

    // 4. Resolve Skills & Languages (Logic from previous code)
    let primarySkillName: string | null = null;
    let allSkillNames: string[] = [];
    let languageNames: string[] = [];

    if (astroData) {
      const allSkillIds = (astroData.allSkill ?? "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

      if (allSkillIds.length) {
        const skills = await prisma.skills.findMany({
          where: {
            id: { in: allSkillIds.map((id: string) => BigInt(id)) },
            isDelete: false,
          },
          select: { id: true, name: true },
        });

        allSkillNames = skills.map((s) => s.name);

        if (astroData.primarySkill) {
          const primary = skills.find((s) => s.id.toString() === astroData.primarySkill);
          primarySkillName = primary?.name ?? astroData.primarySkill;
        }
      }

      const languageIds = (astroData.languageKnown ?? "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);

      if (languageIds.length) {
        const langs = await prisma.languages.findMany({
          where: { id: { in: languageIds.map((id: string) => BigInt(id)) } },
          select: { id: true, languageName: true },
        });
        languageNames = langs.map((l) => l.languageName);
      }
    }

    // 5. History & Stats
    const historyWhere = {
      userId: blockRecord.userId!,
      astrologerId: blockRecord.astrologerId!,
    };

    const [chatHistory, callHistory, userReview, totalChats, totalCalls] = await Promise.all([
      prisma.chatrequest.findMany({
        where: historyWhere,
        orderBy: { created_at: "desc" },
        take: 10,
      }),
      prisma.callrequest.findMany({
        where: historyWhere,
        orderBy: { created_at: "desc" },
        take: 10,
      }),
      prisma.user_reviews.findFirst({
        where: {
          ...historyWhere,
          isDelete: false,
        },
      }),
      prisma.chatrequest.count({ where: historyWhere }),
      prisma.callrequest.count({ where: historyWhere }),
    ]);

    // 6. Construct Safe Response
    const safeData = convertPrismaTypes({
      success: true,
      data: {
        blockInfo: {
          ...blockRecord,
          astrologer: astroData
            ? {
                ...astroData,
                primarySkillName,
                allSkillNames,
                languageNames,
              }
            : null,
          user: userData, // Attached manually
        },
        interactions: {
          totalChats,
          totalCalls,
          recentChats: chatHistory,
          recentCalls: callHistory,
        },
        userReview,
      },
    });

    return NextResponse.json(safeData);
  } catch (error: any) {
    console.error("Error fetching block details:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch block details" },
      { status: 500 }
    );
  }
}