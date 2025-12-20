// app/api/transactions/manual/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = parseInt(params.id);
    const body = await request.json();
    const { action, rejectionReason } = body; // action: "approve" or "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action. Must be 'approve' or 'reject'",
        },
        { status: 400 }
      );
    }

    // Fetch the payment request
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment request not found",
        },
        { status: 404 }
      );
    }

    if (payment.paymentStatus !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: `Payment already ${payment.paymentStatus}`,
        },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Approve payment using transaction
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            paymentStatus: "success",
            updated_at: new Date(),
          },
        });

        // Create wallet transaction
        await tx.wallettransaction.create({
          data: {
            amount: payment.amount || 0,
            userId: payment.userId,
            transactionType: "manual_recharge",
            transaction_id: payment.paymentReference || `MAN_${Date.now()}`,
            isCredit: true,
            createdBy: 1, // Admin user ID
            modifiedBy: 1,
          },
        });

        // Update or create user wallet
        const existingWallet = await tx.user_wallets.findFirst({
          where: { userId: payment.userId! },
        });

        if (existingWallet) {
          await tx.user_wallets.update({
            where: { id: existingWallet.id },
            data: {
              amount: {
                increment: payment.amount || 0,
              },
              updated_at: new Date(),
            },
          });
        } else {
          await tx.user_wallets.create({
            data: {
              userId: payment.userId!,
              amount: payment.amount || 0,
              createdBy: 1,
              modifiedBy: 1,
            },
          });
        }

        // If cashback exists, add it too
        if (payment.cashback_amount && payment.cashback_amount > 0) {
          await tx.wallettransaction.create({
            data: {
              amount: payment.cashback_amount,
              userId: payment.userId,
              transactionType: "cashback",
              transaction_id: `CB_${payment.paymentReference || Date.now()}`,
              isCredit: true,
              createdBy: 1,
              modifiedBy: 1,
            },
          });

          await tx.user_wallets.updateMany({
            where: { userId: payment.userId! },
            data: {
              amount: {
                increment: payment.cashback_amount,
              },
              updated_at: new Date(),
            },
          });

        }
      });

      return NextResponse.json({
        success: true,
        message: "Payment approved and wallet updated successfully",
        data: { paymentId, action: "approved" },
      });
    } else {
      // Reject payment
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentStatus: "failed",
          updated_at: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment rejected successfully",
        data: {
          paymentId,
          action: "rejected",
          reason: rejectionReason || "Not specified",
        },
      });
    }
  } catch (error) {
    console.error("Error processing manual payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process manual payment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}