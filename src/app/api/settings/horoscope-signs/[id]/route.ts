// app/api/settings/horoscope-signs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function safeToBigIntId(idStr: string): bigint {
  const s = idStr.trim();
  if (!/^\d+$/.test(s)) {
    throw new Error("Invalid id");
  }
  return BigInt(s);
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const signId = safeToBigIntId(id);

    const sign = await prisma.hororscope_signs.findFirst({
      where: {
        id: signId,
        isDelete: false,
      },
    });

    if (!sign) {
      return NextResponse.json(
        { success: false, error: "Horoscope sign not found" },
        { status: 404 }
      );
    }

    const signData = {
      ...sign,
      id: sign.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: signData,
    });
  } catch (error: any) {
    console.error("Error fetching horoscope sign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch horoscope sign" },
      { status: 500 }
    );
  }
}


export async function PUT(req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const signId = safeToBigIntId(id);

    const body = await req.json();
    const { name, image, displayOrder, isActive, modifiedBy } = body;

    const existing = await prisma.hororscope_signs.findFirst({
      where: {
        id: signId,
        isDelete: false,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Horoscope sign not found" },
        { status: 404 }
      );
    }

    if (!modifiedBy) {
      return NextResponse.json(
        { success: false, error: "ModifiedBy is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.hororscope_signs.update({
      where: { id: signId },
      data: {
        ...(name && { name: name.trim() }),
        ...(image && { image }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
        modifiedBy: parseInt(modifiedBy),
        updated_at: new Date(),
      },
    });

    const updatedData = {
      ...updated,
      id: updated.id.toString(),
    };

    return NextResponse.json({
      success: true,
      message: "Horoscope sign updated successfully",
      data: updatedData,
    });
  } catch (error: any) {
    console.error("Error updating horoscope sign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update horoscope sign" },
      { status: 500 }
    );
  }
}