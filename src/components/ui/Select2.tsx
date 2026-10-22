import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface Select2Option {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export interface Select2Props {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  options: Select2Option[];
  value?: string | string[];
  onChange?: (value: any) => void;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Select2: React.FC<Select2Props> = ({
  label,
  helperText,
  error,
  placeholder = 'Select an option...',
  options = [],
  value,
  onChange,
  isMulti = false,
  isSearchable = true,
  isClearable = true,
  disabled = false,
  fullWidth = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens and elevate parent card z-index
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (isOpen && containerRef.current) {
      const card = containerRef.current.closest<HTMLElement>('.card-box, [data-card-box]');
      if (card) {
        card.classList.add('has-open-select');
        card.style.zIndex = '40';
        return () => {
          card.classList.remove('has-open-select');
          card.style.zIndex = '';
        };
      }
    }
    if (!isOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
    }
  }, [isOpen, isSearchable]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const selectedValues: string[] = useMemo(() => {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) return value;
    return [value];
  }, [value]);

  const isSelected = (optValue: string) => selectedValues.includes(optValue);

  const handleSelectOption = (opt: Select2Option) => {
    if (opt.disabled) return;

    if (isMulti) {
      const exists = selectedValues.includes(opt.value);
      const updated = exists
        ? selectedValues.filter((v) => v !== opt.value)
        : [...selectedValues, opt.value];
      onChange?.(updated);
    } else {
      onChange?.(opt.value);
      setIsOpen(false);
    }
  };

  const handleRemoveItem = (valToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (isMulti) {
      onChange?.(selectedValues.filter((v) => v !== valToRemove));
    } else {
      onChange?.('');
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.(isMulti ? [] : '');
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (filteredOptions.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev - 1 < 0 ? Math.max(filteredOptions.length - 1, 0) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredOptions[highlightedIndex];
      if (current) handleSelectOption(current);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const selectedObjects = options.filter((opt) => selectedValues.includes(opt.value));

  return (
    <div
      ref={containerRef}
      data-open={isOpen ? 'true' : undefined}
      className={`relative flex flex-col gap-1.5 ${isOpen ? 'select2-open z-50' : 'z-auto'} ${fullWidth ? 'w-full' : 'inline-flex'}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
          {label}
        </label>
      )}

      {/* Main Trigger Box */}
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`min-h-10 w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-900 transition-all duration-150 cursor-pointer select-none focus:outline-none ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500'
            : isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
        } ${disabled ? 'opacity-60 bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed' : ''} ${className}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedValues.length === 0 ? (
            <span className="text-sm text-slate-400 dark:text-slate-500 truncate">
              {placeholder}
            </span>
          ) : isMulti ? (
            selectedObjects.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800/60"
              >
                <span className="truncate max-w-[120px]">{opt.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveItem(opt.value, e)}
                    className="hover:text-indigo-900 dark:hover:text-white rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {selectedObjects[0]?.label || selectedValues[0]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          {isClearable && selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClearAll}
              aria-label="Clear all selections"
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {isSearchable && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-100/50 dark:divide-slate-800/50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const active = isSelected(opt.value);
                const isHighlighted = highlightedIndex === index;

                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelectOption(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isHighlighted
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100'
                        : 'text-slate-700 dark:text-slate-300'
                    } ${active ? 'font-semibold text-indigo-600 dark:text-indigo-400' : ''}`}
                  >
                    <div className="flex flex-col gap-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span>{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.description && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                          {opt.description}
                        </span>
                      )}
                    </div>

                    {active && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

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

export default Select2;
