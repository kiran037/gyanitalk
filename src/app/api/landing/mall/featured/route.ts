// src/app/api/landing/mall/featured/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch featured products (bestsellers or featured flag)
    const featuredProducts = await prisma.astromall_products.findMany({
      where: { 
        isActive: true, 
        isDelete: false,
        OR: [
          { is_feature: true },
          { bestseller: true }
        ]
      },
      select: { 
        id: true,
        name: true,
        slug: true,
        description: true,
        features: true,
        productImage: true,
        gallery: true,
        amount: true,
        is_feature: true,
        bestseller: true,
        productCategoryId: true,
        created_at: true
      },

      orderBy: {
        created_at: 'desc'
      }
    });

    if (featuredProducts.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Get category details for all products - FIX: use product_categories
    const categoryIds = featuredProducts
      .map(p => p.productCategoryId)
      .filter(Boolean) as bigint[];

    const categories = await prisma.product_categories.findMany({
      where: { 
        id: { in: categoryIds },
        isActive: true,
        isDelete: false
      },
      select: {
        id: true,
        name: true,
        categoryImage: true
      }
    });

    const categoryMap = new Map(categories.map(c => [c.id.toString(), c]));

    // Sort: Bestsellers first, then featured, then by created date - FIX: handle null dates
    const sortedProducts = featuredProducts.sort((a, b) => {
      if (a.bestseller && !b.bestseller) return -1;
      if (!a.bestseller && b.bestseller) return 1;
      if (a.is_feature && !b.is_feature) return -1;
      if (!a.is_feature && b.is_feature) return 1;
      
      // Handle null dates safely
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // Take top 15
    const TOP_N = 15;
    const topProducts = sortedProducts.slice(0, TOP_N);

    // Format results
    const results = topProducts.map(product => {
      const slug = product.slug || product.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const category = product.productCategoryId 
        ? categoryMap.get(product.productCategoryId.toString())
        : null;

      return {
        id: product.id.toString(),
        name: product.name,
        slug,
        description: product.description,
        features: product.features,
        productImage: product.productImage,
        gallery: product.gallery,
        amount: product.amount,
        isFeatured: product.is_feature,
        isBestseller: product.bestseller,
        category: category ? {
          id: category.id.toString(),
          name: category.name,
          categoryImage: category.categoryImage
        } : null
      };
    });

    return NextResponse.json({ data: results });

  } catch (err: any) {
    console.error("Featured products API error:", err);
    return NextResponse.json({
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}