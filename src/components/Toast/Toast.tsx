// components/Toast/Toast.tsx
import { motion } from "framer-motion";
import { Check, AlertCircle, Info, X, Sparkles } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  onClose: (id: string) => void;
}

export default function Toast({ id, type, title, message, onClose }: ToastProps) {
  const typeConfig = {
    success: {
      gradient: "from-green-500/10 to-emerald-500/10",
      border: "border-green-500/30",
      iconBg: "from-green-500 to-emerald-500",
      textColor: "text-green-700 dark:text-green-400",
      Icon: Check,
    },
    error: {
      gradient: "from-red-500/10 to-rose-500/10",
      border: "border-red-500/30",
      iconBg: "from-red-500 to-rose-500",
      textColor: "text-red-700 dark:text-red-400",
      Icon: AlertCircle,
    },
    warning: {
      gradient: "from-[#FF6B35]/10 to-[#FFB347]/10",
      border: "border-[#FF6B35]/30",
      iconBg: "from-[#FF6B35] to-[#FFB347]",
      textColor: "text-orange-700 dark:text-orange-400",
      Icon: AlertCircle,
    },
    info: {
      gradient: "from-blue-500/10 to-cyan-500/10",
      border: "border-blue-500/30",
      iconBg: "from-blue-500 to-cyan-500",
      textColor: "text-blue-700 dark:text-blue-400",
      Icon: Info,
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className="relative"
    >
      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-white/40 to-white/20 rounded-full pointer-events-none"
          initial={{
            x: Math.random() * 50 - 25,
            y: Math.random() * 50 - 25,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            y: [null, -80],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
          style={{
            left: `${20 + i * 30}%`,
            top: "50%",
          }}
        />
      ))}

      <div
        className={`relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-2 ${config.border} rounded-2xl p-4 shadow-2xl overflow-hidden min-w-[320px] max-w-md`}
      >
        {/* Gradient background effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`}
        />

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${
              type === "warning" ? "#FF6B35" : config.iconBg.split(" ")[1]
            }40, transparent)`,
          }}
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative z-10 flex items-start gap-3">
          {/* Icon with rotating background */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.div
              className={`w-10 h-10 bg-gradient-to-br ${config.iconBg} rounded-xl flex items-center justify-center shadow-lg`}
              animate={{
                boxShadow: [
                  "0 4px 20px rgba(0,0,0,0.1)",
                  "0 6px 30px rgba(255,107,53,0.3)",
                  "0 4px 20px rgba(0,0,0,0.1)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <IconComponent className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.h4
              className={`font-bold text-sm ${config.textColor} mb-1`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.h4>
            <motion.p
              className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {message}
            </motion.p>
          </div>

          {/* Close button */}
          <motion.button
            onClick={() => onClose(id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>

        {/* Progress bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 4, ease: "linear" }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </motion.div>
  );
}