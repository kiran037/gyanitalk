import { prisma } from "@/lib/prisma";

export async function acquireLock(key: string, ttlSec = 50) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSec * 1000);

    try {
        await prisma.cron_lock.create({
            data: { key, expiresAt },
        });
        return true;
    } catch {
        return false; // already running
    }
}

export async function releaseLock(key: string) {
    await prisma.cron_lock.deleteMany({ where: { key } });
}
