// // app/api/transactions/wallet/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// function fixBigInt(obj: any): any {
//   return JSON.parse(
//     JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v))
//   );
// }


// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;

//     // Pagination
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const skip = (page - 1) * limit;

//     // Filters
//     const transactionType = searchParams.get("transactionType") || undefined;
//     const isCredit = searchParams.get("isCredit");
//     const startDate = searchParams.get("startDate");
//     const endDate = searchParams.get("endDate");
//     const minAmount = searchParams.get("minAmount");
//     const maxAmount = searchParams.get("maxAmount");
//     const search = searchParams.get("search") || "";
//     const sortBy = searchParams.get("sortBy") || "created_at";
//     const sortOrder = searchParams.get("sortOrder") || "desc";

//     // Build where clause
//     const where: any = {};

//     if (transactionType) {
//       where.transactionType = transactionType;
//     }

//     if (isCredit !== null && isCredit !== undefined && isCredit !== "") {
//       where.isCredit = isCredit === "true";
//     }

//     if (startDate || endDate) {
//       where.created_at = {};
//       if (startDate) {
//         where.created_at.gte = new Date(startDate);
//       }
//       if (endDate) {
//         where.created_at.lte = new Date(endDate);
//       }
//     }

//     if (minAmount || maxAmount) {
//       where.amount = {};
//       if (minAmount) {
//         where.amount.gte = parseFloat(minAmount);
//       }
//       if (maxAmount) {
//         where.amount.lte = parseFloat(maxAmount);
//       }
//     }

//     // Search in user details
//     if (search) {
//       where.user = {
//         OR: [
//           { name: { contains: search, mode: "insensitive" } },
//           { email: { contains: search, mode: "insensitive" } },
//           { contactNo: { contains: search } },
//         ],
//       };
//     }

//     // Fetch transactions
//     const [transactions, totalCount] = await Promise.all([
//       prisma.wallettransaction.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { [sortBy]: sortOrder },
//         include: {
//           user: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               profile: true,
//               contactNo: true,
//             },
//           },
//           astrologer: {
//             select: {
//               id: true,
//               name: true,
//               profileImage: true,
//             },
//           },
//           ai_astrologer: {
//             select: {
//               id: true,
//               name: true,
//               image: true,
//             },
//           },
//           order_request: {
//             select: {
//               id: true,
//               orderType: true,
//               orderStatus: true,
//               totalPayable: true,
//             },
//           },
//         },
//       }),
//       prisma.wallettransaction.count({ where }),
//     ]);

//     // Calculate statistics
//     const stats = await prisma.wallettransaction.aggregate({
//       where,
//       _sum: {
//         amount: true,
//       },
//       _count: {
//         id: true,
//       },
//     });

//     const creditSum = await prisma.wallettransaction.aggregate({
//       where: { ...where, isCredit: true },
//       _sum: { amount: true },
//     });

//     const debitSum = await prisma.wallettransaction.aggregate({
//       where: { ...where, isCredit: false },
//       _sum: { amount: true },
//     });

// return NextResponse.json(
//   fixBigInt({
//     success: true,
//     data: transactions,
//     pagination: {
//       currentPage: page,
//       totalPages: Math.ceil(totalCount / limit),
//       totalItems: totalCount,
//       itemsPerPage: limit,
//     },
//     statistics: {
//       totalTransactions: stats._count.id,
//       totalAmount: stats._sum.amount || 0,
//       totalCredit: creditSum._sum.amount || 0,
//       totalDebit: debitSum._sum.amount || 0,
//       netAmount:
//         (creditSum._sum.amount || 0) - (debitSum._sum.amount || 0),
//     },
//   })
// );

//   } catch (error) {
//     console.error("Error fetching wallet transactions:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch wallet transactions",
//         error: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// app/api/transactions/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/client/client";

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
    
    // Sorting Validation
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

    // Date Filters
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        if (endDate.length <= 10) eDate.setHours(23, 59, 59, 999);
        where.created_at.lte = eDate;
      }
    }

    // Amount Filters
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }

    // Search Logic
    if (search) {
      where.OR = [
        { transaction_id: { contains: search } },
        {
          user: {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { contactNo: { contains: search } },
            ],
          },
        },
        // Also search in Order's user if direct user is null
        {
            order_request: {
                user: {
                    OR: [
                        { name: { contains: search } },
                        { email: { contains: search } },
                        { contactNo: { contains: search } },
                    ]
                }
            }
        }
      ];
    }

    // 1. Fetch transactions with nested user relation in order_request
    const [transactionsRaw, totalCount] = await Promise.all([
      prisma.wallettransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
              contactNo: true,
            },
          },
          astrologer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          ai_astrologer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          order_request: {
            select: {
              id: true,
              orderType: true,
              orderStatus: true,
              totalPayable: true,
              // 👇 IMPORTANT: Fetch User from Order Request as fallback
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profile: true,
                  contactNo: true,
                },
              },
            },
          },
        },
      }),
      prisma.wallettransaction.count({ where }),
    ]);

    // 2. Post-process: If direct user is missing, fill it from order_request.user
    const transactions = transactionsRaw.map((t) => {
      let finalUser = t.user;

      // Fallback: If no direct user, try to get user from the order
      if (!finalUser && t.order_request?.user) {
        finalUser = t.order_request.user;
      }

      return {
        ...t,
        user: finalUser, // Now frontend will receive the user object populated
      };
    });

    // Calculate statistics
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