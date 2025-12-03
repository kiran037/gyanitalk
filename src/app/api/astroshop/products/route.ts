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

// small helper to safely convert numeric-ish strings to BigInt
function safeToBigInt(val: unknown) {
  if (val == null) return undefined;
  const s = String(val).trim();
  if (!/^\d+$/.test(s)) return undefined;
  return BigInt(s);
}

// GET - List all products with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');
    const isFeatured = searchParams.get('isFeatured');
    const bestseller = searchParams.get('bestseller');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const where: any = {
      isDelete: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

if (categoryId) {
  const bigintCat = safeToBigInt(categoryId);
  if (bigintCat === undefined) {
    return NextResponse.json({ success: false, error: 'Invalid categoryId' }, { status: 400 });
  }
  where.productCategoryId = bigintCat;
}


    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    if (isFeatured !== null && isFeatured !== '') {
      where.is_feature = isFeatured === 'true';
    }

    if (bestseller !== null && bestseller !== '') {
      where.bestseller = bestseller === 'true';
    }

// whitelist fields allowed for sorting (adjust to your schema)
const ALLOWED_SORT_FIELDS = ['created_at', 'amount', 'name', 'updated_at'];
const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'created_at';
const orderBy: any = { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' };


    const [products, total] = await Promise.all([
      prisma.astromall_products.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          product_category: {
            select: {
              id: true,
              name: true,
              categoryImage: true,
            },
          },
          _count: {
            select: {
              order_requests: true,
            },
          },
        },
      }),
      prisma.astromall_products.count({ where }),
    ]);

const responseData = {
  success: true,
  data: products,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
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

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      schemaJson,
      features,
      productImage,
      gallery,
      productCategoryId,
      amount,
      is_feature,
      bestseller,
      description,
      createdBy,
      modifiedBy,
    } = body;

   // basic required checks
if (!name || !productImage || productCategoryId == null || amount == null || createdBy == null || modifiedBy == null) {
  return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
}

// validate productCategoryId -> BigInt
const productCategoryBigInt = safeToBigInt(productCategoryId);
if (productCategoryBigInt === undefined) {
  return NextResponse.json({ success: false, error: 'Invalid productCategoryId' }, { status: 400 });
}

// validate amount
const parsedAmount = Number(amount);
if (Number.isNaN(parsedAmount)) {
  return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
}

// coerce createdBy/modifiedBy to numbers if needed (optional)
const createdByNum = Number(createdBy);
const modifiedByNum = Number(modifiedBy);
if (Number.isNaN(createdByNum) || Number.isNaN(modifiedByNum)) {
  return NextResponse.json({ success: false, error: 'Invalid createdBy or modifiedBy' }, { status: 400 });
}


const product = await prisma.astromall_products.create({
  data: {
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    metaTitle,
    metaDescription,
    metaKeywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    schemaJson,
    features: typeof features === 'string' ? features : (features ? JSON.stringify(features) : ''),
    productImage,
    gallery: typeof gallery === 'string' ? gallery : (gallery ? JSON.stringify(gallery) : ''),
    productCategoryId: productCategoryBigInt,
    amount: parsedAmount,
    is_feature: Boolean(is_feature),
    bestseller: Boolean(bestseller),
    description,
    isActive: true,
    isDelete: false,
    createdBy: createdByNum,
    modifiedBy: modifiedByNum,
    created_at: new Date(),
    updated_at: new Date(),
  },
  include: {
    product_category: true,
  },
});


const safeProduct = convertPrismaTypes(product);
return NextResponse.json({
  success: true,
  data: safeProduct,
});

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}