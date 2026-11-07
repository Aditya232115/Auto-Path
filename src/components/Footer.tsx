import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Compass, ShieldCheck, HeartHandshake, MessageSquareQuote } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-slate-800">
          {/* Col 1: Wordmark & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Action Path</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {t.subheadline}
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t.trustPrivate} · {t.trustPrivateDesc}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              {language === 'Hindi' ? 'नेविगेशन' : language === 'Marathi' ? 'महत्त्वाचे दुवे' : 'Explore'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/#how-it-works" className="hover:text-white transition-colors">
                  {t.navHowItWorks}
                </Link>
              </li>
              <li>
                <Link to="/#why-action-path" className="hover:text-white transition-colors">
                  {t.navWhyUs}
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="hover:text-white transition-colors">
                  {t.navFaq}
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <MessageSquareQuote className="w-4 h-4 text-teal-400" />
                  <span>{t.navFeedback}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Safe Usage & Feedback CTA */}
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>{language === 'Hindi' ? 'हमारा संकल्प' : language === 'Marathi' ? 'आमचा उद्देश' : 'Our Promise'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'Hindi'
                ? 'हम वरिष्ठ नागरिकों और पहली बार फॉर्म भरने वालों को बिना किसी डर के आत्मनिर्भर बनाने के लिए समर्पित हैं।'
                : language === 'Marathi'
                ? 'ज्येष्ठ नागरिक आणि सर्वसामान्यांना कोणत्याही भीतीशिवाय स्वावलंबी बनवणे हाच आमचा उद्देश आहे.'
                : 'Empowering older adults and first-time users to navigate complex paperwork with dignity, clarity, and zero anxiety.'}
            </p>
            <Link
              to="/feedback"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-lg transition-colors"
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>{t.btnGiveFeedback}</span>
            </Link>
          </div>
        </div>

        {/* Disclaimer row */}
        <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-300">
            <span className="font-semibold text-amber-300 mr-1.5">
              {language === 'Hindi' ? 'महत्वपूर्ण सूचना:' : language === 'Marathi' ? 'महत्त्वाची सूचना:' : 'Notice:'}
            </span>
            {t.disclaimerText}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 pt-2">
            <span>© {new Date().getFullYear()} Action Path. Built for public accessibility and digital confidence.</span>
            <span>Zero trackers · No login needed · Private by design</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
