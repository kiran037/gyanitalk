import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// small helper to safely convert numeric-ish strings to BigInt or return undefined
function safeToBigInt(val: unknown) {
  if (val == null) return undefined;
  const s = String(val).trim();
  if (!/^\d+$/.test(s)) return undefined;
  return BigInt(s);
}

// chunk helper
function chunkArray<T>(arr: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

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



// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
   const { id: idStr } = (await params) as { id: string };
if (!/^\d+$/.test(idStr)) {
  return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
}
const id = BigInt(idStr);


    const product = await prisma.astromall_products.findUnique({
      where: { id },
      include: {
        product_category: true,
        product_details: {
          where: {
            isDelete: 0,
          },
        },
        _count: {
          select: {
            order_requests: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Parse gallery if it's a JSON string
    let parsedProduct: any = { ...product };
    if (product.gallery && typeof product.gallery === 'string') {
      try {
        parsedProduct.gallery = JSON.parse(product.gallery);
      } catch (e) {
        parsedProduct.gallery = [];
      }
    }
const safeProduct = convertPrismaTypes(parsedProduct);
return NextResponse.json({ success: true, data: safeProduct });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = (await params) as { id: string };
if (!/^\d+$/.test(idStr)) {
  return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
}
const id = BigInt(idStr);

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
      isActive,
      modifiedBy,
    } = body;

    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;
    if (ogTitle !== undefined) updateData.ogTitle = ogTitle;
    if (ogDescription !== undefined) updateData.ogDescription = ogDescription;
    if (ogImage !== undefined) updateData.ogImage = ogImage;
    if (twitterTitle !== undefined) updateData.twitterTitle = twitterTitle;
    if (twitterDescription !== undefined) updateData.twitterDescription = twitterDescription;
    if (twitterImage !== undefined) updateData.twitterImage = twitterImage;
    if (schemaJson !== undefined) updateData.schemaJson = schemaJson;
    if (features !== undefined) updateData.features = features;
    if (productImage !== undefined) updateData.productImage = productImage;
    if (gallery !== undefined) updateData.gallery = typeof gallery === 'string' ? gallery : JSON.stringify(gallery);
 if (productCategoryId !== undefined) {
  const catBig = safeToBigInt(productCategoryId);
  if (catBig === undefined) {
    return NextResponse.json({ success: false, error: 'Invalid productCategoryId' }, { status: 400 });
  }
  updateData.productCategoryId = catBig;
}

    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) {
  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount)) {
    return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
  }
  updateData.amount = parsedAmount;
}

if (is_feature !== undefined) updateData.is_feature = Boolean(is_feature);
if (bestseller !== undefined) updateData.bestseller = Boolean(bestseller);
if (isActive !== undefined) updateData.isActive = Boolean(isActive);

if (modifiedBy !== undefined) {
  const modNum = Number(modifiedBy);
  if (Number.isNaN(modNum)) {
    return NextResponse.json({ success: false, error: 'Invalid modifiedBy' }, { status: 400 });
  }
  updateData.modifiedBy = modNum;
}



    const product = await prisma.astromall_products.update({
      where: { id },
      data: updateData,
      include: {
        product_category: true,
      },
    });
const safeProduct = convertPrismaTypes(product);
return NextResponse.json({ success: true, data: safeProduct });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
   const { id: idStr } = (await params) as { id: string };
if (!/^\d+$/.test(idStr)) {
  return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
}
const id = BigInt(idStr);


    const product = await prisma.astromall_products.update({
      where: { id },
      data: {
        isDelete: true,
        isActive: false,
        updated_at: new Date(),
      },
    });
const safeProduct = convertPrismaTypes(product);
return NextResponse.json({ success: true, data: safeProduct });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}