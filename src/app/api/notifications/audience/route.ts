///Users/xeoren/Desktop/gyanitallk-admin/src/app/api/notifications/audience/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const [
      allUsersCount,
      activeUsersCount,
      astrologersCount,
      usersWithWallet,
    ] = await Promise.all([
      prisma.users.count({
        where: {
          isActive: true,
          isDelete: false,
          deleted_at: null,
        },
      }),
      prisma.users.count({
        where: {
          isActive: true,
          isDelete: false,
          deleted_at: null,
          updated_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.astrologers.count({
        where: {
          isActive: true,
          isDelete: false,
        },
      }),
      prisma.user_wallets.count({
        where: {
          amount: { gt: 0 },
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        all_users: allUsersCount,
        active_users: activeUsersCount,
        all_astrologers: astrologersCount,
        users_with_wallet: usersWithWallet,
      },
    });
  } catch (error: any) {
    console.error("Error fetching audience:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}