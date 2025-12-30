
// app/astro/ai/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { ArrowLeft, Edit, RefreshCw } from "lucide-react";
import { AIAstrologerDetail } from "@/components/astro/ai/AIAstrologerDetail";
import { AIAstrologerForm } from "@/components/astro/ai/AIAstrologerForm";


export default function AIAstrologerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const addToast = useToast();
  const aiAstrologerId = params.id as string;

  const [aiAstrologer, setAiAstrologer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchAIAstrologerDetails();
  }, [aiAstrologerId]);

  const fetchAIAstrologerDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai-astrologers/${aiAstrologerId}`);
      const data = await response.json();

      if (data.success) {
        setAiAstrologer(data.data);
      } else {
        addToast("error", "Error", "Failed to fetch AI astrologer");
        router.push("/astro/ai");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch AI astrologer");
      router.push("/astro/ai");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading AI astrologer...</p>
        </div>
      </div>
    );
  }

  if (!aiAstrologer) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.push("/astro/ai")}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={fetchAIAstrologerDetails}
            />
            <Button
              size="sm"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => setShowEditForm(true)}
            >
              Edit
            </Button>
          </div>
        </div>

        <AIAstrologerDetail aiAstrologer={aiAstrologer} />
      </div>

      {showEditForm && (
        <AIAstrologerForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          aiAstrologer={aiAstrologer}
          onSuccess={() => {
            fetchAIAstrologerDetails();
            setShowEditForm(false);
          }}
        />
      )}
    </div>
  );
}