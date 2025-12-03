// app/api/pages/validate-slug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/pages/validate-slug?slug=my-slug&excludeId=1
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('excludeId');

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug parameter is required',
        },
        { status: 400 }
      );
    }

    // Validate slug format (URL-friendly)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        success: true,
        available: false,
        message: 'Slug must be lowercase, alphanumeric, and can contain hyphens (no spaces or special characters)',
      });
    }

    // Check if slug exists
    const where: any = {
      slug,
    };

    if (excludeId) {
      const id = parseInt(excludeId);
      if (!isNaN(id)) {
        where.id = { not: id };
      }
    }

    const existingPage = await prisma.pages.findFirst({
      where,
    });

    if (existingPage) {
      return NextResponse.json({
        success: true,
        available: false,
        message: 'Slug is already in use',
        suggestion: `${slug}-${Date.now().toString().slice(-6)}`,
      });
    }

    return NextResponse.json({
      success: true,
      available: true,
      message: 'Slug is available',
    });
  } catch (error: any) {
    console.error('Error validating slug:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate slug',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}