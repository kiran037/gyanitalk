// app/api/astrologer-groups/[id]/members/[astrologerId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// JSON-safe helper (for consistency)
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

// Next 15 style
type RouteContext = {
  params: Promise<{ id: string; astrologerId: string }>;
};

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id, astrologerId } = await context.params;

    if (!id || !astrologerId) {
      return NextResponse.json(
        { success: false, error: "Group ID and astrologerId are required" },
        { status: 400 }
      );
    }

    const groupIdBigInt = BigInt(id);
    const astrologerIdBigInt = BigInt(astrologerId);

    const assignment = await prisma.astrologer_assign_group.findFirst({
      where: {
        group_id: groupIdBigInt,
        astrologerId: astrologerIdBigInt,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          error: "Astrologer not found in this group",
        },
        { status: 404 }
      );
    }

    await prisma.astrologer_assign_group.delete({
      where: { id: assignment.id },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Astrologer removed from group successfully",
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error removing astrologer from group:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove astrologer from group",
        message: error.message,
      },
      { status: 500 }
    );
  }
}