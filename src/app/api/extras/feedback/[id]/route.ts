// app/api/extras/feedback/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Next 15: params is a Promise now
type RouteContext = {
  params: Promise<{ id: string }>;
};

// Helper to convert Prisma BigInt/Decimal/Date → JSON-safe
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

// GET single feedback by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // ⬇️ unwrap params Promise
    const { id: rawId } = await context.params;
    const id = BigInt(rawId);

    const feedback = await prisma.app_reviews.findFirst({
      where: {
        id,
        isDelete: false,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            profile: true,
            created_at: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: convertPrismaTypes(feedback),
    });
  } catch (error: any) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// PUT update feedback (toggle active status)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = BigInt(rawId);

    const body = await request.json();
    const { isActive, modifiedBy } = body;

    // Check if feedback exists
    const existingFeedback = await prisma.app_reviews.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { success: false, error: "Feedback not found" },
        { status: 404 }
      );
    }

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

    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedFeedback = await prisma.app_reviews.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Feedback updated successfully",
      data: convertPrismaTypes(updatedFeedback),
    });
  } catch (error: any) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update feedback" },
      { status: 500 }
    );
  }
}

// DELETE feedback (soft delete)
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

    const existingFeedback = await prisma.app_reviews.findFirst({
      where: { id, isDelete: false },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { success: false, error: "Feedback not found" },
        { status: 404 }
      );
    }

    await prisma.app_reviews.update({
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
      message: "Feedback deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
