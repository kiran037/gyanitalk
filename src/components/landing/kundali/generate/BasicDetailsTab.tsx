// src/components/landing/kundali/generate/BasicDetailsTab.tsx
import { motion } from 'framer-motion';
import { 
  User, Calendar, MapPin, Clock, Star, Sun, Moon, 
  TrendingUp, Sparkles, Award, Droplets, Target, 
  AlertCircle, Heart, Crown 
} from 'lucide-react';

interface BasicDetailsTabProps {
  data: any;
}

export default function BasicDetailsTab({ data }: BasicDetailsTabProps) {
  const { basicDetails, planetDetails, ascendantReport } = data;

  // Helper to format date nicely
  const formattedDate = new Date(basicDetails.birthDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Personal Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/60 sm:p-6"
      >
        <div className="flex items-center gap-2 pb-4 sm:mb-2">
          <User className="h-5 w-5 text-[#FF6B35]" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
            Personal Information
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem 
            icon={User} 
            label="Name" 
            value={basicDetails.name} 
            color="orange"
          />
          <InfoItem 
            icon={Calendar} 
            label="Date of Birth" 
            value={formattedDate} 
            color="blue"
          />
          <InfoItem 
            icon={Clock} 
            label="Time of Birth" 
            value={basicDetails.birthTime} 
            color="purple"
          />
          <InfoItem 
            icon={MapPin} 
            label="Place of Birth" 
            value={basicDetails.birthPlace} 
            color="green"
            truncate={true}
          />
        </div>
      </motion.div>

      {/* Core Signs (The "Big Three") */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <SignCard 
          title="Ascendant" 
          subtitle="Your Personality"
          value={basicDetails.ascendant || ascendantReport?.ascendant || 'N/A'}
          icon={Crown}
          gradient="from-purple-500 to-indigo-500"
          bg="bg-purple-50 dark:bg-purple-900/20"
          text="text-purple-600 dark:text-purple-300"
        />
        <SignCard 
          title="Moon Sign" 
          subtitle="Your Emotions"
          value={basicDetails.moonSign || planetDetails.moon?.zodiac || 'N/A'}
          icon={Moon}
          gradient="from-blue-400 to-cyan-500"
          bg="bg-blue-50 dark:bg-blue-900/20"
          text="text-blue-600 dark:text-blue-300"
        />
        <SignCard 
          title="Sun Sign" 
          subtitle="Your Soul"
          value={basicDetails.sunSign || planetDetails.sun?.zodiac || 'N/A'}
          icon={Sun}
          gradient="from-amber-400 to-orange-500"
          bg="bg-amber-50 dark:bg-amber-900/20"
          text="text-amber-600 dark:text-amber-300"
        />
      </motion.div>

      {/* Ascendant Report */}
      {ascendantReport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200/60 bg-white/70 overflow-hidden shadow-sm backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/60"
        >
          {/* Header */}
          <div className="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FFB347] shadow-lg shadow-orange-500/20">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Ascendant Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Detailed reading for <span className="font-semibold text-[#FF6B35]">{ascendantReport.ascendant}</span> Rising
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Predictions */}
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">General Nature</h4>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {ascendantReport.general_prediction}
                </p>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-indigo-900 dark:text-indigo-200">
                  <Sparkles className="h-4 w-4" />
                  Personalized Insight
                </h4>
                <p className="text-sm leading-relaxed text-indigo-800 dark:text-indigo-300">
                  {ascendantReport.personalised_prediction}
                </p>
              </div>
            </div>

            {/* Qualities Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  <Award className="h-4 w-4" />
                  Strengths
                </h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {ascendantReport.good_qualities}
                </p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-900/30 dark:bg-rose-900/10">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-800 dark:text-rose-200">
                  <TrendingUp className="h-4 w-4" />
                  Challenges
                </h4>
                <p className="text-sm text-rose-700 dark:text-rose-300">
                  {ascendantReport.bad_qualities}
                </p>
              </div>
            </div>

            {/* Lucky Items Grid */}
            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Lucky Factors</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <LuckyItem 
                  label="Gemstone" 
                  value={ascendantReport.lucky_gem} 
                  icon={Sparkles}
                  color="purple" 
                />
                <LuckyItem 
                  label="Fasting Day" 
                  value={ascendantReport.day_for_fasting} 
                  icon={Calendar}
                  color="blue" 
                />
                <LuckyItem 
                  label="Symbol" 
                  value={ascendantReport.symbol} 
                  icon={Target}
                  color="pink" 
                />
                <LuckyItem 
                  label="Element" 
                  value={ascendantReport.zodiac_characteristics?.split(',')[1]?.trim() || 'N/A'} 
                  icon={Droplets}
                  color="amber" 
                />
              </div>
            </div>

            {/* Spiritual Advice */}
            <div className="flex gap-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-900 dark:from-blue-900/20 dark:to-cyan-900/20">
              <Heart className="h-6 w-6 flex-shrink-0 text-blue-500" />
              <div>
                <h4 className="mb-1 text-sm font-bold text-blue-900 dark:text-blue-100">Spiritual Guidance</h4>
                <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-300">
                  {ascendantReport.spirituality_advice}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Panchang Details */}
      {planetDetails.panchang && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-900/60 sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Moon className="h-5 w-5 text-[#FF6B35]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              Panchang at Birth
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <PanchangItem label="Day" value={planetDetails.panchang.day_of_birth} />
            <PanchangItem label="Tithi" value={planetDetails.panchang.tithi} />
            <PanchangItem label="Nakshatra" value={planetDetails.nakshatra} highlight />
            <PanchangItem label="Karana" value={planetDetails.panchang.karana} />
            <PanchangItem label="Yoga" value={planetDetails.panchang.yoga} />
            <PanchangItem label="Day Lord" value={planetDetails.panchang.day_lord} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* --- Helper Components for Cleaner Code --- */

function InfoItem({ icon: Icon, label, value, color, truncate = false }: any) {
  const colorStyles: Record<string, string> = {
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800/50">
      <div className={`rounded-lg p-2.5 ${colorStyles[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`font-semibold text-gray-900 dark:text-white ${truncate ? 'truncate' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SignCard({ title, subtitle, value, icon: Icon, gradient, bg, text }: any) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-transparent p-5 ${bg}`}>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest opacity-60 dark:text-white">{title}</p>
        <h3 className={`mb-1 text-2xl font-bold ${text}`}>{value}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300">{subtitle}</p>
      </div>
      {/* Decorative Background Blob */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl`} />
    </div>
  );
}

function LuckyItem({ label, value, icon: Icon, color }: any) {
  const colorStyles: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  };

  return (
    <div className={`rounded-xl p-3 ${colorStyles[color]}`}>
      <div className="mb-2 flex items-center gap-1.5 opacity-80">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function PanchangItem({ label, value, highlight = false }: any) {
  return (
    <div className={`rounded-xl border p-3 ${
      highlight 
        ? 'border-[#FF6B35]/30 bg-orange-50/50 dark:border-[#FF6B35]/20 dark:bg-orange-900/10' 
        : 'border-gray-100 bg-gray-50/30 dark:border-gray-800 dark:bg-gray-800/30'
    }`}>
      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`font-semibold ${highlight ? 'text-[#FF6B35]' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}