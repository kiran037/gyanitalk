// app/api/extras/news/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Next 15: params is a Promise now
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

// GET single news by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = BigInt(rawId);

    const news = await prisma.astrotalk_in_news.findFirst({
      where: {
        id,
        isDelete: false,
      },
    });

    if (!news) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: convertPrismaTypes(news),
    });
  } catch (error: any) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// PUT update news
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = BigInt(rawId);

    const body = await request.json();
    const {
      newsDate,
      channel,
      link,
      bannerImage,
      description,
      isActive,
      modifiedBy,
    } = body;

    // Check if news exists
    const existingNews = await prisma.astrotalk_in_news.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: "News not found" },
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

    if (newsDate !== undefined) updateData.newsDate = new Date(newsDate);
    if (channel !== undefined) updateData.channel = channel;
    if (link !== undefined) updateData.link = link;
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedNews = await prisma.astrotalk_in_news.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "News updated successfully",
      data: convertPrismaTypes(updatedNews),
    });
  } catch (error: any) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update news" },
      { status: 500 }
    );
  }
}

// DELETE news (soft delete)
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

    const existingNews = await prisma.astrotalk_in_news.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingNews) {
      return NextResponse.json(
        { success: false, error: "News not found" },
        { status: 404 }
      );
    }

    await prisma.astrotalk_in_news.update({
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
      message: "News deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete news" },
      { status: 500 }
    );
  }
}
