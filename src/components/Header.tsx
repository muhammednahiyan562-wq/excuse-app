import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full flex items-center justify-between py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-6 sm:mb-8">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-md shadow-amber-500/20 text-white text-lg font-bold select-none">
          ⚖️
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-zinc-900 dark:text-zinc-50">
            Excuse<span className="text-amber-500">Check</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-semibold tracking-wide select-none">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Free AI &bull; No Key Required</span>
      </div>
    </header>
  );
};
