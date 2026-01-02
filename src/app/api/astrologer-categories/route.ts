import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Converts BigInt / Date safely for JSON
 */
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

export async function GET() {
  try {
    const categories = await prisma.astrologer_categories.findMany({
      where: {
        isActive: true,
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        displayOrder: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
    });

    return NextResponse.json(
      convertPrismaTypes({
        success: true,
        data: categories,
      })
    );
  } catch (error: any) {
    console.error("Error fetching astrologer categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch astrologer categories",
        message: error.message,
      },
      { status: 500 }
    );
  }
}