

import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * 🔐 SHARED LOGIC: Processes the recharge, adds balance, and logs transaction.
 * This is called by BOTH the Webhook and the Frontend Verification API.
 */
export async function processRecharge(paymentId: number, razorpayPaymentId: string) {
    // 1. Check if payment exists and isn't already processed
    const paymentRecord = await prisma.payment.findFirst({
        where: { id: paymentId },
    });

    if (!paymentRecord) return { success: false, message: "Payment record not found" };
    if (paymentRecord.paymentStatus === "success") return { success: true, message: "Already processed" };

    const userId = paymentRecord.userId;
    if (!userId) return { success: false, message: "User ID not attached to payment" };

    // 2. GST Logic (Inclusive GST)
    // If User pays ₹118, and GST is 18%: Real Balance = 100, Tax = 18.
    const gstFlag = await prisma.systemflag.findFirst({ where: { name: "Gst" } });
    const gstPercent = parseFloat(gstFlag?.value || "18");
    const amountPaid = paymentRecord.amount || 0;
    
    // Calculate Base Amount (Excluding GST)
    const baseWalletAmount = amountPaid / (1 + gstPercent / 100);

    // 3. Cashback Logic
    // We already calculated the specific VALUE in 'create-order', so we just read it here.
    const cashbackAmount = paymentRecord.cashback_amount || 0;

    const totalToAdd = baseWalletAmount + cashbackAmount;

    // 4. 🔥 ATOMIC TRANSACTION (Fixes Issue #3 - Missing Transactions)
    // We use $transaction to ensure everything happens, or nothing happens.
    await prisma.$transaction(async (tx) => {
        // A. Mark Payment as Success
        await tx.payment.update({
            where: { id: paymentId },
            data: {
                paymentStatus: "success",
                paymentReference: razorpayPaymentId,
            },
        });

        // B. Update/Create User Wallet
        const wallet = await tx.user_wallets.findFirst({ where: { userId } });
        
        if (wallet) {
            await tx.user_wallets.update({
                where: { id: wallet.id },
                data: { amount: { increment: totalToAdd } },
            });
        } else {
            await tx.user_wallets.create({
                data: {
                    userId,
                    amount: totalToAdd,
                    createdBy: Number(userId),
                    modifiedBy: Number(userId),
                },
            });
        }

        // C. Create Transaction Entry: Main Topup
        await tx.wallettransaction.create({
            data: {
                userId,
                amount: baseWalletAmount,
                isCredit: true,
                transactionType: "Topup",
                transaction_id: razorpayPaymentId,
                created_at: new Date(),
            },
        });

        // D. Create Transaction Entry: Cashback (If applicable)
        if (cashbackAmount > 0) {
            await tx.wallettransaction.create({
                data: {
                    userId,
                    amount: cashbackAmount,
                    isCredit: true,
                    transactionType: "Cashback",
                    transaction_id: `CB-${razorpayPaymentId}`, // Unique ref
                    created_at: new Date(),
                },
            });
        }
    });

    return { success: true };
}

// --- WEBHOOK HELPERS ---

export async function handleAddMoneyFromWebhook(paymentEntity: any) {
    const pay_id = paymentEntity.notes?.payment_id;
    if (!pay_id) return;
    
    // Redirect logic to the shared function
    console.log(`Webhook processing payment: ${pay_id}`);
    await processRecharge(Number(pay_id), paymentEntity.id);
}

export async function handlePaymentFailed(paymentEntity: any) {
    const pay_id = paymentEntity.notes?.payment_id;
    if (!pay_id) return;

    await prisma.payment.updateMany({
        where: { id: Number(pay_id), paymentStatus: "pending" },
        data: { paymentStatus: "failed", paymentReference: paymentEntity.id },
    });
}

export async function handlePaymentAuthorized(paymentEntity: any) {
    // We attempt to capture it. If captured, the 'payment.captured' event will fire later
    // and trigger handleAddMoneyFromWebhook.
    try {
        if (paymentEntity.status === "captured") return;
        await razorpay.payments.capture(paymentEntity.id, paymentEntity.amount, paymentEntity.currency);
    } catch (err) {
        console.error("Capture failed", err);
    }
}