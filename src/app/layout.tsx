"use client"

import "@/css/satoshi.css";
import "@/css/style.css";

import { Sidebar } from "@/components/Layouts/sidebar";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";


import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/sign-in" || pathname === "/login";

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />

          {isAuthPage ? (
            <div className="flex min-h-screen">

              <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
                <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            <div className="flex min-h-screen">
              <Sidebar />

              <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
                <Header />
                <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
                  {children}
                  <Toaster position="top-right" />
                  </main>
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );

}
