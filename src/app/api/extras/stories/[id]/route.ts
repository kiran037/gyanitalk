// app/api/extras/stories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

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

// GET single story by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10); // if story.id is Int

    const story = await prisma.astrologer_stories.findUnique({
      where: { id },
      include: {
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
            userId: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    // Calculate expiry info
    const createdAt = new Date(story.created_at!);
    const expiresAt = new Date(
      createdAt.getTime() + 24 * 60 * 60 * 1000
    );
    const remainingMs = expiresAt.getTime() - Date.now();
    const isExpired = remainingMs <= 0;

    const payload = {
      ...story,
      viewCount: story.story_view_count.length,
      expiresAt: expiresAt.toISOString(),
      isExpired,
      remainingTime: {
        hours: Math.max(
          0,
          Math.floor(remainingMs / (1000 * 60 * 60))
        ),
        minutes: Math.max(
          0,
          Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
        ),
      },
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

// DELETE story (hard delete since no isDelete field)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = parseInt(rawId, 10); // if story.id is Int

    const existingStory = await prisma.astrologer_stories.findUnique({
      where: { id },
    });

    if (!existingStory) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    // Delete all view counts first (cascade)
    await prisma.story_view_counts.deleteMany({
      where: { storyId: id },
    });

    // Then delete the story
    await prisma.astrologer_stories.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete story" },
      { status: 500 }
    );
  }
}
