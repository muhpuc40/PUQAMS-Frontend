import React, { useRef, useEffect } from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
  helperText?: string;
  indeterminate?: boolean;
  variant?: 'checkbox' | 'switch';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      helperText,
      indeterminate = false,
      variant = 'checkbox',
      checked,
      disabled,
      onChange,
      className = '',
      id,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLInputElement | null>(null);
    const inputId = id || (typeof label === 'string' ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const setRefs = (el: HTMLInputElement | null) => {
      internalRef.current = el;
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    };

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    if (variant === 'switch') {
      return (
        <div className="flex flex-col gap-1">
          <label
            htmlFor={inputId}
            className={`inline-flex items-start gap-3 cursor-pointer select-none ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="relative inline-flex items-center shrink-0 mt-0.5">
              <input
                ref={setRefs}
                id={inputId}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                className="sr-only peer"
                {...props}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20 dark:peer-focus:ring-indigo-500/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500" />
            </div>

            <div className="flex flex-col">
              {label && (
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  {description}
                </span>
              )}
            </div>
          </label>

          {(error || helperText) && (
            <div className="text-[11px] pl-12 leading-tight">
              {error ? (
                <span className="text-rose-500 font-medium">{error}</span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">{helperText}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    // Standard Checkbox
    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              ref={setRefs}
              id={inputId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={onChange}
              className="sr-only peer"
              {...props}
            />
            <div
              className={`w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center ${
                checked || indeterminate
                  ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-500 dark:border-indigo-500'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 peer-hover:border-slate-400'
              } ${error ? 'border-rose-400 dark:border-rose-500' : ''} peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/20`}
            >
              {indeterminate ? (
                <Minus className="w-3 h-3 stroke-[3]" />
              ) : checked ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col">
            {label && (
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                {description}
              </span>
            )}
          </div>
        </label>

        {(error || helperText) && (
          <div className="text-[11px] pl-6 leading-tight">
            {error ? (
              <span className="text-rose-500 font-medium">{error}</span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">{helperText}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
