"use client";

export type Tone = "blue" | "green" | "purple" | "emerald" | "pink" | "orange" | "red";
const tone = {
  blue: { icon: "text-blue-600 dark:text-blue-400", tab: "border-blue-500 text-blue-600 bg-blue-50/60 dark:bg-blue-500/10" },
  green: { icon: "text-green-600 dark:text-green-400", tab: "border-green-500 text-green-600 bg-green-50/60 dark:bg-green-500/10" },
  purple:{ icon: "text-purple-600 dark:text-purple-400", tab:"border-purple-500 text-purple-600 bg-purple-50/60 dark:bg-purple-500/10" },
  emerald:{ icon:"text-emerald-600 dark:text-emerald-400", tab:"border-emerald-500 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-500/10" },
  pink: { icon:"text-pink-600 dark:text-pink-400", tab:"border-pink-500 text-pink-600 bg-pink-50/60 dark:bg-pink-500/10" },
  orange:{ icon:"text-orange-600 dark:text-orange-400", tab:"border-orange-500 text-orange-600 bg-orange-50/60 dark:bg-orange-500/10" },
  red:  { icon:"text-red-600 dark:text-red-400", tab:"border-red-500 text-red-600 bg-red-50/60 dark:bg-red-500/10" },
} as const;

export type TabsBarItem = {
  name: string;
  icon: React.ElementType;
  tone: Tone;
};

export default function TabsBar({
  items,
  active,
  onChange,
}: {
  items: TabsBarItem[];
  active: string;
  onChange: (name: string) => void;
}) {
  return (
    <div className="rounded-t-3xl overflow-hidden">
      <div className="border-b border-white/60 dark:border-white/10">
        <div className="flex overflow-x-auto">
          {items.map((t) => {
            const isActive = active === t.name;
            return (
              <button
                key={t.name}
                onClick={() => onChange(t.name)}
                className={[
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition border-b-2",
                  isActive ? tone[t.tone].tab : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300",
                ].join(" ")}
              >
                <t.icon className={`h-4 w-4 ${tone[t.tone].icon}`} />
                {t.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
