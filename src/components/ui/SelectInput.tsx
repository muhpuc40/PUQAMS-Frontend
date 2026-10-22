import React from 'react';
import { ChevronDown } from 'lucide-react';
import { InputSize } from './TextInput';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectInputProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  options?: (SelectOption | SelectOptionGroup)[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const SelectInput = React.forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      options,
      placeholder,
      fullWidth = true,
      disabled,
      children,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const sizeClasses: Record<InputSize, { container: string; icon: string }> = {
      sm: { container: 'h-8 text-xs py-1 pl-3 pr-8', icon: 'w-3.5 h-3.5' },
      md: { container: 'h-10 text-sm py-2 pl-3 pr-9', icon: 'w-4 h-4' },
      lg: { container: 'h-12 text-base py-2.5 pl-4 pr-10', icon: 'w-5 h-5' },
    };

    const isOptionGroup = (item: SelectOption | SelectOptionGroup): item is SelectOptionGroup => {
      return 'options' in item;
    };

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : 'inline-flex'}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none flex items-center"
          >
            <span>{label}</span>
            {props.required && <span className="text-rose-500 font-normal ml-0.5">*</span>}
          </label>
        )}

        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            className={`w-full appearance-none rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500'
                : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:border-indigo-400'
            } ${sizeClasses[size].container} ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-slate-400">
                {placeholder}
              </option>
            )}

            {options
              ? options.map((item, idx) => {
                  if (isOptionGroup(item)) {
                    return (
                      <optgroup key={`group-${idx}`} label={item.label}>
                        {item.options.map((opt) => (
                          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    );
                  }
                  return (
                    <option key={item.value} value={item.value} disabled={item.disabled}>
                      {item.label}
                    </option>
                  );
                })
              : children}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500">
            <ChevronDown className={sizeClasses[size].icon} />
          </div>
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

SelectInput.displayName = 'SelectInput';

export default SelectInput;
