"use client";

import { useState, useEffect } from "react";
import { Clock, Award, Users, DollarSign, Calendar, MapPin, GraduationCap, Languages } from "lucide-react";
import { motion } from "framer-motion";

export function CompleteDetailsTab({ astrologerId }: { astrologerId: string }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompleteDetails();
  }, [astrologerId]);

  const fetchCompleteDetails = async () => {
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}/complete-details`);
      const data = await response.json();
      if (data.success) setDetails(data.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <motion.div
        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FF6B35]" />
          Professional Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Experience</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {details.basicInfo?.experienceInYears} years
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Daily Contribution</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {details.basicInfo?.dailyContribution} consultations
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Highest Qualification</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {details.basicInfo?.highestQualification || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Degree</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {details.basicInfo?.degree || "N/A"}
            </p>
          </div>
          {details.basicInfo?.college && (
            <div className="md:col-span-2">
              <p className="text-gray-600 dark:text-gray-400 mb-1">Institution</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {details.basicInfo.college}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Availability */}
      {details.availability?.length > 0 && (
        <motion.div
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FF6B35]" />
            Weekly Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {details.availability.map((avail: any) => (
              <div
                key={avail.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <span className="font-medium text-gray-900 dark:text-white">{avail.day}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {avail.fromTime && avail.toTime
                    ? `${avail.fromTime} - ${avail.toTime}`
                    : "Not Available"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Groups */}
      {details.groups?.length > 0 && (
        <motion.div
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF6B35]" />
            Assigned Groups
          </h3>
          <div className="flex flex-wrap gap-2">
            {details.groups.map((group: any) => (
              <span
                key={group.id}
                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-medium rounded-lg"
              >
                {group.group?.name || "Unknown Group"}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Commissions */}
      {details.commissions?.length > 0 && (
        <motion.div
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#FF6B35]" />
            Commission Structure
          </h3>
          <div className="space-y-3">
            {details.commissions.map((comm: any) => (
              <div
                key={comm.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {comm.commissionType?.name}
                </span>
                <span className="text-lg font-bold text-[#FF6B35]">{comm.commission}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}