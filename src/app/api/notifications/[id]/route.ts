// ===================================
// FILE: app/api/notifications/[id]/route.ts
// ===================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = BigInt(params.id);

    const notification = await prisma.notifications.findUnique({
      where: { id: notificationId },
      include: {
        userNotifications: {
          select: {
            id: true,
            userId: true,
            is_read: true,
            created_at: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    const stats = {
      totalSent: notification.userNotifications.length,
      readCount: notification.userNotifications.filter((un) => un.is_read)
        .length,
      unreadCount: notification.userNotifications.filter((un) => !un.is_read)
        .length,
      readRate:
        notification.userNotifications.length > 0
          ? (
              (notification.userNotifications.filter((un) => un.is_read)
                .length /
                notification.userNotifications.length) *
              100
            ).toFixed(2) + "%"
          : "0%",
    };

    return NextResponse.json(
      serializeBigInt({
        success: true,
        data: {
          ...notification,
          stats,
        },
      })
    );
  } catch (error: any) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = BigInt(params.id);
    const body = await request.json();
    const { title, description, isActive } = body;

    const updateData: any = {
      modifiedBy: 1,
      updated_at: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const notification = await prisma.notifications.update({
      where: { id: notificationId },
      data: updateData,
    });

    return NextResponse.json(
      serializeBigInt({
        success: true,
        message: "Notification updated successfully",
        data: notification,
      })
    );
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = BigInt(params.id);

    await prisma.notifications.update({
      where: { id: notificationId },
      data: {
        isDelete: true,
        isActive: false,
        modifiedBy: 1,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}