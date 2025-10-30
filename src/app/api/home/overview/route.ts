// src/app/api/home/overview/route.ts
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
    const { start, end } = istTodayRange();
    const today = start;

    const [
      totalCallRequest,
      completedCalls,
      todayCallRequest,
      todayCallRequestReject,
      todayCallRequestList,
    ] = await Promise.all([
      prisma.callrequest.count(),
      prisma.callrequest.findMany({
        where: { callStatus: "Completed" },
        select: { totalMin: true },
      }),
      prisma.callrequest.count({ where: { created_at: { gte: today } } }),
      prisma.callrequest.count({
        where: { callStatus: "Rejected", created_at: { gte: today } },
      }),
      prisma.callrequest.findMany({
        where: { created_at: { gte: today } },
        select: { totalMin: true },
      }),
    ]);

    const [
      totalChatRequest,
      completedChats,
      todayChatRequest,
      todayChatRequestReject,
      todayChatRequestList,
    ] = await Promise.all([
      prisma.chatrequest.count(),
      prisma.chatrequest.findMany({
        where: { chatStatus: "Completed" },
        select: { totalMin: true },
      }),
      prisma.chatrequest.count({ where: { created_at: { gte: today } } }),
      prisma.chatrequest.count({
        where: { chatStatus: "Rejected", created_at: { gte: today } },
      }),
      prisma.chatrequest.findMany({
        where: { created_at: { gte: today } },
        select: { totalMin: true },
      }),
    ]);

    const sumTotalMin = (items: { totalMin: string | null }[]) =>
      items.reduce(
        (acc, cur) => acc + (parseInt(cur.totalMin || "0", 10) || 0),
        0
      );

    const totalReportRequest = await prisma.user_reports.count();

    // ✅ Mutable OR array; no `as const`. Use `satisfies` to keep strong typing.
    const customerWhere = {
      OR: [
        { userRoles: { some: { roleId: 3 } } },
        { userRoles: { none: {} } },
      ],
      isActive: true,
      isDelete: false,
    } satisfies Prisma.usersWhereInput;

    const [totalCustomer, todayCustomer] = await Promise.all([
      prisma.users.count({ where: customerWhere }),
      prisma.users.count({
        where: {
          ...customerWhere,
          created_at: { gte: today },
        },
      }),
    ]);

    const usersWithChatOrCallTx = await prisma.wallettransaction.findMany({
      where: { transactionType: { in: ["Chat", "Call"] } },
      select: { userId: true },
    });

    // Keep IDs as bigint (no Number() conversion) for Prisma filters.
    const userIdsWithTx = Array.from(
      new Set(
        usersWithChatOrCallTx
          .map((tx) => tx.userId)
          .filter((id): id is bigint => id !== null)
      )
    );

    const totalActiveCustomer = await prisma.users.count({
      where: {
        ...customerWhere,
        id: { in: userIdsWithTx as bigint[] },
      },
    });

    const [
      totalAstrologer,
      totalOrders,
      totalLiveAstro,
      totalLiveChat,
      totalLiveCall,
      totalRequest,
      unverifiedAstrologer,
    ] = await Promise.all([
      prisma.astrologers.count(),
      prisma.order_request.count({ where: { orderType: "astromall" } }),
      prisma.liveastro.count({ where: { isActive: 1 } }),
      prisma.astrologers.count({ where: { chatStatus: "Online" } }),
      prisma.astrologers.count({ where: { callStatus: "Online" } }),
      prisma.astrologer_request.count({ where: { status: "Pending" } }),
      prisma.astrologers.count({ where: { isVerified: false } }),
    ]);

    const [totalEarningResult, todayEarningResult] = await Promise.all([
      prisma.admin_get_commissions.aggregate({ _sum: { amount: true } }),
      prisma.admin_get_commissions.aggregate({
        where: { created_at: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    const astrologerUserIds = await prisma.user_roles.findMany({
      where: { roleId: 2 },
      select: { userId: true },
    });

    const astroIds = astrologerUserIds
      .map((r) => r.userId)
      .filter((id): id is bigint => id !== null);

    const [totalAstroEarningResult, todayAstroEarningResult] = await Promise.all([
      prisma.wallettransaction.aggregate({
        where: { userId: { in: astroIds as bigint[] } },
        _sum: { amount: true },
      }),
      prisma.wallettransaction.aggregate({
        where: {
          userId: { in: astroIds as bigint[] },
          created_at: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
    ]);

    const [totalWithdraw, todayWithdraw] = await Promise.all([
      prisma.withdrawrequest.aggregate({
        where: { status: "Released" },
        _sum: { withdrawAmount: true },
      }),
      prisma.withdrawrequest.aggregate({
        where: { status: "Released", created_at: { gte: start, lte: end } },
        _sum: { withdrawAmount: true },
      }),
    ]);

    const [totalDepositByStatus, todayDepositByStatus] = await Promise.all([
      prisma.payment.groupBy({ by: ["paymentStatus"], _sum: { amount: true } }),
      prisma.payment.groupBy({
        by: ["paymentStatus"],
        where: { created_at: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    const statuses = ["success", "failed", "pending"] as const;
    const normalize = (
      arr: { paymentStatus: string | null; _sum: { amount: number | null } }[]
    ) => {
      const m = Object.fromEntries(
        arr.map((x) => [x.paymentStatus ?? "Unknown", x._sum.amount])
      ) as Record<string, number | null | undefined>;
      return statuses.reduce((acc, s) => {
        acc[s] = Number(m[s] ?? 0);
        return acc;
      }, {} as Record<(typeof statuses)[number], number>);
    };

    const [pendingRequests, successRequests] = await Promise.all([
      prisma.astrologer_request.count({ where: { status: "Pending" } }),
      prisma.astrologer_request.count({ where: { status: "Assigned" } }),
    ]);

    const payload = {
      totalCallRequest,
      totalChatRequest,
      totalReportRequest,
      totalCustomer,
      totalActiveCustomer,
      todayCustomer,
      totalAstrologer,
      totalOrders,
      totalLiveAstro,
      totalLiveChat,
      totalLiveCall,
      totalRequest,
      totalCallCompleteRequest: {
        count: completedCalls.length,
        time: sumTotalMin(completedCalls),
      },
      totalChatComplteRequest: {
        count: completedChats.length,
        time: sumTotalMin(completedChats),
      },
      todayCallRequest,
      todayCallRequestReject,
      todayCallRequestTime: sumTotalMin(todayCallRequestList),
      todayChatRequest,
      todayChatRequestReject,
      todayChatRequestTime: sumTotalMin(todayChatRequestList),
      unverifiedAstrologer,
      totalEarning: Number(totalEarningResult._sum.amount ?? 0),
      todayEarning: Number(todayEarningResult._sum.amount ?? 0),
      totalAstroEarning: Number(totalAstroEarningResult._sum.amount ?? 0),
      todayAstroEarning: Number(todayAstroEarningResult._sum.amount ?? 0),
      totalWithdraw: Number(totalWithdraw._sum.withdrawAmount ?? 0),
      todayWithdraw: Number(todayWithdraw._sum.withdrawAmount ?? 0),
      totalDeposit: normalize(totalDepositByStatus),
      todayDeposit: normalize(todayDepositByStatus),
      pendingRequests,
      successRequests,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    console.error("overview error", err);
    return NextResponse.json(
      { error: "Failed to fetch overview" },
      { status: 500 }
    );
  }
}
