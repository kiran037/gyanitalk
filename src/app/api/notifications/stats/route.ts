import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalNotifications,
      totalSent,
      totalRead,
      recentNotifications,
    ] = await Promise.all([
      prisma.notifications.count({
        where: {
          isDelete: false,
          created_at: { gte: startDate },
        },
      }),
      prisma.user_notifications.count({
        where: {
          created_at: { gte: startDate },
        },
      }),
      prisma.user_notifications.count({
        where: {
          is_read: true,
          created_at: { gte: startDate },
        },
      }),
      prisma.notifications.findMany({
        where: {
          isDelete: false,
          created_at: { gte: startDate },
        },
        take: 10,
        orderBy: { created_at: "desc" },
        include: {
          userNotifications: {
            select: {
              is_read: true,
            },
          },
        },
      }),
    ]);

    const typeBreakdown = await prisma.user_notifications.groupBy({
      by: ["notification_type"],
      where: {
        created_at: { gte: startDate },
      },
      _count: {
        notification_type: true,
      },
    });

    return NextResponse.json(
      serializeBigInt({
        success: true,
        data: {
          overview: {
            totalNotifications,
            totalSent,
            totalRead,
            totalUnread: totalSent - totalRead,
            readRate:
              totalSent > 0
                ? ((totalRead / totalSent) * 100).toFixed(2) + "%"
                : "0%",
          },
          typeBreakdown: typeBreakdown.map((t) => ({
            type: t.notification_type,
            count: t._count.notification_type,
          })),
          recentNotifications: recentNotifications.map((n) => ({
            id: n.id.toString(),
            title: n.title,
            created_at: n.created_at,
            sent: n.userNotifications.length,
            read: n.userNotifications.filter((un) => un.is_read).length,
          })),
        },
      })
    );
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}