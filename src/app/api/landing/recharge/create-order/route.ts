import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { verifyUserJWT } from "@/lib/auth";

// 🔐 Same helper pattern as /api/me
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
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { amount, cashback = 0 } = await request.json();
  const userId = BigInt(session.userId);

  // 1️⃣ Create payment row
  const payment = await prisma.payment.create({
    data: {
      userId,
      amount: Number(amount),
      cashback_amount: cashback,
      paymentMode: "razorpay",
      paymentStatus: "pending",
    },
  });

  // 2️⃣ Create Razorpay order
  const order = await razorpay.orders.create({
    amount: Number(amount) * 100,
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
  });
}