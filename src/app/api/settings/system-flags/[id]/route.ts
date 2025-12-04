// app/api/settings/system-flags/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// Helper to safely get numeric ID from context
async function getNumericId(context: RouteContext): Promise<number> {
  const { id } = await context.params;

  const parsed = Number(id);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Invalid ID param: "${id}"`);
  }

  return parsed;
}

// GET - Fetch single system flag
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const id = await getNumericId(context);

    const flag = await prisma.systemflag.findFirst({
      where: {
        id,
        isDelete: "0",
      },
      include: {
        flagGroup: true,
      },
    });

    if (!flag) {
      return NextResponse.json(
        { success: false, error: "System flag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: flag,
    });
  } catch (error: any) {
    console.error("Error fetching system flag:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch system flag" },
      { status: 500 }
    );
  }
}

// PUT - Update system flag
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const id = await getNumericId(context);

    const body = await req.json();
    const {
      name,
      displayName,
      value,
      valueType,
      flagGroupId,
      description,
      isActive,
      viewenable,
      parent_id,
    } = body;

    // Check if exists
    const existing = await prisma.systemflag.findFirst({
      where: {
        id,
        isDelete: "0",
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "System flag not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (displayName !== undefined) updateData.displayName = displayName;
    if (value !== undefined) updateData.value = value;
    if (valueType !== undefined) updateData.valueType = valueType;
    if (flagGroupId !== undefined) {
      const groupIdNum = Number(flagGroupId);
      if (!Number.isNaN(groupIdNum)) {
        updateData.flagGroupId = groupIdNum;
      }
    }
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive ? "1" : "0";
    if (viewenable !== undefined) updateData.viewenable = viewenable;
    if (parent_id !== undefined) updateData.parent_id = parent_id;

    const updated = await prisma.systemflag.update({
      where: { id },
      data: updateData,
      include: {
        flagGroup: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "System flag updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating system flag:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update system flag" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete system flag
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const id = await getNumericId(context);

    const existing = await prisma.systemflag.findFirst({
      where: {
        id,
        isDelete: "0",
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "System flag not found" },
        { status: 404 }
      );
    }

    await prisma.systemflag.update({
      where: { id },
      data: {
        isDelete: "1",
        isActive: "0",
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "System flag deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting system flag:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete system flag" },
      { status: 500 }
    );
  }
}
