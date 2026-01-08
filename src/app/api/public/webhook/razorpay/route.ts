import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { handleAddMoneyFromWebhook, handlePaymentAuthorized, handlePaymentFailed } from "@/lib/razorpay";



export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get("x-razorpay-signature");

        const body = await req.text();

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest("hex");
        console.log(expectedSignature)
        if (signature !== expectedSignature) {
            return NextResponse.json({ success: false }, { status: 401 });
        }

        const event = JSON.parse(body);

        switch (event.event) {
            case "payment.captured":
                await handleAddMoneyFromWebhook(event.payload.payment.entity);
                break;

            case "payment.failed":
                await handlePaymentFailed(event.payload.payment.entity);
                break;

            case "payment.authorized":
                await handlePaymentAuthorized(event.payload.payment.entity);
                break;

            default:
                console.log("Unhandled event:", event.event);
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}
