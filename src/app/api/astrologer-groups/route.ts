import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: BigInt / Decimal / Date → JSON-safe
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

// GET - List all Astrologer Groups
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";

    const where: any = {};

    if (search) {
      where.name = { contains: search };
    }

    const [groups, total] = await Promise.all([
      prisma.astrologer_groups.findMany({
        where,
        skip,
        take: limit,
        include: {
          astrologerassign: {
            include: {
              astrologer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                  primarySkill: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.astrologer_groups.count({ where }),
    ]);

    // Format response with member count
    const groupsWithStats = groups.map((group) => {
      // Extract astrologers safely (filtering out nulls if relation is missing)
      const members = group.astrologerassign
        .map((assign) => assign.astrologer)
        .filter((member) => member !== null);

      return {
        ...group,
        memberCount: members.length,
        members: members,
        astrologerassign: undefined, // Remove the raw relation data from response
      };
    });

    const safe = convertPrismaTypes({
      success: true,
      data: groupsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching astrologer groups:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch astrologer groups",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new Astrologer Group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Group name is required",
        },
        { status: 400 }
      );
    }

    const newGroup = await prisma.astrologer_groups.create({
      data: { name },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Astrologer group created successfully",
      data: newGroup,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error creating astrologer group:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create astrologer group",
        message: error.message,
      },
      { status: 500 }
    );
  }
}