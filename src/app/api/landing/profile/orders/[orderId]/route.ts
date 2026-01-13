import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";
import { verifySession } from "@/lib/auth/session";

function serializeData(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') return value.toString();
    return value;
  }));
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let jwtPayload;
    try { jwtPayload = await verifyUserJWT(token); } catch { return NextResponse.json({ success: false, error: "Invalid Token" }, { status: 401 }); }

    if (jwtPayload?.sessionId) {
      const sessionCheck = await verifySession(jwtPayload.sessionId as string);
      if (!sessionCheck.valid) return NextResponse.json({ success: false, error: "Session Expired" }, { status: 401 });
    }

    const userId = BigInt(jwtPayload.userId);
    const { searchParams } = new URL(request.url);
    
    // FILTERS
    const orderStatus = searchParams.get("orderStatus");
    const search = searchParams.get("search");
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause: any = { 
        userId: userId,
        isDelete: "0",
        // Force filter for products only
        OR: [
            { orderType: "Product" },
            { orderType: "mall" }, // Cover variations
            { productId: { not: null } }
        ]
    };

    if (orderStatus) whereClause.orderStatus = orderStatus;
    
    if (search) {
        whereClause.product = {
            name: { contains: search }
        };
    }

    const [orders, total] = await Promise.all([
      prisma.order_request.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        include: {
            product: { select: { name: true, productImage: true } },
            product_category: { select: { name: true } },
            // Removed astrologer/call relations to ensure we focus on products
        }
      }),
      prisma.order_request.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders: serializeData(orders),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}