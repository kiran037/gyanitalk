// src/app/api/home/customers/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import type { Prisma } from "@prisma/client";

function istTodayRange() {
  const todayIST = new Date(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  );
  return { start: startOfDay(todayIST), end: endOfDay(todayIST) };
}

export async function GET() {
  try {
    const { start } = istTodayRange();

    // Use a mutable Prisma.usersWhereInput (no "as const") so OR is a mutable array
    const customerWhere: Prisma.usersWhereInput = {
      OR: [
        { userRoles: { some: { roleId: 3 } } },
        { userRoles: { none: {} } },
      ],
      isActive: true,
      isDelete: false,
    };

    const usersWithChatOrCallTx = await prisma.wallettransaction.findMany({
      where: { transactionType: { in: ["Chat", "Call"] } },
      select: { userId: true },
    });

    const activeIds = Array.from(
      new Set(
        usersWithChatOrCallTx
          .map((tx) => tx.userId)
          .filter((id): id is bigint => id !== null)
      )
    );

    const [total, active, today] = await Promise.all([
      prisma.users.count({ where: customerWhere }),
      prisma.users.count({
        where: {
          ...customerWhere,
          id: { in: activeIds }, // bigint[] is fine if users.id is BigInt
        },
      }),
      prisma.users.count({
        where: {
          ...customerWhere,
          created_at: { gte: start },
        },
      }),
    ]);

    return NextResponse.json({ total, active, today }, { status: 200 });
  } catch (err) {
    console.error("customers/stats error", err);
    return NextResponse.json(
      { error: "Failed to fetch customer stats" },
      { status: 500 }
    );
  }
}
