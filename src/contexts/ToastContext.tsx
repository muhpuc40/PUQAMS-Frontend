import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms, 0 for sticky
  action?: ToastAction;
  createdAt: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  toast: {
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    warning: (message: string, options?: ToastOptions) => string;
    info: (message: string, options?: ToastOptions) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((toastData: Omit<Toast, 'id' | 'createdAt'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const newToast: Toast = {
      ...toastData,
      id,
      duration: toastData.duration !== undefined ? toastData.duration : 4000,
      createdAt: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // keep max 5 toasts
    return id;
  }, []);

  const toast = useMemo(
    () => ({
      success: (message: string, options?: ToastOptions) => addToast({ type: 'success', message, ...options }),
      error: (message: string, options?: ToastOptions) => addToast({ type: 'error', message, ...options }),
      warning: (message: string, options?: ToastOptions) => addToast({ type: 'warning', message, ...options }),
      info: (message: string, options?: ToastOptions) => addToast({ type: 'info', message, ...options }),
    }),
    [addToast]
  );

  const value = useMemo(
    () => ({ toasts, addToast, dismissToast, clearToasts, toast }),
    [toasts, addToast, dismissToast, clearToasts, toast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
