import "server-only";
import { db } from "@/services/firebase";
import moment from "moment";
import { prisma } from "@/lib/prisma";

// ---------- Types ----------
export type Activity = {
    id: string;
    screenName: string;
    timestamp: Date | null;
};

export type UserRow = {
    userId: string;
    name?: string | null;
    profile?: string | null;
    total?: number;
    recent: Activity[];
};

// ---------- Helpers ----------
const DATE_FMT = "DD-MM-YYYY";

function parseDateId(id: string): number | null {
    const m = moment(id, DATE_FMT, true);
    return m.isValid() ? m.valueOf() : null;
}

// ---------- Firestore: user IDs under a date ----------
export async function listUserIdsForDate(dateDocId: string): Promise<string[]> {
    const subcols = await db.collection("user_activity_logs").doc(dateDocId).listCollections();
    return subcols.map((c) => c.id).sort();
}

// ---------- Firestore: recent activities for a user on a date ----------
export async function getRecentActivitiesForUserOnDate(
    dateDocId: string,
    userId: string,
    limit = 20
): Promise<Activity[]> {
    const colRef = db.collection("user_activity_logs").doc(dateDocId).collection(userId);
    const snap = await colRef.orderBy("timestamp", "desc").limit(limit).get();

    return snap.docs.map((d) => {
        const data = d.data() as any;
        const ts = data?.timestamp?.toDate?.() ?? null;
        return {
            id: d.id,
            screenName: data?.screenName ?? "",
            timestamp: ts,
        };
    });
}

// ---------- Firestore: aggregation count (best-effort) ----------
export async function countActivitiesForUserOnDate(
    dateDocId: string,
    userId: string
): Promise<number | undefined> {
    try {
        const colRef = db.collection("user_activity_logs").doc(dateDocId).collection(userId);
        const countSnap = await colRef.count().get();
        return countSnap.data().count;
    } catch {
        return undefined;
    }
}

// ---- Sanitize helpers ----
const toCleanId = (v: unknown): string | null => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s.length ? s : null;
};

/** Keep only digit-only ids, dedupe, convert to BigInt[] for Prisma BIGINT columns */
const normalizeNumericIdsToBigInt = (ids: unknown[]): bigint[] => {
    const cleaned = Array.from(
        new Set(
            ids
                .map(toCleanId)
                .filter((v): v is string => v !== null)
                .map((s) => s.replace(/\s+/g, ""))
                .filter((s) => /^\d+$/.test(s))
        )
    );
    return cleaned.map((s) => BigInt(s));
};

// ---------- Prisma: names for many userIds ----------
export async function getUserNames(userIds: string[]) {
    const idsBigInt = normalizeNumericIdsToBigInt(userIds);
    if (idsBigInt.length === 0) return {};

    const rows = await prisma.users.findMany({
        where: { id: { in: idsBigInt } },
        select: { id: true, name: true, profile: true },
    });

    const map: Record<string, { name?: string | null; profile?: string | null }> = {};
    for (const r of rows) {
        map[String(r.id)] = { name: r.name, profile: (r as any).profile ?? null };
    }
    return map;
}

// ---------- Combined: users list (with names) for a selected date ----------
export async function getUsersForDateWithRecent({
    dateDocId,
    perUserLimit = 10,
    filterUserId,
}: {
    dateDocId: string;
    perUserLimit?: number;
    filterUserId?: string;
}) {
    const allUserIdsRaw = await listUserIdsForDate(dateDocId);

    // Sanitize subcollection IDs: remove null/empty/"null", dedupe, keep digits only
    const cleanedAllUserIds = Array.from(
        new Set(
            allUserIdsRaw
                .map(toCleanId)
                .filter((v): v is string => v !== null)
                .map((s) => s.replace(/\s+/g, ""))
                .filter((s) => /^\d+$/.test(s))
        )
    );

    // Optional filter (also sanitized)
    const f = toCleanId(filterUserId);
    const userIds = f ? cleanedAllUserIds.filter((u) => u === f) : cleanedAllUserIds;

    // Names from Prisma (BIGINT ids)
    const nameMap = await getUserNames(userIds);

    const out: UserRow[] = [];
    for (const uid of userIds) {
        const [recent, total] = await Promise.all([
            getRecentActivitiesForUserOnDate(dateDocId, uid, perUserLimit),
            countActivitiesForUserOnDate(dateDocId, uid),
        ]);

        out.push({
            userId: uid,
            name: nameMap[uid]?.name ?? null,
            profile: nameMap[uid]?.profile ?? null,
            total,
            recent,
        });
    }
    return out;
}