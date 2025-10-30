"use client";

import { Suspense } from "react";
import CustomerProfileClient from "@/components/(settings)/customer-profile/CustomerProfileClient";

export default function Page() {
  return (
    <main className="min-h-screen px-6 py-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Default Profiles</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage and update default profile images.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading…</div>}>
          <CustomerProfileClient />
        </Suspense>
      </div>
    </main>
  );
}
