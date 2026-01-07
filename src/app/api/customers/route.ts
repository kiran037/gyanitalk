//Users/xeoren/Desktop/gyanitallk-admin/src/app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/client/client";

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

// GET: List customers
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

    if (filters.searchForWallet && filters.search) {
      return await handleWalletSearch(filters.search);
    }

    const whereClause: Prisma.usersWhereInput = buildWhereClause(filters);
    const skip = ((filters.page || 1) - 1) * (filters.limit || 50);

    const totalCount = await prisma.users.count({ where: whereClause });
    const orderBy = buildOrderByClause(filters);

    // ✅ FIX: Use 'select' instead of 'include' to fetch ONLY existing columns
    // This ignores 'email_verified' so the app doesn't crash if the DB is outdated.
    const users = await prisma.users.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        contactNo: true,
        countryCode: true,
        email: true,
        gender: true,
        birthDate: true,
        birthTime: true,
        created_at: true,
        isActive: true,
        isDelete: true,
        location: true,
        profile: true,
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

    const stats = await calculateStats();

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.id.toString(), // Handle BigInt
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

    if (!body.name || !body.contactNo) {
      return NextResponse.json(
        { success: false, error: "Name and contact number are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        contactNo: body.contactNo,
        isDelete: false,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this contact number already exists" },
        { status: 409 }
      );
    }

    // ✅ FIX: Do NOT include 'email_verified' here to avoid crashes on outdated DBs
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

    return NextResponse.json({
      success: true,
      message: "Customer added successfully",
      data: {
        id: newUser.id.toString(), // Serialize BigInt
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

// Helper: Build WHERE clause
function buildWhereClause(filters: CustomerFilters): Prisma.usersWhereInput {
  const where: Prisma.usersWhereInput = {
    AND: [
      {
        userRoles: {
          none: {
            roleId: { in: [1, 2] },
          },
        },
      },
    ],
  };

  if (filters.status === "active") {
    where.isActive = true;
    where.isDelete = false;
  } else if (filters.status === "inactive") {
    where.isActive = false;
    where.isDelete = false;
  } else if (filters.status === "deleted") {
    where.isDelete = true;
  } else {
    where.isDelete = false;
  }

  if (filters.search) {
    const orConditions: Prisma.usersWhereInput[] = [
      { name: { contains: filters.search } },
      { contactNo: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];
    if (!isNaN(Number(filters.search))) {
      try { orConditions.push({ id: BigInt(filters.search) }); } catch (e) {}
    }
    where.OR = orConditions;
  }

  if (filters.gender && filters.gender !== "all") where.gender = filters.gender;
  if (filters.location) where.location = { contains: filters.location };

  if (filters.startDate || filters.endDate) {
    where.created_at = {};
    if (filters.startDate) where.created_at.gte = new Date(filters.startDate);
    if (filters.endDate) where.created_at.lte = new Date(filters.endDate);
  }

  if (filters.minBalance !== undefined || filters.maxBalance !== undefined) {
    const amountFilter: Prisma.DecimalFilter = {};
    if (filters.minBalance !== undefined) amountFilter.gte = new Prisma.Decimal(filters.minBalance);
    if (filters.maxBalance !== undefined) amountFilter.lte = new Prisma.Decimal(filters.maxBalance);
    where.user_wallets = { some: { amount: amountFilter } };
  }

  return where;
}

// Helper: Build ORDER BY clause
function buildOrderByClause(filters: CustomerFilters): Prisma.usersOrderByWithRelationInput {
  const sortOrder = filters.sortOrder || "desc";
  switch (filters.sortBy) {
    case "name": return { name: sortOrder };
    case "balance": return { user_wallets: { _count: sortOrder } };
    case "birthDate": return { birthDate: sortOrder };
    case "joinDate":
    default: return { created_at: sortOrder };
  }
}

// Helper: Calculate stats
async function calculateStats() {
  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));

  const roleFilter: Prisma.usersWhereInput = {
    userRoles: { none: { roleId: { in: [1, 2] } } },
  };

  const totalUsers = await prisma.users.count({
    where: { isActive: true, isDelete: false, ...roleFilter },
  });

  const activeUsers = await prisma.users.count({
    where: { isActive: true, isDelete: false, ...roleFilter },
  });

  const newToday = await prisma.users.count({
    where: { created_at: { gte: startOfToday }, isDelete: false, ...roleFilter },
  });

  const walletSum = await prisma.user_wallets.aggregate({
    _sum: { amount: true },
    where: { isActive: true, isDelete: false, user: { ...roleFilter } },
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
    const orConditions: Prisma.usersWhereInput[] = [
      { name: { contains: searchTerm } },
      { contactNo: { contains: searchTerm } },
      { email: { contains: searchTerm } },
    ];
    if (!isNaN(Number(searchTerm))) {
      try { orConditions.push({ id: BigInt(searchTerm) }); } catch (e) {}
    }

    // ✅ FIX: Explicit select here as well
    const users = await prisma.users.findMany({
      where: {
        isDelete: false,
        OR: orConditions,
        userRoles: { none: { roleId: { in: [1, 2] } } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        countryCode: true,
        user_wallets: {
          select: { amount: true },
        },
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id.toString(),
      name: user.name || "N/A",
      email: user.email || "N/A",
      contactNo: user.contactNo || "N/A",
      countryCode: user.countryCode || "+91",
      currentBalance: user.user_wallets[0]?.amount?.toString() || "0.00",
    }));

    return NextResponse.json({ success: true, data: { users: formattedUsers } });
  } catch (error: any) {
    console.error("Error in wallet search:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search users", message: error.message },
      { status: 500 }
    );
  }
}