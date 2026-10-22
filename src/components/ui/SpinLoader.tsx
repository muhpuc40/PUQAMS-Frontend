import React from 'react';

export type SpinSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinColor = 'primary' | 'white' | 'slate' | 'emerald' | 'amber' | 'rose';
export type SpinType = 'ring' | 'dots' | 'pulse';

export interface SpinLoaderProps {
  size?: SpinSize;
  color?: SpinColor;
  type?: SpinType;
  label?: string;
  className?: string;
}

export const SpinLoader: React.FC<SpinLoaderProps> = ({
  size = 'md',
  color = 'primary',
  type = 'ring',
  label,
  className = '',
}) => {
  const sizeMap: Record<SpinSize, { dimension: string; stroke: string; dot: string }> = {
    xs: { dimension: 'w-3.5 h-3.5', stroke: 'border-2', dot: 'w-1 h-1' },
    sm: { dimension: 'w-4 h-4', stroke: 'border-2', dot: 'w-1.5 h-1.5' },
    md: { dimension: 'w-6 h-6', stroke: 'border-2.5', dot: 'w-2 h-2' },
    lg: { dimension: 'w-8 h-8', stroke: 'border-3', dot: 'w-2.5 h-2.5' },
    xl: { dimension: 'w-12 h-12', stroke: 'border-4', dot: 'w-3.5 h-3.5' },
  };

  const colorMap: Record<SpinColor, { border: string; borderTop: string; bg: string }> = {
    primary: {
      border: 'border-indigo-200 dark:border-indigo-900',
      borderTop: 'border-t-indigo-600 dark:border-t-indigo-400',
      bg: 'bg-indigo-600 dark:bg-indigo-400',
    },
    white: {
      border: 'border-white/30',
      borderTop: 'border-t-white',
      bg: 'bg-white',
    },
    slate: {
      border: 'border-slate-200 dark:border-slate-700',
      borderTop: 'border-t-slate-700 dark:border-t-slate-200',
      bg: 'bg-slate-700 dark:bg-slate-200',
    },
    emerald: {
      border: 'border-emerald-200 dark:border-emerald-900',
      borderTop: 'border-t-emerald-600 dark:border-t-emerald-400',
      bg: 'bg-emerald-600 dark:bg-emerald-400',
    },
    amber: {
      border: 'border-amber-200 dark:border-amber-900',
      borderTop: 'border-t-amber-500 dark:border-t-amber-400',
      bg: 'bg-amber-500 dark:bg-amber-400',
    },
    rose: {
      border: 'border-rose-200 dark:border-rose-900',
      borderTop: 'border-t-rose-600 dark:border-t-rose-400',
      bg: 'bg-rose-600 dark:bg-rose-400',
    },
  };

  const { dimension, stroke, dot } = sizeMap[size];
  const { border, borderTop, bg } = colorMap[color];

  if (type === 'dots') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`} role="status">
        <span className={`${dot} ${bg} rounded-full animate-bounce [animation-delay:-0.3s]`} />
        <span className={`${dot} ${bg} rounded-full animate-bounce [animation-delay:-0.15s]`} />
        <span className={`${dot} ${bg} rounded-full animate-bounce`} />
        {label && <span className="text-xs text-slate-500 ml-1">{label}</span>}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`} role="status">
        <div className={`relative ${dimension}`}>
          <div className={`absolute inset-0 rounded-full ${bg} opacity-25 animate-ping`} />
          <div className={`relative rounded-full ${bg} ${dimension}`} />
        </div>
        {label && <span className="text-xs text-slate-500">{label}</span>}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status">
      <div
        className={`${dimension} rounded-full animate-spin ${stroke} ${border} ${borderTop}`}
        aria-hidden="true"
      />
      {label && <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>}
    </div>
  );
};

export default SpinLoader;
