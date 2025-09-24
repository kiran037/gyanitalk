"use server"
import { NextResponse } from "next/server";
const prisma = require("../../prismaClient");

// Get all notifications
export async function getNotifications() {
  
  const [notifications] = await Promise.all([
    prisma.notifications.findMany({
      where: {isDelete: false},
      orderBy: { id: "desc" },
    }),
  ]);

  // ✅ Format Date objects into strings
  const data = notifications.map((n: any) => ({
    ...n,
    created_at: n.created_at ? n.created_at.toISOString() : null,
    updated_at: n.updated_at ? n.updated_at.toISOString() : null,
  }));

  return {
    data,
  };
}

// Create new notifications
export async function createNotifications(payload: {
  title: string;
  description: string;
  createdBy?: number;
}) {
  try {
    const created = await prisma.notifications.create({
      data: {
        title: payload.title,
        description: payload.description,
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
    console.error("createNotifications error:", err);
    return { success: false, message: "Failed to create Notifications" };
  }
}

// Update notifications
export async function updateNotifications(
  id: number,
  payload: {
    title: string;
    description: string;
    modifiedBy?: number;
  }
) {
  try {
    const updated = await prisma.notifications.update({
      where: { id: BigInt(id) },
      data: {
        title: payload.title,
        description: payload.description,
        updated_at: new Date(),
        modifiedBy: payload.modifiedBy ?? 1,
      },
    });
    return { success: true, data: updated };
  } catch (err: any) {
    console.error("updateNotifications error:", err);
    return { success: false, message: "Failed to update notification" };
  }
}