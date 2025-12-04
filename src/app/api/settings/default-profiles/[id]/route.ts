// app/api/settings/default-profiles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function safeToIntId(idStr: string): number {
  const s = idStr.trim();
  const n = Number(s);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("Invalid id");
  }
  return n;
}

// GET - Fetch single default profile
export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const profileId = safeToIntId(id);

    const profile = await prisma.defaultprofile.findFirst({
      where: {
        id: profileId,
        isDelete: false,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Default profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    if (error.message === "Invalid id") {
      return NextResponse.json(
        { success: false, error: "Invalid default profile id" },
        { status: 400 }
      );
    }

    console.error("Error fetching default profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch default profile" },
      { status: 500 }
    );
  }
}

// PUT - Update default profile
export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const profileId = safeToIntId(id);

    const body = await req.json();
    const { name, profile, isActive } = body;

    // Check if exists
    const existing = await prisma.defaultprofile.findFirst({
      where: {
        id: profileId,
        isDelete: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Default profile not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.defaultprofile.update({
      where: { id: profileId },
      data: {
        ...(name && { name: name.trim() }),
        ...(profile && { profile }),
        ...(isActive !== undefined && { isActive }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Default profile updated successfully",
      data: updated,
    });
  } catch (error: any) {
    if (error.message === "Invalid id") {
      return NextResponse.json(
        { success: false, error: "Invalid default profile id" },
        { status: 400 }
      );
    }

    console.error("Error updating default profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update default profile" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete default profile
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const profileId = safeToIntId(id);

    const existing = await prisma.defaultprofile.findFirst({
      where: {
        id: profileId,
        isDelete: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Default profile not found" },
        { status: 404 }
      );
    }

    await prisma.defaultprofile.update({
      where: { id: profileId },
      data: {
        isDelete: true,
        isActive: false,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Default profile deleted successfully",
    });
  } catch (error: any) {
    if (error.message === "Invalid id") {
      return NextResponse.json(
        { success: false, error: "Invalid default profile id" },
        { status: 400 }
      );
    }

    console.error("Error deleting default profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete default profile" },
      { status: 500 }
    );
  }
}
