// ===================================
// FILE: lib/notifications/helpers.ts
// ===================================

const { sendNotification } = require("@/services/fcm");
import { prisma } from "@/lib/prisma";

// ===================================
// TYPES
// ===================================

export type TargetAudience = 
  | "all_users" 
  | "specific_users" 
  | "all_astrologers" 
  | "active_users"
  | "users_with_wallet"
  | "inactive_users";

export interface NotificationPayload {
  title: string;
  description: string;
  targetAudience: TargetAudience;
  userIds?: number[];
  notificationType?: number;
  chatRequestId?: number | null;
  callRequestId?: number | null;
}

export interface SendResult {
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  failedUsers: string[];
}

// ===================================
// AUDIENCE TARGETING FUNCTIONS
// ===================================

/**
 * Get target users based on audience type
 */
export async function getTargetUsers(
  targetAudience: TargetAudience,
  userIds: number[] = []
) {
  const baseSelect = {
    id: true,
    fcm_token: true,
    user_device_details: {
      where: { isActive: true },
      select: { fcmToken: true },
    },
  };

  switch (targetAudience) {
    case "all_users":
      return await prisma.users.findMany({
        where: {
          isActive: true,
          isDelete: false,
          deleted_at: null,
        },
        select: baseSelect,
      });

    case "specific_users":
      if (!userIds.length) {
        throw new Error("No user IDs provided for specific_users target");
      }
      return await prisma.users.findMany({
        where: {
          id: { in: userIds.map((id) => BigInt(id)) },
          isActive: true,
          isDelete: false,
        },
        select: baseSelect,
      });

    case "all_astrologers":
      const astrologers = await prisma.astrologers.findMany({
        where: {
          isActive: true,
          isDelete: false,
        },
        select: { userId: true },
      });
      const astrologerUserIds = astrologers.map((a) => a.userId);
      return await prisma.users.findMany({
        where: {
          id: { in: astrologerUserIds },
          isActive: true,
          isDelete: false,
        },
        select: baseSelect,
      });

    case "active_users":
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return await prisma.users.findMany({
        where: {
          isActive: true,
          isDelete: false,
          deleted_at: null,
          updated_at: { gte: thirtyDaysAgo },
        },
        select: baseSelect,
      });

    case "users_with_wallet":
      const usersWithBalance = await prisma.user_wallets.findMany({
        where: {
          amount: { gt: 0 },
          isActive: true,
        },
        select: { userId: true },
      });
      const userIdsWithWallet = usersWithBalance.map((w) => w.userId);
      return await prisma.users.findMany({
        where: {
          id: { in: userIdsWithWallet },
          isActive: true,
          isDelete: false,
        },
        select: baseSelect,
      });

    case "inactive_users":
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      return await prisma.users.findMany({
        where: {
          isActive: true,
          isDelete: false,
          deleted_at: null,
          updated_at: { lt: sixtyDaysAgo },
        },
        select: baseSelect,
      });

    default:
      throw new Error(`Invalid target audience: ${targetAudience}`);
  }
}

// ===================================
// NOTIFICATION SENDING
// ===================================

/**
 * Send FCM notification to a single user
 */
