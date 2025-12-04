// app/api/settings/gifts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Type for the route context in Next 15+/16 with Turbopack
type RouteContext = {
  params: Promise<{ id: string }>;
};

// Small helper to safely parse the id into BigInt
function parseGiftId(id: string): bigint {
  if (!id) {
    throw new Error("Missing id param");
  }
  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid id param: ${id}`);
  }
  return BigInt(trimmed);
}

// GET - Fetch single gift
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const giftId = parseGiftId(id);

    const gift = await prisma.gifts.findFirst({
      where: {
        id: giftId,
        isDelete: false,
      },
    });

    if (!gift) {
      return NextResponse.json(
        { success: false, error: "Gift not found" },
        { status: 404 }
      );
    }

    const giftData = {
      ...gift,
      id: gift.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: giftData,
    });
  } catch (error: any) {
    console.error("Error fetching gift:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gift" },
      { status: 500 }
    );
  }
}

// PUT - Update gift
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const giftId = parseGiftId(id);

    const body = await req.json();
    const { name, image, amount, displayOrder, isActive, modifiedBy } = body;

    // Check if exists
    const existing = await prisma.gifts.findFirst({
      where: {
        id: giftId,
        isDelete: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Gift not found" },
        { status: 404 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "ModifiedBy is required" },
        { status: 400 }
      );
    }

    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be positive" },
        { status: 400 }
      );
    }

    const updateData: any = {
      modifiedBy: parseInt(modifiedBy),
      updated_at: new Date(),
    };

    if (name) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.gifts.update({
      where: { id: giftId },
      data: updateData,
    });

    const updatedData = {
      ...updated,
      id: updated.id.toString(),
    };

    return NextResponse.json({
      success: true,
      message: "Gift updated successfully",
      data: updatedData,
    });
  } catch (error: any) {
    console.error("Error updating gift:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update gift" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete gift
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const giftId = parseGiftId(id);

    const { searchParams } = new URL(req.url);
    const modifiedBy = searchParams.get("modifiedBy");

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "ModifiedBy is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.gifts.findFirst({
      where: {
        id: giftId,
        isDelete: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Gift not found" },
        { status: 404 }
      );
    }

    await prisma.gifts.update({
      where: { id: giftId },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy: parseInt(modifiedBy),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gift deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting gift:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete gift" },
      { status: 500 }
    );
  }
}
