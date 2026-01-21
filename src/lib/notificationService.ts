// ===================================
// FILE: lib/notificationService.ts
// ===================================

import { sendNotification, sendBatchNotifications } from "@/services/fcm";
import { prisma } from "@/lib/prisma";
import { getGroupAstrologers } from "./requestAssignment";

// ===================================
// TYPES
// ===================================

export interface NotificationResult {
  totalSent: number;
  failedCount: number;
  failedAstrologers: string[];
}

// ===================================
// NOTIFICATION TEMPLATES
// ===================================

const NOTIFICATION_TEMPLATES = {
  CALL_REQUEST: {
    title: "📞 New Call Request",
    description: "You have a new call request waiting",
  },
  CHAT_REQUEST: {
    title: "💬 New Chat Request",
    description: "You have a new chat request waiting",
  },
  CALL_REASSIGNED: {
    title: "📞 Call Request Reassigned",
    description: "A call request has been reassigned to your group",
  },
  CHAT_REASSIGNED: {
    title: "💬 Chat Request Reassigned",
    description: "A chat request has been reassigned to your group",
  },
  CALL_BROADCAST: {
    title: "📢 Urgent Call Request",
    description: "A call request is available for all astrologers",
  },
  CHAT_BROADCAST: {
    title: "📢 Urgent Chat Request",
    description: "A chat request is available for all astrologers",
  },
};

// ===================================
// SEND TO ASTROLOGER (Single)
// ===================================

