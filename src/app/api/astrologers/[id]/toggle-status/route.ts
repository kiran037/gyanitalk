// app/api/astrologers/[id]/toggle-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    const astrologerId = BigInt(id);
    const body = await req.json();
    const { field, value } = body;

    const allowedFields = [
      "isVerified",
      "isActive",
      "chatStatus",
      "callStatus",
      "isLiveOff",
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid field",
          message: `Field must be one of: ${allowedFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const astrologer = await prisma.astrologers.findUnique({
      where: { id: astrologerId },
    });

    if (!astrologer) {
      return NextResponse.json(
        { success: false, error: "Astrologer not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (field === "isVerified" || field === "isActive") {
      updateData[field] = Boolean(value);
    } else if (field === "isLiveOff") {
      updateData[field] = value ? 1 : 0;
    } else {
      // chatStatus / callStatus
      updateData[field] = value;
    }

    const updatedAstrologer = await prisma.astrologers.update({
      where: { id: astrologerId },
      data: updateData,
      select: {
        id: true,
        name: true,
        isVerified: true,
        isActive: true,
        chatStatus: true,
        callStatus: true,
        isLiveOff: true,
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: `${field} updated successfully`,
      data: updatedAstrologer,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error toggling astrologer status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update status",
        message: error.message,
      },
      { status: 500 }
    );
  }
}