import React, { useRef, useEffect } from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  maxLength?: number;
  showCharCount?: boolean;
  autoResize?: boolean;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      maxLength,
      showCharCount = false,
      autoResize = false,
      fullWidth = true,
      rows = 4,
      disabled,
      className = '',
      id,
      value,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (el: HTMLTextAreaElement | null) => {
      internalRef.current = el;
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    };

    useEffect(() => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = 'auto';
        internalRef.current.style.height = `${internalRef.current.scrollHeight + 2}px`;
      }
    }, [value, autoResize]);

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : 'inline-flex'}`}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none flex items-center"
            >
              <span>{label}</span>
              {props.required && <span className="text-rose-500 font-normal ml-0.5">*</span>}
            </label>
          )}

          {showCharCount && maxLength && (
            <span
              className={`text-[11px] font-mono tabular-nums ${
                currentLength >= maxLength
                  ? 'text-rose-500 font-semibold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={setRefs}
          id={inputId}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900 transition-all duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500'
              : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:border-indigo-400'
          } ${autoResize ? 'resize-none overflow-hidden' : 'resize-y'} ${className}`}
          {...props}
        />

        {(error || helperText) && (
          <div className="text-[11px] leading-tight">
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

Textarea.displayName = 'Textarea';

export default Textarea;
