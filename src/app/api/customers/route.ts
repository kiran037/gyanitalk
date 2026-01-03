// // src/app/api/customers/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { Prisma } from "@prisma/client";

// // Types
// interface CustomerFilters {
//   page?: number;
//   limit?: number;
//   search?: string;
//   status?: "all" | "active" | "inactive" | "deleted";
//   gender?: string;
//   minBalance?: number;
//   maxBalance?: number;
//   location?: string;
//   startDate?: string;
//   endDate?: string;
//   sortBy?: "name" | "joinDate" | "balance" | "birthDate";
//   sortOrder?: "asc" | "desc";
//   searchForWallet?: boolean; // For "Add Money" popup search
// }

// // GET: List customers with filters, search, sort, pagination
// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;

//     // Parse query parameters
//     const filters: CustomerFilters = {
//       page: parseInt(searchParams.get("page") || "1"),
//       limit: parseInt(searchParams.get("limit") || "50"),
//       search: searchParams.get("search") || undefined,
//       status: (searchParams.get("status") as any) || "all",
//       gender: searchParams.get("gender") || undefined,
//       minBalance: searchParams.get("minBalance")
//         ? parseFloat(searchParams.get("minBalance")!)
//         : undefined,
//       maxBalance: searchParams.get("maxBalance")
//         ? parseFloat(searchParams.get("maxBalance")!)
//         : undefined,
//       location: searchParams.get("location") || undefined,
//       startDate: searchParams.get("startDate") || undefined,
//       endDate: searchParams.get("endDate") || undefined,
//       sortBy: (searchParams.get("sortBy") as any) || "joinDate",
//       sortOrder: (searchParams.get("sortOrder") as any) || "desc",
//       searchForWallet: searchParams.get("searchForWallet") === "true",
//     };

//     // If this is a wallet search request (for Add Money popup)
//     if (filters.searchForWallet && filters.search) {
//       return await handleWalletSearch(filters.search);
//     }

//     // Build where clause for main query
//     const whereClause: Prisma.usersWhereInput = buildWhereClause(filters);

//     // Calculate offset for pagination
//     const skip = ((filters.page || 1) - 1) * (filters.limit || 50);

//     // Get total count (for pagination)
//     const totalCount = await prisma.users.count({ where: whereClause });

//     // Build orderBy clause
//     const orderBy = buildOrderByClause(filters);

//     // Fetch users with pagination
//     const users = await prisma.users.findMany({
//       where: whereClause,
//       include: {
//         user_wallets: {
//           select: {
//             amount: true,
//           },
//         },
//       },
//       orderBy,
//       skip,
//       take: filters.limit || 50,
//     });

//     // Calculate stats (only if first page or no pagination)
//     const stats = await calculateStats();

//     // Format response
//     const formattedUsers = users.map((user) => ({
//       id: user.id.toString(),
//       name: user.name || "N/A",
//       contactNo: user.contactNo || "N/A",
//       countryCode: user.countryCode || "+91",
//       email: user.email || "N/A",
//       gender: user.gender || "N/A",
//       birthDate: user.birthDate,
//       birthTime: user.birthTime || "N/A",
//       joinDate: user.created_at,
//       walletBalance:
//         user.user_wallets[0]?.amount?.toString() || "0.00",
//       isActive: user.isActive,
//       isDelete: user.isDelete,
//       location: user.location || "N/A",
//       profile: user.profile || "default-avatar.svg",
//     }));

//     return NextResponse.json({
//       success: true,
//       data: {
//         users: formattedUsers,
//         pagination: {
//           currentPage: filters.page || 1,
//           totalPages: Math.ceil(totalCount / (filters.limit || 50)),
//           totalCount,
//           perPage: filters.limit || 50,
//         },
//         stats,
//       },
//     });
//   } catch (error: any) {
//     console.error("Error fetching customers:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch customers",
//         message: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// // POST: Add new customer
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     // Validate required fields
//     if (!body.name || !body.contactNo) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Name and contact number are required",
//         },
//         { status: 400 }
//       );
//     }

//     // Check if user already exists
//     const existingUser = await prisma.users.findFirst({
//       where: {
//         contactNo: body.contactNo,
//         isDelete: false,
//       },
//     });

//     if (existingUser) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "User with this contact number already exists",
//         },
//         { status: 409 }
//       );
//     }

//     // Create new user
//     const newUser = await prisma.users.create({
//       data: {
//         name: body.name,
//         contactNo: body.contactNo,
//         countryCode: body.countryCode || "+91",
//         email: body.email || null,
//         gender: body.gender || null,
//         birthDate: body.birthDate ? new Date(body.birthDate) : null,
//         birthTime: body.birthTime || null,
//         birthPlace: body.birthPlace || null,
//         password: body.password || null,
//         profile: body.profile || null,
//         isActive: true,
//         isDelete: false,
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     });

