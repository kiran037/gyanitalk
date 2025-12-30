// app/admin/layout.tsx
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: {
    default: "Gyanitallk Admin",
    template: "%s | Gyanitallk Admin",
  },
  description: "Admin panel for the Gyanitallk astrology platform.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: PropsWithChildren) {
  // Don't change layout structure here, AppShell from root still wraps everything.
  return <>{children}</>;
}