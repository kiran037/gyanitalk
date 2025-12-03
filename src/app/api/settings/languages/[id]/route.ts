// app/api/settings/languages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single language
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const language = await prisma.languages.findUnique({
      where: {
        id: BigInt(params.id),
      },
    });

    if (!language) {
      return NextResponse.json(
        { success: false, error: 'Language not found' },
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
    console.error('Error fetching language:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch language' },
      { status: 500 }
    );
  }
}

// PUT - Update language
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { languageName, languageCode, language_sign } = body;

    // Check if exists
    const existing = await prisma.languages.findUnique({
      where: {
        id: BigInt(params.id),
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Language not found' },
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
      where: { id: BigInt(params.id) },
      data: updateData,
    });

    const updatedData = {
      ...updated,
      id: updated.id.toString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Language updated successfully',
      data: updatedData,
    });
  } catch (error: any) {
    console.error('Error updating language:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update language' },
      { status: 500 }
    );
  }
}

// DELETE - Delete language (hard delete as no soft delete fields)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.languages.findUnique({
      where: {
        id: BigInt(params.id),
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Language not found' },
        { status: 404 }
      );
    }

    await prisma.languages.delete({
      where: { id: BigInt(params.id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Language deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting language:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete language' },
      { status: 500 }
    );
  }
}