// app/api/customers/[id]/notifications/route.ts
// GET: Get customer notifications

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const userId = BigInt(id);
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.user_notifications.count({
      where: { userId, isActive: true, isDelete: false },
    });

    // Fetch notifications
    const notifications = await prisma.user_notifications.findMany({
      where: { userId, isActive: true, isDelete: false },
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id.toString(),
      title: notif.title,
      description: notif.description,
      type: notif.notification_type,
      isRead: notif.is_read,
      chatRequestId: notif.chatRequestId,
      callRequestId: notif.callRequestId,
      createdAt: notif.created_at,
    }));

    // Count unread
    const unreadCount = await prisma.user_notifications.count({
      where: {
        userId,
        isActive: true,
        isDelete: false,
        is_read: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        unreadCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          perPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notifications",
        message: error.message,
      },
      { status: 500 }
    );
  }
}