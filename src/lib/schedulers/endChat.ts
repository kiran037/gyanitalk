import { prisma } from "@/lib/prisma";
import axios from "axios";
import { acquireLock, releaseLock } from "@/lib/cronLock";
import FirestoreService from "@/services/firestore_services";

export async function endChat() {
    const lockKey = "run:endchat";
    if (!(await acquireLock(lockKey))) return;

    const firestoreService = new FirestoreService();

    try {
        const chatRequests = await prisma.chatrequest.findMany({
            where: { chatStatus: "Confirmed" },
            take: 10
        });

        console.log(`${chatRequests.length} request found`);

        for (const value of chatRequests) {
            const chatId = value.id;
            console.log(`Chat Id ${chatId}`);

            try {
                const messages = await firestoreService.getChatMessages(chatId);

                if (!messages?.fields) {
                    console.log("failed");
                    continue;
                }

                const userId = value.userId;
                const astrologerId = value.astrologerId;

                const chatTime =
                    messages.fields.total_seconds?.stringValue ?? "0";

                // chat_log table
                const chatLog = await prisma.chat_log.findFirst({
                    where: { type: 0, chatid: chatId },
                });

                if (!chatLog) {
                    await prisma.chat_log.create({
                        data: {
                            type: 0,
                            chatid: chatId,
                            duration: chatTime,
                        },
                    });
                } else {
                    if (chatLog.duration !== chatTime) {
                        await prisma.chat_log.update({
                            where: { id: chatLog.id },
                            data: { duration: chatTime },
                        });
                    } else {
                        // 🔴 END CHAT
                        const user = await prisma.users.findFirst({
                            where: { id: userId },
                        });

                        if (!user?.jwt_token) continue;
                        await axios.post(
                            `${process.env.API_PUBLIC_URL}/api/chatRequest/endChat`,
                            {
                                chatId: chatId,
                                totalMin: chatTime,
                            },
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${user.jwt_token}`, // ✅ FIX
                                },
                                httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
                            }
                        );

                        await firestoreService.updateChatMessage(chatId);

                        const message = "System-> ended chat";
                        const fbChatID = `${astrologerId}_${userId}`;

                        await firestoreService.sendMessage(
                            fbChatID,
                            userId,
                            astrologerId,
                            message
                        );

                        await prisma.chat_log.delete({
                            where: { id: chatLog.id },
                        });
                    }
                }

                // Cleanup completed chats
                await prisma.chat_log.deleteMany({
                    where: {
                        chatrequest: {
                            chatStatus: "Completed",
                        },
                    },
                });
            } catch (err: any) {
                console.error(`${chatId} - ${err.message}`);

                if (err.response?.status === 404 && err.response?.data.error.status === 'NOT_FOUND') {
                    await prisma.chatrequest.update({
                        where: { id: chatId },
                        data: { chatStatus: "Rejected" },
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
