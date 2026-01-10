/**
 * Floating AI Chat Button
 * Global floating button that provides quick access to AI chat
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Sparkles, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingAIChatButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to AI Hub with chat feature active
    navigate("/ai-hub");
    // You can also add a query param to auto-open chat
    // navigate("/ai-hub?feature=chat");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Try AI Features
            </div>
            {/* Arrow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-8 border-transparent border-l-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 flex items-center justify-center group overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity animate-gradient-shift" />

        {/* Pulsing Ring */}
        <div className="absolute inset-0 rounded-full bg-purple-500 opacity-75 animate-ping" />

        {/* Icon */}
        <div className="relative z-10">
          <Bot size={28} className="drop-shadow-lg" />
        </div>

        {/* Sparkle Effect */}
        <Sparkles className="absolute top-2 right-2 w-4 h-4 text-yellow-300 animate-pulse" />

        {/* Notification Badge (optional - show when there are AI suggestions) */}
        {/* <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white">
          3
        </div> */}
      </motion.button>

      {/* Mini Feature Pills (Optional - shows on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 right-0 flex flex-col gap-2 items-end"
          >
            <MiniFeaturePill
              icon={<Sparkles className="w-4 h-4" />}
              label="DNA Match"
              color="from-purple-600 to-pink-600"
              delay={0}
            />
            <MiniFeaturePill
              icon={<TrendingUp className="w-4 h-4" />}
              label="Market Intel"
              color="from-blue-600 to-cyan-600"
              delay={0.05}
            />
            <MiniFeaturePill
              icon={<MessageSquare className="w-4 h-4" />}
              label="AI Chat"
              color="from-emerald-600 to-green-600"
              delay={0.1}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mini Feature Pill Component
const MiniFeaturePill = ({
  icon,
  label,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay }}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${color} text-white rounded-full shadow-lg text-sm font-medium`}
    >
      {icon}
      {label}
    </motion.div>
  );
};

// Import for TrendingUp
import { TrendingUp } from "lucide-react";

export default FloatingAIChatButton;

// Add this to tailwind.config.js for the gradient animation:
/*
module.exports = {
  theme: {
    extend: {
      animation: {
        'gradient-shift': 'gradientShift 3s ease infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
}
*/
