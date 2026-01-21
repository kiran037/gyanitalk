// ===================================
// FILE: lib/schedulers/autoReassign.ts
// ===================================

import { prisma } from "@/lib/prisma";
import { acquireLock, releaseLock } from "../cronLock";
import {
  getAssignmentMetadata,
  shouldTimeout,
  markTimeout,
  reassignToNextGroup,
  broadcastToAll,
} from "../requestAssignment";
import {
  getAssignmentRules,
  getRequestExpiryMinutes,
} from "../assignmentRules";
import {
  notifyGroup,
  broadcastToAllAstrologers,
  notifyUserTimeout,
} from "../notificationService";

// ===================================
// AUTO-REASSIGN LOGIC
// ===================================

export async function autoReassign() {
  const lockKey = "auto-reassign-requests";

  if (!(await acquireLock(lockKey, 25))) return;

  try {
    const rules = await getAssignmentRules();

    if (!rules.enable_auto_assign) {
      console.log("⏸️ Auto-assignment is disabled");
      return;
    }

    // Process call requests
    await processCallRequests();

    // Process chat requests
    await processChatRequests();
  } finally {
    await releaseLock(lockKey);
  }
}

// ===================================
// PROCESS CALL REQUESTS
// ===================================

async function processCallRequests() {
  try {
    const pendingCalls = await prisma.callrequest.findMany({
      where: {
        callStatus: "Pending",
        call_type: { not: 12 }, // Exclude Exotel calls (handled separately)
      },
      orderBy: { created_at: "asc" },
      take: 20, // Process in batches
    });

    console.log(`📞 Processing ${pendingCalls.length} pending call(s)`);

    for (const call of pendingCalls) {
      try {
        await processCallRequest(call);
      } catch (error: any) {
        console.error(`❌ Error processing call ${call.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error("❌ Error in processCallRequests:", error);
  }
}

async function processCallRequest(call: any) {
  const requestId = call.id;
  const userId = call.userId;

  // Check if request expired
  const expiryMinutes = await getRequestExpiryMinutes();
  const createdAt = new Date(call.created_at);
  const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60000);

  if (Date.now() > expiryTime.getTime()) {
    console.log(`⏰ Call ${requestId} expired (${expiryMinutes}m)`);

    await prisma.callrequest.update({
      where: { id: requestId },
      data: { callStatus: "Rejected" },
    });

    await notifyUserTimeout(userId, "call");
    return;
  }

  // Check if should timeout current assignment
  const timeout = await shouldTimeout(requestId, "call");

  if (!timeout) {
    return; // Still within timeout window
  }

  console.log(`⏱️ Call ${requestId} assignment timeout`);

  // Mark as timeout
  await markTimeout(requestId, "call", userId);

  // Reassign to next group
  const result = await reassignToNextGroup(requestId, "call", userId);

  if (result.success && result.groupId) {
    console.log(`🔄 Call ${requestId} reassigned to group ${result.groupId}`);

    // Notify new group
    await notifyGroup(result.groupId, "call", requestId, true);
  } else {
    // No more groups → Broadcast to all
    console.log(`📢 Call ${requestId} broadcasting to all astrologers`);

    await broadcastToAll(requestId, "call", userId);
    await broadcastToAllAstrologers("call", requestId);
  }
}

// ===================================
// PROCESS CHAT REQUESTS
// ===================================

async function processChatRequests() {
  try {
    const pendingChats = await prisma.chatrequest.findMany({
      where: {
        chatStatus: "Pending",
      },
      orderBy: { created_at: "asc" },
      take: 20,
    });

    console.log(`💬 Processing ${pendingChats.length} pending chat(s)`);

    for (const chat of pendingChats) {
      try {
        await processChatRequest(chat);
      } catch (error: any) {
        console.error(`❌ Error processing chat ${chat.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error("❌ Error in processChatRequests:", error);
  }
}

async function processChatRequest(chat: any) {
  const requestId = chat.id;
  const userId = chat.userId;

  // Check if request expired
  const expiryMinutes = await getRequestExpiryMinutes();
  const createdAt = new Date(chat.created_at);
  const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60000);

  if (Date.now() > expiryTime.getTime()) {
    console.log(`⏰ Chat ${requestId} expired (${expiryMinutes}m)`);

    await prisma.chatrequest.update({
      where: { id: requestId },
      data: { chatStatus: "Rejected" },
    });

    await notifyUserTimeout(userId, "chat");
    return;
  }

  // Check if should timeout current assignment
  const timeout = await shouldTimeout(requestId, "chat");

  if (!timeout) {
    return;
  }

  console.log(`⏱️ Chat ${requestId} assignment timeout`);

  // Mark as timeout
  await markTimeout(requestId, "chat", userId);

  // Reassign to next group
  const result = await reassignToNextGroup(requestId, "chat", userId);

  if (result.success && result.groupId) {
    console.log(`🔄 Chat ${requestId} reassigned to group ${result.groupId}`);

    // Notify new group
    await notifyGroup(result.groupId, "chat", requestId, true);
  } else {
    // No more groups → Broadcast to all
    console.log(`📢 Chat ${requestId} broadcasting to all astrologers`);

    await broadcastToAll(requestId, "chat", userId);
    await broadcastToAllAstrologers("chat", requestId);
  }
}

// ===================================
// CLEANUP OLD ASSIGNMENTS
// ===================================

/**
 * Clean up old assignment metadata
 */
export async function cleanupOldAssignments() {
  const lockKey = "cleanup-old-assignments";

  if (!(await acquireLock(lockKey, 30))) return;

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Delete old assignment tracking orders
    const deleted = await prisma.order_request.deleteMany({
      where: {
        orderType: { in: ["call_assignment", "chat_assignment"] },
        created_at: { lt: sevenDaysAgo },
      },
    });

    console.log(`🧹 Cleaned up ${deleted.count} old assignment record(s)`);
  } finally {
    await releaseLock(lockKey);
  }
}

// ===================================
// EXPORT ALL
// ===================================

export default {
  autoReassign,
  cleanupOldAssignments,
};