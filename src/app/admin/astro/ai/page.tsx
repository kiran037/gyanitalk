// app/astro/ai/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { Bot, Plus, RefreshCw } from "lucide-react";
import { AIAstrologerCard } from "@/components/astro/ai/AIAstrologerCard";
import { AIAstrologerForm } from "@/components/astro/ai/AIAstrologerForm";
import { motion } from "framer-motion";

export default function AIAstrologersPage() {
  const router = useRouter();
  const addToast = useToast();
  const [aiAstrologers, setAiAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAstrologer, setEditingAstrologer] = useState<any>(null);

  useEffect(() => {
    fetchAIAstrologers();
  }, []);

  const fetchAIAstrologers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai-astrologers${search ? `?search=${search}` : ""}`);
      const data = await response.json();

      if (data.success) {
        setAiAstrologers(data.data);
      } else {
        addToast("error", "Error", "Failed to fetch AI astrologers");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch AI astrologers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-astrologers/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "AI Astrologer deleted");
        fetchAIAstrologers();
      } else {
        addToast("error", "Error", "Failed to delete");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete");
    }
  };

  const handleEdit = (astrologer: any) => {
    setEditingAstrologer(astrologer);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="AI Astrologers"
          subtitle="Manage AI-powered astrologers and their configurations"
          badge={{ text: "AI MANAGEMENT", variant: "purple" }}
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={fetchAIAstrologers}
              />
              <Button
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setEditingAstrologer(null);
                  setShowForm(true);
                }}
              >
                Add AI Astrologer
              </Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-6">
          <motion.div
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total AI Astrologers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aiAstrologers.length}
                </p>
              </div>
              <Bot className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search AI astrologers..."
            className="flex-1"
          />
          <Button onClick={fetchAIAstrologers}>Search</Button>
        </div>

        {/* AI Astrologers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : aiAstrologers.length === 0 ? (
          <div className="text-center py-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl">
            <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No AI Astrologers
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first AI astrologer to get started
            </p>
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
              Add AI Astrologer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiAstrologers.map((ai, index) => (
              <AIAstrologerCard
                key={ai.id}
                aiAstrologer={ai}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={() => router.push(`/admin/astro/ai/${ai.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <AIAstrologerForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingAstrologer(null);
          }}
          aiAstrologer={editingAstrologer}
          onSuccess={() => {
            fetchAIAstrologers();
            setShowForm(false);
            setEditingAstrologer(null);
          }}
        />
      )}
    </div>
  );
}