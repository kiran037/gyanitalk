// // components/details/followersList.tsx
"use client";

import Image from "next/image";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { unFollow } from "../../app/(astrologers)/astrologers/fetch";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import GlassButton from "@/components/GlassUI/GlassButton";

const ensureAbs = (p?: string) =>
  p ? `${process.env.NEXT_PUBLIC_BASEURL}${p.startsWith("/") ? "" : "/"}${p}` : "";
const avatar = (p?: string) =>
  ensureAbs(p) || "https://gyanitalk.com/build/assets/images/person.png";

function TableHeader() {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-white/60 dark:border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      <div>Name</div>
      <div>Contact</div>
      <div className="text-right">Action</div>
    </div>
  );
}
function Row({ left, middle, right }: { left: React.ReactNode; middle: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 items-center gap-3 px-4 py-3 text-sm text-slate-800 dark:text-slate-200">
      <div className="flex items-center gap-3">{left}</div>
      <div>{middle}</div>
      <div className="text-right">{right}</div>
    </div>
  );
}

export default function AstroFollowerList({ followers }: { followers: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleUnfollow = (id: number) => {
    startTransition(async () => {
      try {
        await unFollow({ id });
        toast.success("Unfollowed successfully!");
        location.reload();
      } catch {
        toast.error("Something went wrong while unfollowing.");
      }
    });
  };

  return (
    <div className="p-6">
      <GlassCard>
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Follower List</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your followers</p>
        </div>

        <div className="mt-3">
          <TableHeader />
          <div className="divide-y divide-white/60 dark:divide-white/10">
            {followers?.length ? (
              followers.map((f: any) => {
                const user = f.user;
                const img = avatar(user?.profile);
                return (
                  <Row
                    key={f.id}
                    left={
                      <>
                        <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/10 shadow-sm">
                          <Image src={img} alt="Profile" width={40} height={40} className="h-full w-full object-cover" />
                        </div>
                        <div className="truncate font-medium">{user?.name || "Unknown"}</div>
                      </>
                    }
                    middle={<span className="text-slate-700 dark:text-slate-300">{user?.contactNo || "-"}</span>}
                    right={
                      <GlassButton
                        onClick={() => handleUnfollow(f.id)}
                        disabled={isPending}
                        variant="danger"
                        className="px-3 py-1.5 text-xs"
                      >
                        {isPending ? "Removing..." : "Unfollow"}
                      </GlassButton>
                    }
                  />
                );
              })
            ) : (
              <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No followers found.</div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export function UserFollowerList({ followers }: { followers: any[] }) {
  return (
    <div className="p-6">
      <GlassCard>
        <div className="px-4 pt-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Follower List</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Accounts you follow</p>
        </div>

        <div className="mt-3">
          <TableHeader />
          <div className="divide-y divide-white/60 dark:divide-white/10">
            {followers?.length ? (
              followers.map((f: any) => {
                const who = f.astrologer ?? f.aiAstrologer;
                const profilePath = f.astrologer?.profileImage || f.aiAstrologer?.image;
                const img = avatar(profilePath);
                return (
                  <Row
                    key={f.id}
                    left={
                      <>
                        <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/10 shadow-sm">
                          <Image src={img} alt="Profile" width={40} height={40} className="h-full w-full object-cover" />
                        </div>
                        <div className="truncate font-medium">{who?.name || "Unknown"}</div>
                      </>
                    }
                    middle={<span className="text-slate-700 dark:text-slate-300">{who?.contactNo || "-"}</span>}
                    right={<span className="text-slate-400 dark:text-slate-500">—</span>}
                  />
                );
              })
            ) : (
              <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">No followers found.</div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
