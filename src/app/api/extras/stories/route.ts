// app/api/extras/stories/route.ts
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

  // ✅ FIX: Properly handle nested objects
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

    const [stories, total] = await Promise.all([
      prisma.astrologer_stories.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          // ✅ FIX: Explicitly include astrologer with all fields
          astrologer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          story_view_count: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.astrologer_stories.count({ where }),
    ]);

    // ✅ DEBUG: Check raw data from Prisma
    console.log("Raw first story from Prisma:", {
      id: stories[0]?.id,
      astrologerId: stories[0]?.astrologerId,
      astrologer: stories[0]?.astrologer,
    });

    // Add view count and calculate remaining time
    const storiesWithMeta = stories.map((story) => {
      const createdAt = new Date(story.created_at!);
      const expiresAt = new Date(
        createdAt.getTime() + 24 * 60 * 60 * 1000
      );
      const remainingMs = expiresAt.getTime() - Date.now();
      const remainingHours = Math.max(
        0,
        Math.floor(remainingMs / (1000 * 60 * 60))
      );
      const remainingMinutes = Math.max(
        0,
        Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
      );

      // ✅ DEBUG: Log to see what astrologer data we have
      console.log(`Story ${story.id}:`, {
        astrologerId: story.astrologerId?.toString(),
        hasAstrologer: !!story.astrologer,
        astrologerName: story.astrologer?.name,
        astrologerType: typeof story.astrologer
      });

      return {
        id: story.id,
        astrologerId: story.astrologerId?.toString() || null,
        mediaType: story.mediaType,
        media: story.media,
        created_at: story.created_at?.toISOString(),
        // ✅ FIX: Explicitly map astrologer object
        astrologer: story.astrologer ? {
          id: story.astrologer.id.toString(),
          name: story.astrologer.name,
          profileImage: story.astrologer.profileImage
        } : null,
        viewCount: story.story_view_count?.length || 0,
        expiresAt: expiresAt.toISOString(),
        remainingTime: {
          hours: remainingHours,
          minutes: remainingMinutes,
          totalMinutes: Math.max(
            0,
            Math.floor(remainingMs / (1000 * 60))
          ),
        },
      };
    });

    console.log("First story with meta:", JSON.stringify(storiesWithMeta[0], null, 2));

    return NextResponse.json({
      success: true,
      data: storiesWithMeta,
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