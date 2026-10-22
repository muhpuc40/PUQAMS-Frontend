import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-4 sm:px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Premier University Question Authoring Management System
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="font-mono tabular-nums">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
