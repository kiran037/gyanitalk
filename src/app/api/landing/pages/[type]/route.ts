// app/api/landing/pages/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // <-- use singleton
import { pages_type } from '@/generated/client/client';
import { generateSEOMetadata } from '@/lib/utils/seo-generator';
import { analyzeContent } from '@/lib/utils/content-analyzer';
import { handleNotFound, handleServerError } from '@/lib/utils/api-error-handler';
import { PageResponse } from '@/types/api/page';

// Valid page types from your enum
const VALID_PAGE_TYPES: pages_type[] = ['privacy', 'terms', 'aboutus', 'home'];

// Mapping for flexible routing
const TYPE_MAPPING: Record<string, pages_type> = {
  'privacy': 'privacy',
  'privacy-policy': 'privacy',
  'privacypolicy': 'privacy',
  'terms': 'terms',
  'terms-of-service': 'terms',
  'termsofservice': 'terms',
  'about': 'aboutus',
  'aboutus': 'aboutus',
  'about-us': 'aboutus',
  'home': 'home',
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> | { type: string } } // params can be thenable
) {
  try {
    // Await params first (Next.js requirement)
    const params = await (context.params as any);
    const requestedTypeRaw = String(params.type || '').toLowerCase();
    const pageType = TYPE_MAPPING[requestedTypeRaw];

    // Validate page type
    if (!pageType || !VALID_PAGE_TYPES.includes(pageType)) {
      return handleNotFound(requestedTypeRaw, VALID_PAGE_TYPES);
    }

    // Fetch page from database
    const page = await prisma.pages.findFirst({
      where: {
        type: pageType,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterImage: true,
        schemaJson: true,
        isActive: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Page not found or inactive
    if (!page) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page not found',
          message: `The ${pageType} page is not available at this time`,
        },
        { status: 404 }
      );
    }

    // Generate SEO metadata (fills in missing fields)
    const seoMetadata = generateSEOMetadata(page);

    // Analyze content for computed fields
    const computed = analyzeContent(page.description || '', page.updated_at);

    // Build response
    const response: PageResponse = {
      success: true,
      data: {
        page: {
          id: page.id,
          title: page.title || '',
          type: page.type as pages_type,
          description: page.description || '',
          slug: seoMetadata.slug,
          isActive: page.isActive ?? true,
          createdAt: page.created_at?.toISOString() || new Date().toISOString(),
          updatedAt: page.updated_at?.toISOString() || new Date().toISOString(),
        },
        seo: seoMetadata,
        computed,
      },
    };

    // Return with cache headers for performance
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return handleServerError(error);
  }
}

// Optional: Support OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
