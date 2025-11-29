// app/api/customers/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// add this helper near top of the file (after imports)
function sanitizeBigInts(value: any): any {
  // recursively convert BigInt -> string
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value; // keep dates as-is
  if (Array.isArray(value)) return value.map(sanitizeBigInts);
  if (value && typeof value === "object") {
    const out: any = {};
    for (const key of Object.keys(value)) {
      out[key] = sanitizeBigInts(value[key]);
    }
    return out;
  }
  return value;
}


interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch customer full details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const userId = BigInt(id);

    // Fetch customer with all relations
    const customer = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        user_wallets: {
          where: { isDelete: false },
          select: {
            amount: true,
            updated_at: true,
          },
        },
        userRoles: {
          include: {
            role: true,
          },
        },
        user_device_details: {
          orderBy: { updated_at: "desc" },
          take: 1,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get activity counts
    const [chatCount, callCount, orderCount, reviewCount, followingCount] =
      await Promise.all([
        prisma.chatrequest.count({ where: { userId } }),
        prisma.callrequest.count({ where: { userId } }),
        prisma.order_request.count({ where: { userId } }),
        prisma.user_reviews.count({ where: { userId } }),
        prisma.astrologer_followers.count({ where: { userId } }),
      ]);

    // Get total spent
    const totalSpent = await prisma.wallettransaction.aggregate({
      where: {
        userId,
        isCredit: false,
      },
      _sum: {
        amount: true,
      },
    });

    // Format response
    const response = {
      id: customer.id.toString(),
      name: customer.name || "N/A",
      email: customer.email || "N/A",
      contactNo: customer.contactNo || "N/A",
      countryCode: customer.countryCode || "+91",
      profile: customer.profile || null,
      birthDate: customer.birthDate,
      birthTime: customer.birthTime || "N/A",
      birthPlace: customer.birthPlace || "N/A",
      location: customer.location || "N/A",
      gender: customer.gender || "N/A",
      addressLine1: customer.addressLine1 || null,
      addressLine2: customer.addressLine2 || null,
      pincode: customer.pincode || null,
      referCode: customer.refer_code || null,
      isActive: customer.isActive,
      isDelete: customer.isDelete,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      lastActive: customer.updated_at, // Use updated_at as proxy
      walletBalance:
        customer.user_wallets[0]?.amount?.toString() || "0.00",
      walletLastUpdated: customer.user_wallets[0]?.updated_at || null,
      role:
        customer.userRoles[0]?.role?.name || "customer",
      lastDevice:
        customer.user_device_details[0] || null,
      stats: {
        totalChats: chatCount,
        totalCalls: callCount,
        totalOrders: orderCount,
        totalReviews: reviewCount,
        totalFollowing: followingCount,
        totalSpent: totalSpent._sum.amount?.toString() || "0.00",
      },
    };
    return NextResponse.json(sanitizeBigInts({
      success: true,
      data: response,
    }));

  } catch (error: any) {
    console.error("Error fetching customer details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customer details",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PATCH - Update customer info
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const userId = BigInt(id);

    // Check if customer exists
    const existingCustomer = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Update customer
    const updatedCustomer = await prisma.users.update({
      where: { id: userId },
      data: {
        name: body.name || existingCustomer.name,
        email: body.email || existingCustomer.email,
        contactNo: body.contactNo || existingCustomer.contactNo,
        countryCode: body.countryCode || existingCustomer.countryCode,
        gender: body.gender || existingCustomer.gender,
        birthDate: body.birthDate
          ? new Date(body.birthDate)
          : existingCustomer.birthDate,
        birthTime: body.birthTime || existingCustomer.birthTime,
        birthPlace: body.birthPlace || existingCustomer.birthPlace,
        location: body.location || existingCustomer.location,
        addressLine1: body.addressLine1 ?? existingCustomer.addressLine1,
        addressLine2: body.addressLine2 ?? existingCustomer.addressLine2,
        pincode: body.pincode ?? existingCustomer.pincode,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      data: {
        id: updatedCustomer.id.toString(),
        name: updatedCustomer.name,
        email: updatedCustomer.email,
      },
    });
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update customer",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete customer
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const userId = BigInt(id);

    // Soft delete customer
    await prisma.users.update({
      where: { id: userId },
      data: {
        isDelete: true,
        isActive: false,
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete customer",
        message: error.message,
      },
      { status: 500 }
    );
  }
}