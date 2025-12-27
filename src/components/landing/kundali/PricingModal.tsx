// components/landing/kundali/PricingModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Lock, Sparkles, TrendingUp } from 'lucide-react';

interface PricingOption {
  type: string;
  name: string;
  price: number;
  pages?: number;
  description: string;
  features: string[];
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: PricingOption[];
  onSelect: (option: PricingOption) => void;
  userBalance?: number;
}

export default function PricingModal({
  isOpen,
  onClose,
  options,
  onSelect,
  userBalance = 0
}: PricingModalProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'small':
        return '📄';
      case 'ai_prediction':
        return '🤖';
      case 'detailed':
        return '📊';
      case 'year_prediction':
        return '📅';
      case 'advanced':
        return '⭐';
      default:
        return '📋';
    }
  };

  const isPopular = (type: string) => type === 'detailed';
  const isBestValue = (type: string) => type === 'advanced';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-gray-200/60 bg-white/95 p-6 backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-900/95 sm:p-8"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-4 py-2"
                >
                  <Star className="h-4 w-4 text-[#FF6B35]" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    PREMIUM REPORTS
                  </span>
                </motion.div>

                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Choose Your Report
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                  Get detailed predictions, analysis, and remedies
                </p>

                {/* Wallet Balance */}
                {userBalance > 0 && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 dark:bg-green-900/20">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Wallet Balance: ₹{userBalance}
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing Grid */}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {options.map((option, index) => (
                  <motion.div
                    key={option.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Badges */}
                    {isPopular(option.type) && (
                      <div className="absolute -right-2 -top-2 z-10 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-3 py-1 text-xs font-bold text-white shadow-lg">
                        🔥 POPULAR
                      </div>
                    )}
                    {isBestValue(option.type) && (
                      <div className="absolute -right-2 -top-2 z-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                        ⭐ BEST VALUE
                      </div>
                    )}

                    {/* Card */}
                    <motion.div
                      className={`relative h-full overflow-hidden rounded-xl border ${
                        isPopular(option.type)
                          ? 'border-[#FF6B35] bg-gradient-to-br from-[#FF6B35]/5 to-[#FFB347]/5'
                          : 'border-gray-200/60 bg-white/60 dark:border-gray-700/60 dark:bg-white/5'
                      } p-6 backdrop-blur-sm transition-all hover:shadow-xl`}
                      whileHover={{ scale: 1.02, y: -4 }}
                    >
                      {/* Icon */}
                      <div className="mb-4 text-4xl">{getIcon(option.type)}</div>

                      {/* Title */}
                      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                        {option.name}
                      </h3>

                      {/* Pages */}
                      {option.pages && (
                        <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          📄 {option.pages} pages
                        </div>
                      )}

                      {/* Description */}
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>

                      {/* Features */}
                      <ul className="mb-6 space-y-2">
                        {option.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Price & CTA */}
                      <div className="mt-auto">
                        <div className="mb-4 flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{option.price}
                          </span>
                          <span className="text-sm text-gray-500">only</span>
                        </div>

                        <button
                          onClick={() => onSelect(option)}
                          disabled={userBalance < option.price}
                          className={`w-full rounded-lg py-3 font-semibold transition-all ${
                            userBalance >= option.price
                              ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg hover:scale-105'
                              : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-800'
                          }`}
                        >
                          {userBalance >= option.price ? (
                            <span className="flex items-center justify-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Get Report
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Lock className="h-4 w-4" />
                              Insufficient Balance
                            </span>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-900/10">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 <strong>Secure Payment:</strong> All transactions are encrypted and secure. 
                  Your report will be generated instantly and available for download.
                </p>
              </div>

              {/* Low Balance Warning */}
              {userBalance < Math.min(...options.map(o => o.price)) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-orange-200/60 bg-orange-50/60 p-4 dark:border-orange-900/60 dark:bg-orange-900/10"
                >
                  <div className="flex items-start gap-3">
                    <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                        Recharge Required
                      </h4>
                      <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                        Please add funds to your wallet to purchase reports
                      </p>
                      <button className="mt-3 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-700">
                        Add Money to Wallet
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}