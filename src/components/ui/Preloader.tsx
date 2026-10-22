import React, { useEffect, useState } from "react";
import puLogo from "@/assets/puc.png";

export interface PreloaderProps {
  isLoading?: boolean;
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  fullscreen?: boolean;
  onComplete?: () => void;
  duration?: number;
}

export const Preloader: React.FC<PreloaderProps> = ({
  isLoading = true,
  message = "Initializing Application",
  subMessage = "Loading modules & assets...",
  showProgress = false,
  fullscreen = true,
  onComplete,
  duration = 1600,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      return;
    }

    if (showProgress) {
      const stepTime = 30;
      let currentProgress = 0;

      const interval = setInterval(() => {
        currentProgress += (stepTime / duration) * 100;

        if (currentProgress >= 100) {
          clearInterval(interval);
          setProgress(100);
          if (onComplete) {
            onComplete();
          }
        } else {
          setProgress(currentProgress);
        }
      }, stepTime);

      return () => clearInterval(interval);
    }
  }, [isLoading, showProgress, duration, onComplete]);

  if (!isLoading) return null;

  const containerClasses = fullscreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/98 backdrop-blur-md text-white"
    : "relative w-full min-h-[300px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl p-8";

  return (
    <div
      className={containerClasses}
      role="dialog"
      aria-modal="true"
      aria-label="Loading">
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* Animated Brand Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse overflow-hidden">
            <img
              src={puLogo}
              alt="Premier University"
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="absolute -inset-2 rounded-2xl border border-indigo-500/20 animate-ping [animation-duration:2s]" />
        </div>

        {/* Text */}
        <h3 className="text-base font-semibold text-white mb-1 tracking-tight">
          {message}
        </h3>
        <p className="text-xs text-white/80 mb-6">{subMessage}</p>

        {/* Progress Bar / Spinner */}
        {showProgress ? (
          <div className="w-64 flex flex-col gap-2">
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-100 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-white/70 font-mono tabular-nums">
              <span>Syncing</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Preloader;
