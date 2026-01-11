"use client";

import { motion } from "framer-motion";
import { Sparkles, PartyPopper, AlertTriangle } from "lucide-react";

interface PanchangExtendedInfoProps {
  data: any;
}

export default function PanchangExtendedInfo({ data }: PanchangExtendedInfoProps) {
  if (!data) return null;
  const festivals = data.festival_list || [];
  const yogas = data.yogas || [];

  if (festivals.length === 0 && yogas.length === 0) return null;

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Festivals Section */}
      {festivals.length > 0 && (
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4 dark:border-purple-900/30 dark:from-purple-900/10 dark:to-pink-900/10 sm:rounded-3xl sm:p-6">
          <div className="mb-3 flex items-center gap-3 sm:mb-4">
            <div className="rounded-xl bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 sm:p-2.5">
              <PartyPopper className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
              Festivals & Observances
            </h3>
          </div>

          <div className="space-y-3">
            {festivals.map((festival: any, index: number) => (
              <div key={index} className="rounded-xl border border-purple-100 bg-white/60 p-3 backdrop-blur-sm dark:border-purple-900/20 dark:bg-gray-900/40 sm:rounded-2xl sm:p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-base font-bold text-purple-900 dark:text-purple-200 sm:text-lg">
                    {festival.festival_name}
                  </h4>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 sm:px-3 sm:py-1 sm:text-xs">
                    {festival.type}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 sm:text-sm">
                  {festival.significance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Yogas Section */}
      {yogas.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4 dark:border-amber-900/30 dark:from-amber-900/10 dark:to-orange-900/10 sm:rounded-3xl sm:p-6">
          <div className="mb-3 flex items-center gap-3 sm:mb-4">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 sm:p-2.5">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
              Special Planetary Yogas
            </h3>
          </div>

          <div className="space-y-3">
            {yogas.map((yoga: any, index: number) => (
              <div key={index} className="rounded-xl border border-amber-100 bg-white/60 p-3 backdrop-blur-sm dark:border-amber-900/20 dark:bg-gray-900/40 sm:rounded-2xl sm:p-4">
                <div className="mb-2 flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400 sm:h-5 sm:w-5" />
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-amber-900 dark:text-amber-200 sm:text-lg">
                      {yoga.yoga_name}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-gray-700 dark:text-gray-300 sm:text-sm">
                      {yoga.significance}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 sm:px-3 sm:py-1 sm:text-xs">
                      {yoga.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}