//     // Create wallet for new user
//     await prisma.user_wallets.create({
//       data: {
//         userId: newUser.id,
//         amount: 0,
//         isActive: true,
//         isDelete: false,
//         createdBy: 0, // Replace with actual admin ID
//         modifiedBy: 0, // Replace with actual admin ID
//         created_at: new Date(),
//         updated_at: new Date(),
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Customer added successfully",
//       data: {
//         id: newUser.id.toString(),
//         name: newUser.name,
//         contactNo: newUser.contactNo,
//         email: newUser.email,
//       },
//     });
//   } catch (error: any) {
//     console.error("Error adding customer:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to add customer",
//         message: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// // Helper: Build WHERE clause for filtering
// function buildWhereClause(filters: CustomerFilters): Prisma.usersWhereInput {
//   const where: Prisma.usersWhereInput = {
//     AND: [],
//   };

//   // Status filter
//   if (filters.status === "active") {
//     where.isActive = true;
//     where.isDelete = false;
//   } else if (filters.status === "inactive") {
//     where.isActive = false;
//     where.isDelete = false;
//   } else if (filters.status === "deleted") {
//     where.isDelete = true;
//   } else {
//     // "all" - no status filter, but exclude soft-deleted by default
//     where.isDelete = false;
//   }

//   // Search filter (name, phone, email, user ID) - MySQL is case-insensitive by default
// if (filters.search) {
//   const orConditions: any[] = [
//     { name: { contains: filters.search } },
//     { contactNo: { contains: filters.search } },
//     { email: { contains: filters.search } },
//   ];

//   if (!isNaN(Number(filters.search))) {
//     orConditions.push({ id: BigInt(filters.search) });
//   }

//   where.OR = orConditions;
// }


//   // Gender filter
//   if (filters.gender && filters.gender !== "all") {
//     where.gender = filters.gender;
//   }

//   // Location filter (MySQL is case-insensitive by default)
//   if (filters.location) {
//     where.location = { contains: filters.location };
//   }

//   // Date range filter (registration date)
//   if (filters.startDate || filters.endDate) {
//     where.created_at = {};
//     if (filters.startDate) {
//       where.created_at.gte = new Date(filters.startDate);
//     }
//     if (filters.endDate) {
//       where.created_at.lte = new Date(filters.endDate);
//     }
//   }

//   // Balance range filter (using user_wallets relation)
//   if (filters.minBalance !== undefined || filters.maxBalance !== undefined) {
//     const amountFilter: any = {};
    
//     if (filters.minBalance !== undefined) {
//       amountFilter.gte = filters.minBalance;
//     }
//     if (filters.maxBalance !== undefined) {
//       amountFilter.lte = filters.maxBalance;
//     }

//     where.user_wallets = {
//       some: {
//         amount: amountFilter,
//       },
//     };
//   }

//   return where;
// }

// // Helper: Build ORDER BY clause for sorting
// function buildOrderByClause(
//   filters: CustomerFilters
// ): Prisma.usersOrderByWithRelationInput {
//   const sortOrder = filters.sortOrder || "desc";

//   switch (filters.sortBy) {
//     case "name":
//       return { name: sortOrder };
//     case "balance":
//       return { user_wallets: { _count: sortOrder } }; // Sort by wallet count as proxy
//     case "birthDate":
//       return { birthDate: sortOrder };
//     case "joinDate":
//     default:
//       return { created_at: sortOrder };
//   }
// }

// // Helper: Calculate stats for dashboard cards
// async function calculateStats() {
//   const now = new Date();
//   const startOfToday = new Date(now.setHours(0, 0, 0, 0));

//   // Total users (active, not deleted)
//   const totalUsers = await prisma.users.count({
//     where: {
//       isActive: true,
//       isDelete: false,
//     },
//   });

//   // Active users
//   const activeUsers = await prisma.users.count({
//     where: {
//       isActive: true,
//       isDelete: false,
//     },
//   });

//   // New users today
//   const newToday = await prisma.users.count({
//     where: {
//       created_at: {
//         gte: startOfToday,
//       },
//       isDelete: false,
//     },
//   });

//   // Total wallet balance
//   const walletSum = await prisma.user_wallets.aggregate({
//     _sum: {
//       amount: true,
//     },
//     where: {
//       isActive: true,
//       isDelete: false,
//     },
//   });

//   return {
//     totalUsers,
//     activeUsers,
//     newToday,
//     totalWalletBalance: walletSum._sum.amount?.toString() || "0",
//   };
// }

// async function handleWalletSearch(searchTerm: string) {
//   try {
//     // Build OR conditions safely (only include id if numeric)
//     const orConditions: any[] = [
//       { name: { contains: searchTerm } },         // removed mode
//       { contactNo: { contains: searchTerm } },
//       { email: { contains: searchTerm } },        // removed mode
//     ];

