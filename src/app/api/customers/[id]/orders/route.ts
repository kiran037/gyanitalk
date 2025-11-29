// app/api/customers/[id]/orders/route.ts
// GET: Get customer mall orders

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const userId = BigInt(id);
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.order_request.count({
      where: { userId },
    });

    // Fetch orders
    const orders = await prisma.order_request.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productImage: true,
            amount: true,
          },
        },
        product_category: {
          select: {
            id: true,
            name: true,
          },
        },
        order_address: {
          select: {
            name: true,
            phoneNumber: true,
            flatNo: true,
            locality: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
        astrologer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id.toString(),
      orderType: order.orderType,
      productId: order.productId?.toString() || null,
      productName: order.product?.name || "N/A",
      productImage: order.product?.productImage || null,
      categoryId: order.productCategoryId?.toString() || null,
      categoryName: order.product_category?.name || "N/A",
      astrologerId: order.astrologerId?.toString() || null,
      astrologerName: order.astrologer?.name || null,
      orderStatus: order.orderStatus,
      payableAmount: order.payableAmount?.toString() || "0",
      walletBalanceDeducted:
        order.walletBalanceDeducted?.toString() || "0",
      gstPercent: order.gstPercent?.toString() || "0",
      totalPayable: order.totalPayable?.toString() || "0",
      couponCode: order.couponCode || null,
      paymentMethod: order.paymentMethod,
      address: order.order_address,
      createdAt: order.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          perPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        message: error.message,
      },
      { status: 500 }
    );
  }
}