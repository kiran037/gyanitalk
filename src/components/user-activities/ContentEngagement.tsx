"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Eye, Heart, User, GraduationCap } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";

interface ContentEngagementProps {
  userId: string;
}

export function ContentEngagement({ userId }: ContentEngagementProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    fetchContent();
  }, [userId]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-activities/${userId}/content`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        addToast("error", "Error", "Failed to load content data");
      }
    } catch (error) {
      console.error(error);
      addToast("error", "Error", "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">No data available</div>;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Horoscope</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.horoscope.totalFeedback}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Stories</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stories.totalViews}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Kundali</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kundali.total}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Matching</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kundaliMatching.total}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Consults</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.consultations.total}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Courses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.courses.total}</p>
        </motion.div>
      </div>

      {/* Horoscope & Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horoscope Feedback */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF6B35]" />
            Horoscope Feedback
          </h3>

          <div className="space-y-3 mb-4">
            {data.horoscope.byType.map((type: any, i: number) => (
              <div key={type.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type.type}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{type.count}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Recent Feedback
            </p>
            {data.horoscope.recentFeedback.length > 0 ? (
              data.horoscope.recentFeedback.map((fb: any, i: number) => (
                <div key={fb.id} className="p-2 bg-gray-50/50 dark:bg-gray-800/50 rounded text-xs">
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">{fb.feedback}</p>
                  <span className="text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No feedback</p>
            )}
          </div>
        </motion.div>

        {/* Story Views */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#FF6B35]" />
            Story Views ({data.stories.totalViews})
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.stories.recent.length > 0 ? (
              data.stories.recent.map((story: any, i: number) => (
                <motion.div
                  key={story.id}
                  className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <img
                    src={avatar(story.astrologer?.profileImage)}
                    alt={story.astrologer?.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {story.astrologer?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Viewed {new Date(story.viewedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No stories viewed</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Kundali & Matching */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kundali */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#FF6B35]" />
            Kundali Created ({data.kundali.total})
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.kundali.kundalis.length > 0 ? (
              data.kundali.kundalis.map((k: any, i: number) => (
                <motion.div
                  key={k.id}
                  className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{k.name}</p>
                      <p className="text-xs text-gray-500">{k.gender}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p>DOB: {new Date(k.birthDate).toLocaleDateString()}</p>
                    <p>Place: {k.birthPlace}</p>
                    <p className="text-gray-400 mt-1">
                      Created: {new Date(k.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No kundali created</p>
            )}
          </div>
        </motion.div>

        {/* Kundali Matching */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#FF6B35]" />
            Kundali Matching ({data.kundaliMatching.total})
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.kundaliMatching.matchings.length > 0 ? (
              data.kundaliMatching.matchings.map((m: any, i: number) => (
                <motion.div
                  key={m.id}
                  className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {m.boyName} & {m.girlName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No matching done</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Consultations & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultations */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF6B35]" />
            Consultation Forms ({data.consultations.total})
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.consultations.recent.length > 0 ? (
              data.consultations.recent.map((form: any, i: number) => (
                <motion.div
                  key={form.id}
                  className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{form.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Topic: {form.topic}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No consultations</p>
            )}
          </div>
        </motion.div>

        {/* Courses */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#FF6B35]" />
            Courses Purchased ({data.courses.total})
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.courses.purchased.length > 0 ? (
              data.courses.purchased.map((course: any, i: number) => (
                <motion.div
                  key={course.id}
                  className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {course.courseImage && (
                    <img
                      src={avatar(course.courseImage)}
                      alt={course.courseName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {course.courseName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(course.purchasedAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-bold text-[#FF6B35]">₹{course.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No courses purchased</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}