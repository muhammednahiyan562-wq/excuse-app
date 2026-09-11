import React from 'react';
import { motion } from 'motion/react';

interface ScoreCardProps {
  icon: string;
  label: string;
  score: number;
  colorClass: string;
  barColor: string;
  delay?: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  icon,
  label,
  score,
  colorClass,
  barColor,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl select-none">{icon}</span>
          <span className="font-semibold text-sm sm:text-base text-zinc-800 dark:text-zinc-200">
            {label}
          </span>
        </div>
        <div className="flex items-baseline">
          <span className={`text-xl sm:text-2xl font-black ${colorClass}`}>
            {Number.isInteger(score) ? score : score.toFixed(1)}
          </span>
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 ml-0.5">
            /10
          </span>
        </div>
      </div>

      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, (score / 10) * 100))}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </motion.div>
  );
};
