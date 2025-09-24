"use server"
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");

// ✅ Get banners with relation
export async function getProductCategory(
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

  const [product_categories, totalCount] = await Promise.all([
    prisma.product_categories.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
      where: {
          // add more filters directly if needed
        name: { contains: search },
      },
    }),
    prisma.product_categories.count({
      where: {
        // add more filters directly if needed
        name: { contains: search },
      },
    }),
  ]);

  const data = product_categories.map((p: any) => ({
    ...p,
    created_at: p.created_at ? p.created_at.toISOString() : null,
  }));
  return { data,    
    total: totalCount, // uncomment if you add count query
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page, };
}

// ✅ Add Product Category
export async function addProductCategory(payload: {
  name: string;
  categoryImage: string;
  createdBy?: number;
}) {
  try {
    const created = await prisma.product_categories.create({
      data: {
        categoryImage: payload.categoryImage,  // 👈 file ka path ya url
        name: payload.name,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: payload.createdBy ?? 1, // 👈 adjust with session user
        modifiedBy: payload.createdBy ?? 1,
      },
    });

    return { success: true, data: created };
  } catch (error: any) {
    console.error("Add Product Category Error:", error);
    return { success: false, message: "Failed to create product category"};
  }
}

// ✅ Update Product Category
export async function updateProductCategory(
  id: number,
  payload: {
    name: string;
    categoryImage: string;
    modifiedBy?: number;
  }
) {
  try {
    const updated = await prisma.product_categories.update({
      where: { id },
      data: {
        categoryImage: payload.categoryImage,
        name: payload.name,
        updated_at: new Date(),
        modifiedBy: payload.modifiedBy ?? 1,
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Update Product Category Error:", error);
    return { success: false, message: "Failed to update product category" };
  }
}

// Toggle Active/Inactive
export async function updateProductCategoriesStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.product_categories.update({
      where: { id: BigInt(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateProductcategoriesStatus error:", err);
    return { success: false, message: "Failed to update status" };
  }
}
