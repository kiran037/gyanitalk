"use server"
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");

// ✅ Get banners with relation
export async function getBanners() {
    const banners = await prisma.banners.findMany({
      orderBy: { id: "desc" },
      include: {
        bannerType: { select: { id: true, name: true } },
      },
    });
    const data = banners.map((c: any) => ({
      ...c,
      fromDate: c.fromDate ? c.fromDate.toISOString() : null,
      toDate: c.toDate ? c.toDate.toISOString() : null,
    }));
  return { data };
}

// ✅ Get banner types
export async function getBannerTypes() {
  const banner_types = await prisma.banner_types.findMany({
    where: { isActive: true, isDelete: false },
    orderBy: { id: "asc" },
  });
  return { data: banner_types };
}

// ✅ Add Banner
export async function addBanner(payload: {
  bannerTypeId: string;
  fromDate: string;
  toDate: string;
  bannerImage: string;
  createdBy?: number;
}) {
  try {
    const created = await prisma.banners.create({
      data: {
        bannerImage: payload.bannerImage,  // 👈 file ka path ya url
        bannerTypeId: payload.bannerTypeId, // 👈 dropdown se select hoga
        fromDate: payload.fromDate ? new Date(payload.fromDate) : null,
        toDate: payload.toDate ? new Date(payload.toDate) : null,
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
    console.error("Add Banner Error:", error);
    return { success: false, message: "Failed to create banner"};
  }
}

// ✅ Update Banner
export async function updateBanner(
  id: number,
  payload: {
    bannerTypeId: string;
    fromDate: string;
    toDate: string;
    bannerImage: string;
    modifiedBy?: number;
  }
) {
  try {
    const updated = await prisma.banners.update({
      where: { id },
      data: {
        bannerImage: payload.bannerImage,
        bannerTypeId: payload.bannerTypeId,
        fromDate: payload.fromDate ? new Date(payload.fromDate) : null,
        toDate: payload.toDate ? new Date(payload.toDate) : null,
        updated_at: new Date(),
        modifiedBy: payload.modifiedBy ?? 1,
      },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Update Banner Error:", error);
    return { success: false, message: "Failed to update banner" };
  }
}

// Toggle Active/Inactive
export async function updateBannersStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.banners.update({
      where: { id: BigInt(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateBannersStatus error:", err);
    return { success: false, message: "Failed to update status" };
  }
}
