// src/app/api/customers/[id]/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// PATCH: Add money to user wallet
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate user ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (!body.amount || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid amount is required (must be greater than 0)",
        },
        { status: 400 }
      );
    }

    const userId = BigInt(id);
    const amountToAdd = Number(body.amount);
    const reason = body.reason || "Admin credit";
    const adminId = body.adminId || 0; // Replace with actual admin ID from session

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        contactNo: true,
        email: true,
        isActive: true,
        isDelete: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.isDelete) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot add money to a deleted user",
        },
        { status: 400 }
      );
    }

    // Find or create user wallet
    let userWallet = await prisma.user_wallets.findFirst({
      where: {
        userId: userId,
        isDelete: false,
      },
    });

    if (!userWallet) {
      // Create wallet if doesn't exist
      userWallet = await prisma.user_wallets.create({
        data: {
          userId: userId,
          amount: 0,
          isActive: true,
          isDelete: false,
          createdBy: adminId,
          modifiedBy: adminId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    // Calculate new balance
    const currentBalance = Number(userWallet.amount || 0);
    const newBalance = currentBalance + amountToAdd;

    // Use Prisma transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.user_wallets.update({
        where: { id: userWallet!.id },
        data: {
          amount: newBalance,
          modifiedBy: adminId,
          updated_at: new Date(),
        },
      });

      // Create wallet transaction record
      const transaction = await tx.wallettransaction.create({
        data: {
          userId: userId,
          amount: amountToAdd,
          transactionType: "credit",
          transaction_id: `ADMIN_CREDIT_${Date.now()}`,
          isCredit: true,
          createdBy: adminId,
          modifiedBy: adminId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      return { updatedWallet, transaction };
    });

    return NextResponse.json({
      success: true,
      message: `₹${amountToAdd} added successfully to ${user.name}'s wallet`,
      data: {
        userId: user.id.toString(),
        userName: user.name,
        previousBalance: currentBalance.toFixed(2),
        amountAdded: amountToAdd.toFixed(2),
        newBalance: newBalance.toFixed(2),
        transactionId: result.transaction.id.toString(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error adding money to wallet:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add money to wallet",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// GET: Get user wallet details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    const userId = BigInt(id);

    // Get user with wallet details
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        countryCode: true,
        isActive: true,
        isDelete: true,
        user_wallets: {
          where: { isDelete: false },
          select: {
            id: true,
            amount: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Get recent wallet transactions
    const recentTransactions = await prisma.wallettransaction.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 10,
      select: {
        id: true,
        amount: true,
        transactionType: true,
        transaction_id: true,
        isCredit: true,
        created_at: true,
      },
    });

    const walletBalance = user.user_wallets[0]?.amount || 0;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id.toString(),
          name: user.name || "N/A",
          email: user.email || "N/A",
          contactNo: user.contactNo || "N/A",
          countryCode: user.countryCode || "+91",
          isActive: user.isActive,
          isDelete: user.isDelete,
        },
        wallet: {
          balance: walletBalance.toString(),
          lastUpdated: user.user_wallets[0]?.updated_at,
        },
        recentTransactions: recentTransactions.map((txn) => ({
          id: txn.id.toString(),
          amount: txn.amount?.toString() || "0",
          type: txn.transactionType || "N/A",
          transactionId: txn.transaction_id || "N/A",
          isCredit: txn.isCredit || false,
          date: txn.created_at,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching wallet details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch wallet details",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: Deduct money from wallet (optional - for corrections)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    if (!body.amount || isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid amount is required (must be greater than 0)",
        },
        { status: 400 }
      );
    }

    const userId = BigInt(id);
    const amountToDeduct = Number(body.amount);
    const reason = body.reason || "Admin deduction";
    const adminId = body.adminId || 0;

    // Get user wallet
    const userWallet = await prisma.user_wallets.findFirst({
      where: {
        userId: userId,
        isDelete: false,
      },
    });

    if (!userWallet) {
      return NextResponse.json(
        {
          success: false,
          error: "User wallet not found",
        },
        { status: 404 }
      );
    }

    const currentBalance = Number(userWallet.amount || 0);

    if (currentBalance < amountToDeduct) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient balance. Current balance: ₹${currentBalance}`,
        },
        { status: 400 }
      );
    }

    const newBalance = currentBalance - amountToDeduct;

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.user_wallets.update({
        where: { id: userWallet.id },
        data: {
          amount: newBalance,
          modifiedBy: adminId,
          updated_at: new Date(),
        },
      });

      const transaction = await tx.wallettransaction.create({
        data: {
          userId: userId,
          amount: amountToDeduct,
          transactionType: "debit",
          transaction_id: `ADMIN_DEBIT_${Date.now()}`,
          isCredit: false,
          createdBy: adminId,
          modifiedBy: adminId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      return { updatedWallet, transaction };
    });

    return NextResponse.json({
      success: true,
      message: `₹${amountToDeduct} deducted successfully`,
      data: {
        userId: userId.toString(),
        previousBalance: currentBalance.toFixed(2),
        amountDeducted: amountToDeduct.toFixed(2),
        newBalance: newBalance.toFixed(2),
        transactionId: result.transaction.id.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error deducting money from wallet:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to deduct money from wallet",
        message: error.message,
      },
      { status: 500 }
    );
  }
}