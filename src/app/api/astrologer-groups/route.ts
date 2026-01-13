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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }

    // 1. Fetch Groups Only (with Counts)
    const [groups, total] = await Promise.all([
      prisma.astrologer_groups.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { astrologerassign: true },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.astrologer_groups.count({ where }),
    ]);

    // 2. Fetch ALL Assignments manually
    const groupIds = groups.map((g) => g.id);
    
    const assignments = await prisma.astrologer_assign_group.findMany({
      where: {
        group_id: { in: groupIds },
        astrologerId: { not: null } 
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        group_id: true,
        astrologerId: true,
      },
    });

    // 3. Fetch Astrologer Data (Images + Names)
    const astrologerIds = Array.from(new Set(
      assignments.map((a) => a.astrologerId).filter((id) => id !== null)
    )) as bigint[];

    const astrologers = await prisma.astrologers.findMany({
      where: { id: { in: astrologerIds } },
      select: {
        id: true,
        name: true,
        profileImage: true, // Primary Image
        users: {
            select: {
                profile: true // Fallback Image
            }
        }
      },
    });

    // 4. Create Lookup Map
    const astrologerMap = new Map();
    astrologers.forEach((a) => {
        // Resolve the best image available
        const finalImage = a.profileImage || a.users?.profile || null;
        astrologerMap.set(a.id.toString(), { ...a, finalImage });
    });

    // 5. Stitch Data Together
    const groupsWithStats = groups.map((group) => {
      const groupIdStr = group.id.toString();
      
      const groupAssignments = assignments.filter(
        (a) => a.group_id?.toString() === groupIdStr
      );

      const members = groupAssignments.slice(0, 5).map((assign) => {
        const idStr = assign.astrologerId?.toString();
        const astro = idStr ? astrologerMap.get(idStr) : null;
        
        return {
          id: idStr,
          name: astro?.name || "Unknown", 
          profileImage: astro?.finalImage || null // Send the resolved image
        };
      });

      return {
        ...group,
        memberCount: group._count?.astrologerassign || 0,
        members: members,
        _count: undefined,
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
      { success: false, error: "Failed to fetch groups", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name) return NextResponse.json({ success: false, error: "Group name is required" }, { status: 400 });
    const newGroup = await prisma.astrologer_groups.create({ data: { name } });
    const safe = convertPrismaTypes({ success: true, message: "Group created successfully", data: newGroup });
    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error creating group:", error);
    return NextResponse.json({ success: false, error: "Failed to create group", message: error.message }, { status: 500 });
  }
}