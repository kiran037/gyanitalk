// src/lib/auth/session.ts
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const SESSION_EXPIRY_DAYS = parseInt(
  process.env.SESSION_EXPIRY_DAYS || "30",
  10
);

/**
 * Create a new session
 */
export async function createSession(
  userId: bigint,
  deviceInfo?: {
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<string> {
  // Generate unique session token
  const sessionToken = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.user_sessions.create({
    data: {
      userId: BigInt(userId),
      session_token: sessionToken,
      device_id: deviceInfo?.deviceId || null,
      ip_address: deviceInfo?.ipAddress || null,
      user_agent: deviceInfo?.userAgent || null,
      expires_at: expiresAt,
      last_activity: new Date(),
    },
  });

  return sessionToken;
}

/**
 * Verify session is valid
 */
export async function verifySession(
  sessionToken: string
): Promise<{ valid: boolean; userId?: bigint }> {
  const session = await prisma.user_sessions.findUnique({
    where: { session_token: sessionToken },
    select: { userId: true, expires_at: true },
  });

  if (!session || session.expires_at < new Date()) {
    return { valid: false };
  }

  // Update last activity
  await prisma.user_sessions.update({
    where: { session_token: sessionToken },
    data: { last_activity: new Date() },
  });

  return { valid: true, userId: session.userId };
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionToken: string): Promise<void> {
  await prisma.user_sessions.delete({
    where: { session_token: sessionToken },
  });
}

/**
 * Delete all sessions for a user (logout all devices)
 */
export async function deleteAllUserSessions(userId: bigint): Promise<number> {
  const result = await prisma.user_sessions.deleteMany({
    where: { userId: BigInt(userId) },
  });

  return result.count;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: bigint) {
  return await prisma.user_sessions.findMany({
    where: {
      userId: BigInt(userId),
      expires_at: { gte: new Date() },
    },
    select: {
      id: true,
      device_id: true,
      ip_address: true,
      user_agent: true,
      last_activity: true,
      created_at: true,
    },
    orderBy: { last_activity: "desc" },
  });
}

/**
 * Delete a specific session by ID
 */
export async function deleteSessionById(
  sessionId: bigint,
  userId: bigint
): Promise<boolean> {
  const result = await prisma.user_sessions.deleteMany({
    where: {
      id: BigInt(sessionId),
      userId: BigInt(userId),
    },
  });

  return result.count > 0;
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.user_sessions.deleteMany({
    where: {
      expires_at: { lt: new Date() },
    },
  });

  return result.count;
}

/**
 * Extract device info from request
 */
export function extractDeviceInfo(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}