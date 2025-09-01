"use server";

import prisma from "../../prismaClient"; // ✅ adjust path if needed

// Get all news
export async function getAstroguruNews() {
  const news = await prisma.astrotalk_in_news.findMany({
    where: {isDelete: false},
    orderBy: { id: "desc" },
  });

  const data = news.map((n: any) => ({
    ...n,
    created_at: n.created_at ? n.created_at.toISOString() : null,
    updated_at: n.updated_at ? n.updated_at.toISOString() : null,
    newsDate: n.newsDate ? n.newsDate.toISOString() : null,
  }));

  return { data };
}

// Create new news
export async function createAstroguruNews(payload: {
  channel: string;
  link: string;
  newsDate: string;
  description: string;
  bannerImage: string;
  createdBy?: number;
}) {
  try {
    const created = await prisma.astrotalk_in_news.create({
      data: {
        channel: payload.channel,
        link: payload.link,
        newsDate: new Date(payload.newsDate),
        description: payload.description,
        bannerImage: payload.bannerImage,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
        createdBy: payload.createdBy ?? 1, // 👈 adjust with session user
        modifiedBy: payload.createdBy ?? 1,
      },
    });
    return { success: true, data: created };
  } catch (err: any) {
    console.error("createAstroguruNews error:", err);
    return { success: false, message: "Failed to create news" };
  }
}

// Update news
export async function updateAstroguruNews(
  id: number,
  payload: {
    channel: string;
    link: string;
    newsDate: string;
    description: string;
    bannerImage: string;
    modifiedBy?: number;
  }
) {
  try {
    const updated = await prisma.astrotalk_in_news.update({
      where: { id: BigInt(id) },
      data: {
        channel: payload.channel,
        link: payload.link,
        newsDate: new Date(payload.newsDate),
        description: payload.description,
        bannerImage: payload.bannerImage,
        updated_at: new Date(),
        modifiedBy: payload.modifiedBy ?? 1,
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateAstroguruNews error:", err);
    return { success: false, message: "Failed to update news" };
  }
}

export async function deleteAstroguruNews(id: number) {
  try {
    const deleted = await prisma.astrotalk_in_news.update({
      where: { id: BigInt(id) },
      data: {
        isDelete: true,
        updated_at: new Date(),
      },
    });
    return { success: true, data: deleted };
  } catch (err: any) {
    console.error("deleteAstroguruNews error:", err);
    return { success: false, message: "Failed to delete news" };
  }
}

// Toggle Active/Inactive
export async function updateAstroguruNewsStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.astrotalk_in_news.update({
      where: { id: BigInt(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateAstroguruNewsStatus error:", err);
    return { success: false, message: "Failed to update status" };
  }
}
