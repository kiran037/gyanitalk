// app/api/astrologers/block-astro/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe
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

// GET - Get detailed information about a blocked astrologer
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id: idStr } = await context.params;
    const blockId = parseInt(idStr, 10);

    const blockRecord = await prisma.blockastrologer.findUnique({
      where: { id: blockId },
      include: {
        astrologer: {
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
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            profile: true,
            gender: true,
            birthDate: true,
          },
        },
      },
    });

    if (!blockRecord) {
      return NextResponse.json(
        { success: false, error: "Block record not found" },
        { status: 404 }
      );
    }

let primarySkillName: string | null = null;
let allSkillNames: string[] = [];
let languageNames: string[] = [];

if (blockRecord.astrologer) {
  const astro = blockRecord.astrologer; // ✅ TS now knows this is non-null

  // --- Skills ---
  const allSkillIds = (astro.allSkill ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (allSkillIds.length) {
    const skills = await prisma.skills.findMany({
      where: {
        id: {
          in: allSkillIds.map((id) => BigInt(id)),
        },
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
      },
    });

    allSkillNames = skills.map((s) => s.name);

    if (astro.primarySkill) {
      const primary = skills.find(
        (s) => s.id.toString() === astro.primarySkill
      );
      primarySkillName = primary?.name ?? astro.primarySkill;
    }
  }

      // --- Languages ---
      const languageIds = (blockRecord.astrologer?.languageKnown ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (languageIds.length) {
        const langs = await prisma.languages.findMany({
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

        languageNames = langs.map((l) => l.languageName);
      }
    }

    // Chat history between user and astrologer
    const chatHistory = await prisma.chatrequest.findMany({
      where: {
        userId: blockRecord.userId!,
        astrologerId: blockRecord.astrologerId!,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 10,
    });

    // Call history
    const callHistory = await prisma.callrequest.findMany({
      where: {
        userId: blockRecord.userId!,
        astrologerId: blockRecord.astrologerId!,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 10,
    });

    // User's review for this astrologer (if any)
    const userReview = await prisma.user_reviews.findFirst({
      where: {
        userId: blockRecord.userId!,
        astrologerId: blockRecord.astrologerId!,
        isDelete: false,
      },
    });

    const totalChats = await prisma.chatrequest.count({
      where: {
        userId: blockRecord.userId!,
        astrologerId: blockRecord.astrologerId!,
      },
    });

    const totalCalls = await prisma.callrequest.count({
      where: {
        userId: blockRecord.userId!,
        astrologerId: blockRecord.astrologerId!,
      },
    });

    const safeData = convertPrismaTypes({
      success: true,
      data: {
        blockInfo: {
          ...blockRecord,
          astrologer: blockRecord.astrologer
            ? {
                ...blockRecord.astrologer,
                primarySkillName,
                allSkillNames,
                languageNames,
              }
            : null,
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
      {
        success: false,
        error: error.message || "Failed to fetch block details",
      },
      { status: 500 }
    );
  }
}