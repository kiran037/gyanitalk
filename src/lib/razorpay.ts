import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function handleAddMoneyFromWebhook(payment: any) {
    const transaction_id = payment.id;
    const amount = payment.amount / 100; // paise → rupees

    const pay_id = payment.notes?.payment_id;
    const userId = payment.notes?.user_id;

    if (!pay_id || !userId) {
        console.log("❌ Missing pay_id or user_id in Razorpay notes");
        return;
    }

    // 🔁 Idempotency check
    const alreadyProcessed = await prisma.payment.findFirst({
        where: {
            id: Number(pay_id),
            paymentStatus: "success",
        },
    });

    if (alreadyProcessed) {
        console.log("⚠️ Payment already processed");
        return;
    }

    const gstFlag = await prisma.systemflag.findFirst({
        where: { name: "Gst" },
    });

    const gstPercent = parseFloat(gstFlag?.value || "18");
    const originalAmount = amount / (1 + gstPercent / 100);

    const paymentRecord = await prisma.payment.findFirst({
        where: { id: Number(pay_id) },
    });

    if (!paymentRecord || paymentRecord.paymentStatus !== "pending") {
        console.log("❌ Invalid or already used payment record");
        return;
    }

    // ✅ Update payment
    await prisma.payment.update({
        where: { id: Number(pay_id) },
        data: {
            paymentMode: "razorpay",
            paymentReference: transaction_id,
            paymentStatus: "success",
        },
    });

    const cashbackAmount = paymentRecord.cashback_amount || 0;

    // 💰 Cashback entry
    if (cashbackAmount > 0) {
        await prisma.wallettransaction.create({
            data: {
                userId: Number(userId),
                amount: cashbackAmount,
                isCredit: true,
                transactionType: "Cashback",
            },
        });
    }

    // 💳 Topup entry
    await prisma.wallettransaction.create({
        data: {
            userId: Number(userId),
            amount: originalAmount,
            isCredit: true,
            transactionType: "Topup",
            transaction_id,
        },
    });

    // 👛 Wallet update
    const wallet = await prisma.user_wallets.findFirst({
        where: { userId: Number(userId) },
    });

    const finalAmount = originalAmount + cashbackAmount;

    if (wallet) {
        await prisma.user_wallets.update({
            where: { id: wallet.id },
            data: {
                amount: Number(wallet.amount) + finalAmount,
            },
        });
    } else {
        await prisma.user_wallets.create({
            data: {
                userId: Number(userId),
                amount: finalAmount,
                createdBy: Number(userId),
                modifiedBy: Number(userId),
            },
        });
    }

    console.log("✅ Wallet updated successfully via webhook");
}
export async function handlePaymentFailed(payment: any) {
    const pay_id = payment.notes?.payment_id;

    if (!pay_id) return;

    await prisma.payment.updateMany({
        where: {
            id: Number(pay_id),
            paymentStatus: "pending",
        },
        data: {
            paymentStatus: "failed",
            paymentReference: payment.id
        },
    });

    console.log("❌ Payment marked as failed:", payment.id);
}
export async function handlePaymentAuthorized(payment: any) {
    const pay_id = payment.notes?.payment_id;

    if (!pay_id) {
        console.log("❌ pay_id missing in notes");
        return;
    }

    try {
        // 🔒 Idempotency: agar already captured / success ho chuka hai
        if (payment.status === "captured") {
            console.log("✅ Payment already captured");
            return;
        }

        console.log("⚠️ Capturing authorized payment:", payment.id);

        // ✅ CAPTURE PAYMENT
        await razorpay.payments.capture(
            payment.id,
            payment.amount, // paise
            payment.currency || "INR"
        );

        // ✅ DB update (authorized → success)
        await prisma.payment.updateMany({
            where: {
                id: Number(pay_id),
                paymentStatus: "pending",
            },
            data: {
                paymentStatus: "success",
                paymentReference: payment.id,
            },
        });

        console.log("✅ Payment captured successfully:", payment.id);
    } catch (err: any) {
        console.error("❌ Error while capturing payment:", err.message);

        // ❌ Mark failed if capture fails
        await prisma.payment.updateMany({
            where: {
                id: Number(pay_id),
            },
            data: {
                paymentStatus: "failed",
            },
        });
    }
}

