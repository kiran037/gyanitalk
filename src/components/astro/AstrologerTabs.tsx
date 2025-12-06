"use client";

import { motion } from "framer-motion";
import { 
  MessageSquare, Phone, Wallet, Users, Bell, 
  Star, Gift, Image, FileText 
} from "lucide-react";
import { ChatHistoryTab } from "./tabs/ChatHistoryTab";
import { CallHistoryTab } from "./tabs/CallHistoryTab";
import { WalletTab } from "./tabs/WalletTab";
import { FollowersTab } from "./tabs/FollowersTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { GiftsTab } from "./tabs/GiftsTab";
import { GalleryTab } from "./tabs/GalleryTab";
import { CompleteDetailsTab } from "./tabs/CompleteDetailsTab";

interface AstrologerTabsProps {
  astrologerId: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: "chatHistory", label: "Chat History", icon: MessageSquare },
  { id: "callHistory", label: "Call History", icon: Phone },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "followers", label: "Followers", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "gifts", label: "Gifts", icon: Gift },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "details", label: "Details", icon: FileText },
];

export function AstrologerTabs({
  astrologerId,
  activeTab,
  setActiveTab,
}: AstrologerTabsProps) {
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "chatHistory" && <ChatHistoryTab astrologerId={astrologerId} />}
        {activeTab === "callHistory" && <CallHistoryTab astrologerId={astrologerId} />}
        {activeTab === "wallet" && <WalletTab astrologerId={astrologerId} />}
        {activeTab === "followers" && <FollowersTab astrologerId={astrologerId} />}
        {activeTab === "notifications" && <NotificationsTab astrologerId={astrologerId} />}
        {activeTab === "reviews" && <ReviewsTab astrologerId={astrologerId} />}
        {activeTab === "gifts" && <GiftsTab astrologerId={astrologerId} />}
        {activeTab === "gallery" && <GalleryTab astrologerId={astrologerId} />}
        {activeTab === "details" && <CompleteDetailsTab astrologerId={astrologerId} />}
      </motion.div>
    </div>
  );
}