// // app/api/landing/profile/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { verifySession } from "@/lib/auth/session";
// import { getUserProfile, serializeProfile } from "@/lib/profile/index";


// export async function GET(request: NextRequest) {
//   try {
//     // Get session token from cookie or header
//     const sessionToken =
//       request.cookies.get("session_token")?.value ||
//       request.headers.get("authorization")?.replace("Bearer ", "");

//     if (!sessionToken) {
//       return NextResponse.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Verify session
//     const session = await verifySession(sessionToken);
//     if (!session.valid || !session.userId) {
//       return NextResponse.json(
//         { success: false, error: "Invalid session" },
//         { status: 401 }
//       );
//     }

//     // Get profile
//     const profile = await getUserProfile(session.userId);

//     if (!profile) {
//       return NextResponse.json(
//         { success: false, error: "Profile not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: serializeProfile(profile),
//     });
//   } catch (error) {
//     console.error("Get profile error:", error);
//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// app/api/landing/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";

// Helper: Robust session extraction
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
 * GET /api/landing/profile
 * Fetch complete user profile + Stats + Wallet
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify Session
    const session = await getSession(request);
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = BigInt(session.userId);

    // 2. Fetch User Data & Wallet
    const user = await prisma.users.findUnique({
      where: { 
        id: userId,
        isDelete: false // Ensure soft-deleted users can't fetch profile via API
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        countryCode: true,
        gender: true,
        birthDate: true,
        birthTime: true,
        birthPlace: true,
        profile: true,
        addressLine1: true,
        location: true,
        user_wallets: {
          select: { amount: true },
          take: 1
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // 3. Fetch Activity Statistics (Parallel for performance)
    const [ordersCount, chatCount, callCount] = await Promise.all([
      prisma.order_request.count({ where: { userId } }),
      prisma.chatrequest.count({ where: { userId } }),
      prisma.callrequest.count({ where: { userId } }),
    ]);

    // 4. Construct Response Data
    const responseData = {
      id: user.id.toString(),
      name: user.name || "",
      email: user.email || "",
      contactNo: user.contactNo || "",
      countryCode: user.countryCode || "+91",
      
      // Personal Details
      gender: user.gender,
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      location: user.location, // Fallback location field
      address: user.addressLine1,
      profile: user.profile,

      // Wallet
      wallet_balance: user.user_wallets[0]?.amount || 0,

      // Dashboard Stats
      statistics: {
        total_orders: ordersCount,
        total_chats: chatCount,
        total_calls: callCount,
      }
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}