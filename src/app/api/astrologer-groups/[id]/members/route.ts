// app/api/astrologer-groups/[id]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// JSON-safe converter (BigInt / Decimal / Date)
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

// Next 15+ style
type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get Group Members
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Group ID is required" },
        { status: 400 }
      );
    }

    const groupId = BigInt(id);
    const searchParams = req.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where = {
      group_id: groupId,
    };

    const [members, total] = await Promise.all([
      prisma.astrologer_assign_group.findMany({
        where,
        skip,
        take: limit,
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
              videoCallRate: true,
              isVerified: true,
              isActive: true,
              chatStatus: true,
              callStatus: true,
              created_at: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.astrologer_assign_group.count({ where }),
    ]);

    const safe = convertPrismaTypes({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching group members:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch group members",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Add Astrologers to Group
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Group ID is required" },
        { status: 400 }
      );
    }

    const groupId = BigInt(id);
    const body = await req.json();
    const { astrologerIds } = body; // Array of astrologer IDs (string/number)

    if (!astrologerIds || !Array.isArray(astrologerIds) || astrologerIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "astrologerIds array is required",
        },
        { status: 400 }
      );
    }

    // Check if group exists
    const group = await prisma.astrologer_groups.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          error: "Group not found",
        },
        { status: 404 }
      );
    }

    // Check which astrologers are already in the group
    const existingAssignments = await prisma.astrologer_assign_group.findMany({
      where: {
        group_id: groupId,
        astrologerId: {
          in: astrologerIds.map((id: string | number) => BigInt(id)),
        },
      },
    });

    const existingAstrologerIds = existingAssignments
      .map((a) => a.astrologerId?.toString())
      .filter(Boolean) as string[];

    const newAstrologerIds = astrologerIds.filter(
      (id: string | number) => !existingAstrologerIds.includes(id.toString())
    );

    if (newAstrologerIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "All selected astrologers are already in this group",
        },
        { status: 400 }
      );
    }

    // Add astrologers to group
    const assignments = await Promise.all(
      newAstrologerIds.map((astrologerId: string | number) =>
        prisma.astrologer_assign_group.create({
          data: {
            group_id: groupId,
            astrologerId: BigInt(astrologerId),
          },
          include: {
            astrologer: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        })
      )
    );

    const safe = convertPrismaTypes({
      success: true,
      message: `${assignments.length} astrologer(s) added to group successfully`,
      data: assignments,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error adding astrologers to group:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add astrologers to group",
        message: error.message,
      },
      { status: 500 }
    );
  }
}