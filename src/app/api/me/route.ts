//src/app/api/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";

// --- Helper: BigInt/Decimal Serializer ---
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (typeof obj === "object" && (obj as any).constructor?.name === "Decimal") {
    return Number((obj as any).toString());
  }
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);
  if (typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = convertPrismaTypes(v);
    }
    return out;
  }
  return obj;
}

// --- Helper: Auth Check ---
async function getSession(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;
  try {
    return await verifyUserJWT(token);
  } catch (e) {
    return null;
  }
}

/**
 * GET /api/me
 * Returns: User Profile, Roles, Wallet Balance, and Activity Stats
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = BigInt(session.userId);

    // 1. Fetch User + Wallet + Roles + Astrologer Status
    const user = await prisma.users.findUnique({
      where: { id: userId, isDelete: false },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        countryCode: true,
        birthDate: true,
        birthTime: true,
        birthPlace: true,
        gender: true,
        profile: true,
        addressLine1: true,
        addressLine2: true,
        location: true,
        pincode: true,
        isActive: true,
        created_at: true,
        
        // Relations
        userRoles: {
          select: {
            role: { select: { id: true, name: true, isActive: true } },
          },
        },
        user_wallets: {
          select: { amount: true },
          take: 1, // Get the primary wallet
        },
        astrologers: {
          select: { id: true, isVerified: true },
          take: 1, // Check if linked to astrologer table
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 2. Fetch Activity Counts (Parallel for performance)
    const [ordersCount, ticketsCount, reviewsCount] = await Promise.all([
      prisma.order_request.count({ where: { userId: userId } }),
      prisma.tickets.count({ where: { userId: userId } }),
      prisma.user_reviews.count({ where: { userId: userId } }),
    ]);

    // 3. Process Data
    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id.toString(),
      name: ur.role.name,
      isActive: ur.role.isActive,
    }));

    // Determine flags
    const isAstrologer = roles.some((r) => r.name.toLowerCase() === "astrologer") || user.astrologers.length > 0;
    const isAdmin = roles.some((r) => r.name.toLowerCase().includes("admin"));
    
    // Get Wallet Balance (Handle nulls)
    const walletBalance = user.user_wallets[0]?.amount || 0;

    // 4. Construct Response
    const responseData = {
      // Identity
      id: user.id.toString(),
      name: user.name || "User",
      email: user.email,
      contactNo: user.contactNo,
      countryCode: user.countryCode,
      profile: user.profile,
      
      // Details
      gender: user.gender,
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      location: user.location,
      addressLine1: user.addressLine1,
      
      // System Data
      isActive: user.isActive,
      createdAt: user.created_at,
      loginAt: session.loginAt || user.created_at, // Provided by verifyUserJWT if available
      
      // Computed
      roles,
      isAstrologer,
      isAdmin,
      walletBalance: walletBalance.toString(),
      
      // Activity Stats
      stats: {
        totalOrders: ordersCount,
        totalTickets: ticketsCount,
        totalReviews: reviewsCount,
      }
    };

    return NextResponse.json({
      success: true,
      data: convertPrismaTypes(responseData),
    });

  } catch (error: any) {
    console.error("GET /api/me error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/me
 * Update basic profile fields
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = BigInt(session.userId);
    const body = await request.json();

    // Whitelist allowed fields to prevent overwriting sensitive data (like balance/roles)
    const allowedFields = [
      "name", "gender", "birthDate", "birthTime", "birthPlace", 
      "location", "addressLine1", "addressLine2", "pincode"
    ];

    const updates: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Handle Date conversion
        if (field === "birthDate" && body[field]) {
          updates[field] = new Date(body[field]);
        } else {
          updates[field] = body[field];
        }
      }
    }

    // Implicit update
    updates.updated_at = new Date();

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        name: true,
        gender: true,
        birthDate: true,
        location: true,
        updated_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: convertPrismaTypes(updatedUser),
    });

  } catch (error: any) {
    console.error("PATCH /api/me error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}