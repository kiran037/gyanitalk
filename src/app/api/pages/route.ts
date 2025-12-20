// app/api/pages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pages_type } from '@/generated/client/client';


// GET /api/pages - List all pages with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    // Build where clause
    const where: any = {};

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    // Fetch pages
    const pages = await prisma.pages.findMany({
      where,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        isActive: true,
        created_at: true,
        updated_at: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    // Get all possible page types (match Prisma enum)
    const allTypes = Object.values(pages_type);

    // Existing types from DB, filter out null safely
    const existingTypes = pages
      .map((p) => p.type)
      .filter((t): t is pages_type => t !== null);

    // Types that are not yet used
    const availableTypes = allTypes.filter((type) => !existingTypes.includes(type));


    // Calculate stats
    const stats = {
      total: pages.length,
      active: pages.filter(p => p.isActive).length,
      inactive: pages.filter(p => !p.isActive).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        pages,
        availableTypes,
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pages',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/pages - Create new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, slug, description, ...seoFields } = body;

    // Validate required fields
    if (!type || !title) {
      return NextResponse.json(
        {
          success: false,
          error: 'Type and title are required',
        },
        { status: 400 }
      );
    }

if (!Object.values(pages_type).includes(type)) {
  return NextResponse.json(
    {
      success: false,
      error: `Invalid type. Must be one of: ${Object.values(pages_type).join(', ')}`,
    },
    { status: 400 }
  );
}

    // Check if page with this type already exists
    const existingPage = await prisma.pages.findFirst({
      where: { type },
    });

    if (existingPage) {
      return NextResponse.json(
        {
          success: false,
          error: `A page with type '${type}' already exists`,
        },
        { status: 409 }
      );
    }

    // Generate slug if not provided
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const slugExists = await prisma.pages.findFirst({
      where: { slug: finalSlug },
    });

    if (slugExists) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    // Validate schema JSON if provided
    if (seoFields.schemaJson) {
      try {
        JSON.parse(seoFields.schemaJson);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid JSON in schemaJson field',
          },
          { status: 400 }
        );
      }
    }

    // Create page
    const newPage = await prisma.pages.create({
      data: {
        type,
        title,
        slug: finalSlug,
        description,
        ...seoFields,
        isActive: seoFields.isActive ?? true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Page created successfully',
        data: newPage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create page',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}