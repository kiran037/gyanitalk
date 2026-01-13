import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

// GET single story
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);

    // 1. Fetch Raw Story
    const story = await prisma.astrologer_stories.findUnique({
      where: { id },
      include: {
        // Use count aggregation instead of full array if possible, 
        // but here we might need userIds for specific logic?
        // Let's stick to _count for now unless you display the user list
        _count: {
            select: { story_view_count: true }
        }
      },
    });

    if (!story) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    // 2. Manual Fetch - Astrologer Details
    let astroData = null;
    if (story.astrologerId) {
        const astro = await prisma.astrologers.findUnique({
            where: { id: story.astrologerId },
            select: {
                id: true,
                name: true,
                profileImage: true,
                users: { select: { profile: true } }
            }
        });
        
        if (astro) {
            const img = astro.profileImage || astro.users?.profile || null;
            astroData = { 
                id: astro.id.toString(), 
                name: astro.name, 
                profileImage: img 
            };
        }
    }

    // Calc expiry
    const createdAt = new Date(story.created_at!);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const remainingMs = expiresAt.getTime() - Date.now();
    const isExpired = remainingMs <= 0;

    const payload = {
      ...story,
      viewCount: story._count?.story_view_count || 0,
      astrologer: astroData || { name: "Unknown", profileImage: null },
      expiresAt: expiresAt.toISOString(),
      isExpired,
      remainingTime: {
        hours: Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))),
      },
      // Clean up internal aggregate key
      _count: undefined
    };

    return NextResponse.json({
      success: true,
      data: convertPrismaTypes(payload),
    });
  } catch (error: any) {
    console.error("Error fetching story:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch story" },
      { status: 500 }
    );
  }
}

// DELETE story
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10);

    const existingStory = await prisma.astrologer_stories.findUnique({
      where: { id },
    });

    if (!existingStory) {
      return NextResponse.json({ success: false, error: "Story not found" }, { status: 404 });
    }

    await prisma.story_view_counts.deleteMany({ where: { storyId: id } });
    await prisma.astrologer_stories.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Story deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete story" },
      { status: 500 }
    );
  }
}