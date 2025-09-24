"use server"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
const prisma = require("../../prismaClient");

// ✅ Get banners with relation
export async function getProducts(
   {
    page = 1,
    limit = 15,
    search = "",
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {

  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

  const offset = (page - 1) * limit;
  const baseWhere = {
    isActive: true,
    isDelete: false,

    ...(search &&
      isAlphaSearch && {
      name: { contains: search },
    }),
  };

  const [astromall_products, totalCount] = await Promise.all([
    prisma.astromall_products.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        product_category: { select: { id: true, name: true } },
      },
      where: {
          // add more filters directly if needed
        name: { contains: search },
      },
    }),
    prisma.astromall_products.count({
      where: {
        // add more filters directly if needed
        name: { contains: search },
      },
    }),
  ]);

  const data = astromall_products.map((p: any) => ({
    ...p,
    created_at: p.created_at ? p.created_at.toISOString() : null,
  }));
  return { data,    
    total: totalCount, // uncomment if you add count query
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page, };
}

// 🔹 Get all product categories
export async function getproductCategories() {
  try {
    const categories = await prisma.product_categories.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getProductDetails(id: any) {
  const recordsRaw = await prisma.astromall_products.findFirst({
    where: { id: Number(id) },
    orderBy: { id: "desc" },
    include: {
      product_details: true,
    },
  });

  if (!recordsRaw) {
    return { astroMall: null, currency: { value: "₹" } };
  }
  
  const astroMall = {
    productImage: recordsRaw.productImage,
    name: recordsRaw.name,
    features: recordsRaw.features,
    amount: Number(recordsRaw.amount), // ensure number
     // ✅ product_details relation ek array hoga
    questionAnswer: recordsRaw.product_details || [],
  };

  // currency ko alag se table se laana hai ya default set karna hai
  const currency = { value: "INR" }; // example: INR

  const pDetails = {
    ...recordsRaw,
  };

   return { pDetails, astroMall, currency};
}

// ✅ Add Product Category
export async function createProductDetails(data: any) {
  const newProduct = await prisma.astromall_products.create({
    data: {
      productImage: data.productImage,
      gallery: Array.isArray(data.gallery) ? JSON.stringify(data.gallery) : data.gallery,
      name: data.name,
      features: data.features,
      productCategoryId: Number(data.productCategoryId),
      amount: Number(data.amount),
      is_feature: Boolean(data.is_feature),
      bestseller: Boolean(data.bestseller),
      isActive: Boolean(data.isActive),
      createdBy: data.createdBy ?? 1,  // ✅ required field
      modifiedBy: data.modifiedBy ?? 1, // ✅ required field
      created_at: new Date(),
      updated_at: new Date(),
    },
  });


  const productData = {
    ...newProduct,
    created_at: newProduct.created_at?.toISOString(),
    updated_at: newProduct.updated_at?.toISOString(),
  };

  return productData;
}


// ✅ Update Product Category
export async function updateProductDetails(data: any, productId: number) {
  const updatedProduct = await prisma.astromall_products.update({
    where: { id: productId },
    data: {
      productImage: data.productImage,
      gallery: Array.isArray(data.gallery) ? JSON.stringify(data.gallery) : data.gallery,
      name: data.name,
      features: data.features,
      productCategoryId: Number(data.productCategoryId),
      amount: Number(data.amount),
      is_feature: Boolean(data.is_feature),
      bestseller: Boolean(data.bestseller),
      isActive: Boolean(data.isActive),
      modifiedBy: data.modifiedBy ?? 1, // ✅ required field
      updated_at: new Date(),
    },
  });
}

// Add Product Detail
export async function addProductDetails(data:  {
  astromallProductId: number | bigint;
  question: string;
  answer: string;
  isActive?: number; // 1 = active, 0 = inactive
}) {
    const now = new Date();
    const newProductDetail = await prisma.product_details.create({
    data: {
      astromallProductId: BigInt(data.astromallProductId), // ✅ bigint cast
      question: data.question,
      answer: data.answer,
      isActive: data.isActive ?? 1, // default active
      isDelete: 0,
      created_at: now,
      updated_at: now,
    },
  });

  const productDetail = {
    ...newProductDetail,
    created_at: newProductDetail.created_at?.toISOString(),
    updated_at: newProductDetail.updated_at?.toISOString(),
  };

  return productDetail;
}

// Toggle Active/Inactive
export async function updateProductStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.astromall_products.update({
      where: { id: BigInt(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateProductStatus error:", err);
    return { success: false, message: "Failed to update status" };
  }
}
