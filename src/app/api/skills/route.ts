// app/api/skills/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const skills = await prisma.skills.findMany({
      where: {
        isDelete: false,
        isActive: true,
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

    const safe = convertPrismaTypes({
      success: true,
      data: skills,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch skills",
        message: error.message,
      },
      { status: 500 }
    );
  }
}