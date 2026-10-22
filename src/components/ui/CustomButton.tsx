import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-150 select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap active:scale-[0.98]';

  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 h-7',
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5 h-8',
    md: 'px-4 py-2 text-sm gap-2 h-10',
    lg: 'px-5 py-2.5 text-base gap-2.5 h-12',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm focus-visible:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus-visible:ring-slate-400',
    outline:
      'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/60 focus-visible:ring-slate-400',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:ring-slate-400',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm focus-visible:ring-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm focus-visible:ring-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default CustomButton;
