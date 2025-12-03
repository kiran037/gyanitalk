import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: walk object and convert BigInt -> string
function convertBigIntToString(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  // primitive bigint
  if (typeof obj === 'bigint') return obj.toString();
  // primitives (number, string, boolean) -> pass through
  if (typeof obj !== 'object') return obj;

  // arrays
  if (Array.isArray(obj)) return obj.map(convertBigIntToString);

  // objects
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertBigIntToString(v);
  }
  return out;
}

// GET - List all categories with pagination and search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    const where: any = { isDelete: false };

    if (search) {
      where.name = { contains: search };
    }

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const [categories, total] = await Promise.all([
      prisma.product_categories.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: { select: { product: true } },
        },
      }),
      prisma.product_categories.count({ where }),
    ]);

    // Convert BigInt -> string recursively so JSON serialization won't fail
    const safeCategories = convertBigIntToString(categories);
    // Use String(...) to avoid TS narrowing issues
    const safeTotal = String(total);
    const totalPages = Math.ceil(Number(safeTotal) / limit);

    return NextResponse.json({
      success: true,
      data: safeCategories,
      pagination: {
        page,
        limit,
        total: safeTotal,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('GET /api/astroshop/categories error:', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      categoryImage,
      displayOrder,
      createdBy,
      modifiedBy,
    } = body;

    if (!name || !categoryImage || createdBy == null || modifiedBy == null) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const category = await prisma.product_categories.create({
      data: {
        name,
        categoryImage,
        displayOrder: displayOrder || 0,
        isActive: true,
        isDelete: false,
        createdBy,
        modifiedBy,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // convert returned BigInt(s)
    const safeCategory = convertBigIntToString(category);

    return NextResponse.json({
      success: true,
      data: safeCategory,
    });
  } catch (error: any) {
    console.error('POST /api/astroshop/categories error:', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
