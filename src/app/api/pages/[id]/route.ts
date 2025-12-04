// app/api/pages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// SEO Validation Helper
function validateSEO(page: any) {
  const issues: string[] = [];
  let score = 100;

  // Title validation
  if (!page.title || page.title.length === 0) {
    issues.push('Title is missing');
    score -= 20;
  } else if (page.title.length > 200) {
    issues.push('Title is too long (max 200 characters)');
    score -= 5;
  }

  // Meta Title validation
  if (!page.metaTitle) {
    issues.push('Meta title is missing');
    score -= 15;
  } else if (page.metaTitle.length < 50) {
    issues.push('Meta title is too short (recommended 50-60 characters)');
    score -= 5;
  } else if (page.metaTitle.length > 60) {
    issues.push('Meta title is too long (recommended 50-60 characters)');
    score -= 5;
  }

  // Meta Description validation
  if (!page.metaDescription) {
    issues.push('Meta description is missing');
    score -= 15;
  } else if (page.metaDescription.length < 120) {
    issues.push('Meta description is too short (recommended 120-160 characters)');
    score -= 5;
  } else if (page.metaDescription.length > 160) {
    issues.push('Meta description is too long (recommended 120-160 characters)');
    score -= 5;
  }

  // Meta Keywords
  if (!page.metaKeywords) {
    issues.push('Meta keywords are missing');
    score -= 5;
  }

  // Canonical URL
  if (!page.canonicalUrl) {
    issues.push('Canonical URL is missing');
    score -= 5;
  }

  // Open Graph validation
  if (!page.ogTitle) {
    issues.push('OG title is missing');
    score -= 10;
  }
  if (!page.ogDescription) {
    issues.push('OG description is missing');
    score -= 5;
  }
  if (!page.ogImage) {
    issues.push('OG image is missing');
    score -= 5;
  }

  // Twitter Card validation
  if (!page.twitterTitle) {
    issues.push('Twitter title is missing');
    score -= 5;
  }
  if (!page.twitterDescription) {
    issues.push('Twitter description is missing');
    score -= 3;
  }
  if (!page.twitterImage) {
    issues.push('Twitter image is missing');
    score -= 3;
  }

  // Schema JSON validation
  if (!page.schemaJson) {
    issues.push('Schema JSON is missing');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
    status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
  };
}

// GET /api/pages/[id] - Get single page with SEO analysis
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
const pageId = parseInt((await params).id, 10);


    if (isNaN(pageId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid page ID',
        },
        { status: 400 }
      );
    }

    const page = await prisma.pages.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page not found',
        },
        { status: 404 }
      );
    }

    // Calculate SEO score
    const seoAnalysis = validateSEO(page);

    return NextResponse.json({
      success: true,
      data: {
        page,
        seoAnalysis,
      },
    });
  } catch (error: any) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch page',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/pages/[id] - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
const pageId = parseInt((await params).id, 10);


    if (isNaN(pageId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid page ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, slug, schemaJson, ...updateData } = body;

    // Check if page exists
    const existingPage = await prisma.pages.findUnique({
      where: { id: pageId },
    });

    if (!existingPage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page not found',
        },
        { status: 404 }
      );
    }

    // Validate type if changed
    if (type && type !== existingPage.type) {
      const validTypes = ['privacy', 'terms', 'aboutus'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
          },
          { status: 400 }
        );
      }

      // Check if new type already exists
      const typeExists = await prisma.pages.findFirst({
        where: {
          type,
          id: { not: pageId },
        },
      });

      if (typeExists) {
        return NextResponse.json(
          {
            success: false,
            error: `A page with type '${type}' already exists`,
          },
          { status: 409 }
        );
      }
    }

    // Validate slug if changed
    if (slug && slug !== existingPage.slug) {
      const slugExists = await prisma.pages.findFirst({
        where: {
          slug,
          id: { not: pageId },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slug already exists',
          },
          { status: 409 }
        );
      }
    }

    // Validate schema JSON if provided
    if (schemaJson) {
      try {
        JSON.parse(schemaJson);
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

    // Update page
    const updatedPage = await prisma.pages.update({
      where: { id: pageId },
      data: {
        ...updateData,
        ...(type && { type }),
        ...(slug && { slug }),
        ...(schemaJson && { schemaJson }),
      },
    });

    // Calculate SEO score for updated page
    const seoAnalysis = validateSEO(updatedPage);

    return NextResponse.json({
      success: true,
      message: 'Page updated successfully',
      data: {
        page: updatedPage,
        seoAnalysis,
      },
    });
  } catch (error: any) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update page',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/pages/[id] - Permanently delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
const pageId = parseInt((await params).id, 10);


    if (isNaN(pageId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid page ID',
        },
        { status: 400 }
      );
    }

    const page = await prisma.pages.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page not found',
        },
        { status: 404 }
      );
    }

    // Permanently delete
    await prisma.pages.delete({
      where: { id: pageId },
    });

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete page',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}