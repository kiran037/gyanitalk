// ===================================
// FILE: lib/requestAssignment.ts
// ===================================

import { prisma } from "@/lib/prisma";
import {
  getAssignmentRules,
  getGroupTimeout,
  getNextPriorityGroup,
} from "./assignmentRules";

// ===================================
// TYPES
// ===================================

export interface AssignmentMetadata {
  assigned_group_id: number | null;
  assigned_at: string;
  attempt: number;
  previous_groups: number[];
  last_reassigned_at?: string;
  assignment_history: Array<{
    group_id: number | null;
    assigned_at: string;
    timeout_at: string;
    status: "pending" | "timeout" | "accepted" | "rejected";
  }>;
}

export interface AssignmentResult {
  success: boolean;
  groupId: number | null;
  message: string;
  metadata: AssignmentMetadata;
}

// ===================================
// ASSIGNMENT METADATA HELPERS
// ===================================

/**
 * Create initial assignment metadata
 */
export function createAssignmentMetadata(groupId: number): AssignmentMetadata {
  const now = new Date().toISOString();

  return {
    assigned_group_id: groupId,
    assigned_at: now,
    attempt: 1,
    previous_groups: [],
    assignment_history: [
      {
        group_id: groupId,
        assigned_at: now,
        timeout_at: new Date(Date.now() + 30000).toISOString(),
        status: "pending",
      },
    ],
  };
}

/**
 * Get assignment metadata from order_request
 * ✅ FIX: Parse compact format from couponCode and get full metadata from systemflag
 */
export async function getAssignmentMetadata(
  requestId: number,
  requestType: "call" | "chat"
): Promise<AssignmentMetadata | null> {
  try {
    // Try to get full metadata from systemflag first
    const metadataKey = `request_assignment_${requestType}_${requestId}`;
    const flag = await prisma.systemflag.findFirst({
      where: { name: metadataKey },
    });

    if (flag?.value) {
      try {
        return JSON.parse(flag.value);
      } catch (e) {
        console.warn("Failed to parse systemflag metadata, falling back to compact format");
      }
    }

    // Fallback: parse compact format from order_request
    const order = await prisma.order_request.findFirst({
      where: {
        ...(requestType === "call" ? { callId: requestId } : { chatId: requestId }),
        orderType: requestType,
      },
      orderBy: { created_at: "desc" },
    });

    if (!order || !order.couponCode) {
      return null;
    }

    // Parse compact format: "groupId:attempt:timestamp"
    const parts = order.couponCode.split(":");
    if (parts.length !== 3) {
      return null;
    }

    const [groupIdStr, attemptStr, timestampStr] = parts;
    const groupId = parseInt(groupIdStr);
    const attempt = parseInt(attemptStr);
    const timestamp = parseInt(timestampStr);

    // Reconstruct basic metadata
    return {
      assigned_group_id: groupId === 0 ? null : groupId,
      assigned_at: new Date(timestamp).toISOString(),
      attempt,
      previous_groups: groupId > 0 ? [groupId] : [],
      assignment_history: [
        {
          group_id: groupId === 0 ? null : groupId,
          assigned_at: new Date(timestamp).toISOString(),
          timeout_at: new Date(timestamp + 30000).toISOString(),
          status: "pending",
        },
      ],
    };
  } catch (error) {
    console.error("❌ Error getting assignment metadata:", error);
    return null;
  }
}

/**
 * Save assignment metadata to order_request
 * ✅ FIX: Use couponCode (VARCHAR(45)) to store group_id only
 * Store full metadata in a separate tracking table or simplify
 */
