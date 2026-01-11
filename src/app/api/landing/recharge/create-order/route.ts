

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";

async function getSession(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;
  try {
    return await verifyUserJWT(token);
  } catch {
    return null;
  }
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  const session = await getSession(request);

  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Renaming cashback to cashbackPercent for clarity
  const { amount, cashback: cashbackPercent = 0 } = await request.json();
  const userId = BigInt(session.userId);

  const amountNum = Number(amount);
  
  // 🔥 FIX: Calculate the actual cashback money value
  // If amount is 100 and cashbackPercent is 10, cashbackValue becomes 10
  const cashbackValue = (amountNum * Number(cashbackPercent)) / 100;

  // 1️⃣ Create payment row
  const payment = await prisma.payment.create({
    data: {
      userId,
      amount: amountNum,
      cashback_amount: cashbackValue, // ✅ Storing calculated amount, not percentage
      paymentMode: "razorpay",
      paymentStatus: "pending",
    },
  });

  // 2️⃣ Create Razorpay order
  const order = await razorpay.orders.create({
    amount: amountNum * 100, // Razorpay takes paise
    currency: "INR",
    notes: {
      payment_id: payment.id.toString(),
      user_id: userId.toString(),
    },
  });

  // 3️⃣ Save orderId
  await prisma.payment.update({
    where: { id: payment.id },
    data: { orderId: order.id },
  });

  return NextResponse.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    internalPaymentId: payment.id, // ✅ Sending this back for verification step
  });
}