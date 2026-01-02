// app/admin/astro/new/page.tsx
"use client";

import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AstrologerForm } from "@/components/astro/AstrologerForm";

export default function NewAstrologerPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full mx-auto relative z-10">
        {/* Header */}
        <PageHeader
          title="Add New Astrologer"
          subtitle="Create a new astrologer profile"
          badge={{ text: "NEW", variant: "green" }}
          leftActions={
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push("/admin/astro")}
              ariaLabel="Back to astrologers"
            />
          }
        />

        {/* Form */}
        <div className="mt-6">
          <AstrologerForm mode="create" />
        </div>
      </div>
    </div>
  );
}