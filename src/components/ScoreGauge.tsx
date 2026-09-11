import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CategoryDetails } from '../utils/category';

interface ScoreGaugeProps {
  score: number;
  categoryDetails: CategoryDetails;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, categoryDetails }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = score;
    const duration = 800;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        // Round to 1 decimal place if needed or whole integer
        setDisplayScore(Math.round(start * 10) / 10);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Circumference for 62px radius circle
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  // Scale is 1-10 (progress ratio is score / 10)
  const ratio = Math.max(0, Math.min(1, score / 10));
  const strokeDashoffset = circumference - ratio * circumference;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-sm"
    >
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center mb-4">
        {/* SVG Circular Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            className="text-zinc-200/80 dark:text-zinc-800"
            fill="transparent"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={categoryDetails.accentColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center score details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl sm:text-5xl select-none mb-1 animate-pulse">
            {categoryDetails.emoji}
          </span>
          <div className="flex items-baseline">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {Number.isInteger(displayScore) ? displayScore : displayScore.toFixed(1)}
            </span>
            <span className="text-base sm:text-lg font-bold text-zinc-400 dark:text-zinc-500 ml-1">
              /10
            </span>
          </div>
        </div>
      </div>

      {/* Category Pill */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-extrabold tracking-wider uppercase ${categoryDetails.badgeBg} ${categoryDetails.badgeText}`}
      >
        {categoryDetails.label}
      </motion.div>
    </motion.div>
  );
};
