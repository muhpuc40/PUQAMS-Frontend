import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { Modal } from '@/components/ui';
import { ACCENTS } from '@/router/accents';
import { navRoutes } from '@/router/routes';

export interface CommandSearchProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/** Ctrl/⌘ + K palette. Its list is generated from `src/router/routes.ts`. */
export const CommandSearch: React.FC<CommandSearchProps> = ({ isOpen, onOpen, onClose }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const close = () => {
    onClose();
    setFilter('');
  };

  // Keyboard shortcuts: Ctrl/⌘+K toggles, Esc closes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) close();
        else onOpen();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const query = filter.toLowerCase();
  const results = navRoutes.filter(
    (route) =>
      route.label.toLowerCase().includes(query) ||
      route.description.toLowerCase().includes(query)
  );

  return (
    <Modal isOpen={isOpen} onClose={close} size="md" showCloseButton={false}>
      <div className="flex flex-col gap-3 -m-1">
        {/* Search Header */}
        <div className="relative flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <div className="relative flex items-center flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Search views, components, tools..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={close}
            title="Close search modal (Esc)"
            aria-label="Close search"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No matching results found
            </div>
          ) : (
            results.map((route) => {
              const Icon = route.icon;
              return (
                <button
                  key={route.path}
                  onClick={() => {
                    navigate(route.path);
                    close();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                      <Icon className={`w-4 h-4 ${ACCENTS[route.accent ?? 'indigo'].search}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {route.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {route.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CommandSearch;
