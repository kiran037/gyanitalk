"use client";

export function Field(props: any) {
  const { label, className, ...rest } = props;
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input
        {...rest}
        className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
      />
    </div>
  );
}

export function SelectField({ label, options, className, ...rest }: any) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <select
        {...rest}
        className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition"
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextArea({ label, className, ...rest }: any) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <textarea
        {...rest}
        className="w-full px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition resize-none"
      />
    </div>
  );
}
