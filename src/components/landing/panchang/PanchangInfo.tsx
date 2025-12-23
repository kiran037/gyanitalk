// components/landing/panchang/PanchangInfo.tsx
"use client";

import { motion } from "framer-motion";
import { BookOpen, HelpCircle } from "lucide-react";

export default function PanchangInfo() {
  const elements = [
    {
      title: "Tithi",
      description:
        "Lunar day in the Hindu calendar. Each Tithi represents a specific phase of the moon and has unique significance for various activities.",
    },
    {
      title: "Nakshatra",
      description:
        "One of 27 lunar constellations in Vedic astrology. Each Nakshatra governs specific qualities and is important for timing events.",
    },
    {
      title: "Yoga",
      description:
        "Auspicious combination formed by the angular relationship between the Sun and Moon. There are 27 Yogas in total.",
    },
    {
      title: "Karana",
      description:
        "Half of a Tithi. There are 11 Karanas that repeat in a fixed cycle, each with its own characteristics.",
    },
  ];

  const timings = [
    {
      title: "Rahu Kaal",
      description:
        "Inauspicious period ruled by Rahu. Generally avoided for starting new ventures or important activities.",
      type: "warning",
    },
    {
      title: "Gulika Kalam",
      description:
        "Period ruled by Saturn's son. Considered unfavorable for most auspicious activities.",
      type: "warning",
    },
    {
      title: "Abhijit Muhurta",
      description:
        "Most auspicious time of the day. Ideal for starting new ventures, important meetings, and ceremonies.",
      type: "success",
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* What is Panchang */}
      <motion.div
        className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <BookOpen className="h-5 w-5 text-[#FF6B35]" />
          What is Panchang?
        </h3>

        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          Panchang is a Hindu calendar and almanac that provides important
          astronomical and astrological information. The word "Panchang" comes
          from Sanskrit, where "Panch" means five and "Anga" means limbs. It
          consists of five main elements: Tithi, Nakshatra, Yoga, Karana, and
          Var (weekday).
        </p>

        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          Panchang is used to determine auspicious timings (Muhurat) for
          important life events such as weddings, business ventures, travel, and
          religious ceremonies. It helps people align their activities with
          cosmic energies for maximum benefit.
        </p>
      </motion.div>

      {/* Panchang Elements Explained */}
      <motion.div
        className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <HelpCircle className="h-5 w-5 text-[#FF6B35]" />
          Understanding Panchang Elements
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {elements.map((element, index) => (
            <motion.div
              key={element.title}
              className="rounded-xl bg-gray-50/80 p-4 dark:bg-gray-800/60"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="mb-2 font-bold text-gray-900 dark:text-white">
                {element.title}
              </h4>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {element.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Timings Explained */}
      <motion.div
        className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
          Important Timings
        </h3>

        <div className="space-y-4">
          {timings.map((timing, index) => (
            <motion.div
              key={timing.title}
              className={`rounded-xl p-4 ${
                timing.type === "warning"
                  ? "bg-orange-50/80 dark:bg-orange-900/10"
                  : "bg-green-50/80 dark:bg-green-900/10"
              }`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4
                className={`mb-2 font-bold ${
                  timing.type === "warning"
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {timing.title}
              </h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {timing.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        className="rounded-2xl border border-blue-200/70 bg-blue-50/70 p-6 backdrop-blur-xl dark:border-blue-800/70 dark:bg-blue-900/10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          💡 Tips for Using Panchang
        </h3>

        <ul className="space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
            <span>
              Avoid starting new ventures during Rahu Kaal and Gulika Kalam
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
            <span>
              Abhijit Muhurta is considered universally auspicious for most
              activities
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
            <span>
              Consult with an astrologer for personalized Muhurta selection for
              important events
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
            <span>
              The effects of Panchang elements can vary based on your personal
              birth chart
            </span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}