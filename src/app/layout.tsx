
// app/layout.tsx

import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import NextTopLoader from "nextjs-toploader";
import { Providers } from "./providers";
import { AppShell } from "./AppShell";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://gyanitallk.com"
  ),
  title: {
    default: "Gyanitallk Admin",
    template: "%s | Gyanitallk Admin",
  },
  description: "Admin panel for the Gyanitallk astrology platform.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      {/* No overflow-hidden here so public pages can scroll normally */}
      <body className="h-full">
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}