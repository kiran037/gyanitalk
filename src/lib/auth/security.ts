// src/lib/auth/security.ts
import { prisma } from "@/lib/prisma";

const MAX_LOGIN_ATTEMPTS = parseInt(
  process.env.MAX_LOGIN_ATTEMPTS || "5",
  10
);
const LOCKOUT_DURATION_MINUTES = parseInt(
  process.env.LOCKOUT_DURATION_MINUTES || "15",
  10
);

/**
 * Check if account is locked
 */
export async function checkAccountLock(
  userId: bigint
): Promise<{ locked: boolean; unlockAt?: Date }> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { locked_until: true, account_status: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if account is locked
  if (user.locked_until && user.locked_until > new Date()) {
    return { locked: true, unlockAt: user.locked_until };
  }

  // If lock expired, reset the lock
  if (user.locked_until && user.locked_until <= new Date()) {
    await prisma.users.update({
      where: { id: userId },
      data: {
        locked_until: null,
        failed_login_attempts: 0,
        account_status: "active",
      },
    });
  }

  return { locked: false };
}

/**
 * Increment failed login attempts
 */
export async function incrementFailedAttempts(
  userId: bigint
): Promise<{ locked: boolean; attemptsLeft: number }> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { failed_login_attempts: true },
  });

  const currentAttempts = user?.failed_login_attempts || 0;
  const newAttempts = currentAttempts + 1;

  // Lock account if max attempts reached
  if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
    const lockUntil = new Date(
      Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
    );

    await prisma.users.update({
      where: { id: userId },
      data: {
        failed_login_attempts: newAttempts,
        locked_until: lockUntil,
        account_status: "locked",
      },
    });

    return { locked: true, attemptsLeft: 0 };
  }

  // Increment attempts
  await prisma.users.update({
    where: { id: userId },
    data: { failed_login_attempts: newAttempts },
  });

  return {
    locked: false,
    attemptsLeft: MAX_LOGIN_ATTEMPTS - newAttempts,
  };
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedAttempts(userId: bigint): Promise<void> {
  await prisma.users.update({
    where: { id: userId },
    data: {
      failed_login_attempts: 0,
      locked_until: null,
      account_status: "active",
      last_login_at: new Date(),
    },
  });
}

/**
 * Log login attempt
 */
export async function logLoginAttempt(
  userId: bigint | null,
  email: string,
  success: boolean,
  method: "password" | "otp" | "social",
  request: Request
): Promise<void> {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  await prisma.login_attempts.create({
    data: {
      userId: userId ? BigInt(userId) : null,
      email,
      success,
      method,
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Check if user account is suspended or inactive
 */
export async function checkAccountStatus(
  userId: bigint
): Promise<{ active: boolean; reason?: string }> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { account_status: true, isActive: true },
  });

  if (!user) {
    return { active: false, reason: "User not found" };
  }

  if (!user.isActive) {
    return { active: false, reason: "Account is deactivated" };
  }

  if (user.account_status === "suspended") {
    return { active: false, reason: "Account is suspended" };
  }

  if (user.account_status === "locked") {
    return { active: false, reason: "Account is locked" };
  }

  return { active: true };
}

/**
 * Unlock user account (admin action)
 */
export async function unlockAccount(userId: bigint): Promise<void> {
  await prisma.users.update({
    where: { id: userId },
    data: {
      locked_until: null,
      failed_login_attempts: 0,
      account_status: "active",
    },
  });
}