// app/api/languages/route.ts
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
    const languages = await prisma.languages.findMany({
      select: {
        id: true,
        languageName: true,
      },
      orderBy: {
        languageName: "asc",
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      data: languages,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch languages",
        message: error.message,
      },
      { status: 500 }
    );
  }
}