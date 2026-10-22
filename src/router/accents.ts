/**
 * Accent colours a route can use. Full class names are listed here
 * (instead of being built dynamically) so Tailwind can detect them.
 */
export type Accent = 'indigo' | 'emerald' | 'amber' | 'sky';

export const ACCENTS: Record<Accent, { search: string; card: string; cardArrow: string }> = {
  indigo: {
    search: 'text-indigo-500',
    card: 'text-indigo-600 dark:text-indigo-400',
    cardArrow: 'group-hover:text-indigo-600',
  },
  emerald: {
    search: 'text-emerald-500',
    card: 'text-emerald-600 dark:text-emerald-400',
    cardArrow: 'group-hover:text-emerald-600',
  },
  amber: {
    search: 'text-amber-500',
    card: 'text-amber-600 dark:text-amber-400',
    cardArrow: 'group-hover:text-amber-600',
  },
  sky: {
    search: 'text-sky-500',
    card: 'text-sky-600 dark:text-sky-400',
    cardArrow: 'group-hover:text-sky-600',
  },
};
