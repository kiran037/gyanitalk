// app/api/user-activities/[userId]/devices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ userId: string }>;
};

async function getUserId(context: RouteContext): Promise<bigint> {
  const { userId } = await context.params; // unwrap Promise

  const trimmed = userId?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid userId: "${userId}"`);
  }

  return BigInt(trimmed);
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId(context); // ✅ unwrap + validate

    const [devices, sessionTokens, liveUserSessions] = await Promise.all([
      // All device details for this user
      prisma.user_device_details.findMany({
        where: { userId, isDelete: false },
        orderBy: { updated_at: "desc" },
      }),

      // Session tokens (recent logins)
      prisma.sessiontoken.findMany({
        where: {
          expire_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        orderBy: { created_at: "desc" },
        take: 20,
      }),

      // Live streaming sessions
      prisma.liveuser.findMany({
        where: { userId: Number(userId) },
        orderBy: { updated_at: "desc" },
      }),
    ]);

    // Group devices by model
    const deviceGroups = devices.reduce(
      (acc, device) => {
        const model = device.deviceModel || "Unknown";
        if (!acc[model]) acc[model] = [];
        acc[model].push(device);
        return acc;
      },
      {} as Record<string, typeof devices>
    );

    // Get unique app versions
    const appVersions = Array.from(
      new Set(devices.map((d) => d.appVersion).filter(Boolean))
    );

    // Calculate session statistics
    const activeDevices = devices.filter(
      (d) =>
        d.updated_at &&
        new Date(d.updated_at).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000 // Active in last 7 days
    );

    return NextResponse.json({
      success: true,
      data: {
        devices: {
          total: devices.length,
          active: activeDevices.length,
          byModel: Object.keys(deviceGroups).map((model) => ({
            model,
            count: deviceGroups[model].length,
            lastSeen: deviceGroups[model][0].updated_at,
          })),
          details: devices.map((d) => ({
            id: d.id.toString(),
            deviceId: d.deviceId,
            deviceModel: d.deviceModel,
            deviceManufacturer: d.deviceManufacturer,
            appVersion: d.appVersion,
            appId: d.appId,
            fcmToken: d.fcmToken ? "***" + d.fcmToken.slice(-10) : null, // Masked for security
            deviceLocation: d.deviceLocation,
            isActive: d.isActive,
            lastActive: d.updated_at,
            createdAt: d.created_at,
          })),
        },
        appVersions: {
          current: appVersions[0] || null,
          all: appVersions,
        },
        sessions: {
          total: sessionTokens.length,
          recent: sessionTokens.slice(0, 10).map((s) => ({
            id: s.id,
            createdAt: s.created_at,
            expiresAt: s.expire_at,
            isExpired: s.expire_at && new Date(s.expire_at) < new Date(),
          })),
        },
        liveStreaming: {
          total: liveUserSessions.length,
          recent: liveUserSessions.map((ls) => ({
            id: ls.id,
            channelName: ls.channelName,
            fcmToken: ls.fcmToken ? "***" + ls.fcmToken.slice(-10) : null,
            createdAt: ls.created_at,
            updatedAt: ls.updated_at,
          })),
        },
        summary: {
          totalDevices: devices.length,
          activeDevices: activeDevices.length,
          lastSeenDevice: devices[0]
            ? {
                model: devices[0].deviceModel,
                lastActive: devices[0].updated_at,
              }
            : null,
          pushNotificationsEnabled: devices.some((d) => d.fcmToken),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user device data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user device data" },
      { status: 500 }
    );
  }
}
