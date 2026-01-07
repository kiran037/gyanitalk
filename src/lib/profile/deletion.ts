// src/lib/profile/deletion.ts
import { prisma } from "@/lib/prisma";
import { deleteAllUserSessions } from "@/lib/auth/session";

const SOFT_DELETE_GRACE_PERIOD_DAYS = parseInt(
  process.env.SOFT_DELETE_GRACE_PERIOD_DAYS || "20",
  10
);

/**
 * Soft delete account (20-day grace period)
 */
export async function softDeleteAccount(userId: bigint) {
  const deletionDate = new Date();
  const permanentDeletionDate = new Date(
    deletionDate.getTime() + SOFT_DELETE_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  // Update user status
  await prisma.users.update({
    where: { id: userId },
    data: {
      deleted_at: deletionDate,
      account_status: "suspended",
      isActive: false,
    },
  });

  // Logout all sessions
  await deleteAllUserSessions(userId);

  return {
    deleted_at: deletionDate,
    permanent_deletion_date: permanentDeletionDate,
    grace_period_days: SOFT_DELETE_GRACE_PERIOD_DAYS,
  };
}

/**
 * Restore soft-deleted account
 */
export async function restoreAccount(userId: bigint) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { deleted_at: true, account_status: true },
  });

  if (!user || !user.deleted_at) {
    return { success: false, error: "Account not found or not deleted" };
  }

  // Check if within grace period
  const gracePeriodEnd = new Date(
    user.deleted_at.getTime() + SOFT_DELETE_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  if (new Date() > gracePeriodEnd) {
    return { success: false, error: "Grace period expired, account cannot be restored" };
  }

  // Restore account
  await prisma.users.update({
    where: { id: userId },
    data: {
      deleted_at: null,
      account_status: "active",
      isActive: true,
    },
  });

  return { success: true };
}

/**
 * Permanent delete account (hard delete)
 */
export async function permanentDeleteAccount(userId: bigint) {
  // Mark as deleted (soft delete in DB for record keeping)
  await prisma.users.update({
    where: { id: userId },
    data: {
      isDelete: true,
      deleted_at: new Date(),
      account_status: "suspended",
      isActive: false,
      // Anonymize personal data
      name: "Deleted User",
      email: `deleted_${userId}@deleted.com`,
      contactNo: null,
      profile: null,
      addressLine1: null,
      addressLine2: null,
      birthPlace: null,
      fcm_token: null,
      jwt_token: null,
      otp: null,
    },
  });

  // Delete all sessions
  await deleteAllUserSessions(userId);

  // Delete sensitive data
  await Promise.all([
    prisma.user_device_details.deleteMany({ where: { userId } }),
    prisma.user_sessions.deleteMany({ where: { userId } }),
    prisma.email_verifications.deleteMany({ where: { userId } }),
    prisma.otps.deleteMany({ where: { userId } }),
  ]);

  return { success: true };
}

/**
 * Check if account can be restored
 */
export async function canRestoreAccount(userId: bigint): Promise<{
  canRestore: boolean;
  daysLeft?: number;
  reason?: string;
}> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { deleted_at: true, isDelete: true, account_status: true },
  });

  if (!user) {
    return { canRestore: false, reason: "Account not found" };
  }

  if (user.isDelete) {
    return { canRestore: false, reason: "Account permanently deleted" };
  }

  if (!user.deleted_at) {
    return { canRestore: false, reason: "Account not deleted" };
  }

  const gracePeriodEnd = new Date(
    user.deleted_at.getTime() + SOFT_DELETE_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  const now = new Date();
  if (now > gracePeriodEnd) {
    return { canRestore: false, reason: "Grace period expired" };
  }

  const daysLeft = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return { canRestore: true, daysLeft };
}

/**
 * Auto-delete accounts past grace period (cron job)
 */
export async function autoDeleteExpiredAccounts() {
  const gracePeriodEnd = new Date(
    Date.now() - SOFT_DELETE_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  const expiredAccounts = await prisma.users.findMany({
    where: {
      deleted_at: { lte: gracePeriodEnd },
      isDelete: false,
      account_status: "suspended",
    },
    select: { id: true },
  });

  for (const account of expiredAccounts) {
    await permanentDeleteAccount(account.id);
  }

  return { deleted_count: expiredAccounts.length };
}