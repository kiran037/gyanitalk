// src/lib/profile/index.ts
import { prisma } from "@/lib/prisma";


export async function getUserProfile(userId: bigint) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      contactNo: true,
      countryCode: true,
      birthDate: true,
      birthTime: true,
      birthPlace: true,
      profile: true,
      gender: true,
      addressLine1: true,
      addressLine2: true,
      location: true,
      pincode: true,
      refer_code: true,
      email_verified: true,
      phone_verified: true,
      account_status: true,
      created_at: true,
      updated_at: true,
      last_login_at: true,
      userRoles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      astrologers: {
        select: {
          id: true,
          name: true,
          slug: true,
          isVerified: true,
        },
      },
      user_wallets: {
        select: {
          amount: true,
        },
      },
      _count: {
        select: {
          order_request: true,
          chatrequests: true,
          callrequests: true,
          reviews: true,
          followedAstrologers: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    wallet_balance: user.user_wallets[0]?.amount || 0,
    roles: user.userRoles.map((ur) => ur.role),
    astrologer: user.astrologers[0] || null,
    statistics: {
      total_orders: user._count.order_request,
      total_chats: user._count.chatrequests,
      total_calls: user._count.callrequests,
      total_reviews: user._count.reviews,
      following_count: user._count.followedAstrologers,
    },
  };
}

/**
 * Get user basic info (for quick lookups)
 */
export async function getUserBasicInfo(userId: bigint) {
  return await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      contactNo: true,
      profile: true,
      account_status: true,
      email_verified: true,
      phone_verified: true,
    },
  });
}

/**
 * Check if user exists by email or phone
 */
export async function checkUserExists(
  email?: string,
  phone?: string,
  excludeUserId?: bigint
) {
  const where: any = {
    isDelete: false,
  };

  if (excludeUserId) {
    where.id = { not: excludeUserId };
  }

  if (email && phone) {
    where.OR = [{ email }, { contactNo: phone }];
  } else if (email) {
    where.email = email;
  } else if (phone) {
    where.contactNo = phone;
  } else {
    return null;
  }

  return await prisma.users.findFirst({
    where,
    select: { id: true, email: true, contactNo: true },
  });
}

/**
 * Serialize BigInt values for JSON response
 */
export function serializeProfile(profile: any) {
  if (!profile) return null;

  return JSON.parse(
    JSON.stringify(profile, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}