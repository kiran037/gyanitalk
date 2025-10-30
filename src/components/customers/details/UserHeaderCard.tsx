"use client";

import Image from "next/image";
import GlassButton from "@/components/GlassUI/GlassButton";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import StatChip from "./StatChip";
import InfoRow from "./InfoRow";
import { Edit3 } from "lucide-react";

export default function UserHeaderCard({
  profileSrc,
  name,
  joinedText,
  onEditClick,
  chips,
  contactRows,
}: {
  profileSrc: string;
  name: string;
  joinedText?: string;
  onEditClick: () => void;
  chips: Array<{ icon: React.ElementType; label: string; value: string }>;
  contactRows: Array<{ icon: React.ElementType; label: string; value: string; onClick?: () => void }>;
}) {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/70 dark:ring-white/10 shadow">
                <Image src={profileSrc} alt="profile" width={112} height={112} className="h-full w-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 block w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h1>
              {joinedText ? <p className="text-sm text-slate-600 dark:text-slate-400">{joinedText}</p> : null}
              <div className="mt-3">
                <GlassButton icon={Edit3} onClick={onEditClick}>Edit Profile</GlassButton>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 lg:ml-auto">
            {chips.map((c, i) => (
              <StatChip key={i} icon={c.icon} label={c.label} value={c.value} />
            ))}
          </div>
        </div>

        {/* Contact */}
        {contactRows?.length ? (
          <div className="pt-6 border-t border-white/60 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Contact Information</h3>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {contactRows.map((row, i) => (
                <InfoRow key={i} icon={row.icon} label={row.label} value={row.value} onValueClick={row.onClick} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
