"use server"
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");

// Get all videos
export async function getVideos() {
  const news = await prisma.astrology_videos.findMany({
    where: {isDelete: false},
    orderBy: { id: "desc" },
  });

  const data = news.map((n: any) => ({
    ...n,
    created_at: n.created_at ? n.created_at.toISOString() : null,
    updated_at: n.updated_at ? n.updated_at.toISOString() : null,
  }));

  return { data };
}

// Create new videos
export async function createVideos(payload: {
  youtubeLink: string;
  coverImage: string;
  videoTitle: string;
  createdBy?: number;
}) {
  try {
    const created = await prisma.astrology_videos.create({
      data: {
        youtubeLink: payload.youtubeLink,
        coverImage: payload.coverImage,
        videoTitle: payload.videoTitle,
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
    console.error("createAdsVideos error:", err);
    return { success: false, message: "Failed to create ads videos" };
  }
}

// Update videos
export async function updateVideos(
  id: number,
  payload: {
    youtubeLink: string;
    coverImage: string;
    videoTitle: string;
    modifiedBy?: number;
  }
) {
  try {
    const updated = await prisma.astrology_videos.update({
      where: { id: BigInt(id) },
      data: {
        youtubeLink: payload.youtubeLink,
        coverImage: payload.coverImage,
        videoTitle: payload.videoTitle,
        updated_at: new Date(),
        modifiedBy: payload.modifiedBy ?? 1,
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateAdsVideos error:", err);
    return { success: false, message: "Failed to update ads videos" };
  }
}

export async function deleteVideos(id: number) {
  try {
    const deleted = await prisma.astrology_videos.update({
      where: { id: BigInt(id) },
      data: {
        isDelete: true,
        updated_at: new Date(),
      },
    });
    return { success: true, data: deleted };
  } catch (err: any) {
    console.error("deleteAdsVideos error:", err);
    return { success: false, message: "Failed to delete ads videos" };
  }
}

// Toggle Active/Inactive
export async function updateVideosStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.astrology_videos.update({
      where: { id: BigInt(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateAdsVideos error:", err);
    return { success: false, message: "Failed to update ads videos" };
  }
}