"use client";

export default function StatChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-sm">
      <Icon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
