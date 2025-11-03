"use client";

export default function InfoRow({
  icon: Icon,
  label,
  value,
  onValueClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onValueClick?: () => void;
}) {
  const clickable = Boolean(onValueClick);
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-white dark:from-white/[0.06] dark:to-white/[0.02] border border-white/60 dark:border-white/10">
        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p
          className={clickable ? "font-medium text-slate-900 dark:text-white cursor-pointer hover:underline" : "font-medium text-slate-900 dark:text-white"}
          onClick={onValueClick}
          title={clickable ? "Click to copy" : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
