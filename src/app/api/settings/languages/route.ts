// app/api/settings/languages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all languages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where: any = {};

    if (search) {
      where.OR = [
        { languageName: { contains: search } },
        { languageCode: { contains: search } },
      ];
    }

    const languages = await prisma.languages.findMany({
      where,
      orderBy: {
        languageName: 'asc',
      },
    });

    // Convert BigInt to string
    const languagesData = languages.map((lang) => ({
      ...lang,
      id: lang.id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: languagesData,
      total: languagesData.length,
    });
  } catch (error: any) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}

// POST - Create new language
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { languageName, languageCode, language_sign } = body;

    // Validation
    if (!languageName || !languageCode) {
      return NextResponse.json(
        { success: false, error: 'Language name and code are required' },
        { status: 400 }
      );
    }

    // Check for duplicate language name
    const existingName = await prisma.languages.findFirst({
      where: {
        languageName: languageName.trim(),
      },
    });

    if (existingName) {
      return NextResponse.json(
        { success: false, error: 'This language name already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate language code
    const existingCode = await prisma.languages.findFirst({
      where: {
        languageCode: languageCode.trim(),
      },
    });

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'This language code already exists' },
        { status: 409 }
      );
    }

    const newLanguage = await prisma.languages.create({
      data: {
        languageName: languageName.trim(),
        languageCode: languageCode.trim(),
        language_sign: language_sign || null,
      },
    });

    const languageData = {
      ...newLanguage,
      id: newLanguage.id.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Language created successfully',
        data: languageData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating language:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create language' },
      { status: 500 }
    );
  }
}