// "use server"
// const prisma = require("../../prismaClient");

// export async function getWalletTransactions({
//   page = 1,
//   limit = 15,
//   search = "",
//   startDate,
//   endDate,
// }: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   startDate?: string;
//   endDate?: string;
// }) {

//   let startOfToday: Date | undefined;
//   let endOfToday: Date | undefined;

//   if (startDate) {
//     startOfToday = new Date(startDate);
//     startOfToday.setHours(0, 0, 0, 0);
//   }

//   if (endDate) {
//     endOfToday = new Date(endDate);
//     endOfToday.setHours(23, 59, 59, 999);
//   }


//   const isNumericSearch = /^\d+$/.test(search);
//   const isAlphaSearch = /[a-zA-Z]/.test(search);


//   const offset = (page - 1) * limit;
//   const baseWhere = {
//     ...(startDate && endDate && {
//       created_at: {
//         gte: new Date(startDate),
//         lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//       },
//     }),
//     ...(search &&
//       isAlphaSearch && {
//       name: { contains: search },
//     }),
//     ...(search &&
//       isNumericSearch && {
//       contactNo: { contains: search },
//     }),
//   };

//   const [records, totalCount] = await Promise.all([
//     prisma.wallettransaction.findMany({
//       skip: offset,
//       take: limit,
//       orderBy: { id: "desc" },
//       include: {
//         user: {
//           select: {
//             name: true,
//             profile: true
//           },
//         },
//       },
//     }),

//     prisma.wallettransaction.count({
//       where: baseWhere,
//     }),
//   ]);

//   return {
//     records,
//     total: totalCount,
//     totalPages: Math.ceil(totalCount / limit),
//     currentPage: page,
//   };
// }



// export async function getPaymentTransactions({
//   page = 1,
//   limit = 15,
//   search = "",
//   startDate,
//   endDate,
// }: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   startDate?: string;
//   endDate?: string;
// }) {

//   let startOfToday: Date | undefined;
//   let endOfToday: Date | undefined;

//   if (startDate) {
//     startOfToday = new Date(startDate);
//     startOfToday.setHours(0, 0, 0, 0);
//   }

//   if (endDate) {
//     endOfToday = new Date(endDate);
//     endOfToday.setHours(23, 59, 59, 999);
//   }


//   const isNumericSearch = /^\d+$/.test(search);
//   const isAlphaSearch = /[a-zA-Z]/.test(search);


//   const offset = (page - 1) * limit;
//   const baseWhere = {
//     ...(startDate && endDate && {
//       created_at: {
//         gte: new Date(startDate),
//         lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
//       },
//     }),
//     ...(search &&
//       isAlphaSearch && {
//       name: { contains: search },
//     }),
//     ...(search &&
//       isNumericSearch && {
//       contactNo: { contains: search },
//     }),
//   };

//   const [records, totalCount] = await Promise.all([
//     prisma.payment.findMany({
//       skip: offset,
//       take: limit,
//       orderBy: { id: "desc" },
//       include: {
//         user: {
//           select: {
//             name: true,
//             profile: true
//           },
//         },
//       },
//     }),

//     prisma.payment.count({
//       where: {
//         user: {
//           name:{ contains: search }, // search user name
//         },
//       },
//     }),
//   ]);

//   return {
//     records,
//     total: totalCount,
//     totalPages: Math.ceil(totalCount / limit),
//     currentPage: page,
//   };
// }


"use server"
const prisma = require("../../prismaClient");

export async function getWalletTransactions({
  page = 1,
  limit = 15,
  search = "",
  startDate,
  endDate,
}: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

  const offset = (page - 1) * limit;
  
  // Build the where clause properly
  const baseWhere = {
    ...(startDate && endDate && {
      created_at: {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      },
    }),
    ...(search && isAlphaSearch && {
      user: {
        name: { contains: search },
      },
    }),
    ...(search && isNumericSearch && {
      user: {
        contactNo: { contains: search },
      },
    }),
  };

  // Get paginated records, total count, and summary in parallel
  const [records, totalCount, summaryData] = await Promise.all([
    // Paginated records with proper where clause
    prisma.wallettransaction.findMany({
      skip: offset,
      take: limit,
      where: baseWhere,
      orderBy: { id: "desc" },
      include: {
        user: {
          select: {
            name: true,
            profile: true,
            contactNo: true,
          },
        },
      },
    }),

    // Total count with same where clause
    prisma.wallettransaction.count({
      where: baseWhere,
    }),

    // Summary aggregation for all matching records (not paginated)
    prisma.wallettransaction.aggregate({
      where: baseWhere,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Calculate separate credit and debit totals
  const [creditSum, debitSum] = await Promise.all([
    prisma.wallettransaction.aggregate({
      where: {
        ...baseWhere,
        isCredit: true,
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.wallettransaction.aggregate({
      where: {
        ...baseWhere,
        isCredit: false,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const summary = {
    totalCredits: Number(creditSum._sum.amount || 0),
    totalDebits: Number(debitSum._sum.amount || 0),
    totalTransactions: summaryData._count.id,
  };

  return {
    records,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    summary, // Add summary here
  };
}

export async function getPaymentTransactions({
  page = 1,
  limit = 15,
  search = "",
  startDate,
  endDate,
}: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const isNumericSearch = /^\d+$/.test(search);
  const isAlphaSearch = /[a-zA-Z]/.test(search);

  const offset = (page - 1) * limit;
  
  const baseWhere = {
    ...(startDate && endDate && {
      created_at: {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      },
    }),
    ...(search && isAlphaSearch && {
      user: {
        name: { contains: search },
      },
    }),
    ...(search && isNumericSearch && {
      user: {
        contactNo: { contains: search },
      },
    }),
  };

  const [records, totalCount] = await Promise.all([
    prisma.payment.findMany({
      skip: offset,
      take: limit,
      where: baseWhere, // Fixed: use baseWhere instead of no where clause
      orderBy: { id: "desc" },
      include: {
        user: {
          select: {
            name: true,
            profile: true,
            contactNo: true,
          },
        },
      },
    }),

    prisma.payment.count({
      where: baseWhere, // Fixed: use baseWhere for consistent filtering
    }),
  ]);

  return {
    records,
    total: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}