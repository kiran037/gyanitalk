// ===================================
// FILE: lib/assignmentRules.ts
// ===================================

import { prisma } from "@/lib/prisma";

// ===================================
// TYPES
// ===================================

export interface AssignmentRule {
  default_timeout: number;
  max_retries: number;
  priority_groups: number[];
  enable_auto_assign: boolean;
  enable_skill_matching: boolean;
  load_balance: boolean;
}

export interface GroupPriority {
  priority: number;
  timeout: number;
}

export interface GroupPriorities {
  [groupId: string]: GroupPriority;
}

// ===================================
// DEFAULT CONFIGURATIONS
// ===================================

const DEFAULT_ASSIGNMENT_RULES: AssignmentRule = {
  default_timeout: 30,
  max_retries: 3,
  priority_groups: [],
  enable_auto_assign: true,
  enable_skill_matching: false,
  load_balance: true,
};

const DEFAULT_GROUP_PRIORITIES: GroupPriorities = {};

// ===================================
// SYSTEMFLAG KEYS
// ===================================

const SYSTEMFLAG_KEYS = {
  ASSIGNMENT_RULES: "assignment_rules",
  GROUP_PRIORITIES: "group_priorities",
  REQUEST_EXPIRY: "request_expiry_minutes",
};

// ===================================
// GET FUNCTIONS
// ===================================

export async function getAssignmentRules(): Promise<AssignmentRule> {
  try {
    const flag = await prisma.systemflag.findFirst({
      where: {
        name: SYSTEMFLAG_KEYS.ASSIGNMENT_RULES,
        isActive: "1",
        isDelete: "0",
      },
    });

    if (!flag || !flag.value) {
      return DEFAULT_ASSIGNMENT_RULES;
    }

    const parsed = JSON.parse(flag.value);
    return { ...DEFAULT_ASSIGNMENT_RULES, ...parsed };
  } catch (error) {
    console.error("❌ Error loading assignment rules:", error);
    return DEFAULT_ASSIGNMENT_RULES;
  }
}

export async function getGroupPriorities(): Promise<GroupPriorities> {
  try {
    const flag = await prisma.systemflag.findFirst({
      where: {
        name: SYSTEMFLAG_KEYS.GROUP_PRIORITIES,
        isActive: "1",
        isDelete: "0",
      },
    });

    if (!flag || !flag.value) {
      return DEFAULT_GROUP_PRIORITIES;
    }

    return JSON.parse(flag.value);
  } catch (error) {
    console.error("❌ Error loading group priorities:", error);
    return DEFAULT_GROUP_PRIORITIES;
  }
}

export async function getRequestExpiryMinutes(): Promise<number> {
  try {
    const flag = await prisma.systemflag.findFirst({
      where: {
        name: SYSTEMFLAG_KEYS.REQUEST_EXPIRY,
        isActive: "1",
        isDelete: "0",
      },
    });

    return flag?.value ? parseInt(flag.value) : 5;
  } catch (error) {
    console.error("❌ Error loading request expiry:", error);
    return 5;
  }
}

// ===================================
// SET FUNCTIONS (✅ FIXED)
// ===================================

export async function saveAssignmentRules(
  rules: Partial<AssignmentRule>
): Promise<AssignmentRule> {
  const currentRules = await getAssignmentRules();
  const updatedRules = { ...currentRules, ...rules };

  // ✅ FIX: Find existing or create new
  const existing = await prisma.systemflag.findFirst({
    where: { name: SYSTEMFLAG_KEYS.ASSIGNMENT_RULES },
  });

  if (existing) {
    await prisma.systemflag.update({
      where: { id: existing.id },
      data: {
        value: JSON.stringify(updatedRules),
        updated_at: new Date(),
      },
    });
  } else {
    await prisma.systemflag.create({
      data: {
        name: SYSTEMFLAG_KEYS.ASSIGNMENT_RULES,
        valueType: "json",
        value: JSON.stringify(updatedRules),
        isActive: "1",
        isDelete: "0",
        displayName: "Assignment Rules",
        description: "Auto-assignment configuration for requests",
        viewenable: true,
      },
    });
  }

  return updatedRules;
}

