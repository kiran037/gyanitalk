// ===================================
// FILE: components/requests/RequestActionsMenu.tsx
// ===================================

"use client";

import { useState } from "react";
import { MoreVertical, UserPlus, Repeat, Radio, Eye, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RequestActionsMenuProps {
  requestId: number;
  requestType: "call" | "chat";
  status: string;
  onAssign: () => void;
  onReassign: () => void;
  onViewDetails: () => void;
}

export function RequestActionsMenu({
  requestId,
  requestType,
  status,
  onAssign,
  onReassign,
  onViewDetails,
}: RequestActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isPending = status === "Pending";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 py-1"
            >
              <button
                onClick={() => {
                  onViewDetails();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>

              {isPending && (
                <>
                  <button
                    onClick={() => {
                      onAssign();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <UserPlus className="w-4 h-4" />
                    Assign to Group
                  </button>

                  <button
                    onClick={() => {
                      onReassign();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <Repeat className="w-4 h-4" />
                    Reassign
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}