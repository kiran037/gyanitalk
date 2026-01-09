import { prisma } from "@/lib/prisma";
import axios from "axios";
import { Exotel } from "@/lib/exotel";
import { acquireLock, releaseLock } from "../cronLock";

export async function exotelCalls() {
    const lockKey = "exotel-calls-check";

    // 🔐 withoutOverlapping()
    // if (!(await acquireLock(lockKey, 25))) return;

    try {
        // ✅ STEP 1: SAB pending calls uthao
        const calls = await prisma.callrequest.findMany({
            where: {
                call_type: 12,
                sId: { not: null },
                callStatus: { notIn: ["Completed", "Rejected"] },
            },
            orderBy: {
                updated_at: "asc", // oldest first
            },
            take: 10,
        });

        if (!calls.length) {
            console.log("✅ No pending Exotel calls");
            return;
        }

        console.log(`📞 Processing ${calls.length} pending call(s)`);

        // ✅ STEP 2: ek-ek karke process
        for (const call of calls) {
            console.log(`📞 Checking callId=${call.id}, sid=${call.sId}`);

            try {
                if (!call.sId) {
                    continue;
                }
                const response = await Exotel.callDetail(call.sId);
                const status = response?.Call?.Status ?? "unknown";
                const duration = Number(response?.Call?.Duration ?? 0);

                console.log(`🔁 Status: ${status} : Duration ${duration}`);

                // ✅ COMPLETED
                if (status === "completed" && duration > 0) {
                    const user = await prisma.users.findFirst({
                        where: { id: call.userId },
                    });

                    if (user?.jwt_token) {
                        await axios.post(
                            `${process.env.API_PUBLIC_URL}/api/callRequest/end`,
                            {
                                callId: call.id,
                                sId: call.sId,
                                totalMin: duration,
                            },
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${user.jwt_token}`, // ✅ FIX
                                },
                                httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
                            }
                        );
                    }

                    await prisma.callrequest.update({
                        where: { id: call.id },
                        data: { callStatus: "Completed" },
                    });

                    console.log(`✅ Call ${call.id} completed`);
                    continue;
                }

                // ❌ FAILED STATES
                if (["failed", "busy", "no-answer", "cancelled"].includes(status)) {
                    await prisma.callrequest.update({
                        where: { id: call.id },
                        data: { callStatus: "Rejected" },
                    });

                    console.log(`❌ Call ${call.id} rejected (${status})`);
                    continue;
                }

                // 📞 ANSWERED
                if (status === "answered") {
                    await prisma.callrequest.update({
                        where: { id: call.id },
                        data: {
                            callStatus: "Confirmed",
                            deduction: 0,
                            totalMin: '0',
                            updated_at: new Date(),
                        },
                    });

                    console.log(`📞 Call ${call.id} answered`);
                    continue;
                }

                // ⏳ STILL RINGING → sirf timestamp update
                await prisma.callrequest.update({
                    where: { id: call.id },
                    data: { updated_at: new Date() },
                });

            } catch (err: any) {
                console.error(`🔥 Call ${call.id} error:`, err.message);
                if (err.response?.status === 404) {
                    await prisma.callrequest.update({
                        where: { id: call.id },
                        data: { callStatus: "Rejected" },
                    });
                } else if (err.response?.status === 403 && err.response?.data.message === 'Invalid token.') {
                    const user = await prisma.users.findFirst({
                        where: { id: call.userId },
                    });
                    if (user && user.contactNo) {
                        await axios.post(
                            `${process.env.API_PUBLIC_URL}/api/loginAppUser`,
                            { contactNo: user.contactNo },
                            {
                                headers: { "Content-Type": "application/json" },
                                httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
                            }
                        );
                    }


                }
            }
        }
    } finally {
        await releaseLock(lockKey);
    }
}
