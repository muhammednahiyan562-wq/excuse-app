/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { LoadingView } from './components/LoadingView';
import { ScoreGauge } from './components/ScoreGauge';
import { ScoreCard } from './components/ScoreCard';
import { ErrorView } from './components/ErrorView';
import { ExcuseAnalysis, RateExcuseResponse } from './types';
import { getCategoryDetails, EXAMPLE_EXCUSES } from './utils/category';
import { analyzeExcuseLocally, validateExcuseInput } from './utils/excuseJudge';
import { Share2, Copy, RotateCcw, CheckCircle2, Sparkles, Quote, AlertCircle } from 'lucide-react';

export default function App() {
  const [excuse, setExcuse] = useState('');
  const [submittedExcuse, setSubmittedExcuse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ExcuseAnalysis | null>(null);
  const [errorType, setErrorType] = useState<'MISSING_KEY' | 'RATE_LIMIT' | 'GENERAL_ERROR' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputWarning, setInputWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const charCount = excuse.length;
  const isInputEmpty = !excuse.trim();

  const handleRateExcuse = async () => {
    if (isInputEmpty || isLoading) return;

    const trimmedExcuse = excuse.trim();
    const validation = validateExcuseInput(trimmedExcuse);

    if (!validation.isValid) {
      setInputWarning(validation.warning || 'Please enter an actual excuse before submitting.');
      return;
    }

    setInputWarning(null);
    setIsLoading(true);
    setErrorType(null);
    setErrorMessage(null);
    setSubmittedExcuse(trimmedExcuse);

    // Guaranteed minimum loading duration so user sees the funny courthouse loading sequence
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const fetchPromise = fetch('/api/rate-excuse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ excuse: trimmedExcuse }),
      }).then(async (res) => {
        const json: RateExcuseResponse = await res.json();
        return json;
      });

      const [_, json] = await Promise.all([delayPromise, fetchPromise.catch(() => null)]);

      if (json && json.success && json.data) {
        setAnalysis(json.data);
      } else {
        // Instant reliable smart judge fallback - requires ZERO API keys!
        const localResult = analyzeExcuseLocally(trimmedExcuse);
        setAnalysis(localResult);
      }
    } catch {
      // Offline / zero-setup fallback
      const localResult = analyzeExcuseLocally(trimmedExcuse);
      setAnalysis(localResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExample = (example: string) => {
    setExcuse(example);
    setErrorType(null);
    setInputWarning(null);
  };

  const handleRateAnother = () => {
    setAnalysis(null);
    setErrorType(null);
    setErrorMessage(null);
    setExcuse('');
    setSubmittedExcuse('');
  };

  const handleShare = async () => {
    if (!analysis) return;
    const details = getCategoryDetails(analysis.category, analysis.overall);
    const appUrl = window.location.href;

    const shareText = `I got ${Number.isInteger(analysis.overall) ? analysis.overall : analysis.overall.toFixed(1)}/10 on ExcuseCheck ${details.emoji}\n\nApparently my excuse is ${details.label}.\n\nCan you beat my score?\n${appUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ExcuseCheck Score',
          text: shareText,
          url: appUrl,
        });
        return;
      } catch {
        // Fallback to clipboard if share was cancelled or failed
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const currentCategoryDetails = analysis
    ? getCategoryDetails(analysis.category, analysis.overall)
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-between selection:bg-amber-500 selection:text-white">
      <div className="w-full max-w-xl px-4 py-4 sm:py-6 flex-1 flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <LoadingView key="loading" />
            ) : errorType ? (
              <ErrorView
                key="error"
                errorType={errorType}
                errorMessage={errorMessage || undefined}
                onRetry={handleRateExcuse}
              />
            ) : analysis && currentCategoryDetails ? (
              /* ================= RESULT SCREEN ================= */
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6"
              >
                {/* Large animated overall score */}
                <ScoreGauge
                  score={analysis.overall}
                  categoryDetails={currentCategoryDetails}
                />

                {/* User's excuse quote card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                  <Quote className="w-8 h-8 text-amber-500/20 absolute -top-1 -left-1 transform rotate-180" />
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                    Your Excuse
                  </p>
                  <blockquote className="text-base sm:text-lg font-medium text-zinc-800 dark:text-zinc-200 italic pl-1 leading-snug">
                    "{submittedExcuse}"
                  </blockquote>
                </div>

                {/* Four Score Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <ScoreCard
                    icon="🌀"
                    label="Weirdness"
                    score={analysis.weirdness}
                    colorClass="text-purple-600 dark:text-purple-400"
                    barColor="bg-purple-500"
                    delay={0.1}
                  />
                  <ScoreCard
                    icon="🤨"
                    label="Believability"
                    score={analysis.believability}
                    colorClass="text-blue-600 dark:text-blue-400"
                    barColor="bg-blue-500"
                    delay={0.2}
                  />
                  <ScoreCard
                    icon="💡"
                    label="Creativity"
                    score={analysis.creativity}
                    colorClass="text-amber-600 dark:text-amber-400"
                    barColor="bg-amber-500"
                    delay={0.3}
                  />
                  <ScoreCard
                    icon="😂"
                    label="Comedy"
                    score={analysis.comedy}
                    colorClass="text-rose-600 dark:text-rose-400"
                    barColor="bg-rose-500"
                    delay={0.4}
                  />
                </div>

                {/* Verdict Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-500/10 border border-amber-500/20 text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>VERDICT</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    "{analysis.verdict}"
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    id="btn-share-score"
                    onClick={handleShare}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>COPIED TO CLIPBOARD!</span>
                      </>
                    ) : typeof navigator !== 'undefined' && 'share' in navigator ? (
                      <>
                        <Share2 className="w-5 h-5" />
                        <span>📤 SHARE MY SCORE</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>📋 COPY RESULT</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-rate-another"
                    onClick={handleRateAnother}
                    className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <RotateCcw className="w-5 h-5 text-zinc-500" />
                    <span>🔄 RATE ANOTHER</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ================= HOMEPAGE ================= */
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                {/* Headline & Subtitle */}
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                    How Weird Is Your Excuse?
                  </h1>
                  <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
                    Tell us your excuse. We'll judge it.
                  </p>
                </div>

                {/* Main Input Area */}
                <div className="flex flex-col gap-2.5">
                  <div className={`relative rounded-2xl border bg-white dark:bg-zinc-900 transition-all shadow-sm ${
                    inputWarning
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : 'border-zinc-300 dark:border-zinc-700/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20'
                  }`}>
                    <textarea
                      id="excuse-textarea"
                      value={excuse}
                      onChange={(e) => {
                        setExcuse(e.target.value.slice(0, 500));
                        if (inputWarning) setInputWarning(null);
                      }}
                      placeholder="I couldn't come because..."
                      rows={4}
                      maxLength={500}
                      className="w-full p-4 sm:p-5 rounded-2xl bg-transparent resize-none border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-base leading-relaxed"
                    />

                    {/* Character counter */}
                    <div className="flex justify-between items-center px-4 pb-3 pt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      <span className="text-[11px] font-medium text-zinc-400">
                        AI Judge &bull; 100% Free &bull; No Key Needed
                      </span>
                      <span className={`font-mono ${charCount >= 480 ? 'text-rose-500 font-bold' : ''}`}>
                        {charCount} / 500
                      </span>
                    </div>
                  </div>

                  {/* Warning banner if not an actual excuse */}
                  {inputWarning && (
                    <motion.div
                      id="non-excuse-warning"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-sm"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 leading-snug">
                        <span className="font-semibold">{inputWarning}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Main Action Button */}
                  <button
                    id="btn-rate-my-excuse"
                    onClick={handleRateExcuse}
                    disabled={isInputEmpty || isLoading}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                      isInputEmpty
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-600 hover:via-rose-600 hover:to-amber-700 text-white shadow-amber-500/25'
                    }`}
                  >
                    <span>🔥 RATE MY EXCUSE</span>
                  </button>
                </div>

                {/* Example Excuses */}
                <div className="pt-2 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <span>Try an example excuse:</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {EXAMPLE_EXCUSES.map((item, idx) => (
                      <button
                        key={idx}
                        id={`btn-example-${idx}`}
                        onClick={() => handleSelectExample(item)}
                        className="text-left p-3 sm:p-3.5 rounded-xl bg-white dark:bg-zinc-900/90 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-300 dark:hover:border-amber-700/50 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 transition-colors flex items-start gap-2.5 group"
                      >
                        <span className="text-amber-500 font-bold select-none mt-0.5 group-hover:scale-110 transition-transform">
                          👉
                        </span>
                        <span className="leading-snug">"{item}"</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-10 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 text-center text-xs text-zinc-400 dark:text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ExcuseCheck &copy; {new Date().getFullYear()}</span>
          <span>Zero Paid API Calls &bull; 100% Free to Use</span>
        </footer>
      </div>
    </div>
  );
}
