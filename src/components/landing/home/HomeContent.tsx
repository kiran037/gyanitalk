"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  Globe2, 
  Clock, 
  UserCheck, 
  ScrollText, 
  Gem,
  HeartHandshake
} from "lucide-react";

export default function HomeContent() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black overflow-hidden">
      
      {/* --- Background Elements --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100 dark:bg-orange-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-100 dark:bg-orange-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-24">
        
        {/* --- Section 1: Philosophy (Why Astrology?) --- */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase"
          >
            <Sparkles className="w-3 h-3" />
            Ancient Wisdom
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white"
          >
            Why Astrology? <span className="text-orange-500">Decoding the Cosmic Blueprint</span>
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="prose prose-lg dark:prose-invert mx-auto text-gray-600 dark:text-gray-300 leading-relaxed"
          >
            <p>
              Have you ever noticed how certain events unfold with uncanny timing? Astrology isn't just about predicting the future; it is the language of synchronization. It explains how the cosmic rhythm of planets and stars influences the ebb and flow of our earthly lives.
            </p>
            <p>
              In a world full of uncertainty, GyaniTalk bridges the gap between ancient Vedic knowledge and modern dilemmas. Whether you are at a crossroads in your career, seeking clarity in love, or searching for spiritual purpose, your unique birth chart holds the map. By aligning your actions with these cosmic currents, you move from confusion to clarity, walking a path that feels destined yet empowered.
            </p>
          </motion.div>
        </div>

        {/* --- Section 2: How It Works --- */}
        <div className="relative">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Your Journey with <span className="text-orange-600 dark:text-orange-400">GyaniTalk</span>
            </h3>
            <p className="mt-3 text-gray-500 dark:text-gray-400">From confusion to clarity in four simple steps.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-800 transition-colors group"
              >
                <div className="w-10 h-10 mb-2 bg-white dark:bg-black rounded-xl flex items-center justify-center shadow-sm text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- Section 3: Why Online? (Grid Feature) --- */}
        <div className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-black rounded-3xl p-8 sm:p-12 border border-orange-100 dark:border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Traditional Wisdom, <br/>
                <span className="text-orange-500">Digital Convenience.</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Gone are the days of traveling long distances to find a reputable Guru. GyaniTalk brings the ashram to your smartphone. Online consultation offers a level of privacy and comfort that face-to-face meetings often lack.
              </p>
              
              <ul className="space-y-4">
                {advantages.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <FeatureCard icon={<Globe2 />} label="Global Access" desc="Connect from anywhere" />
               <FeatureCard icon={<Clock />} label="24/7 Availability" desc="Guidance anytime" />
               <FeatureCard icon={<UserCheck />} label="Verified Experts" desc="100% Vetted Panel" />
               <FeatureCard icon={<ScrollText />} label="Private & Secure" desc="Anonymous Chat" />
            </div>

          </div>
        </div>

        {/* --- Section 4: Daily Horoscope & Expertise --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Horoscope Column */}
          <div className="space-y-6">
             <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ScrollText className="w-6 h-6 text-orange-500" />
                Planetary Rhythms
             </h3>
             <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300">
                <p>
                  The universe is always in motion. Our Daily Horoscope feature isn't just a prediction; it's a weather forecast for your soul. By understanding the daily shift of the Moon and planetary transits, you can align your activities with favorable times.
                </p>
                <p>
                  From <strong>Aries to Pisces</strong>, GyaniTalk provides detailed insights into how cosmic energies affect your mood, career prospects, and relationships today. Use these insights to navigate your day with confidence rather than caution.
                </p>
             </div>
          </div>

          {/* Our Experts Column */}
          <div className="space-y-6">
             <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Gem className="w-6 h-6 text-orange-500" />
                The GyaniTalk Standard
             </h3>
             <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300">
                <p>
                  We don't just onboard anyone. Our astrologers undergo a rigorous testing process that evaluates not just their predictive accuracy, but their empathy and communication skills. We blend the purity of Vedic traditions with a modern, practical approach to problem-solving.
                </p>
                <p>
                  Beyond consultations, the <strong>GyaniTalk Store</strong> offers energized gemstones and spiritual tools, personally curated by experts to enhance your vibrations.
                </p>
             </div>
          </div>
        </div>

        {/* --- Conclusion --- */}
        <div className="text-center pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className="text-lg font-medium text-gray-900 dark:text-white max-w-3xl mx-auto leading-relaxed">
            "Astrology doesn't take away your free will; it empowers it. By understanding the celestial climate, you can make informed decisions, transforming obstacles into stepping stones."
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <HeartHandshake className="w-4 h-4" />
            <span>Start your journey with GyaniTalk today.</span>
          </div>
        </div>

      </div>
    </section>
  );
}

// --- Data & Subcomponents ---

const steps = [
  {
    title: "Digital Access",
    desc: "Access ancient wisdom instantly via the GyaniTalk app or website from the comfort of your home.",
    icon: <Smartphone className="w-6 h-6" />
  },
  {
    title: "Chart Generation",
    desc: "Input your birth details to generate a precise Kundli map of your karmic journey.",
    icon: <ScrollText className="w-6 h-6" />
  },
  {
    title: "Select an Expert",
    desc: "Browse profiles, read reviews, and pick an astrologer that resonates with your energy.",
    icon: <UserCheck className="w-6 h-6" />
  },
  {
    title: "Get Answers",
    desc: "Chat or Call instantly to receive personalized remedies and actionable guidance.",
    icon: <HeartHandshake className="w-6 h-6" />
  }
];

const advantages = [
  "100% Confidential discussions regarding Love, Career, and Finance.",
  "Introductory offers allow you to test compatibility with astrologers.",
  "Access to diverse specialists: Tarot, Vedic, Numerology, and Vastu.",
  "Transparent pricing per minute with no hidden charges."
];

function FeatureCard({ icon, label, desc }: { icon: any, label: string, desc: string }) {
  return (
    <div className="bg-white dark:bg-black/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
      <div className="text-orange-500 mb-2">{icon}</div>
      <div className="font-bold text-gray-900 dark:text-white text-sm">{label}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
    </div>
  );
}