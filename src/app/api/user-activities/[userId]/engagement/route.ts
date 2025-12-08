// app/api/user-activities/[userId]/engagement/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ userId: string }>;
};

async function getUserId(context: RouteContext): Promise<bigint> {
  const { userId } = await context.params; // unwrap params Promise

  const trimmed = userId?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid userId: "${userId}"`);
  }

  return BigInt(trimmed);
}


export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId(context); // bigint

    const [
      followedAstrologers,
      blockedAstrologers,
      reviews,
      giftsSent,
      notifications,
    ] = await Promise.all([
      // Followed astrologers with details
      prisma.astrologer_followers.findMany({
        where: { userId, isActive: true, isDelete: false },
        include: {
          astrologer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              primarySkill: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),

      // Blocked astrologers
      prisma.blockastrologer.findMany({
        where: { userId },
        include: {
          astrologer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),

      // Reviews with astrologer details
      prisma.user_reviews.findMany({
        where: { userId, isActive: true, isDelete: false },
        include: {
          astrologer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      }),

      // Gifts sent to astrologers
      prisma.astrologer_gifts.findMany({
        where: { userId, isActive: true, isDelete: false },
        include: {
          astrologer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          gift: {
            select: {
              name: true,
              image: true,
              amount: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      }),

      // Recent notifications
      prisma.user_notifications.findMany({
        where: { userId },
        orderBy: { created_at: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          is_read: true,
          notification_type: true,
          created_at: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        following: {
          total: followedAstrologers.length,
          astrologers: followedAstrologers.map((f) => ({
            id: f.astrologer?.id.toString(),
            name: f.astrologer?.name,
            profileImage: f.astrologer?.profileImage,
            primarySkill: f.astrologer?.primarySkill,
            followedAt: f.created_at,
          })),
        },
        blocked: {
          total: blockedAstrologers.length,
          astrologers: blockedAstrologers.map((b) => ({
            id: b.astrologer?.id.toString(),
            name: b.astrologer?.name,
            profileImage: b.astrologer?.profileImage,
            reason: b.reason,
            blockedAt: b.created_at,
          })),
        },
        reviews: {
          total: reviews.length,
          recent: reviews.map((r) => ({
            id: r.id.toString(),
            rating: r.rating,
            review: r.review,
            astrologer: {
              id: r.astrologer?.id.toString(),
              name: r.astrologer?.name,
              profileImage: r.astrologer?.profileImage,
            },
            createdAt: r.created_at,
            isPublic: r.isPublic,
          })),
        },
        gifts: {
          total: giftsSent.length,
          recent: giftsSent.map((g) => ({
            id: g.id.toString(),
            giftName: g.gift?.name,
            giftImage: g.gift?.image,
            amount: g.giftAmount,
            astrologer: {
              id: g.astrologer?.id.toString(),
              name: g.astrologer?.name,
              profileImage: g.astrologer?.profileImage,
            },
            sentAt: g.created_at,
          })),
        },
        notifications: {
          total: notifications.length,
          unread: notifications.filter((n) => !n.is_read).length,
          recent: notifications.map((n) => ({
            id: n.id.toString(),
            title: n.title,
            description: n.description,
            isRead: n.is_read,
            type: n.notification_type,
            createdAt: n.created_at,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user engagement:", error);
    return NextResponse.json(
      { error: "Failed to fetch user engagement data" },
      { status: 500 }
    );
  }
}
