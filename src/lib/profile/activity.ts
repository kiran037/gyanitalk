// src/lib/profile/activity.ts
import { prisma } from "@/lib/prisma";

/**
 * Get user activity log
 */
export async function getUserActivity(
  userId: bigint,
  filters: {
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
    page?: number;
    limit?: number;
  } = {}
) {
  const { startDate, endDate, success, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  if (success !== undefined) where.success = success;
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at.gte = startDate;
    if (endDate) where.created_at.lte = endDate;
  }

  const [loginAttempts, total] = await Promise.all([
    prisma.login_attempts.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        success: true,
        ipAddress: true,
        userAgent: true,
        method: true,
        created_at: true,
      },
    }),
    prisma.login_attempts.count({ where }),
  ]);

  return {
    activities: loginAttempts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get recent login activity
 */
export async function getRecentLoginActivity(userId: bigint, limit: number = 10) {
  return await prisma.login_attempts.findMany({
    where: { userId, success: true },
    take: limit,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      method: true,
      created_at: true,
    },
  });
}

/**
 * Get failed login attempts
 */
export async function getFailedLoginAttempts(
  userId: bigint,
  lastNDays: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - lastNDays);

  return await prisma.login_attempts.findMany({
    where: {
      userId,
      success: false,
      created_at: { gte: startDate },
    },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      method: true,
      created_at: true,
    },
  });
}

/**
 * Get activity statistics
 */
export async function getActivityStatistics(userId: bigint) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalLogins, successfulLogins, failedLogins, uniqueDevices] = await Promise.all([
    prisma.login_attempts.count({
      where: { userId, created_at: { gte: thirtyDaysAgo } },
    }),
    prisma.login_attempts.count({
      where: { userId, success: true, created_at: { gte: thirtyDaysAgo } },
    }),
    prisma.login_attempts.count({
      where: { userId, success: false, created_at: { gte: thirtyDaysAgo } },
    }),
    prisma.login_attempts.groupBy({
      by: ["ipAddress"],
      where: { userId, created_at: { gte: thirtyDaysAgo } },
    }),
  ]);

  return {
    total_logins: totalLogins,
    successful_logins: successfulLogins,
    failed_logins: failedLogins,
    unique_devices: uniqueDevices.length,
    period_days: 30,
  };
}

/**
 * Parse user agent to extract device info
 */
export function parseUserAgent(userAgent: string): {
  browser?: string;
  os?: string;
  device?: string;
} {
  const info: any = {};

  // Extract browser
  if (userAgent.includes("Chrome")) info.browser = "Chrome";
  else if (userAgent.includes("Firefox")) info.browser = "Firefox";
  else if (userAgent.includes("Safari")) info.browser = "Safari";
  else if (userAgent.includes("Edge")) info.browser = "Edge";

  // Extract OS
  if (userAgent.includes("Windows")) info.os = "Windows";
  else if (userAgent.includes("Mac")) info.os = "macOS";
  else if (userAgent.includes("Linux")) info.os = "Linux";
  else if (userAgent.includes("Android")) info.os = "Android";
  else if (userAgent.includes("iOS")) info.os = "iOS";

  // Extract device type
  if (userAgent.includes("Mobile")) info.device = "Mobile";
  else if (userAgent.includes("Tablet")) info.device = "Tablet";
  else info.device = "Desktop";

  return info;
}