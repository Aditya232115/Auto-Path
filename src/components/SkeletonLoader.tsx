import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Compass } from 'lucide-react';

export const SkeletonLoader: React.FC = () => {
  const { t } = useApp();
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    t.loadingStep1,
    t.loadingStep2,
    t.loadingStep3,
    t.loadingStep4,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div
      className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 max-w-3xl mx-auto my-8 animate-fade-in"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Friendly calm loading indicator banner */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 animate-spin [animation-duration:3s]">
          <Compass className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm sm:text-base font-bold text-slate-900 transition-all duration-300">
            {messages[messageIndex]}
          </p>
          <p className="text-xs text-slate-600">
            {t.btnAnalyzing}
          </p>
        </div>
      </div>

      {/* Title & Summary Skeleton */}
      <div className="space-y-3">
        <div className="h-7 w-3/4 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-full bg-slate-200/70 rounded-md animate-pulse" />
        <div className="h-4 w-5/6 bg-slate-200/70 rounded-md animate-pulse" />
      </div>

      {/* Progress Bar Skeleton */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-400/50 w-1/3 animate-pulse" />
      </div>

      {/* Action Steps Skeletons */}
      <div className="space-y-4 pt-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start gap-3.5"
          >
            <div className="w-6 h-6 rounded-md bg-slate-200 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-1/2 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-200/70 rounded-md animate-pulse" />
              <div className="flex gap-2 pt-1">
                <div className="h-4 w-16 bg-slate-200/60 rounded-md animate-pulse" />
                <div className="h-4 w-20 bg-slate-200/60 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
