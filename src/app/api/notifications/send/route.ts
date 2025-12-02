import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const { sendNotification } = require("@/services/fcm");



function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, targetAudience, userIds = [] } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notifications.findUnique({
      where: { id: BigInt(notificationId) },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    let targetUsers: any[] = [];

    switch (targetAudience) {
      case "all_users":
        targetUsers = await prisma.users.findMany({
          where: {
            isActive: true,
            isDelete: false,
            deleted_at: null,
          },
          select: {
            id: true,
            fcm_token: true,
            user_device_details: {
              where: { isActive: true },
              select: { fcmToken: true },
            },
          },
        });
        break;

      case "specific_users":
        if (!userIds.length) {
          return NextResponse.json(
            { success: false, error: "No user IDs provided" },
            { status: 400 }
          );
        }
        targetUsers = await prisma.users.findMany({
          where: {
            id: { in: userIds.map((id: any) => BigInt(id)) },
            isActive: true,
            isDelete: false,
          },
          select: {
            id: true,
            fcm_token: true,
            user_device_details: {
              where: { isActive: true },
              select: { fcmToken: true },
            },
          },
        });
        break;
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const user of targetUsers) {
      const fcmToken =
        user.user_device_details[0]?.fcmToken || user.fcm_token;

      if (fcmToken) {
        try {
          await sendNotification({
            token: fcmToken,
            title: notification.title,
            description: notification.description,
            body: {
              notificationId: notification.id.toString(),
            },
          });
          sentCount++;

          await prisma.user_notifications.create({
            data: {
              userId: user.id,
              title: notification.title,
              description: notification.description,
              notificationId: notification.id,
              is_read: false,
              isActive: true,
              isDelete: false,
              createdBy: 1,
              modifiedBy: 1,
            },
          });
        } catch (error) {
          console.error(`Failed to send to user ${user.id}:`, error);
          failedCount++;
        }
      } else {
        failedCount++;
      }
    }

    return NextResponse.json(
      serializeBigInt({
        success: true,
        message: "Notification sent successfully",
        data: {
          notificationId: notification.id.toString(),
          stats: {
            totalRecipients: targetUsers.length,
            sentCount,
            failedCount,
          },
        },
      })
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
