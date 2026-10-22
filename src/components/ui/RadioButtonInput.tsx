import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

export interface RadioButtonInputProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  error?: string;
  variant?: 'simple' | 'cards';
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
}

export const RadioButtonInput: React.FC<RadioButtonInputProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  helperText,
  error,
  variant = 'simple',
  orientation = 'vertical',
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
          {label}
        </label>
      )}

      <div
        className={`flex ${
          orientation === 'horizontal' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2.5'
        }`}
        role="radiogroup"
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          if (variant === 'cards') {
            return (
              <label
                key={option.value}
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                    : isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onChange(option.value)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 shrink-0 cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <span className="text-slate-600 dark:text-slate-400 shrink-0">
                          {option.icon}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {option.label}
                      </span>
                    </div>
                    {option.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 font-medium rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {option.description}
                    </p>
                  )}
                </div>
              </label>
            );
          }

          // Simple native-styled radio
          return (
            <label
              key={option.value}
              className={`flex items-center gap-2.5 cursor-pointer select-none ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onChange(option.value)}
                className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-700 focus:ring-indigo-500 shrink-0 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
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
};

export default RadioButtonInput;
