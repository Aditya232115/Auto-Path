import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AnalyzeCard } from '../components/AnalyzeCard';
import {
  ShieldCheck,
  Zap,
  Globe2,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Calendar,
  Lock,
  Compass,
  Search,
  X,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, language } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [landingSearchQuery, setLandingSearchQuery] = useState('');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToAnalyze = () => {
    const el = document.getElementById('analyze-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLandingSearch = (keyword: string) => {
    setLandingSearchQuery(keyword);
    scrollToAnalyze();
  };

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10">
      {/* 1. Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 text-xs sm:text-sm font-semibold tracking-wide">
          <Compass className="w-4 h-4 text-blue-700" />
          <span>
            {language === 'Hindi'
              ? 'वरिष्ठ नागरिकों और प्रथम उपयोगकर्ताओं के लिए समर्पित'
              : language === 'Marathi'
              ? 'ज्येष्ठ नागरिक व सर्वसामान्यांसाठी खास तयार'
              : 'Designed for Seniors & First-Time Applicants'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance">
          {t.tagline}
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
          {t.subheadline}
        </p>

        {/* Primary CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={scrollToAnalyze}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-700 to-teal-700 hover:from-blue-800 hover:to-teal-800 text-white font-bold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 min-h-[52px] group focus-visible:ring-3 focus-visible:ring-blue-600 cursor-pointer"
          >
            <span>{t.ctaPrimary}</span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => {
              setLandingSearchQuery('');
              scrollToAnalyze();
            }}
            className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-colors min-h-[52px] focus-visible:ring-3 focus-visible:ring-blue-600 cursor-pointer"
          >
            <span>{t.ctaSecondary}</span>
          </button>
        </div>

        {/* Simple Search Bar for Built-in Sample Documents */}
        <div className="max-w-2xl mx-auto w-full pt-4">
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-md flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={landingSearchQuery}
                onChange={(e) => {
                  setLandingSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    scrollToAnalyze();
                  }
                }}
                placeholder={t.sampleSearchPlaceholder}
                className="w-full pl-11 pr-9 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-slate-50 sm:bg-transparent rounded-xl border border-slate-200 sm:border-none outline-none focus:bg-white sm:focus:bg-transparent transition-colors"
                aria-label="Search sample documents by keywords"
              />
              {landingSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLandingSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                  title={t.clearSearch}
                  aria-label={t.clearSearch}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick keyword filter chips: pension, scholarship, bank */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 shrink-0">
              {[
                { kw: 'pension', label: t.filterPension },
                { kw: 'scholarship', label: t.filterScholarship },
                { kw: 'bank', label: t.filterBank },
              ].map((item) => (
                <button
                  key={item.kw}
                  type="button"
                  onClick={() => handleLandingSearch(item.kw)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[36px] flex items-center justify-center ${
                    landingSearchQuery.toLowerCase() === item.kw
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Row */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900">{t.trustPrivate}</h3>
              <p className="text-xs sm:text-sm text-slate-600">{t.trustPrivateDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900">{t.trustNoSignup}</h3>
              <p className="text-xs sm:text-sm text-slate-600">{t.trustNoSignupDesc}</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <Globe2 className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900">{t.trustLanguages}</h3>
              <p className="text-xs sm:text-sm text-slate-600">{t.trustLanguagesDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Interactive Analyzer Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <AnalyzeCard
          id="analyze-section"
          defaultTab="sample"
          initialSearchQuery={landingSearchQuery}
        />
      </section>

      {/* 4. How It Works (3 Steps) */}
      <section id="how-it-works" className="max-w-[1100px] mx-auto px-4 sm:px-6 scroll-mt-24 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t.howItWorksTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {language === 'Hindi'
              ? 'बिना किसी परेशानी के अपना काम पूरा करें'
              : language === 'Marathi'
              ? 'कोणत्याही त्रासाशिवाय आपले काम पूर्ण करा'
              : 'Clear steps designed for simplicity and calm guidance.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              Step 01
            </span>
            <h3 className="text-lg font-bold text-slate-900">{t.howStep1Title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t.howStep1Desc}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
              Step 02
            </span>
            <h3 className="text-lg font-bold text-slate-900">{t.howStep2Title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t.howStep2Desc}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 relative">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
              Step 03
            </span>
            <h3 className="text-lg font-bold text-slate-900">{t.howStep3Title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t.howStep3Desc}</p>
          </div>
        </div>
      </section>

      {/* 5. Why Action Path (Mapped to User Pains) */}
      <section id="why-action-path" className="max-w-[1100px] mx-auto px-4 sm:px-6 scroll-mt-24 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t.whyTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {t.whySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{t.pain1Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.pain1Desc}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{t.pain2Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.pain2Desc}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{t.pain3Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.pain3Desc}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{t.pain4Title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.pain4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 scroll-mt-24 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t.faqTitle}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-base sm:text-lg flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 min-h-[52px]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transform transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