export async function saveAssignmentMetadata(
  requestId: number,
  requestType: "call" | "chat",
  userId: bigint,
  metadata: AssignmentMetadata
): Promise<void> {
  try {
    // ✅ FIX: Store only essential data in couponCode
    // Format: "groupId:attempt:timestamp"
    const compactMetadata = `${metadata.assigned_group_id || 0}:${metadata.attempt}:${Date.now()}`;

    // Find existing order or create new
    const existing = await prisma.order_request.findFirst({
      where: {
        ...(requestType === "call" ? { callId: requestId } : { chatId: requestId }),
        orderType: requestType, // ✅ Shortened
      },
    });

    if (existing) {
      await prisma.order_request.update({
        where: { id: existing.id },
        data: {
          couponCode: compactMetadata, // ✅ Use couponCode instead
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.order_request.create({
        data: {
          userId,
          orderType: requestType, // ✅ Just "call" or "chat"
          ...(requestType === "call" ? { callId: requestId } : { chatId: requestId }),
          couponCode: compactMetadata, // ✅ Use couponCode
          orderStatus: "pending",
          isActive: "1",
          isDelete: "0",
        },
      });
    }

    // ✅ OPTIONAL: Store full metadata in systemflag for tracking
    try {
      const metadataKey = `request_assignment_${requestType}_${requestId}`;
      const existingFlag = await prisma.systemflag.findFirst({
        where: { name: metadataKey },
      });

      if (existingFlag) {
        await prisma.systemflag.update({
          where: { id: existingFlag.id },
          data: {
            value: JSON.stringify(metadata),
            updated_at: new Date(),
          },
        });
      } else {
        await prisma.systemflag.create({
          data: {
            name: metadataKey,
            valueType: "json",
            value: JSON.stringify(metadata),
            description: `Assignment metadata for ${requestType} request ${requestId}`,
            isActive: "1",
            isDelete: "0",
          },
        });
      }
    } catch (flagError) {
      console.warn("⚠️ Could not save full metadata to systemflag:", flagError);
    }
  } catch (error) {
    console.error("❌ Error saving assignment metadata:", error);
    throw error;
  }
}

// ===================================
// ASSIGNMENT FUNCTIONS
// ===================================

/**
 * Assign request to a specific group
 */
export async function assignToGroup(
  requestId: number,
  requestType: "call" | "chat",
  groupId: number,
  userId: bigint
): Promise<AssignmentResult> {
  try {
    // Validate group exists
    const group = await prisma.astrologer_groups.findFirst({
      where: { id: BigInt(groupId) },
    });

    if (!group) {
      return {
        success: false,
        groupId: null,
        message: "Invalid group ID",
        metadata: createAssignmentMetadata(groupId),
      };
    }

    // Get or create metadata
    let metadata = await getAssignmentMetadata(requestId, requestType);

    if (!metadata) {
      metadata = createAssignmentMetadata(groupId);
    } else {
      // Update existing metadata
      metadata.assigned_group_id = groupId;
      metadata.assigned_at = new Date().toISOString();
      metadata.attempt += 1;
      if (!metadata.previous_groups.includes(groupId)) {
        metadata.previous_groups.push(groupId);
      }

      const timeout = await getGroupTimeout(groupId);
      metadata.assignment_history.push({
        group_id: groupId,
        assigned_at: new Date().toISOString(),
        timeout_at: new Date(Date.now() + timeout * 1000).toISOString(),
        status: "pending",
      });
    }

    // Save metadata
    await saveAssignmentMetadata(requestId, requestType, userId, metadata);

    return {
      success: true,
      groupId,
      message: `Request assigned to group ${group.name}`,
      metadata,
    };
  } catch (error: any) {
    console.error("❌ Error assigning to group:", error);
    return {
      success: false,
      groupId: null,
      message: error.message || "Failed to assign request",
      metadata: createAssignmentMetadata(groupId),
    };
  }
}

/**
 * Reassign request to next priority group
 */
export async function reassignToNextGroup(
  requestId: number,
  requestType: "call" | "chat",
  userId: bigint
): Promise<AssignmentResult> {
  try {
    const metadata = await getAssignmentMetadata(requestId, requestType);

    if (!metadata) {
      return {
        success: false,
        groupId: null,
        message: "No assignment metadata found",
        metadata: createAssignmentMetadata(0),
      };
    }

    // Check max retries
    const rules = await getAssignmentRules();
    if (metadata.attempt >= rules.max_retries) {
      return {
        success: false,
        groupId: null,
        message: "Max retries reached",
        metadata,
      };
    }

    // Get next group
    const nextGroupId = await getNextPriorityGroup(metadata.assigned_group_id);

    if (!nextGroupId) {
      return {
        success: false,
        groupId: null,
        message: "No more groups in priority chain",
        metadata,
      };
    }

    // Assign to next group
    return await assignToGroup(requestId, requestType, nextGroupId, userId);
  } catch (error: any) {
    console.error("❌ Error reassigning request:", error);
    return {
      success: false,
      groupId: null,
      message: error.message || "Failed to reassign request",
      metadata: createAssignmentMetadata(0),
    };
  }
}

/**
 * Broadcast request to all astrologers
 */
export async function broadcastToAll(
  requestId: number,
  requestType: "call" | "chat",
  userId: bigint
): Promise<AssignmentResult> {
  try {
    const metadata = await getAssignmentMetadata(requestId, requestType);

    const updatedMetadata: AssignmentMetadata = metadata || createAssignmentMetadata(0);

    updatedMetadata.assigned_group_id = null;
    updatedMetadata.assigned_at = new Date().toISOString();
    updatedMetadata.attempt += 1;

    updatedMetadata.assignment_history.push({
      group_id: null,
      assigned_at: new Date().toISOString(),
      timeout_at: new Date(Date.now() + 300000).toISOString(),
      status: "pending",
    });

    await saveAssignmentMetadata(requestId, requestType, userId, updatedMetadata);

    return {
      success: true,
      groupId: null,
      message: "Request broadcasted to all astrologers",
      metadata: updatedMetadata,
    };
  } catch (error: any) {
    console.error("❌ Error broadcasting request:", error);
    return {
      success: false,
      groupId: null,
      message: error.message || "Failed to broadcast request",
      metadata: createAssignmentMetadata(0),
    };
  }
}

// ===================================
// ASTROLOGER SELECTION HELPERS
// ===================================

/**
 * Get available astrologers in a group
 */
export async function getGroupAstrologers(
  groupId: number,
  options: {
    excludeOffline?: boolean;
    excludeBusy?: boolean;
    skillMatch?: string[];
  } = {}
): Promise<any[]> {
  const { excludeOffline = true, excludeBusy = true, skillMatch = [] } = options;

  try {
    const assignments = await prisma.astrologer_assign_group.findMany({
      where: { group_id: BigInt(groupId) },
      include: {
        astrologer: {
          include: {
            users: true,
          },
        },
      },
    });

    let astrologers = assignments
      .map((a) => a.astrologer)
      .filter((a) => a && a.isActive && !a.isDelete);

    if (excludeOffline) {
      astrologers = astrologers.filter(
        (a) => a?.chatStatus !== "Offline" && a?.callStatus !== "Offline"
      );
    }

    if (excludeBusy) {
      astrologers = astrologers.filter(
        (a) => a?.chatStatus !== "Busy" && a?.callStatus !== "Busy"
      );
    }

    if (skillMatch.length > 0) {
      astrologers = astrologers.filter((a) => {
        const skills = a?.allSkill?.split(",").map((s) => s.trim()) || [];
        return skillMatch.some((skill) => skills.includes(skill));
      });
    }

    return astrologers;
  } catch (error) {
    console.error("❌ Error getting group astrologers:", error);
    return [];
  }
}

/**
 * Select best astrologer from group
 */
export async function selectBestAstrologer(
  groupId: number,
  requestType: "call" | "chat"
): Promise<any | null> {
  const astrologers = await getGroupAstrologers(groupId, {
    excludeOffline: true,
    excludeBusy: true,
  });

  if (!astrologers.length) {
    return null;
  }

  const astrologerLoads = await Promise.all(
    astrologers.map(async (astro) => {
      const count =
        requestType === "call"
          ? await prisma.callrequest.count({
              where: {
                astrologerId: astro.id,
                created_at: { gte: new Date(Date.now() - 3600000) },
              },
            })
          : await prisma.chatrequest.count({
              where: {
                astrologerId: astro.id,
                created_at: { gte: new Date(Date.now() - 3600000) },
              },
            });

      return { astrologer: astro, load: count };
    })
  );

  astrologerLoads.sort((a, b) => a.load - b.load);

  return astrologerLoads[0]?.astrologer || null;
}

// ===================================
// REQUEST STATUS HELPERS
// ===================================

export async function shouldTimeout(
  requestId: number,
  requestType: "call" | "chat"
): Promise<boolean> {
  const metadata = await getAssignmentMetadata(requestId, requestType);

  if (!metadata) return false;

  const lastAssignment =
    metadata.assignment_history[metadata.assignment_history.length - 1];

  if (!lastAssignment) return false;

  const timeoutAt = new Date(lastAssignment.timeout_at);
  return Date.now() > timeoutAt.getTime();
}

export async function markTimeout(
  requestId: number,
  requestType: "call" | "chat",
  userId: bigint
): Promise<void> {
  const metadata = await getAssignmentMetadata(requestId, requestType);

  if (!metadata) return;

  const lastIndex = metadata.assignment_history.length - 1;
  if (metadata.assignment_history[lastIndex]) {
    metadata.assignment_history[lastIndex].status = "timeout";
  }

  await saveAssignmentMetadata(requestId, requestType, userId, metadata);
}

export default {
  createAssignmentMetadata,
  getAssignmentMetadata,
  saveAssignmentMetadata,
  assignToGroup,
  reassignToNextGroup,
  broadcastToAll,
  getGroupAstrologers,
  selectBestAstrologer,
  shouldTimeout,
  markTimeout,
};