export async function saveGroupPriorities(
  priorities: GroupPriorities
): Promise<GroupPriorities> {
  // ✅ FIX: Find existing or create new
  const existing = await prisma.systemflag.findFirst({
    where: { name: SYSTEMFLAG_KEYS.GROUP_PRIORITIES },
  });

  if (existing) {
    await prisma.systemflag.update({
      where: { id: existing.id },
      data: {
        value: JSON.stringify(priorities),
        updated_at: new Date(),
      },
    });
  } else {
    await prisma.systemflag.create({
      data: {
        name: SYSTEMFLAG_KEYS.GROUP_PRIORITIES,
        valueType: "json",
        value: JSON.stringify(priorities),
        isActive: "1",
        isDelete: "0",
        displayName: "Group Priorities",
        description: "Priority order and timeout for astrologer groups",
        viewenable: true,
      },
    });
  }

  return priorities;
}

export async function saveRequestExpiry(minutes: number): Promise<number> {
  // ✅ FIX: Find existing or create new
  const existing = await prisma.systemflag.findFirst({
    where: { name: SYSTEMFLAG_KEYS.REQUEST_EXPIRY },
  });

  if (existing) {
    await prisma.systemflag.update({
      where: { id: existing.id },
      data: {
        value: minutes.toString(),
        updated_at: new Date(),
      },
    });
  } else {
    await prisma.systemflag.create({
      data: {
        name: SYSTEMFLAG_KEYS.REQUEST_EXPIRY,
        valueType: "number",
        value: minutes.toString(),
        isActive: "1",
        isDelete: "0",
        displayName: "Request Expiry (Minutes)",
        description: "Auto-reject requests after X minutes",
        viewenable: true,
      },
    });
  }

  return minutes;
}

// ===================================
// VALIDATION FUNCTIONS
// ===================================

export function validateAssignmentRules(
  rules: Partial<AssignmentRule>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (rules.default_timeout !== undefined && rules.default_timeout < 10) {
    errors.push("Default timeout must be at least 10 seconds");
  }

  if (rules.max_retries !== undefined && rules.max_retries < 1) {
    errors.push("Max retries must be at least 1");
  }

  if (rules.priority_groups !== undefined) {
    if (!Array.isArray(rules.priority_groups)) {
      errors.push("Priority groups must be an array");
    } else if (rules.priority_groups.some((id) => typeof id !== "number")) {
      errors.push("All priority group IDs must be numbers");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateGroupPriorities(
  priorities: GroupPriorities
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [groupId, config] of Object.entries(priorities)) {
    if (isNaN(parseInt(groupId))) {
      errors.push(`Invalid group ID: ${groupId}`);
    }

    if (config.priority < 1) {
      errors.push(`Group ${groupId}: Priority must be at least 1`);
    }

    if (config.timeout < 10) {
      errors.push(`Group ${groupId}: Timeout must be at least 10 seconds`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

export async function getNextPriorityGroup(
  currentGroupId: number | null
): Promise<number | null> {
  const rules = await getAssignmentRules();
  const priorities = await getGroupPriorities();

  if (!rules.priority_groups.length) {
    return null;
  }

  if (!currentGroupId) {
    return rules.priority_groups[0] || null;
  }

  const currentPriority = priorities[currentGroupId.toString()]?.priority;

  if (!currentPriority) {
    return rules.priority_groups[0] || null;
  }

  let nextGroup: number | null = null;
  let nextPriority = Infinity;

  for (const groupId of rules.priority_groups) {
    const groupPriority = priorities[groupId.toString()]?.priority || Infinity;

    if (groupPriority > currentPriority && groupPriority < nextPriority) {
      nextGroup = groupId;
      nextPriority = groupPriority;
    }
  }

  return nextGroup;
}

export async function getGroupTimeout(groupId: number): Promise<number> {
  const priorities = await getGroupPriorities();
  const rules = await getAssignmentRules();

  return priorities[groupId.toString()]?.timeout || rules.default_timeout;
}

export async function isValidGroup(groupId: number): Promise<boolean> {
  const group = await prisma.astrologer_groups.findFirst({
    where: { id: BigInt(groupId) },
  });

  return !!group;
}

export default {
  getAssignmentRules,
  getGroupPriorities,
  getRequestExpiryMinutes,
  saveAssignmentRules,
  saveGroupPriorities,
  saveRequestExpiry,
  validateAssignmentRules,
  validateGroupPriorities,
  getNextPriorityGroup,
  getGroupTimeout,
  isValidGroup,
};