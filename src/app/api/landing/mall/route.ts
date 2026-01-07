// app/api/landing/mall/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphons
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

// Helper function to generate SEO metadata
function generateProductSEO(product: any) {
  const slug = product.slug || generateSlug(product.name);
  const defaultDescription = product.description || 
    `Buy ${product.name} at the best price. ${product.features?.substring(0, 100) || 'Premium astrology product'}...`;
  
  return {
    slug,
    metaTitle: product.metaTitle || `${product.name} | AstroMall - Premium Astrology Products`,
    metaDescription: product.metaDescription || defaultDescription,
    metaKeywords: product.metaKeywords || `${product.name}, astrology products, astromall, buy ${product.name}`,
    canonicalUrl: product.canonicalUrl || `/mall/${slug}`,
    ogTitle: product.ogTitle || product.name,
    ogDescription: product.ogDescription || defaultDescription,
    ogImage: product.ogImage || product.productImage,
    twitterTitle: product.twitterTitle || product.name,
    twitterDescription: product.twitterDescription || defaultDescription,
    twitterImage: product.twitterImage || product.productImage,
    schemaJson: product.schemaJson || JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.productImage,
      "description": defaultDescription,
      "offers": {
        "@type": "Offer",
        "price": product.amount,
        "priceCurrency": "INR"
      }
    })
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const categoryId = searchParams.get('categoryId');
    const isFeatured = searchParams.get('isFeatured');
    const isBestseller = searchParams.get('isBestseller');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {
      isActive: true,
      isDelete: false,
    };

    if (categoryId) {
      where.productCategoryId = BigInt(categoryId);
    }

    if (isFeatured === 'true') {
      where.is_feature = true;
    }

    if (isBestseller === 'true') {
      where.bestseller = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { features: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch products with category details
    const [products, totalCount] = await Promise.all([
      prisma.astromall_products.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          product_category: {
            select: {
              id: true,
              name: true,
              categoryImage: true,
            },
          },
          product_details: {
            where: {
              isActive: 1,
              isDelete: 0,
            },
            select: {
              id: true,
              question: true,
              answer: true,
            },
          },
        },
      }),
      prisma.astromall_products.count({ where }),
    ]);

    // Generate SEO for each product and convert BigInt to string
    const productsWithSEO = products.map(product => {
      const seo = generateProductSEO(product);
      
      return {
        id: product.id.toString(),
        name: product.name,
        slug: seo.slug,
        description: product.description,
        features: product.features,
        productImage: product.productImage,
        gallery: product.gallery,
        amount: product.amount,
        isFeatured: product.is_feature,
        isBestseller: product.bestseller,
        category: product.product_category ? {
          id: product.product_category.id.toString(), // ✅ Convert BigInt to string
          name: product.product_category.name,
          categoryImage: product.product_category.categoryImage,
        } : null,
        productDetailsCount: product.product_details.length,
        seo: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          metaKeywords: seo.metaKeywords,
          canonicalUrl: seo.canonicalUrl,
          ogTitle: seo.ogTitle,
          ogDescription: seo.ogDescription,
          ogImage: seo.ogImage,
          twitterTitle: seo.twitterTitle,
          twitterDescription: seo.twitterDescription,
          twitterImage: seo.twitterImage,
          schemaJson: seo.schemaJson,
        },
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithSEO,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching astromall products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}