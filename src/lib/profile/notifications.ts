// src/lib/profile/notifications.ts
import { prisma } from "@/lib/prisma";

/**
 * Get user notifications with pagination
 */
export async function getUserNotifications(
  userId: bigint,
  filters: {
    isRead?: boolean;
    type?: number;
    page?: number;
    limit?: number;
  } = {}
) {
  const { isRead, type, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: any = { userId, isActive: true, isDelete: false };

  if (isRead !== undefined) where.is_read = isRead;
  if (type !== undefined) where.notification_type = type;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.user_notifications.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    }),
    prisma.user_notifications.count({ where }),
    prisma.user_notifications.count({
      where: { userId, is_read: false, isActive: true, isDelete: false },
    }),
  ]);

  return {
    notifications,
    unread_count: unreadCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  userId: bigint,
  notificationIds: bigint[]
) {
  const result = await prisma.user_notifications.updateMany({
    where: {
      userId,
      id: { in: notificationIds },
      isActive: true,
      isDelete: false,
    },
    data: { is_read: true },
  });

  return { updated_count: result.count };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: bigint) {
  const result = await prisma.user_notifications.updateMany({
    where: { userId, is_read: false, isActive: true, isDelete: false },
    data: { is_read: true },
  });

  return { updated_count: result.count };
}

/**
 * Get notification preferences (stored in user_device_details for now)
 */
export async function getNotificationPreferences(userId: bigint) {
  // This is a placeholder - you may want to create a separate preferences table
  const deviceDetails = await prisma.user_device_details.findFirst({
    where: { userId, isActive: true },
    select: { fcmToken: true },
  });

  return {
    push_enabled: !!deviceDetails?.fcmToken,
    email_enabled: true, // Default, can be customized
    sms_enabled: false, // Default, can be customized
  };
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: bigint,
  preferences: {
    push_enabled?: boolean;
    email_enabled?: boolean;
    sms_enabled?: boolean;
  }
) {
  // This is a placeholder implementation
  // You may want to create a user_preferences table for better management
  
  if (preferences.push_enabled === false) {
    // Clear FCM tokens to disable push notifications
    await prisma.user_device_details.updateMany({
      where: { userId },
      data: { fcmToken: null },
    });
  }

  return {
    success: true,
    preferences: {
      push_enabled: preferences.push_enabled ?? true,
      email_enabled: preferences.email_enabled ?? true,
      sms_enabled: preferences.sms_enabled ?? false,
    },
  };
}

/**
 * Delete notification
 */
export async function deleteNotification(userId: bigint, notificationId: bigint) {
  const result = await prisma.user_notifications.updateMany({
    where: { userId, id: notificationId },
    data: { isDelete: true },
  });

  return { success: result.count > 0 };
}