// app/api/astrologers/[id]/gallery/[galleryId]/route.ts
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
  params: Promise<{ id: string; galleryId: string }>;
};

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { galleryId } = await context.params;

    if (!galleryId) {
      return NextResponse.json(
        { success: false, error: "Gallery ID is required" },
        { status: 400 }
      );
    }

    const galleryIdNum = parseInt(galleryId, 10);

    const deletedItem = await prisma.astrologers_gallery.update({
      where: { id: galleryIdNum },
      data: { status: 0 }, // soft delete
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Gallery item deleted successfully",
      data: deletedItem,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete gallery item",
        message: error.message,
      },
      { status: 500 }
    );
  }
}