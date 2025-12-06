// app/api/extras/videos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

// Helper: convert BigInt / Decimal / Date → JSON-safe
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

// GET single video by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = BigInt(rawId); // keep BigInt since your schema uses BIGINT

    const video = await prisma.astrology_videos.findFirst({
      where: {
        id,
        isDelete: false,
      },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: convertPrismaTypes(video),
    });
  } catch (error: any) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch video" },
      { status: 500 }
    );
  }
}

// PUT update video
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = BigInt(rawId);

    const body = await request.json();
    const {
      youtubeLink,
      coverImage,
      videoTitle,
      isActive,
      modifiedBy,
    } = body;

    // Check if video exists
    const existingVideo = await prisma.astrology_videos.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    // Validation
    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "modifiedBy is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      modifiedBy,
      updated_at: new Date(),
    };

    if (youtubeLink !== undefined) updateData.youtubeLink = youtubeLink;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (videoTitle !== undefined) updateData.videoTitle = videoTitle;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedVideo = await prisma.astrology_videos.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Video updated successfully",
      data: convertPrismaTypes(updatedVideo),
    });
  } catch (error: any) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update video" },
      { status: 500 }
    );
  }
}

// DELETE video (soft delete)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = BigInt(rawId);

    const { searchParams } = new URL(request.url);
    const modifiedBy = parseInt(searchParams.get("modifiedBy") || "0", 10);

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "modifiedBy is required" },
        { status: 400 }
      );
    }

    const existingVideo = await prisma.astrology_videos.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingVideo) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    await prisma.astrology_videos.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete video" },
      { status: 500 }
    );
  }
}
