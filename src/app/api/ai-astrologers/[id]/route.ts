// app/api/ai-astrologers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  // bigint → string
  if (typeof obj === "bigint") return obj.toString();

  // Prisma Decimal → number
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

// GET - Get AI Astrologer Details
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const aiAstrologerId = BigInt(id);

    const aiAstrologer = await prisma.aiastrologers.findUnique({
      where: { id: aiAstrologerId },
      include: {
        aiChatHistories: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
        wallettransactions: {
          orderBy: { created_at: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        aiFollowers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        order_requests: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
      },
    });

    if (!aiAstrologer) {
      return NextResponse.json(
        {
          success: false,
          error: "AI Astrologer not found",
        },
        { status: 404 }
      );
    }

    // 🔹 Fetch ALL available skills for dropdowns
    const availableSkills = await prisma.skills.findMany({
      where: { isDelete: false, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const skillsMap = new Map<string, string>(
      availableSkills.map((s) => [s.id.toString(), s.name])
    );

    // 🔹 Parse all_skills (stored as IDs) → names
    const rawSkillIdStrings: string[] = aiAstrologer.all_skills
      ? aiAstrologer.all_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Clean to numeric string IDs (in case something like "id:12")
    const cleanSkillIdStrings = rawSkillIdStrings
      .map((id) => id.replace(/[^\d]/g, ""))
      .filter((clean) => clean.length > 0);

    const allSkillNames = cleanSkillIdStrings.map(
      (id) => skillsMap.get(id) ?? id // fallback to the id string if not found
    );

    // 🔹 Primary Skill: stored as ID, resolve to name
    let primarySkillName: string | null = null;
    if (aiAstrologer.primary_skill != null) {
      const rawPrimary = String(aiAstrologer.primary_skill);
      const cleanPrimary = rawPrimary.replace(/[^\d]/g, "");
      primarySkillName =
        skillsMap.get(cleanPrimary) ??
        rawPrimary; // fallback to whatever is stored if not found
    }

    // 🔹 Calculate wallet balance safely
    const walletBalance = aiAstrologer.wallettransactions.reduce(
      (sum, transaction) => {
        const amt =
          transaction.amount != null ? Number(transaction.amount) : 0;
        return transaction.isCredit ? sum + amt : sum - amt;
      },
      0 as number
    );

    const payload = {
      ...aiAstrologer,
      walletBalance: walletBalance.toFixed(2),
      totalChats: aiAstrologer.aiChatHistories.length,
      totalOrders: aiAstrologer.order_requests.length,
      followerCount: aiAstrologer.aiFollowers.length,

      // ✅ Human-readable skill info for cards/detail UI
      primarySkillName,
      allSkillNames,

      // ✅ Options for dropdowns on the frontend
      availableSkills: availableSkills.map((s) => ({
        id: s.id.toString(),
        name: s.name,
      })),
    };

    return NextResponse.json(
      convertPrismaTypes({
        success: true,
        data: payload,
      })
    );
  } catch (error: any) {
    console.error("Error fetching AI astrologer details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch AI astrologer details",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH - Update AI Astrologer
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const aiAstrologerId = BigInt(id);
    const body = await request.json();

    const updatedAiAstrologer = await prisma.aiastrologers.update({
      where: { id: aiAstrologerId },
      data: {
        ...body,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      convertPrismaTypes({
        success: true,
        message: "AI Astrologer updated successfully",
        data: updatedAiAstrologer,
      })
    );
  } catch (error: any) {
    console.error("Error updating AI astrologer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update AI astrologer",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete AI Astrologer
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const aiAstrologerId = BigInt(id);

    await prisma.aiastrologers.delete({
      where: { id: aiAstrologerId },
    });

    return NextResponse.json(
      convertPrismaTypes({
        success: true,
        message: "AI Astrologer deleted successfully",
      })
    );
  } catch (error: any) {
    console.error("Error deleting AI astrologer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete AI astrologer",
        message: error.message,
      },
      { status: 500 }
    );
  }
}