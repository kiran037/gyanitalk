// components/landing/panchang/PanchangInfo.tsx
"use client";

import { motion } from "framer-motion";
import { BookOpen, HelpCircle, AlertTriangle, CheckCircle2, Lightbulb, Info } from "lucide-react";

export default function PanchangInfo() {
  const elements = [
    {
      title: "Tithi",
      description:
        "The lunar day. Crucial for determining the auspiciousness of an activity. Each Tithi favors different types of actions.",
    },
    {
      title: "Nakshatra",
      description:
        "The lunar constellation the moon is passing through. It heavily influences the mindset and outcome of events.",
    },
    {
      title: "Yoga",
      description:
        "A mathematical calculation of Sun and Moon positions. It determines the underlying essence of the day.",
    },
    {
      title: "Karana",
      description:
        "Half of a Tithi. It is the active element used for finer timing of specific tasks and rituals.",
    },
  ];

  const timings = [
    {
      title: "Rahu Kaal",
      description: "Inauspicious period ruled by Rahu. Avoid starting new ventures.",
      type: "warning",
    },
    {
      title: "Gulika Kalam",
      description: "Ruled by Saturn's son. Generally avoided for commencements.",
      type: "warning",
    },
    {
      title: "Abhijit Muhurta",
      description: "The most auspicious mid-day window for almost all good activities.",
      type: "success",
    },
  ];

  return (
    <motion.div
      className="space-y-6 sm:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* 1. What is Panchang? */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-orange-50 p-2.5 text-[#FF6B35] dark:bg-orange-900/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            What is Panchang?
          </h3>
        </div>

        <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 sm:prose-base">
          <p>
            Panchang is the ancient Hindu almanac that tracks the precise movements of the Sun and Moon to determine the quality of time. The word is derived from Sanskrit: <strong>Panch (Five)</strong> + <strong>Anga (Limbs)</strong>.
          </p>
          <p className="mt-3">
            It serves as a cosmic compass, helping millions align their daily activities—from weddings to business launches—with favorable energy cycles (Muhurats) to ensure success and harmony.
          </p>
        </div>
      </motion.div>

      {/* 2. The 5 Elements Grid */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-900/20">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            The 5 Cosmic Limbs
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {elements.map((element, index) => (
            <motion.div
              key={element.title}
              className="group rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition-colors hover:border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800/60"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#FF6B35]">
                {element.title}
              </h4>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {element.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 3. Timings Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Important Timings */}
        <motion.div
          className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">
            Critical Timings Explained
          </h3>

          <div className="space-y-4">
            {timings.map((timing, index) => (
              <div
                key={timing.title}
                className={`flex gap-4 rounded-xl p-4 ${
                  timing.type === "warning"
                    ? "bg-rose-50 dark:bg-rose-900/10"
                    : "bg-emerald-50 dark:bg-emerald-900/10"
                }`}
              >
                <div className={`mt-0.5 flex-shrink-0 ${
                  timing.type === "warning" ? "text-rose-500" : "text-emerald-500"
                }`}>
                  {timing.type === "warning" ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${
                    timing.type === "warning" ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"
                  }`}>
                    {timing.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {timing.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4. Pro Tips */}
        <motion.div
          className="flex flex-col justify-between rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10 sm:p-8"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <div className="mb-5 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Lightbulb className="h-6 w-6" />
              <h3 className="text-lg font-bold">Quick Usage Tips</h3>
            </div>

            <ul className="space-y-4">
              {[
                "Avoid Rahu Kaal for starting journeys or signing contracts.",
                "Abhijit Muhurta cancels out most negative doshas (flaws).",
                "For weddings and property purchases, always consult a personalized chart.",
                "Panchang timings change daily based on your sunrise location."
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-indigo-900 dark:text-indigo-200">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 rounded-xl bg-white/60 p-4 text-xs font-medium text-indigo-800 backdrop-blur-sm dark:bg-black/20 dark:text-indigo-300">
            <div className="mb-1 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              <strong>Note:</strong>
            </div>
            These are general guidelines. Personal planetary periods (Dasha) may override general Panchang results.
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}