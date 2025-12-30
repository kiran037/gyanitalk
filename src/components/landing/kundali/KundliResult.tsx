

// components/landing/kundali/KundliResult.tsx
import { motion } from 'framer-motion';
import { 
  User, Calendar, MapPin, Clock, Star, 
  TrendingUp, Award, Share2,
  ChevronDown, ChevronUp, RotateCcw
} from 'lucide-react';
import { useState } from 'react';
import ChartDisplay from './ChartDisplay';
import PlanetPositions from './PlanetPositions';
import HousesDisplay from './HousesDisplay';
import PricingModal from './PricingModal';

interface KundliResultProps {
  data: any;
  onUpgrade: () => void;
  onGenerateNew: () => void;
}

export default function KundliResult({ data, onUpgrade, onGenerateNew }: KundliResultProps) {
  const [showPricing, setShowPricing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    planets: true,
    houses: true,
    predictions: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const kundli = data.data.kundli;
  const birthDetails = {
    name: kundli.name,
    birthDate: kundli.birthDate,
    birthTime: kundli.birthTime,
    birthPlace: kundli.birthPlace
  };

  const handleShare = () => {
    const shareText = `Check out my Vedic Kundli!\n\nName: ${kundli.name}\nAscendant: ${kundli.ascendant}\nMoon Sign: ${kundli.moonSign}\nSun Sign: ${kundli.sunSign}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Kundli',
        text: shareText,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Kundli details copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl border border-green-200/60 bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-6 backdrop-blur-sm dark:border-green-900/60 dark:from-green-900/20 dark:to-emerald-900/20"
      >
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-green-400/20 blur-3xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="rounded-full bg-green-500 p-3">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
              Your Kundli is Ready! ✨
            </h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              {data.isFreeTier && (
                <>Free generations remaining: <strong>{data.remainingFreeGenerations}</strong></>
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={onGenerateNew}
                className="flex items-center gap-2 rounded-lg border border-green-600/20 bg-white/80 px-4 py-2 text-sm font-semibold text-green-700 transition-all hover:bg-white dark:bg-green-900/30 dark:text-green-300"
              >
                <RotateCcw className="h-4 w-4" />
                Generate New
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-lg border border-green-600/20 bg-white/80 px-4 py-2 text-sm font-semibold text-green-700 transition-all hover:bg-white dark:bg-green-900/30 dark:text-green-300"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Birth Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FF6B35]/10 p-2">
              <User className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-semibold text-gray-900 dark:text-white">{kundli.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FF6B35]/10 p-2">
              <Calendar className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(kundli.birthDate).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FF6B35]/10 p-2">
              <Clock className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">{kundli.birthTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FF6B35]/10 p-2">
              <MapPin className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Place</p>
              <p className="truncate font-semibold text-gray-900 dark:text-white">{kundli.birthPlace}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Basic Astrology */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <button
          onClick={() => toggleSection('basic')}
          className="flex w-full items-center justify-between p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Basic Astrology
          </h3>
          {expandedSections.basic ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        
        {expandedSections.basic && (
          <div className="border-t border-gray-200/60 p-6 dark:border-gray-700/60">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200/60 bg-white/60 p-4 text-center dark:border-gray-700/60 dark:bg-white/5">
                <div className="mb-2 text-4xl">♈</div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Ascendant (Lagna)</p>
                <p className="text-2xl font-bold text-[#FF6B35]">{kundli.ascendant}</p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Your personality and how you appear to others
                </p>
              </div>
              <div className="rounded-xl border border-gray-200/60 bg-white/60 p-4 text-center dark:border-gray-700/60 dark:bg-white/5">
                <div className="mb-2 text-4xl">🌙</div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Moon Sign (Rashi)</p>
                <p className="text-2xl font-bold text-[#FF6B35]">{kundli.moonSign}</p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Your emotions and inner self
                </p>
              </div>
              <div className="rounded-xl border border-gray-200/60 bg-white/60 p-4 text-center dark:border-gray-700/60 dark:bg-white/5">
                <div className="mb-2 text-4xl">☀️</div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Sun Sign</p>
                <p className="text-2xl font-bold text-[#FF6B35]">{kundli.sunSign}</p>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Your core identity and life purpose
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Chart Display */}
      {data.chart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ChartDisplay
            chartUrl={data.chart}
            chartType="D1 (Rasi Chart)"
            birthDetails={birthDetails}
          />
        </motion.div>
      )}

      {/* Planet Positions */}
      {kundli.planetPositions && kundli.planetPositions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
        >
          <button
            onClick={() => toggleSection('planets')}
            className="flex w-full items-center justify-between p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Planetary Positions
            </h3>
            {expandedSections.planets ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {expandedSections.planets && (
            <div className="border-t border-gray-200/60 p-6 dark:border-gray-700/60">
              <PlanetPositions planets={kundli.planetPositions} />
            </div>
          )}
        </motion.div>
      )}

      {/* Houses Display */}
      {kundli.houses && kundli.houses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
        >
          <button
            onClick={() => toggleSection('houses')}
            className="flex w-full items-center justify-between p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              House Details
            </h3>
            {expandedSections.houses ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {expandedSections.houses && (
            <div className="border-t border-gray-200/60 p-6 dark:border-gray-700/60">
              <HousesDisplay houses={kundli.houses} />
            </div>
          )}
        </motion.div>
      )}

      {/* Premium Upsell */}
      {data.upgradeToPaid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-[#FF6B35]/20 bg-gradient-to-br from-[#FF6B35]/10 via-[#FFB347]/10 to-[#FF6B35]/10 p-8 backdrop-blur-sm"
        >
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#FF6B35]/20 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Unlock Premium Reports
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get detailed predictions, dasha analysis, and personalized remedies
                </p>
              </div>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.upgradeToPaid.options.slice(0, 3).map((option: any) => (
                <div
                  key={option.type}
                  className="rounded-xl border border-gray-200/60 bg-white/80 p-4 dark:border-gray-700/60 dark:bg-white/10"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {option.name}
                    </h4>
                    <span className="text-lg font-bold text-[#FF6B35]">
                      ₹{option.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPricing(true)}
              className="w-full rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02] sm:w-auto sm:px-8"
            >
              View All Premium Options
            </button>
          </div>
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-900/10"
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          💡 <strong>Note:</strong> This is a free basic Kundli report. For detailed predictions, 
          planetary dashas, yogas, doshas, and personalized remedies, upgrade to our premium reports.
        </p>
      </motion.div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        options={data.upgradeToPaid?.options || []}
        onSelect={(option) => {
          console.log('Selected:', option);
          // Handle purchase
        }}
      />
    </div>
  );
}