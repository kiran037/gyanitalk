// components/UserActivitySlideOver.tsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import SlideOver from "@/components/ui/slide-over";

type RecentItem = { id: string; screenName: string; timestampISO: string | null };

export default function UserActivitySlideOver({
  open,
  title,
  recent,
  closeHref,
  onRequestClose,
}: {
  open: boolean;
  title: string;
  recent: RecentItem[];
  closeHref: string;       // e.g., "?date=01-08-2025"
  onRequestClose?: () => void;
}) {
  const router = useRouter();

  const handleClose = () => {
    onRequestClose?.();        // close instantly (parent state)
    router.replace(closeHref); // update URL (remove userId)
  };

  const items = useMemo(() => recent, [recent]);

  return (
    <SlideOver open={open} onClose={handleClose} title={title}>
      <div className="space-y-2">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {items.map((a) => (
            <div key={a.id} className="py-2 flex items-center justify-between">
              <div className="text-sm">{a.screenName || "/"}</div>
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
          {items.length === 0 && (
            <div className="py-6 text-sm text-gray-500">No activity.</div>
          )}
        </div>
      </div>
    </SlideOver>
  );
}
