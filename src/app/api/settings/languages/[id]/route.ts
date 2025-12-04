// app/api/settings/languages/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// 🔹 Next 15/16 Turbopack: params is a Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

// 🔹 Safe BigInt parser
function parseLanguageId(id: string): bigint {
  if (!id) throw new Error("Missing id param");
  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid id param: ${id}`);
  }
  return BigInt(trimmed);
}

// GET - Fetch single language
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const languageId = parseLanguageId(id);

    const language = await prisma.languages.findUnique({
      where: {
        id: languageId,
      },
    });

    if (!language) {
      return NextResponse.json(
        { success: false, error: "Language not found" },
        { status: 404 }
      );
    }

    const languageData = {
      ...language,
      id: language.id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: languageData,
    });
  } catch (error: any) {
    console.error("Error fetching language:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch language" },
      { status: 500 }
    );
  }
}

// PUT - Update language
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const languageId = parseLanguageId(id);

    const body = await req.json();
    const { languageName, languageCode, language_sign } = body;

    // Check if exists
    const existing = await prisma.languages.findUnique({
      where: {
        id: languageId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Language not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (languageName) updateData.languageName = languageName.trim();
    if (languageCode) updateData.languageCode = languageCode.trim();
    if (language_sign !== undefined) updateData.language_sign = language_sign;

    const updated = await prisma.languages.update({
      where: { id: languageId },
      data: updateData,
    });

    const updatedData = {
      ...updated,
      id: updated.id.toString(),
    };

    return NextResponse.json({
      success: true,
      message: "Language updated successfully",
      data: updatedData,
    });
  } catch (error: any) {
    console.error("Error updating language:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update language" },
      { status: 500 }
    );
  }
}

// DELETE - Delete language (hard delete)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const languageId = parseLanguageId(id);

    const existing = await prisma.languages.findUnique({
      where: {
        id: languageId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Language not found" },
        { status: 404 }
      );
    }

    await prisma.languages.delete({
      where: { id: languageId },
    });

    return NextResponse.json({
      success: true,
      message: "Language deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting language:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete language" },
      { status: 500 }
    );
  }
}
