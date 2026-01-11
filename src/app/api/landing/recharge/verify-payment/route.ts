import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { processRecharge } from "@/lib/razorpay";
import { verifyUserJWT } from "@/lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try { return await verifyUserJWT(token); } catch { return null; }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session?.userId) return NextResponse.json({ success: false }, { status: 401 });

  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    internal_payment_id 
  } = await request.json();

  // 1. Verify Signature (Security Check)
  const text = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ success: false, message: "Invalid Signature" }, { status: 400 });
  }

  // 2. Process the Recharge using shared logic
  const result = await processRecharge(Number(internal_payment_id), razorpay_payment_id);

  if (result.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }
}