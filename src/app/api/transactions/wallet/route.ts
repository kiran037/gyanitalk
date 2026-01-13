import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/client/client";

// Helper to handle BigInt serialization
function fixBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filters
    const transactionType = searchParams.get("transactionType");
    const isCredit = searchParams.get("isCredit");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const search = searchParams.get("search") || "";
    
    // Sorting
    const sortByParam = searchParams.get("sortBy") || "created_at";
    const sortOrderParam = searchParams.get("sortOrder") || "desc";
    const validSortFields = ["created_at", "amount", "id"];
    const sortBy = validSortFields.includes(sortByParam) ? sortByParam : "created_at";
    const sortOrder: Prisma.SortOrder = sortOrderParam === "asc" ? "asc" : "desc";

    // Build where clause
    const where: Prisma.wallettransactionWhereInput = {};

    if (transactionType) where.transactionType = transactionType;
    if (isCredit !== null && isCredit !== undefined && isCredit !== "") {
      where.isCredit = isCredit === "true";
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        if (endDate.length <= 10) eDate.setHours(23, 59, 59, 999);
        where.created_at.lte = eDate;
      }
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }

    if (search) {
      where.OR = [
        { transaction_id: { contains: search } },
        { user: { OR: [{ name: { contains: search } }, { email: { contains: search } }, { contactNo: { contains: search } }] } },
        { order_request: { user: { OR: [{ name: { contains: search } }, { email: { contains: search } }, { contactNo: { contains: search } }] } } }
      ];
    }

    // 1. Fetch transactions (Get IDs primarily to avoid relation mapping issues)
    const [transactionsRaw, totalCount] = await Promise.all([
      prisma.wallettransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          // We only fetch the nested IDs we need for manual lookup
          order_request: {
            select: {
              id: true,
              userId: true, // Vital: Get the User ID from the order
              orderType: true,
              orderStatus: true,
              totalPayable: true,
            },
          },
        },
      }),
      prisma.wallettransaction.count({ where }),
    ]);

    // 2. Extract IDs for Manual Fetching
    const userIds = new Set<string>();
    const astrologerIds = new Set<string>();
    const aiAstrologerIds = new Set<string>();

    transactionsRaw.forEach(t => {
      // Logic: Prefer direct userId, fallback to order_request.userId
      if (t.userId) {
        userIds.add(t.userId.toString());
      } else if (t.order_request?.userId) {
        userIds.add(t.order_request.userId.toString());
      }

      if (t.astrologerId) astrologerIds.add(t.astrologerId.toString());
      if (t.aiAstrologerId) aiAstrologerIds.add(t.aiAstrologerId.toString());
    });

    // 3. Manual Fetch - USERS
    const userMap = new Map();
    if (userIds.size > 0) {
      const users = await prisma.users.findMany({
        where: { id: { in: Array.from(userIds).map(id => BigInt(id)) } },
        select: {
          id: true,
          name: true,
          email: true,
          profile: true, // Correct column for User table
          contactNo: true,
        }
      });
      users.forEach(u => userMap.set(u.id.toString(), u));
    }

    // 4. Manual Fetch - ASTROLOGERS
    const astroMap = new Map();
    if (astrologerIds.size > 0) {
      const astros = await prisma.astrologers.findMany({
        where: { id: { in: Array.from(astrologerIds).map(id => BigInt(id)) } },
        select: {
          id: true,
          name: true,
          profileImage: true, // Correct column for Astrologer table
        }
      });
      astros.forEach(a => astroMap.set(a.id.toString(), a));
    }

    // 5. Manual Fetch - AI ASTROLOGERS
    const aiAstroMap = new Map();
    if (aiAstrologerIds.size > 0) {
      const aiAstros = await prisma.aiastrologers.findMany({
        where: { id: { in: Array.from(aiAstrologerIds).map(id => BigInt(id)) } },
        select: {
          id: true,
          name: true,
          image: true, // Correct column for AI Astro table
        }
      });
      aiAstros.forEach(a => aiAstroMap.set(a.id.toString(), a));
    }

    // 6. Stitch Data Together
    const transactions = transactionsRaw.map((t) => {
      // Resolve User
      let userIdStr = t.userId?.toString();
      if (!userIdStr && t.order_request?.userId) {
        userIdStr = t.order_request.userId.toString();
      }
      
      const userObj = userIdStr ? userMap.get(userIdStr) : null;
      
      // Resolve Astrologers
      const astroObj = t.astrologerId ? astroMap.get(t.astrologerId.toString()) : null;
      const aiAstroObj = t.aiAstrologerId ? aiAstroMap.get(t.aiAstrologerId.toString()) : null;

      return {
        ...t,
        // Attach the manually fetched objects
        user: userObj || { 
            name: "Unknown User", 
            profile: null, 
            email: "N/A" 
        },
        astrologer: astroObj,
        ai_astrologer: aiAstroObj
      };
    });

    // Statistics
    const stats = await prisma.wallettransaction.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true },
    });

    const creditSum = await prisma.wallettransaction.aggregate({
      where: { ...where, isCredit: true },
      _sum: { amount: true },
    });

    const debitSum = await prisma.wallettransaction.aggregate({
      where: { ...where, isCredit: false },
      _sum: { amount: true },
    });

    return NextResponse.json(
      fixBigInt({
        success: true,
        data: transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
        },
        statistics: {
          totalTransactions: stats._count.id,
          totalAmount: stats._sum.amount || 0,
          totalCredit: creditSum._sum.amount || 0,
          totalDebit: debitSum._sum.amount || 0,
          netAmount: (creditSum._sum.amount || 0) - (debitSum._sum.amount || 0),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch wallet transactions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}