export async function sendToUser(
  user: any,
  title: string,
  description: string,
  body: any = {}
): Promise<boolean> {
  const fcmToken = user.user_device_details[0]?.fcmToken || user.fcm_token;

  if (!fcmToken) {
    console.warn(`User ${user.id} has no FCM token`);
    return false;
  }

  try {
    await sendNotification({
      token: fcmToken,
      title,
      description,
      body,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send notification to user ${user.id}:`, error);
    return false;
  }
}

/**
 * Send notification to multiple users and create user_notifications entries
 */
export async function sendBulkNotification(
  notificationId: bigint,
  title: string,
  description: string,
  targetUsers: any[],
  options: {
    notificationType?: number;
    chatRequestId?: number | null;
    callRequestId?: number | null;
    createdBy?: number;
  } = {}
): Promise<SendResult> {
  const {
    notificationType = 0,
    chatRequestId = null,
    callRequestId = null,
    createdBy = 1,
  } = options;

  let sentCount = 0;
  let failedCount = 0;
  const failedUsers: string[] = [];
  const userNotificationPromises: any[] = [];

  for (const user of targetUsers) {
    const sent = await sendToUser(user, title, description, {
      notificationId: notificationId.toString(),
      type: notificationType,
    });

    if (sent) {
      sentCount++;
    } else {
      failedCount++;
      failedUsers.push(user.id.toString());
    }

    // Create user_notification entry regardless of send success
    userNotificationPromises.push(
      prisma.user_notifications.create({
        data: {
          userId: user.id,
          title,
          description,
          notificationId,
          chatRequestId,
          callRequestId,
          notification_type: notificationType,
          is_read: false,
          isActive: true,
          isDelete: false,
          createdBy,
          modifiedBy: createdBy,
        },
      })
    );
  }

  // Batch create user notifications
  await Promise.all(userNotificationPromises);

  return {
    totalRecipients: targetUsers.length,
    sentCount,
    failedCount,
    failedUsers,
  };
}

// ===================================
// STATISTICS HELPERS
// ===================================

/**
 * Calculate notification statistics
 */
export function calculateStats(userNotifications: any[]) {
  const totalSent = userNotifications.length;
  const readCount = userNotifications.filter((un) => un.is_read).length;
  const unreadCount = totalSent - readCount;
  const readRate = totalSent > 0 ? ((readCount / totalSent) * 100).toFixed(2) + "%" : "0%";

  return {
    totalSent,
    readCount,
    unreadCount,
    readRate,
  };
}

/**
 * Get notification with stats
 */
export async function getNotificationWithStats(notificationId: bigint) {
  const notification = await prisma.notifications.findUnique({
    where: { id: notificationId },
    include: {
      userNotifications: {
        select: {
          id: true,
          userId: true,
          is_read: true,
          created_at: true,
        },
      },
    },
  });

  if (!notification) {
    return null;
  }

  return {
    ...notification,
    stats: calculateStats(notification.userNotifications),
  };
}

// ===================================
// VALIDATION HELPERS
// ===================================

/**
 * Validate notification payload
 */
export function validateNotificationPayload(payload: NotificationPayload) {
  const errors: string[] = [];

  if (!payload.title || payload.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!payload.description || payload.description.trim().length === 0) {
    errors.push("Description is required");
  }

  if (!payload.targetAudience) {
    errors.push("Target audience is required");
  }

  if (payload.targetAudience === "specific_users" && (!payload.userIds || payload.userIds.length === 0)) {
    errors.push("User IDs are required for specific_users target");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ===================================
// QUERY HELPERS
// ===================================

/**
 * Build notification list query filters
 */
export function buildNotificationFilters(params: {
  search?: string;
  type?: number;
  startDate?: string;
  endDate?: string;
}) {
  const where: any = {
    isActive: true,
    isDelete: false,
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { description: { contains: params.search } },
    ];
  }

  if (params.startDate && params.endDate) {
    where.created_at = {
      gte: new Date(params.startDate),
      lte: new Date(params.endDate),
    };
  }

  return where;
}

// ===================================
// AUDIENCE COUNT HELPERS
// ===================================

/**
 * Get counts for all audience types
 */
export async function getAudienceCounts() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [
    allUsersCount,
    activeUsersCount,
    inactiveUsersCount,
    astrologersCount,
    usersWithWallet,
  ] = await Promise.all([
    prisma.users.count({
      where: {
        isActive: true,
        isDelete: false,
        deleted_at: null,
      },
    }),
    prisma.users.count({
      where: {
        isActive: true,
        isDelete: false,
        deleted_at: null,
        updated_at: { gte: thirtyDaysAgo },
      },
    }),
    prisma.users.count({
      where: {
        isActive: true,
        isDelete: false,
        deleted_at: null,
        updated_at: { lt: sixtyDaysAgo },
      },
    }),
    prisma.astrologers.count({
      where: {
        isActive: true,
        isDelete: false,
      },
    }),
    prisma.user_wallets.count({
      where: {
        amount: { gt: 0 },
        isActive: true,
      },
    }),
  ]);

  return {
    all_users: allUsersCount,
    active_users: activeUsersCount,
    inactive_users: inactiveUsersCount,
    all_astrologers: astrologersCount,
    users_with_wallet: usersWithWallet,
  };
}

// ===================================
// EXPORT ALL
// ===================================

export default {
  getTargetUsers,
  sendToUser,
  sendBulkNotification,
  calculateStats,
  getNotificationWithStats,
  validateNotificationPayload,
  buildNotificationFilters,
  getAudienceCounts,
};