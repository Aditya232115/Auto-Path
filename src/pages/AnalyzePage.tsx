import React from 'react';
import { Link } from 'react-router-dom';
import { AnalyzeCard } from '../components/AnalyzeCard';
import { useApp } from '../context/AppContext';
import { ArrowLeft } from 'lucide-react';

export const AnalyzePage: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {language === 'Hindi'
              ? 'मुख्य पृष्ठ पर वापस जाएं'
              : language === 'Marathi'
              ? 'मुख्य पृष्ठावर परत जा'
              : 'Back to Home'}
          </span>
        </Link>
      </div>

      <AnalyzeCard id="standalone-analyze" defaultTab="sample" />
    </div>
  );
};
