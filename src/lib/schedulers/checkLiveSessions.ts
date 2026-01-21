///Users/xeoren/Desktop/gyanitallk-admin/src/lib/schedulers/checkLiveSessions.ts
import { prisma } from "@/lib/prisma";
import axios from "axios";
import https from "https";
import { acquireLock, releaseLock } from "../cronLock";
import FirestoreService from "@/services/firestore_services";

export async function checkLiveSessions() {
    const lockKey = "astro:check-live-sessions";

    // 🔒 Laravel withoutOverlapping()
    if (!(await acquireLock(lockKey))) return;

    const firestoreService = new FirestoreService();

    try {
        // ⚠️ LIMIT to avoid Firestore 429
        const sessions = await prisma.liveastro.findMany({
            take: 5, // 👉 max 5 per cron run (safe)
        });

        for (const value of sessions) {
            try {
                const channelName = `liveAstrologer_${value.astrologerId}`;

                // 🔹 Firestore fetch
                const activityStatus =
                    await firestoreService.getLiveStatus(channelName);

                if (!activityStatus?.fields) continue;

                // 🔹 ALWAYS number (Firestore gives string)
                const duration = Number(
                    activityStatus.fields.total_seconds?.stringValue || 0
                );

                // 🔹 astrologerId fallback (Firestore → DB)
                let astrologerId = Number(
                    activityStatus.fields.astrologerId?.stringValue
                );

                const dbAstrologerId = Number(value.astrologerId);

                if (!astrologerId || astrologerId !== dbAstrologerId) {
                    astrologerId = dbAstrologerId;
                }

                // 🔹 chat_log lookup
                const chatDetail = await prisma.chat_log.findFirst({
                    where: {
                        type: 1,
                        chatid: astrologerId,
                    },
                });


                const data = {
                    type: 1,
                    chatid: astrologerId,
                    duration: duration,
                };

                // 🆕 INSERT
                if (!chatDetail) {
                    await prisma.chat_log.create({ data });
                    continue;
                }

                // 🔄 UPDATE duration if changed
                if (chatDetail.duration !== duration) {

                    await prisma.chat_log.update({
                        where: { id: chatDetail.id },
                        data: { duration },
                    });
                    continue;
                }

                // 🔴 SAME duration → END LIVE SESSION
                const res = await axios.post(
                    `${process.env.API_PUBLIC_URL}/api/liveAstrologer/endSession`,
                    { astrologerId },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        httpsAgent: new https.Agent({
                            rejectUnauthorized: false, // only if SSL issue
                        }),
                    }
                );

                // 🔹 Update Firestore
                await firestoreService.updateLiveStatus(channelName);

                // 🔹 Cleanup chat_log
                await prisma.chat_log.delete({
                    where: { id: chatDetail.id },
                });

            } catch (err: any) {
                console.log(value.astrologerId)
                console.error(
                    `🔥 Live session error for astrologer ${value.astrologerId} -`,
                    err.message
                );
            }
        }
        console.log(`✅ Checked and updated ${sessions.length} live session(s).`);
    } finally {
        await releaseLock(lockKey);
    }
}
