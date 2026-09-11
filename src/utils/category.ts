import { ExcuseCategory } from '../types';

export interface CategoryDetails {
  category: ExcuseCategory;
  emoji: string;
  label: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  gradient: string;
}

export function getCategoryDetails(category: ExcuseCategory, score: number): CategoryDetails {
  // Ensure consistency with score brackets on a 1-10 scale (also accommodates legacy inputs if any)
  const normalizedScore = score > 10 ? score / 10 : score;

  if (normalizedScore <= 2 || category === 'Completely Normal') {
    return {
      category: 'Completely Normal',
      emoji: '😇',
      label: 'COMPLETELY NORMAL',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      accentColor: '#10b981',
      gradient: 'from-emerald-500 to-teal-500',
    };
  }
  if (normalizedScore <= 4 || category === 'Slightly Suspicious') {
    return {
      category: 'Slightly Suspicious',
      emoji: '🤔',
      label: 'SLIGHTLY SUSPICIOUS',
      badgeBg: 'bg-blue-500/10 border-blue-500/30',
      badgeText: 'text-blue-700 dark:text-blue-300',
      accentColor: '#3b82f6',
      gradient: 'from-blue-500 to-cyan-500',
    };
  }
  if (normalizedScore <= 6 || category === 'Getting Weird') {
    return {
      category: 'Getting Weird',
      emoji: '🧐',
      label: 'GETTING WEIRD',
      badgeBg: 'bg-amber-500/10 border-amber-500/30',
      badgeText: 'text-amber-700 dark:text-amber-300',
      accentColor: '#f59e0b',
      gradient: 'from-amber-500 to-yellow-500',
    };
  }
  if (normalizedScore <= 8 || category === 'Definitely Questionable') {
    return {
      category: 'Definitely Questionable',
      emoji: '🚨',
      label: 'DEFINITELY QUESTIONABLE',
      badgeBg: 'bg-orange-500/10 border-orange-500/30',
      badgeText: 'text-orange-700 dark:text-orange-300',
      accentColor: '#f97316',
      gradient: 'from-orange-500 to-rose-500',
    };
  }
  if (normalizedScore <= 9.5 || category === 'Extremely Weird') {
    return {
      category: 'Extremely Weird',
      emoji: '🛸',
      label: 'EXTREMELY WEIRD',
      badgeBg: 'bg-purple-500/10 border-purple-500/30',
      badgeText: 'text-purple-700 dark:text-purple-300',
      accentColor: '#a855f7',
      gradient: 'from-purple-500 to-indigo-500',
    };
  }
  return {
    category: 'Absolutely Unhinged',
    emoji: '💀',
    label: 'ABSOLUTELY UNHINGED',
    badgeBg: 'bg-rose-500/10 border-rose-500/30',
    badgeText: 'text-rose-700 dark:text-rose-300',
    accentColor: '#ef4444',
    gradient: 'from-rose-600 to-pink-600',
  };
}

export const EXAMPLE_EXCUSES = [
  'My alarm and I are no longer on speaking terms.',
  'I couldn\'t finish my homework because my cat was judging me.',
  'I was late because I forgot what day it was.',
  'My Wi-Fi was emotionally unavailable.',
  'My neighbor\'s chicken distracted me for three hours.',
];
