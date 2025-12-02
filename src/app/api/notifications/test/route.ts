import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const { sendNotification } = require("@/services/fcm");



function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, userId } = body;

    if (!title || !description || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, description, and userId are required",
        },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
      include: {
        user_device_details: {
          where: { isActive: true },
          select: { fcmToken: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const fcmToken = user.user_device_details[0]?.fcmToken || user.fcm_token;

    if (!fcmToken) {
      return NextResponse.json(
        { success: false, error: "User has no FCM token" },
        { status: 400 }
      );
    }

    await sendNotification({
      token: fcmToken,
      title,
      description,
      body: {
        test: true,
      },
    });

    return NextResponse.json(
      serializeBigInt({
        success: true,
        message: "Test notification sent successfully",
        data: {
          userId: user.id.toString(),
          userName: user.name,
        },
      })
    );
  } catch (error: any) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
