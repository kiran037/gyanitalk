import ClientUI from "./ClientUI";
import { getHelpSupport } from "@/app/helpSupport/fetch";

type Support = { id: number; name: string };

export default async function HelpSupportPage() {
  const res = await getHelpSupport();
  const initialSupports: Support[] = Array.isArray(res) ? res : (res?.data ?? []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl p-6 md:p-8 space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Help Support</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Manage top-level help topics.</p>
          </div>
        </header>

        <ClientUI initialSupports={initialSupports} />
      </div>
    </div>
  );
}
