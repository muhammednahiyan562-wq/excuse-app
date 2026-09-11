import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const LOADING_MESSAGES = [
  '🔍 Examining your excuse...',
  '🧠 Measuring believability...',
  '🛸 Detecting weirdness...',
  '⚖️ Preparing your verdict...',
];

export const LoadingView: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
        {/* Ambient pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-amber-400/20 blur-md"
        />
        {/* Animated spinner ring */}
        <div className="w-24 h-24 rounded-full border-4 border-amber-200 dark:border-amber-900/40 border-t-amber-500 animate-spin" />
        <div className="absolute text-3xl select-none animate-bounce">
          ⚖️
        </div>
      </div>

      <div className="h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100"
          >
            {LOADING_MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        AI excuse court is currently in session...
      </p>
    </motion.div>
  );
};
