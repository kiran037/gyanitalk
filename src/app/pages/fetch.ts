"use server"
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");

// GET all pages
export async function getPages() {

  const pages = await prisma.pages.findMany({
    orderBy: { id: "desc" },
  });

  const data = pages.map((v: any) => ({
    ...v,
    created_at: v.created_at ? v.created_at.toISOString() : null,
    updated_at: v.updated_at ? v.updated_at.toISOString() : null,
  }));

  return {
    data,
  };
}

// Update pages
export async function updatePages(
  id: number,
  payload: {
    title: string;
    type: string;
    description: string;
    modifiedBy?: number;
  }
) {
  try {
    const updated = await prisma.pages.update({
      where: { id: Number(id) },
      data: {
        title: payload.title,
        type: payload.type,
        description: payload.description,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updatePages error:", err);
    return { success: false, message: "Failed to update pages" };
  }
}

// Toggle Active/Inactive
export async function updatePagesStatus(
  id: number,
  isActive: boolean
) {
  try {
    const updated = await prisma.pages.update({
      where: { id: Number(id) },
      data: {
        isActive,
        updated_at: new Date(),
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updatePages error:", err);
    return { success: false, message: "Failed to update Pages" };
  }
}