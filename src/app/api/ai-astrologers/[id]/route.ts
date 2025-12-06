// app/api/ai-astrologers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  // bigint → string
  if (typeof obj === "bigint") return obj.toString();

  // Prisma Decimal (runtime class name "Decimal") → number
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  // Date → ISO string
  if (obj instanceof Date) return obj.toISOString();

  // primitives
  if (typeof obj !== "object") return obj;

  // arrays
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  // objects: recurse
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

    if (type) {
      where.type = type;
    }

    if (aiType) {
      where.aiType = aiType;
    }

    if (featured !== null && featured !== undefined) {
      // e.g. "0" | "1"
      where.featured = parseInt(featured, 10);
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

    // 🔹 Collect ALL skill IDs across all AI astrologers (to query skills once)
    const rawSkillStrings = aiAstrologers.flatMap((ai) =>
      (ai.all_skills || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );

    const flattenedSkillStrings = rawSkillStrings.flatMap((id) =>
      id.includes(",") ? id.split(",") : id
    );

    const cleanSkillIdStrings = flattenedSkillStrings
      .map((id) => id.replace(/[^\d]/g, "")) // keep only digits
      .filter((clean) => clean.length > 0);

    const uniqueCleanSkillIdStrings = Array.from(new Set(cleanSkillIdStrings));
    const skillIds =
      uniqueCleanSkillIdStrings.length > 0
        ? uniqueCleanSkillIdStrings.map((s) => BigInt(s))
        : [];

    // 🔹 Fetch all skills once
    const skills = skillIds.length
      ? await prisma.skills.findMany({
          where: { id: { in: skillIds }, isDelete: false },
          select: { id: true, name: true },
        })
      : [];

    const skillsById = new Map<string, string>(
      skills.map((s) => [s.id.toString(), s.name])
    );

    // 🔹 Calculate stats + attach readable skill names
    const aiAstrologersWithStats = aiAstrologers.map((ai) => {
      // Wallet balance
      const walletBalance = ai.wallettransactions.reduce(
        (sum: number, transaction: any) => {
          const amt =
            transaction.amount != null ? Number(transaction.amount) : 0;
          return transaction.isCredit ? sum + amt : sum - amt;
        },
        0
      );

      // All skills → names
      let allSkillNames: string[] = [];
      if (ai.all_skills) {
        const ownRawIds = ai.all_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const ownCleanIds = ownRawIds
          .flatMap((id) => (id.includes(",") ? id.split(",") : id))
          .map((id) => id.replace(/[^\d]/g, ""))
          .filter((clean) => clean.length > 0);

        allSkillNames = ownCleanIds.map(
          (cleanId) => skillsById.get(cleanId) ?? cleanId
        );
      }

      // Primary skill → name
      let primarySkillName: string | null = null;
      if (ai.primary_skill != null) {
        const cleanPrimary = String(ai.primary_skill).replace(/[^\d]/g, "");
        primarySkillName =
          skillsById.get(cleanPrimary) ?? String(ai.primary_skill);
      }

      return {
        ...ai,
        totalChats: ai.aiChatHistories.length,
        totalOrders: ai.order_requests.length,
        followerCount: ai.aiFollowers.length,
        walletBalance: walletBalance.toFixed(2),

        // ✅ human readable skills for frontend
        primarySkillName,
        allSkillNames,

        // Don't expose raw relations in list
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

// POST - Create new AI Astrologer
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