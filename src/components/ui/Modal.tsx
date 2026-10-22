import React, { useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import CustomButton from './CustomButton';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnEsc = false,
  closeOnOverlayClick = false,
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      // Lock body & html scroll without position:fixed (which hides or shifts sticky navbar)
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');

      // Intercept wheel events to completely block primary display scrolling
      const handleWheel = (e: WheelEvent) => {
        const target = e.target as HTMLElement;
        const scrollBody = modalBodyRef.current;

        // If mouse is outside the scrollable body, block wheel event
        if (!scrollBody || !scrollBody.contains(target)) {
          e.preventDefault();
          return;
        }

        // Inside scrollable body: prevent scroll chaining to background
        const canScroll = scrollBody.scrollHeight > scrollBody.clientHeight;
        if (!canScroll) {
          e.preventDefault();
          return;
        }

        const atTop = scrollBody.scrollTop <= 0 && e.deltaY < 0;
        const atBottom =
          scrollBody.scrollTop + scrollBody.clientHeight >= scrollBody.scrollHeight - 1 &&
          e.deltaY > 0;

        if (atTop || atBottom) {
          e.preventDefault();
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        const scrollBody = modalBodyRef.current;
        if (!scrollBody || !scrollBody.contains(target)) {
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });

      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.touchAction = originalTouchAction;
        document.documentElement.style.overflow = '';
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('wheel', handleWheel, { capture: true });
        document.removeEventListener('wheel', handleWheel, { capture: true });
        document.removeEventListener('touchmove', handleTouchMove, { capture: true });
      };
    }
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[85vh]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden overscroll-none"
      role="dialog"
      aria-modal="true"
    >
      {/* Fullscreen Backdrop - blurs and dims the entire screen including the navbar */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200"
        onClick={() => closeOnOverlayClick && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        ref={modalRef}
        className={`relative w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-200 z-10 flex flex-col overflow-hidden my-auto overscroll-contain ${sizeClasses[size]}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              {title && (
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          ref={modalBodyRef}
          className="p-5 overflow-y-auto max-h-[70vh] text-slate-700 dark:text-slate-300 text-sm overscroll-contain"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <CustomButton variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </CustomButton>
          <CustomButton
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </CustomButton>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
