///Users/xeoren/Desktop/gyanitallk-admin/src/lib/schedulers/endCall.ts
import { prisma } from "@/lib/prisma";
import { acquireLock, releaseLock } from "@/lib/cronLock";
import FirestoreService from "@/services/firestore_services";
import axios from "axios";
import { getAgoraChannelUsage } from "../agora";

export async function endCall() {
    const lockKey = "run:endcall";

    // Laravel withoutOverlapping()
    if (!(await acquireLock(lockKey))) return;

    const firestoreService = new FirestoreService();

    try {
        const callRequests = await prisma.callrequest.findMany({
            where: { callStatus: "Confirmed" },
            take: 10
        });
        console.log(`${callRequests.length} request found`);

        for (const value of callRequests) {
            const callId = value.id;
            try {
                console.log(`Call Id ${callId}`);
                const messages = await firestoreService.getCallMessages(callId);
                
                if (!messages?.fields) {
                    console.log("failed");
                    continue;
                }

                const userId = value.userId;
                const astrologerId = value.astrologerId;

                const callTime =
                    messages.fields.total_seconds?.stringValue ?? "0";

                const type =
                    messages.fields.type?.stringValue ?? value.call_type;

                const data = {
                    type: type,
                    chatid: callId,
                    duration: callTime,
                };

                const chatDetail = await prisma.chat_log.findFirst({
                    where: {
                        type: type,
                        chatid: callId,
                    },
                });

                if (!chatDetail) {
                    // INSERT
                    await prisma.chat_log.create({ data });
                } else {
                    if (chatDetail.duration !== callTime) {
                        // UPDATE duration
                        await prisma.chat_log.update({
                            where: { id: chatDetail.id },
                            data: { duration: callTime },
                        });
                    } else {
                        // 🔴 END CALL
                        const user = await prisma.users.findFirst({
                            where: { id: userId },
                        });

                        if (!user?.jwt_token) continue;
                        await axios.post(
                            `${process.env.API_PUBLIC_URL}/api/callRequest/end`,
                            {
                                callId: callId,
                                totalMin: callTime,
                            },
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${user.jwt_token}`, // ✅ FIX
                                },
                                httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
                            }
                        );
                        await firestoreService.updateCallMessage(callId);

                        await prisma.chat_log.delete({
                            where: { id: chatDetail.id },
                        });
                    }
                }
            } catch (err: any) {
                console.error(`${callId} - ${err.message}`);
                if (err.response?.status === 404 && err.response?.data.error.status === 'NOT_FOUND') {
                    await prisma.callrequest.update({
                        where: { id: callId },
                        data: { callStatus: "Rejected" },
                    });
                } else if (err.response?.status === 403 && err.response?.data.message === 'Invalid token.') {
                    const user = await prisma.users.findFirst({
                        where: { id: value.userId },
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
