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

// GET all stories (last 24 hours only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const astrologerId = searchParams.get("astrologerId");

    const skip = (page - 1) * limit;

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const where: any = {
      created_at: {
        gte: twentyFourHoursAgo,
      },
    };

    if (astrologerId) {
      where.astrologerId = BigInt(astrologerId);
    }

    // 1. Fetch RAW Stories (No nested includes)
    const [storiesRaw, total] = await Promise.all([
      prisma.astrologer_stories.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          _count: {
            select: { story_view_count: true }
          }
        }
      }),
      prisma.astrologer_stories.count({ where }),
    ]);

    // 2. Extract Astrologer IDs
    const astroIds = new Set<string>();
    storiesRaw.forEach(s => {
      if (s.astrologerId) astroIds.add(s.astrologerId.toString());
    });

    // 3. Manual Fetch - ASTROLOGERS (With User Image Fallback)
    const astroMap = new Map();
    if (astroIds.size > 0) {
      const astros = await prisma.astrologers.findMany({
        where: { id: { in: Array.from(astroIds).map(id => BigInt(id)) } },
        select: {
          id: true,
          name: true,
          profileImage: true, 
          users: { select: { profile: true } } // Fallback image
        },
      });

      astros.forEach(a => {
        const img = a.profileImage || a.users?.profile || null;
        astroMap.set(a.id.toString(), {
          id: a.id.toString(),
          name: a.name,
          profileImage: img
        });
      });
    }

    // 4. Stitch Data & Calculate Meta
    const storiesWithMeta = storiesRaw.map((story) => {
      const createdAt = new Date(story.created_at!);
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
      const remainingMs = expiresAt.getTime() - Date.now();
      
      const astroIdStr = story.astrologerId?.toString();
      const astro = astroIdStr ? astroMap.get(astroIdStr) : null;

      return {
        id: story.id,
        astrologerId: astroIdStr || null,
        mediaType: story.mediaType,
        media: story.media,
        created_at: story.created_at?.toISOString(),
        
        astrologer: astro || { 
            id: astroIdStr, 
            name: "Unknown", 
            profileImage: null 
        },
        
        viewCount: story._count?.story_view_count || 0,
        expiresAt: expiresAt.toISOString(),
        remainingTime: {
          hours: Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60))),
          minutes: Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))),
          totalMinutes: Math.max(0, Math.floor(remainingMs / (1000 * 60))),
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: convertPrismaTypes(storiesWithMeta),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching stories list:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stories" },
      { status: 500 }
    );
  }
}