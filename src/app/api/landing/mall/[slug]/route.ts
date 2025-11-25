// app/api/landing/mall/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Helper function to generate comprehensive SEO metadata
function generateDetailedProductSEO(product: any) {
  const slug = product.slug || generateSlug(product.name);
  const defaultDescription = product.description || 
    `${product.name} - ${product.features?.substring(0, 150) || 'Premium astrology product with detailed insights and guidance'}`;
  
  const categoryName = product.product_category?.name || 'Astrology Products';
  
  return {
    slug,
    metaTitle: product.metaTitle || 
      `${product.name} - ${categoryName} | Buy Now at Best Price`,
    metaDescription: product.metaDescription || 
      `${defaultDescription}. Shop now at ₹${product.amount}. ${product.product_details?.length || 0} key features included.`,
    metaKeywords: product.metaKeywords || 
      `${product.name}, ${categoryName}, astrology, buy ${product.name}, astromall products, ${slug}`,
    canonicalUrl: product.canonicalUrl || `/landing/mall/${slug}`,
    ogTitle: product.ogTitle || `${product.name} | ${categoryName}`,
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
      "brand": {
        "@type": "Brand",
        "name": "AstroMall"
      },
      "category": categoryName,
      "offers": {
        "@type": "Offer",
        "price": product.amount,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": product.averageRating ? {
        "@type": "AggregateRating",
        "ratingValue": product.averageRating,
        "reviewCount": product.reviewCount || 0
      } : undefined
    }, null, 2)
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Try to find product by slug first, then by generated slug
    let product = await prisma.astromall_products.findFirst({
      where: {
        slug: slug,
        isActive: true,
        isDelete: false,
      },
      include: {
        product_category: {
          select: {
            id: true,
            name: true,
            categoryImage: true,
            displayOrder: true,
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
        order_requests: {
          where: {
            isActive: '1',
            isDelete: '0',
          },
          select: {
            id: true,
            orderStatus: true,
            created_at: true,
          },
          take: 5,
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    // If not found by slug, try to find by generating slug from name
    if (!product) {
      const allProducts = await prisma.astromall_products.findMany({
        where: {
          isActive: true,
          isDelete: false,
        },
        include: {
          product_category: {
            select: {
              id: true,
              name: true,
              categoryImage: true,
              displayOrder: true,
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
          order_requests: {
            where: {
              isActive: '1',
              isDelete: '0',
            },
            select: {
              id: true,
              orderStatus: true,
              created_at: true,
            },
            take: 5,
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      product = allProducts.find(p => generateSlug(p.name) === slug) || null;
    }

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
          message: `No product found with slug: ${slug}`,
        },
        { status: 404 }
      );
    }

    // Get related products from same category
    const relatedProducts = await prisma.astromall_products.findMany({
      where: {
        productCategoryId: product.productCategoryId,
        id: { not: product.id },
        isActive: true,
        isDelete: false,
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        productImage: true,
        amount: true,
        description: true,
        is_feature: true,
        bestseller: true,
      },
    });

    // Calculate statistics
    const totalOrders = product.order_requests.length;
    const completedOrders = product.order_requests.filter(
      order => order.orderStatus === 'completed'
    ).length;

    // Parse gallery if it's a JSON string
    let galleryImages = [];
    if (product.gallery) {
      try {
        galleryImages = typeof product.gallery === 'string' 
          ? JSON.parse(product.gallery) 
          : product.gallery;
      } catch (e) {
        galleryImages = [product.gallery];
      }
    }

    // Generate comprehensive SEO
    const seo = generateDetailedProductSEO(product);

    const response = {
      success: true,
      data: {
        product: {
          id: product.id.toString(),
          name: product.name,
          slug: seo.slug,
          description: product.description,
          features: product.features,
          productImage: product.productImage,
          gallery: galleryImages,
          amount: product.amount,
          isFeatured: product.is_feature,
          isBestseller: product.bestseller,
          category: {
            id: product.product_category.id.toString(),
            name: product.product_category.name,
            image: product.product_category.categoryImage,
            displayOrder: product.product_category.displayOrder,
          },
          productDetails: product.product_details.map(detail => ({
            id: detail.id.toString(),
            question: detail.question,
            answer: detail.answer,
          })),
          statistics: {
            totalOrders,
            completedOrders,
            successRate: totalOrders > 0 
              ? Math.round((completedOrders / totalOrders) * 100) 
              : 0,
          },
          createdBy: product.createdBy,
          modifiedBy: product.modifiedBy,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
        },
        relatedProducts: relatedProducts.map(rp => ({
          id: rp.id.toString(),
          name: rp.name,
          slug: rp.slug || generateSlug(rp.name),
          image: rp.productImage,
          amount: rp.amount,
          description: rp.description,
          isFeatured: rp.is_feature,
          isBestseller: rp.bestseller,
        })),
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
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}