import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  isClearable?: boolean;
  onClear?: () => void;
  fullWidth?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      type = 'text',
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      isClearable = false,
      onClear,
      fullWidth = true,
      disabled,
      className = '',
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === 'password';
    const computedType = isPasswordType && showPassword ? 'text' : type;

    const sizeClasses: Record<InputSize, { container: string; input: string; icon: string }> = {
      sm: { container: 'h-8 text-xs', input: 'py-1 text-xs', icon: 'w-3.5 h-3.5' },
      md: { container: 'h-10 text-sm', input: 'py-2 text-sm', icon: 'w-4 h-4' },
      lg: { container: 'h-12 text-base', input: 'py-2.5 text-base', icon: 'w-5 h-5' },
    };

    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : 'inline-flex'}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none flex items-center justify-between"
          >
            <span>{label}</span>
            {props.required && <span className="text-rose-500 font-normal ml-0.5">*</span>}
          </label>
        )}

        <div
          className={`relative flex items-center rounded-lg border transition-all duration-150 bg-white dark:bg-slate-900 ${
            error
              ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 dark:border-rose-500'
              : 'border-slate-300 dark:border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:focus-within:border-indigo-400'
          } ${disabled ? 'opacity-60 bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed' : ''} ${
            sizeClasses[size].container
          } ${className}`}
        >
          {prefix && (
            <span className="px-3 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 h-full flex items-center select-none rounded-l-lg">
              {prefix}
            </span>
          )}

          {leftIcon && (
            <div className="pl-3 pr-1 text-slate-400 dark:text-slate-500 shrink-0 flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={computedType}
            disabled={disabled}
            value={value}
            onChange={onChange}
            aria-invalid={!!error}
            className={`w-full bg-transparent px-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed ${
              sizeClasses[size].input
            }`}
            {...props}
          />

          <div className="flex items-center gap-1 pr-2.5 shrink-0">
            {isClearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={onClear}
                tabIndex={-1}
                aria-label="Clear text"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded"
              >
                <X className={sizeClasses[size].icon} />
              </button>
            )}

            {isPasswordType && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded"
              >
                {showPassword ? (
                  <EyeOff className={sizeClasses[size].icon} />
                ) : (
                  <Eye className={sizeClasses[size].icon} />
                )}
              </button>
            )}

            {rightIcon && !isPasswordType && (
              <div className="text-slate-400 dark:text-slate-500 flex items-center">
                {rightIcon}
              </div>
            )}
          </div>

          {suffix && (
            <span className="px-3 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 border-l border-slate-300 dark:border-slate-700 h-full flex items-center select-none rounded-r-lg">
              {suffix}
            </span>
          )}
        </div>

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

TextInput.displayName = 'TextInput';

export default TextInput;
