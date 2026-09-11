import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, KeyRound, Clock } from 'lucide-react';

interface ErrorViewProps {
  errorType?: 'MISSING_KEY' | 'RATE_LIMIT' | 'GENERAL_ERROR';
  errorMessage?: string;
  onRetry: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  errorType = 'GENERAL_ERROR',
  errorMessage,
  onRetry,
}) => {
  let title = 'Oops! Our excuse department got confused.';
  let subtitle = 'Something went wrong while evaluating your excuse. Please try again.';
  let Icon = AlertTriangle;
  let iconBg = 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400';

  if (errorType === 'RATE_LIMIT') {
    title = '🛑 The free AI limit has been reached.';
    subtitle = 'Try again later.';
    Icon = Clock;
    iconBg = 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400';
  } else if (errorType === 'MISSING_KEY') {
    title = 'Gemini API is not configured yet.';
    subtitle = 'Please configure your free Google Gemini API key in the AI Studio Settings > Secrets panel (GEMINI_API_KEY).';
    Icon = KeyRound;
    iconBg = 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400';
  } else if (errorMessage) {
    title = errorMessage;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center flex flex-col items-center"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${iconBg}`}>
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {subtitle}
      </p>

      <button
        id="btn-retry-error"
        onClick={onRetry}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm transition-transform active:scale-95 shadow"
      >
        <RefreshCw className="w-4 h-4" />
        <span>TRY AGAIN</span>
      </button>
    </motion.div>
  );
};
