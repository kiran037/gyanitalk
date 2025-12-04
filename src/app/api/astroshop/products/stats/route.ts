import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: convert BigInt and Prisma Decimal -> JSON-safe primitives (strings)
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (
    typeof obj === 'object' &&
    (obj as any).constructor &&
    (obj as any).constructor.name === 'Decimal'
  ) {
    return (obj as any).toString();
  }
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}


// GET - Get product statistics
export async function GET(request: NextRequest) {
  try {
    const [
      totalProducts,
      activeProducts,
      featuredProducts,
      bestsellers,
      topSellingProducts,
    ] = await Promise.all([
      prisma.astromall_products.count({
        where: { isDelete: false },
      }),
      prisma.astromall_products.count({
        where: { isDelete: false, isActive: true },
      }),
      prisma.astromall_products.count({
        where: { isDelete: false, is_feature: true },
      }),
      prisma.astromall_products.count({
        where: { isDelete: false, bestseller: true },
      }),
      prisma.$queryRaw`
        SELECT 
          p.id,
          p.name,
          p.productImage,
          p.amount,
          COUNT(o.id) as orderCount
        FROM astromall_products p
        LEFT JOIN order_request o ON o.productId = p.id
        WHERE p.isDelete = false AND p.isActive = true
        GROUP BY p.id, p.name, p.productImage, p.amount
        ORDER BY orderCount DESC
        LIMIT 10
      `,
    ]);

const responseData = {
  success: true,
  data: {
    totalProducts,
    activeProducts,
    featuredProducts,
    bestsellers,
    topSellingProducts,
  },
};

const safeResponse = convertPrismaTypes(responseData);
return NextResponse.json(safeResponse);

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}