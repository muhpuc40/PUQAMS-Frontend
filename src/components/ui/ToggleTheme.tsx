import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '@/contexts/ThemeContext';

export interface ToggleThemeProps {
  variant?: 'button' | 'segmented';
  className?: string;
}

export const ToggleTheme: React.FC<ToggleThemeProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    const options: { mode: Theme; label: string; icon: React.ReactNode }[] = [
      { mode: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
      { mode: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
      { mode: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
    ];

    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 ${className}`}
        role="group"
        aria-label="Theme mode switcher"
      >
        {options.map((opt) => {
          const isActive = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              onClick={() => setTheme(opt.mode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 select-none ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {opt.icon}
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Quick One-Click Toggle Button
  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Current: ${resolvedTheme} mode. Click to toggle.`}
      aria-label="Toggle dark/light theme"
      className={`relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer select-none ${className}`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600" />
      )}
    </button>
  );
};

export default ToggleTheme;