//     // add id filter only if searchTerm is numeric
//     if (!isNaN(Number(searchTerm))) {
//       orConditions.push({ id: BigInt(searchTerm) });
//     }

//     const users = await prisma.users.findMany({
//       where: {
//         isDelete: false,
//         OR: orConditions,
//       },
//       include: {
//         user_wallets: {
//           select: {
//             amount: true,
//           },
//         },
//       },
//       take: 10, // Limit to 10 results for popup
//       orderBy: {
//         name: "asc",
//       },
//     });

//     const formattedUsers = users.map((user) => ({
//       id: user.id.toString(),
//       name: user.name || "N/A",
//       email: user.email || "N/A",
//       contactNo: user.contactNo || "N/A",
//       countryCode: user.countryCode || "+91",
//       currentBalance: user.user_wallets[0]?.amount?.toString() || "0.00",
//     }));

//     return NextResponse.json({
//       success: true,
//       data: { users: formattedUsers },
//     });
//   } catch (error: any) {
//     console.error("Error in wallet search:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to search users", message: error.message },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Types
interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "inactive" | "deleted";
  gender?: string;
  minBalance?: number;
  maxBalance?: number;
  location?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "name" | "joinDate" | "balance" | "birthDate";
  sortOrder?: "asc" | "desc";
  searchForWallet?: boolean;
}

