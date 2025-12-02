// ===================================
// FILE: app/api/notifications/route.ts
// ===================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const { sendNotification } = require("@/services/fcm");


// Helper to convert BigInt to string for JSON serialization
function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// GET - List all notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      isDelete: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          created_at: true,
          updated_at: true,
          userNotifications: {
            select: {
              id: true,
              is_read: true,
            },
          },
        },
      }),
      prisma.notifications.count({ where }),
    ]);

    const notificationsWithStats = notifications.map((notif) => ({
      id: notif.id.toString(),
      title: notif.title,
      description: notif.description,
      created_at: notif.created_at,
      updated_at: notif.updated_at,
      totalSent: notif.userNotifications.length,
      readCount: notif.userNotifications.filter((un) => un.is_read).length,
      unreadCount: notif.userNotifications.filter((un) => !un.is_read).length,
    }));

    return NextResponse.json(
      serializeBigInt({
        success: true,
        data: notificationsWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create and send notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      targetAudience,
      userIds = [],
      notificationType = 0,
      sendImmediately = true,
      chatRequestId = null,
      callRequestId = null,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notifications.create({
      data: {
        title,
        description,
        isActive: true,
        isDelete: false,
        createdBy: 1,
        modifiedBy: 1,
      },
    });

    if (!sendImmediately) {
      return NextResponse.json(
        serializeBigInt({
          success: true,
          message: "Notification created successfully",
          data: notification,
        })
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

      case "all_astrologers":
        const astrologers = await prisma.astrologers.findMany({
          where: {
            isActive: true,
            isDelete: false,
          },
          select: {
            userId: true,
          },
        });
        const astrologerUserIds = astrologers.map((a) => a.userId);
        targetUsers = await prisma.users.findMany({
          where: {
            id: { in: astrologerUserIds },
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

      case "active_users":
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        targetUsers = await prisma.users.findMany({
          where: {
            isActive: true,
            isDelete: false,
            deleted_at: null,
            updated_at: {
              gte: thirtyDaysAgo,
            },
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

      case "users_with_wallet":
        const usersWithBalance = await prisma.user_wallets.findMany({
          where: {
            amount: { gt: 0 },
            isActive: true,
          },
          select: { userId: true },
        });
        const userIdsWithWallet = usersWithBalance.map((w) => w.userId);
        targetUsers = await prisma.users.findMany({
          where: {
            id: { in: userIdsWithWallet },
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

      default:
        return NextResponse.json(
          { success: false, error: "Invalid target audience" },
          { status: 400 }
        );
    }

    let sentCount = 0;
    let failedCount = 0;
    const userNotificationPromises: any[] = [];

    for (const user of targetUsers) {
      const fcmToken =
        user.user_device_details[0]?.fcmToken || user.fcm_token;

      if (fcmToken) {
        try {
          await sendNotification({
            token: fcmToken,
            title,
            description,
            body: {
              notificationId: notification.id.toString(),
              type: notificationType,
            },
          });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send to user ${user.id}:`, error);
          failedCount++;
        }
      } else {
        failedCount++;
      }

      userNotificationPromises.push(
        prisma.user_notifications.create({
          data: {
            userId: user.id,
            title,
            description,
            notificationId: notification.id,
            chatRequestId,
            callRequestId,
            notification_type: notificationType,
            is_read: false,
            isActive: true,
            isDelete: false,
            createdBy: 1,
            modifiedBy: 1,
          },
        })
      );
    }

    await Promise.all(userNotificationPromises);

    return NextResponse.json(
      serializeBigInt({
        success: true,
        message: "Notification sent successfully",
        data: {
          notification,
          stats: {
            totalRecipients: targetUsers.length,
            sentCount,
            failedCount,
          },
        },
      })
    );
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}