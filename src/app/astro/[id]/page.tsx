"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { AstrologerDetailHeader } from "@/components/astro/AstrologerDetailHeader";
import { AstrologerTabs } from "@/components/astro/AstrologerTabs";

export default function AstrologerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToast();
  const astrologerId = params.id as string;

  const [astrologer, setAstrologer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chatHistory");

  useEffect(() => {
    fetchAstrologerDetails();
  }, [astrologerId]);

  const fetchAstrologerDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}`);
      const data = await response.json();

      if (data.success) {
        setAstrologer(data.data);
      } else {
        addToast("error", "Error", data.error || "Failed to fetch astrologer");
        router.push("/astro");
      }
    } catch (error) {
      console.error("Error fetching astrologer:", error);
      addToast("error", "Error", "Failed to fetch astrologer details");
      router.push("/astro");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading astrologer details...</p>
        </div>
      </div>
    );
  }

  if (!astrologer) {
    return null;
  }

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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push("/astro")}
          >
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchAstrologerDetails}
          >
            Refresh
          </Button>
        </div>

        {/* Astrologer Header */}
        <AstrologerDetailHeader astrologer={astrologer} />

        {/* Tabs */}
        <AstrologerTabs
          astrologerId={astrologerId}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}