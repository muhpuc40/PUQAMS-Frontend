import React from 'react';
import { Loader2 } from 'lucide-react';

export type CardVariant = 'default' | 'bordered' | 'flat';

export interface CardBoxProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Right-aligned header action slot, ideal for CustomButton */
  headerAction?: React.ReactNode;
  /** Right-aligned footer action slot, ideal for CustomButton */
  footer?: React.ReactNode;
  variant?: CardVariant;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const CardBox: React.FC<CardBoxProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  footer,
  variant = 'default',
  isLoading = false,
  children,
  className = '',
  bodyClassName = '',
}) => {
  const variantStyles: Record<CardVariant, string> = {
    default:
      'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs',
    bordered:
      'bg-transparent border border-slate-300 dark:border-slate-700',
    flat:
      'bg-slate-100/70 dark:bg-slate-800/40 border border-transparent',
  };

  const hasHeader = title || subtitle || icon || headerAction;

  return (
    <div
      data-card-box="true"
      className={`card-box relative rounded-xl transition-all duration-150 ${variantStyles[variant]} ${className}`}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/75 dark:bg-slate-900/75 backdrop-blur-xs rounded-xl">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Header with right-aligned headerAction */}
      {hasHeader && (
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 rounded-t-xl">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="text-slate-500 dark:text-slate-400 shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right-aligned Header Action Slot for CustomButton */}
          {headerAction && (
            <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>

      {/* Footer with right-aligned Action Slot for CustomButton */}
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl flex items-center justify-end gap-2.5">
          {footer}
        </div>
      )}
    </div>
  );
};

export default CardBox;
