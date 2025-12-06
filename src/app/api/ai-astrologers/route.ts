// app/api/ai-astrologers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
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

// GET - List all AI Astrologers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
    const aiType = searchParams.get("aiType");
    const featured = searchParams.get("featured");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (type) where.type = type;
    if (aiType) where.aiType = aiType;

    if (featured !== null && featured !== undefined) {
      where.featured = parseInt(featured, 10); // "0" | "1"
    }

    const [aiAstrologers, total] = await Promise.all([
      prisma.aiastrologers.findMany({
        where,
        skip,
        take: limit,
        include: {
          aiChatHistories: {
            select: { id: true },
          },
          wallettransactions: {
            select: {
              amount: true,
              isCredit: true,
            },
          },
          aiFollowers: {
            select: { id: true },
          },
          order_requests: {
            select: { id: true },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.aiastrologers.count({ where }),
    ]);

    // 🔹 Collect all skill IDs used across these AI astrologers
    const skillIdSet = new Set<string>();

    const addCsvIds = (csv?: string | null) => {
      if (!csv) return;
      csv
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .forEach((id) => skillIdSet.add(id));
    };

    aiAstrologers.forEach((ai) => {
      addCsvIds(ai.all_skills);
      addCsvIds(ai.primary_skill); // primary_skill might ALSO be CSV like "2,51,54"
    });

    // Only keep pure numeric IDs before converting to BigInt
    const skillIdStrings = Array.from(skillIdSet).filter((id) =>
      /^\d+$/.test(id)
    );

    let skillMap: Record<string, string> = {};

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

      skillMap = Object.fromEntries(
        skills.map((s) => [s.id.toString(), s.name])
      );
    }

    // 🔹 Calculate stats + attach human-readable skills
    const aiAstrologersWithStats = aiAstrologers.map((ai) => {
      const walletBalance = ai.wallettransactions.reduce(
        (sum: number, transaction: any) => {
          const amt =
            transaction.amount != null ? Number(transaction.amount) : 0;
          return transaction.isCredit ? sum + amt : sum - amt;
        },
        0
      );

      // Parse skill IDs from CSV strings
      const parsedAllSkillIds =
        ai.all_skills
          ?.split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0) ?? [];

      const parsedPrimarySkillIds =
        ai.primary_skill
          ?.split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0) ?? [];

      const primarySkillId = parsedPrimarySkillIds[0]; // first ID as primary

      const allSkillNames = parsedAllSkillIds.map(
        (id) => skillMap[id] ?? id
      );

      const primarySkillName = primarySkillId
        ? skillMap[primarySkillId] ?? primarySkillId
        : null;

      return {
        ...ai,
        totalChats: ai.aiChatHistories.length,
        totalOrders: ai.order_requests.length,
        followerCount: ai.aiFollowers.length,
        walletBalance: walletBalance.toFixed(2),
        primarySkillName,
        allSkillNames,
        // hide raw relations in list view
        aiChatHistories: undefined,
        wallettransactions: undefined,
        aiFollowers: undefined,
        order_requests: undefined,
      };
    });

    const safe = convertPrismaTypes({
      success: true,
      data: aiAstrologersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching AI astrologers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch AI astrologers",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST unchanged…
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      image,
      about,
      astrologerCategoryId,
      primary_skill,
      all_skills,
      chat_charge,
      chat_charge_usd,
      experience,
      system_intruction,
      slug,
      type,
      aiType,
      referral_code,
      featured,
    } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required",
        },
        { status: 400 }
      );
    }

    const newAiAstrologer = await prisma.aiastrologers.create({
      data: {
        name,
        image,
        about,
        astrologerCategoryId,
        primary_skill,
        all_skills,
        chat_charge,
        chat_charge_usd,
        experience,
        system_intruction,
        slug,
        type,
        aiType,
        referral_code,
        featured: featured ?? 0,
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "AI Astrologer created successfully",
      data: newAiAstrologer,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error creating AI astrologer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create AI astrologer",
        message: error.message,
      },
      { status: 500 }
    );
  }
}