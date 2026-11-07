import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { Compass, MessageSquareQuote, Bot } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, textSize, increaseTextSize, decreaseTextSize, t } = useApp();
  const location = useLocation();

  const languages: { code: Language; label: string; script: string }[] = [
    { code: 'English', label: 'English', script: 'EN' },
    { code: 'Hindi', label: 'हिन्दी', script: 'HI' },
    { code: 'Marathi', label: 'मराठी', script: 'MR' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark & Icon */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1.5 -ml-1.5"
          aria-label="Action Path Home"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-teal-600 flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow">
            <Compass className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Action Path
            </span>
            <span className="text-xs font-medium text-slate-500 hidden sm:block">
              {language === 'Hindi'
                ? 'सरल मार्गदर्शन'
                : language === 'Marathi'
                ? 'मार्गदर्शन व कृती'
                : 'Simple Action Guide'}
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <Link
            to="/#how-it-works"
            className="hover:text-blue-700 transition-colors whitespace-nowrap py-1 relative hover:underline decoration-2 underline-offset-4"
          >
            {t.navHowItWorks}
          </Link>
          <Link
            to="/chat"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 relative hover:underline decoration-2 underline-offset-4 ${
              location.pathname === '/chat'
                ? 'text-blue-700 font-bold underline'
                : 'hover:text-blue-700'
            }`}
          >
            <Bot className="w-4 h-4 text-teal-600" />
            <span>{t.navChat}</span>
          </Link>
          <Link
            to="/#faq"
            className="hover:text-blue-700 transition-colors whitespace-nowrap py-1 relative hover:underline decoration-2 underline-offset-4"
          >
            {t.navFaq}
          </Link>
          <Link
            to="/feedback"
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap py-1 relative hover:underline decoration-2 underline-offset-4 ${
              location.pathname === '/feedback'
                ? 'text-blue-700 font-bold underline'
                : 'hover:text-blue-700'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>{t.navFeedback}</span>
          </Link>
        </nav>

        {/* Zone 3: Controls (Language Direct Buttons & Text Scaling) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Text Size Controls A- / A+ */}
          <div
            className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200"
            role="group"
            aria-label="Text size adjustment"
          >
            <button
              onClick={decreaseTextSize}
              disabled={textSize === 'normal'}
              className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-700 rounded-md hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-blue-600"
              title={t.decreaseText}
              aria-label={t.decreaseText}
            >
              A-
            </button>
            <span className="w-px h-4 bg-slate-300 mx-0.5" aria-hidden="true" />
            <button
              onClick={increaseTextSize}
              disabled={textSize === 'xlarge'}
              className="w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-700 rounded-md hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus-visible:ring-2 focus-visible:ring-blue-600"
              title={t.increaseText}
              aria-label={t.increaseText}
            >
              A+
            </button>
          </div>

          {/* Direct Language Switcher (EN · हिन्दी · मराठी) */}
          <div
            className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200"
            role="radiogroup"
            aria-label="Select Language"
          >
            {languages.map((item) => {
              const isActive = language === item.code;
              return (
                <button
                  key={item.code}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setLanguage(item.code)}
                  className={`px-2.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all whitespace-nowrap min-h-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
