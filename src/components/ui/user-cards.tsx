// components/UserCards.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import UserActivitySlideOver from "@/components/ui/user-activity-slide-over";

type RecentItem = { id: string; screenName: string; timestampISO: string | null };
type UserRowClient = {
    userId: string;
    name?: string | null;
    profile?: string | null;
    total?: number;
    recent: RecentItem[];
};

export default function UserCards({
    selectedDate,                // "DD-MM-YYYY"
    users,                        // serialized users with timestampISO already
}: {
    selectedDate: string;
    users: UserRowClient[];
}) {
    const router = useRouter();
    const sp = useSearchParams();

    const [openUserId, setOpenUserId] = useState<string | null>(sp.get("userId"));
    const selected = useMemo(
        () => users.find(u => u.userId === openUserId) || null,
        [users, openUserId]
    );

    const onOpen = (userId: string) => {
        // 1) Open instantly (local state)
        setOpenUserId(userId);
        // 2) Update URL without full reload (client-side navigation)
        const params = new URLSearchParams(sp?.toString());
        params.set("date", selectedDate);
        params.set("userId", userId);
        router.replace(`?${params.toString()}`);
    };

    const onClose = () => {
        setOpenUserId(null);

        const params = new URLSearchParams(sp?.toString());
        params.set("date", selectedDate);
        params.delete("userId");
        router.replace(`?${params.toString()}`);
    };

    return (
        <>
            <div className="space-y-2">
                {users.map((u) => (
                    <div
                        key={`${selectedDate}-${u.userId}`}
                        className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-3 hover:border-blue-200 dark:hover:border-blue-700 transition"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-600">
                                    {u.profile ? (
                                        <Image
                                            src={
                                                u.profile.startsWith("http")
                                                    ? u.profile
                                                    : `${process.env.NEXT_PUBLIC_BASEURL || ""}${u.profile}`
                                            }
                                            alt={u.name || u.userId}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                            👤
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">
                                        {u.name || "Unknown User"}{" "}
                                        <span className="text-gray-400">({u.userId})</span>
                                    </div>
                                    {typeof u.total === "number" && (
                                        <div className="text-xs text-gray-500">{u.total} activities</div>
                                    )}
                                </div>
                            </div>

                            {/* Button instead of <a>, instant open */}
                            <button
                                type="button"
                                onClick={() => onOpen(u.userId)}
                                className={cn(
                                    "text-xs px-2 py-1 rounded border transition",
                                    "border-blue-200 text-blue-600 hover:bg-blue-50",
                                    "dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                )}
                            >
                                View
                            </button>
                        </div>

                        {/* small inline preview */}
                        <div className="mt-3 grid gap-1">
                            {u.recent.map((a) => (
                                <div key={a.id} className="flex items-center justify-between text-sm">
                                    <div className="truncate max-w-[65%]">{a.screenName || "/"}</div>
                                    <div className="text-xs text-gray-500">
                                        {a.timestampISO
                                            ? new Intl.DateTimeFormat("en-IN", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                                timeZone: "Asia/Kolkata",
                                            }).format(new Date(a.timestampISO))
                                            : "—"}
                                    </div>
                                </div>
                            ))}
                            {u.recent.length === 0 && (
                                <div className="text-sm text-gray-500">No recent activity.</div>
                            )}
                        </div>
                    </div>
                ))}

                {!users.length && (
                    <div className="text-sm text-gray-500">No users found for this date.</div>
                )}
            </div>

            {/* Slide-over opens instantly from local state */}
            <UserActivitySlideOver
                open={Boolean(openUserId && selected)}
                title={selected ? (selected.name || selected.userId) : "Activity"}
                recent={selected?.recent || []}
                closeHref={`?date=${encodeURIComponent(selectedDate)}`}
                onRequestClose={onClose}  
            />
        </>
    );
}