// GET: List customers with filters, search, sort, pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const filters: CustomerFilters = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
      search: searchParams.get("search") || undefined,
      status: (searchParams.get("status") as any) || "all",
      gender: searchParams.get("gender") || undefined,
      minBalance: searchParams.get("minBalance")
        ? parseFloat(searchParams.get("minBalance")!)
        : undefined,
      maxBalance: searchParams.get("maxBalance")
        ? parseFloat(searchParams.get("maxBalance")!)
        : undefined,
      location: searchParams.get("location") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "joinDate",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
      searchForWallet: searchParams.get("searchForWallet") === "true",
    };

    // If this is a wallet search request (for Add Money popup)
    if (filters.searchForWallet && filters.search) {
      return await handleWalletSearch(filters.search);
    }

    // Build where clause for main query
    const whereClause: Prisma.usersWhereInput = buildWhereClause(filters);

    // Calculate offset for pagination
    const skip = ((filters.page || 1) - 1) * (filters.limit || 50);

    // Get total count (for pagination)
    const totalCount = await prisma.users.count({ where: whereClause });

    // Build orderBy clause
    const orderBy = buildOrderByClause(filters);

    // Fetch users with pagination
    const users = await prisma.users.findMany({
      where: whereClause,
      include: {
        user_wallets: {
          select: {
            amount: true,
          },
        },
      },
      orderBy,
      skip,
      take: filters.limit || 50,
    });

    // Calculate stats (only if first page or no pagination)
    const stats = await calculateStats();

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.id.toString(),
      name: user.name || "N/A",
      contactNo: user.contactNo || "N/A",
      countryCode: user.countryCode || "+91",
      email: user.email || "N/A",
      gender: user.gender || "N/A",
      birthDate: user.birthDate,
      birthTime: user.birthTime || "N/A",
      joinDate: user.created_at,
      walletBalance: user.user_wallets[0]?.amount?.toString() || "0.00",
      isActive: user.isActive,
      isDelete: user.isDelete,
      location: user.location || "N/A",
      profile: user.profile || "default-avatar.svg",
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          currentPage: filters.page || 1,
          totalPages: Math.ceil(totalCount / (filters.limit || 50)),
          totalCount,
          perPage: filters.limit || 50,
        },
        stats,
      },
    });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customers",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: Add new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.contactNo) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and contact number are required",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        contactNo: body.contactNo,
        isDelete: false,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this contact number already exists",
        },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await prisma.users.create({
      data: {
        name: body.name,
        contactNo: body.contactNo,
        countryCode: body.countryCode || "+91",
        email: body.email || null,
        gender: body.gender || null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        birthTime: body.birthTime || null,
        birthPlace: body.birthPlace || null,
        password: body.password || null,
        profile: body.profile || null,
        isActive: true,
        isDelete: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create wallet for new user
    await prisma.user_wallets.create({
      data: {
        userId: newUser.id,
        amount: 0,
        isActive: true,
        isDelete: false,
        createdBy: 0,
        modifiedBy: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // NOTE: If you have a specific Role ID for "Customer", you should likely assign it here
    // inside the user_roles table, otherwise they have no role.

    return NextResponse.json({
      success: true,
      message: "Customer added successfully",
      data: {
        id: newUser.id.toString(),
        name: newUser.name,
        contactNo: newUser.contactNo,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error("Error adding customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add customer",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Helper: Build WHERE clause for filtering
function buildWhereClause(filters: CustomerFilters): Prisma.usersWhereInput {
  const where: Prisma.usersWhereInput = {
    AND: [
      // ✅ ADDED: Filter to exclude Admins (1) and Astrologers (2)
      {
        userRoles: {
          none: {
            roleId: {
              in: [1, 2],
            },
          },
        },
      },
    ],
  };

  // Status filter
  if (filters.status === "active") {
    where.isActive = true;
    where.isDelete = false;
  } else if (filters.status === "inactive") {
    where.isActive = false;
    where.isDelete = false;
  } else if (filters.status === "deleted") {
    where.isDelete = true;
  } else {
    // "all" - no status filter, but exclude soft-deleted by default
    where.isDelete = false;
  }

  // Search filter
  if (filters.search) {
    const orConditions: any[] = [
      { name: { contains: filters.search } },
      { contactNo: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];

    if (!isNaN(Number(filters.search))) {
      orConditions.push({ id: BigInt(filters.search) });
    }

    where.OR = orConditions;
  }

  // Gender filter
  if (filters.gender && filters.gender !== "all") {
    where.gender = filters.gender;
  }

  // Location filter
  if (filters.location) {
    where.location = { contains: filters.location };
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    where.created_at = {};
    if (filters.startDate) {
      where.created_at.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.created_at.lte = new Date(filters.endDate);
    }
  }

  // Balance range filter
  if (filters.minBalance !== undefined || filters.maxBalance !== undefined) {
    const amountFilter: any = {};

    if (filters.minBalance !== undefined) {
      amountFilter.gte = filters.minBalance;
    }
    if (filters.maxBalance !== undefined) {
      amountFilter.lte = filters.maxBalance;
    }

    where.user_wallets = {
      some: {
        amount: amountFilter,
      },
    };
  }

  return where;
}

// Helper: Build ORDER BY clause for sorting
function buildOrderByClause(
  filters: CustomerFilters
): Prisma.usersOrderByWithRelationInput {
  const sortOrder = filters.sortOrder || "desc";

  switch (filters.sortBy) {
    case "name":
      return { name: sortOrder };
    case "balance":
      return { user_wallets: { _count: sortOrder } };
    case "birthDate":
      return { birthDate: sortOrder };
    case "joinDate":
    default:
      return { created_at: sortOrder };
  }
}

// Helper: Calculate stats for dashboard cards
async function calculateStats() {
  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));

  // ✅ Common filter for all stats to exclude Admins/Astrologers
  const roleFilter: Prisma.usersWhereInput = {
    userRoles: {
      none: { roleId: { in: [1, 2] } },
    },
  };

  // Total users (active, not deleted)
  const totalUsers = await prisma.users.count({
    where: {
      isActive: true,
      isDelete: false,
      ...roleFilter, // Apply filter
    },
  });

  // Active users
  const activeUsers = await prisma.users.count({
    where: {
      isActive: true,
      isDelete: false,
      ...roleFilter, // Apply filter
    },
  });

  // New users today
  const newToday = await prisma.users.count({
    where: {
      created_at: {
        gte: startOfToday,
      },
      isDelete: false,
      ...roleFilter, // Apply filter
    },
  });

  // Total wallet balance (of customers only)
  const walletSum = await prisma.user_wallets.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      isActive: true,
      isDelete: false,
      user: {
        ...roleFilter, // Apply user role filter inside wallet query
      },
    },
  });

  return {
    totalUsers,
    activeUsers,
    newToday,
    totalWalletBalance: walletSum._sum.amount?.toString() || "0",
  };
}

async function handleWalletSearch(searchTerm: string) {
  try {
    const orConditions: any[] = [
      { name: { contains: searchTerm } },
      { contactNo: { contains: searchTerm } },
      { email: { contains: searchTerm } },
    ];

    if (!isNaN(Number(searchTerm))) {
      orConditions.push({ id: BigInt(searchTerm) });
    }

    const users = await prisma.users.findMany({
      where: {
        isDelete: false,
        OR: orConditions,
        // ✅ ADDED: Filter to exclude Admins (1) and Astrologers (2)
        userRoles: {
          none: {
            roleId: {
              in: [1, 2],
            },
          },
        },
      },
      include: {
        user_wallets: {
          select: {
            amount: true,
          },
        },
      },
      take: 10,
      orderBy: {
        name: "asc",
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id.toString(),
      name: user.name || "N/A",
      email: user.email || "N/A",
      contactNo: user.contactNo || "N/A",
      countryCode: user.countryCode || "+91",
      currentBalance: user.user_wallets[0]?.amount?.toString() || "0.00",
    }));

    return NextResponse.json({
      success: true,
      data: { users: formattedUsers },
    });
  } catch (error: any) {
    console.error("Error in wallet search:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search users",
        message: error.message,
      },
      { status: 500 }
    );
  }
}