export async function sendToAstrologer(
  astrologerId: bigint,
  title: string,
  description: string,
  body: any = {}
): Promise<boolean> {
  try {
    const astrologer = await prisma.astrologers.findFirst({
      where: { id: astrologerId },
      include: {
        users: {
          include: {
            user_device_details: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!astrologer?.users) {
      return false;
    }

    const fcmToken =
      astrologer.users.user_device_details[0]?.fcmToken ||
      astrologer.users.fcm_token;

    if (!fcmToken) {
      return false;
    }

    const response = await sendNotification({
      token: fcmToken,
      title,
      description,
      body,
    });

    return !!response;
  } catch (error) {
    console.error(`❌ Failed to notify astrologer ${astrologerId}:`, error);
    return false;
  }
}

// ===================================
// ✅ OPTIMIZED: BATCH NOTIFICATIONS
// ===================================

/**
 * Get FCM tokens for astrologers
 */
async function getAstrologerTokens(astrologers: any[]): Promise<{
  tokens: string[];
  astrologerIdToToken: Map<string, string>;
}> {
  const tokens: string[] = [];
  const astrologerIdToToken = new Map<string, string>();

  for (const astrologer of astrologers) {
    const astroWithUser = await prisma.astrologers.findFirst({
      where: { id: astrologer.id },
      include: {
        users: {
          include: {
            user_device_details: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!astroWithUser?.users) continue;

    const fcmToken =
      astroWithUser.users.user_device_details[0]?.fcmToken ||
      astroWithUser.users.fcm_token;

    if (fcmToken) {
      tokens.push(fcmToken);
      astrologerIdToToken.set(astrologer.id.toString(), fcmToken);
    }
  }

  return { tokens, astrologerIdToToken };
}

// ===================================
// SEND TO GROUP (✅ OPTIMIZED WITH BATCH)
// ===================================

export async function notifyGroup(
  groupId: number,
  requestType: "call" | "chat",
  requestId: number,
  isReassignment: boolean = false
): Promise<NotificationResult> {
  try {
    const astrologers = await getGroupAstrologers(groupId, {
      excludeOffline: true,
      excludeBusy: false,
    });

    if (!astrologers.length) {
      console.warn(`⚠️ No active astrologers in group ${groupId}`);
      return {
        totalSent: 0,
        failedCount: 0,
        failedAstrologers: [],
      };
    }

    const template = isReassignment
      ? NOTIFICATION_TEMPLATES[
          requestType === "call" ? "CALL_REASSIGNED" : "CHAT_REASSIGNED"
        ]
      : NOTIFICATION_TEMPLATES[
          requestType === "call" ? "CALL_REQUEST" : "CHAT_REQUEST"
        ];

    const body = {
      requestId,
      requestType,
      groupId,
      isReassignment,
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      route: requestType === "call" ? "/call-request" : "/chat-request",
    };

    // ✅ Get all tokens at once
    const { tokens, astrologerIdToToken } = await getAstrologerTokens(astrologers);

    if (!tokens.length) {
      console.warn(`⚠️ No valid FCM tokens in group ${groupId}`);
      return {
        totalSent: 0,
        failedCount: astrologers.length,
        failedAstrologers: astrologers.map((a) => a.id.toString()),
      };
    }

    // ✅ Send in batch (MUCH faster!)
    const result = await sendBatchNotifications({
      tokens,
      title: template.title,
      description: template.description,
      body,
    });

    console.log(`✅ Group ${groupId}: ${result.successCount}/${tokens.length} sent`);

    return {
      totalSent: result.successCount,
      failedCount: result.failureCount,
      failedAstrologers: [], // We don't track individual failures in batch mode
    };
  } catch (error) {
    console.error(`❌ Error notifying group ${groupId}:`, error);
    return {
      totalSent: 0,
      failedCount: 0,
      failedAstrologers: [],
    };
  }
}

// ===================================
// BROADCAST TO ALL (✅ OPTIMIZED WITH BATCH)
// ===================================

export async function broadcastToAllAstrologers(
  requestType: "call" | "chat",
  requestId: number
): Promise<NotificationResult> {
  try {
    const astrologers = await prisma.astrologers.findMany({
      where: {
        isActive: true,
        isDelete: false,
        ...(requestType === "call"
          ? { callStatus: { not: "Offline" } }
          : { chatStatus: { not: "Offline" } }),
      },
      include: {
        users: {
          include: {
            user_device_details: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!astrologers.length) {
      console.warn("⚠️ No active astrologers found for broadcast");
      return {
        totalSent: 0,
        failedCount: 0,
        failedAstrologers: [],
      };
    }

    const template =
      NOTIFICATION_TEMPLATES[
        requestType === "call" ? "CALL_BROADCAST" : "CHAT_BROADCAST"
      ];

    const body = {
      requestId,
      requestType,
      isBroadcast: true,
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      route: requestType === "call" ? "/call-request" : "/chat-request",
    };

    // ✅ Collect all tokens
    const tokens: string[] = [];
    for (const astrologer of astrologers) {
      const fcmToken =
        astrologer.users?.user_device_details[0]?.fcmToken ||
        astrologer.users?.fcm_token;

      if (fcmToken) {
        tokens.push(fcmToken);
      }
    }

    if (!tokens.length) {
      console.warn("⚠️ No valid FCM tokens for broadcast");
      return {
        totalSent: 0,
        failedCount: astrologers.length,
        failedAstrologers: [],
      };
    }

    // ✅ Send in batch
    const result = await sendBatchNotifications({
      tokens,
      title: template.title,
      description: template.description,
      body,
    });

    console.log(`📢 Broadcast: ${result.successCount}/${tokens.length} sent`);

    return {
      totalSent: result.successCount,
      failedCount: result.failureCount,
      failedAstrologers: [],
    };
  } catch (error) {
    console.error("❌ Error broadcasting:", error);
    return {
      totalSent: 0,
      failedCount: 0,
      failedAstrologers: [],
    };
  }
}

// ===================================
// SEND TO USER
// ===================================

export async function notifyUser(
  userId: bigint,
  title: string,
  description: string,
  body: any = {}
): Promise<boolean> {
  try {
    const user = await prisma.users.findFirst({
      where: { id: userId },
      include: {
        user_device_details: {
          where: { isActive: true },
        },
      },
    });

    if (!user) {
      return false;
    }

    const fcmToken =
      user.user_device_details[0]?.fcmToken || user.fcm_token;

    if (!fcmToken) {
      return false;
    }

    const response = await sendNotification({
      token: fcmToken,
      title,
      description,
      body,
    });

    return !!response;
  } catch (error) {
    console.error(`❌ Failed to notify user ${userId}:`, error);
    return false;
  }
}

export async function notifyUserTimeout(
  userId: bigint,
  requestType: "call" | "chat"
): Promise<boolean> {
  return await notifyUser(
    userId,
    "Request Timeout",
    `Your ${requestType} request could not be assigned. Please try again.`,
    {
      requestType,
      status: "timeout",
    }
  );
}

export async function notifyUserRejection(
  userId: bigint,
  requestType: "call" | "chat"
): Promise<boolean> {
  return await notifyUser(
    userId,
    "Request Unavailable",
    `Sorry, no astrologers are currently available for ${requestType}.`,
    {
      requestType,
      status: "rejected",
    }
  );
}

export default {
  sendToAstrologer,
  notifyGroup,
  broadcastToAllAstrologers,
  notifyUser,
  notifyUserTimeout,
  notifyUserRejection,
};