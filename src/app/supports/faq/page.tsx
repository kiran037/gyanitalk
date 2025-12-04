// app/supports/faq/page.tsx
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { CategoryManager } from "@/components/supports/faq/CategoryManager";
import { QuestionManager } from "@/components/supports/faq/QuestionManager";
import { AnswerManager } from "@/components/supports/faq/AnswerManager";
import { HelpCircle, List, MessageSquare, Layers } from "lucide-react";
import { motion } from "framer-motion";

type TabType = "categories" | "questions" | "answers";

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<TabType>("categories");

  const tabs = [
    { id: "categories" as TabType, label: "Categories", icon: Layers },
    { id: "questions" as TabType, label: "Questions", icon: HelpCircle },
    { id: "answers" as TabType, label: "Answers", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader
            title="FAQ Management"
            subtitle="Manage help center categories, questions, and answers"
            badge={{ text: "SUPPORT", variant: "purple" }}
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200/60 dark:border-gray-700/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "categories" && <CategoryManager />}
            {activeTab === "questions" && <QuestionManager />}
            {activeTab === "answers" && <AnswerManager />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}