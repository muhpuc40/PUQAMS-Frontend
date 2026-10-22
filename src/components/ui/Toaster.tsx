import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
} from 'lucide-react';
import { useToast, Toast, ToastType } from '@/contexts/ToastContext';

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const intervalTime = 40;
    let elapsed = 0;

    const timer = setInterval(() => {
      if (!isPaused) {
        elapsed += intervalTime;
        const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100);
        setProgress(remaining);

        if (elapsed >= toast.duration!) {
          clearInterval(timer);
          onDismiss(toast.id);
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.id, toast.duration, isPaused, onDismiss]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const borders: Record<ToastType, string> = {
    success: 'border-emerald-200 dark:border-emerald-800/60',
    error: 'border-rose-200 dark:border-rose-800/60',
    warning: 'border-amber-200 dark:border-amber-800/60',
    info: 'border-sky-200 dark:border-sky-800/60',
  };

  const barColors: Record<ToastType, string> = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-84 sm:w-96 rounded-xl border bg-white dark:bg-slate-900 shadow-lg p-4 transition-all duration-200 flex flex-col gap-2.5 overflow-hidden ${borders[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div className="flex-1 min-w-0 pr-1">
          {toast.title && (
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
            {toast.message}
          </p>
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full transition-all duration-75 ease-linear ${barColors[toast.type]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const Toaster: React.FC<{ position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' }> = ({
  position = 'top-right',
}) => {
  const { toasts, dismissToast } = useToast();

  const positionClasses = {
    'top-right': 'top-5 right-5',
    'top-left': 'top-5 left-5',
    'bottom-right': 'bottom-5 right-5',
    'bottom-left': 'bottom-5 left-5',
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed z-[100] flex flex-col gap-2.5 pointer-events-auto ${positionClasses[position]}`}
      tabIndex={-1}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

export default Toaster;
