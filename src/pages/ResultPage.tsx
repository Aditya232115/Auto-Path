import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { VoicePlayer } from '../components/VoicePlayer';
import {
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Lock,
  BookA,
  Printer,
  Copy,
  Check,
  Send,
  MessageSquareQuote,
  ShieldAlert,
  Clock,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const ResultPage: React.FC = () => {
  const { currentResult, completedStepIds, toggleStep, resetStepProgress, t, language } = useApp();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [followupAnswer, setFollowupAnswer] = useState<string | null>(null);
  const [isAskingFollowup, setIsAskingFollowup] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);

  // If no result is loaded, provide an inviting empty state
  if (!currentResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            {language === 'Hindi'
              ? 'कोई परिणाम नहीं मिला'
              : language === 'Marathi'
              ? 'कोणताही निकाल सापडला नाही'
              : 'No Document Analyzed Yet'}
          </h2>
          <p className="text-slate-600">
            {language === 'Hindi'
              ? 'कृपया पहले एक दस्तावेज़ पेस्ट करें, फ़ोटो अपलोड करें या एक नमूना चुनें।'
              : language === 'Marathi'
              ? 'कृपया आधी मजकूर पेस्ट करा, फोटो अपलोड करा किंवा नमुना निवडा.'
              : 'Please choose a sample notice or upload a photo to generate your personalized action plan.'}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.resultBack}</span>
        </Link>
      </div>
    );
  }

  const totalSteps = currentResult.steps.length;
  const completedCount = completedStepIds.filter((id) =>
    currentResult.steps.some((s) => s.id === id)
  ).length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Build spoken transcript for read-aloud
  const spokenTranscript = `${currentResult.title}. ${currentResult.summary}. Here are your steps: ${currentResult.steps
    .map((s, idx) => `Step ${idx + 1}: ${s.action}. ${s.detail}`)
    .join('. ')}`;

  const handleCopy = () => {
    const textToCopy = `ACTION PATH: ${currentResult.title}
Summary: ${currentResult.summary}

STEPS:
${currentResult.steps.map((s, idx) => `${idx + 1}. [${s.difficulty}] ${s.action} - ${s.detail} (${s.estimatedTime})`).join('\n')}

REQUIRED DOCUMENTS:
${currentResult.documentsNeeded.map((d) => `- ${d}`).join('\n')}

DEADLINES:
${currentResult.deadlines.map((d) => `- ${d.label}: ${d.date}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupQuestion.trim() || isAskingFollowup) return;

    setFollowupError(null);
    setIsAskingFollowup(true);

    try {
      const response = await fetch('/api/ask-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: followupQuestion.trim(),
          documentContext: currentResult,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to answer');
      }

      setFollowupAnswer(data.answer);
      setFollowupQuestion('');
    } catch (err: any) {
      console.error('Follow-up Q&A error:', err);
      setFollowupError(err.message || 'Could not answer at this moment.');
    } finally {
      setIsAskingFollowup(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Top Navigation & Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.resultBack}</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors shadow-2xs min-h-[40px] focus-visible:ring-2 focus-visible:ring-blue-600"
            title={t.btnCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-bold">{t.copiedText}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>{t.btnCopy}</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors shadow-2xs min-h-[40px] focus-visible:ring-2 focus-visible:ring-blue-600"
            title={t.btnPrint}
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>{t.btnPrint}</span>
          </button>
        </div>
      </div>

      {/* Main Result Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-8 card-print">
        {/* Title, Confidence Badge & Official Disclaimer */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                currentResult.confidence === 'High'
                  ? 'bg-teal-100 text-teal-900 border border-teal-200'
                  : currentResult.confidence === 'Medium'
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {t.confidenceLabel}{' '}
                {currentResult.confidence === 'High'
                  ? t.confidenceHigh
                  : currentResult.confidence === 'Medium'
                  ? t.confidenceMedium
                  : t.confidenceLow}
              </span>
            </span>

            {/* Official source verification warning */}
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.disclaimerText}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {currentResult.title}
          </h1>
        </div>

        {/* Voice Player Banner */}
        <div className="no-print">
          <VoicePlayer textToRead={spokenTranscript} />
        </div>

        {/* Plain Summary (Max 60 words) */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.summaryHeading}
          </h2>
          <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
            {currentResult.summary}
          </p>
        </div>

        {/* Interactive Progress Bar */}
        <div className="space-y-2.5 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800">
            <span className="font-mono tabular-nums">
              {completedCount} of {totalSteps} {t.progressLabel} ({progressPct}%)
            </span>
            {completedCount > 0 && (
              <button
                onClick={resetStepProgress}
                className="text-xs text-blue-700 hover:text-blue-900 underline font-normal cursor-pointer"
              >
                Reset checks
              </button>
            )}
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-teal-600 transition-all duration-400 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Numbered Checkable Action Steps */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t.stepsHeading}</span>
          </h2>

          <div className="space-y-3">
            {currentResult.steps.map((step, index) => {
              const isDone = completedStepIds.includes(step.id);
              return (
                <div
                  key={step.id || index}
                  onClick={() => toggleStep(step.id)}
                  className={`p-4 sm:p-5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-4 select-none ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/20 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  {/* Large Touch-Friendly Checkbox */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-slate-300 bg-white hover:border-blue-600'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-5 h-5" />}
                  </div>

                  {/* Step Content */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Step {index + 1}
                        </span>
                        <h3
                          className={`text-base sm:text-lg font-bold leading-snug ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}
                        >
                          {step.action}
                        </h3>
                      </div>

                      {/* Difficulty & Time Badges */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            step.difficulty === 'Easy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : step.difficulty === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {step.difficulty === 'Easy'
                            ? t.diffEasy
                            : step.difficulty === 'Medium'
                            ? t.diffMedium
                            : t.diffHelp}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{step.estimatedTime}</span>
                        </span>
                      </div>
                    </div>

                    <p
                      className={`text-sm sm:text-base leading-relaxed ${
                        isDone ? 'text-slate-500' : 'text-slate-700'
                      }`}
                    >
                      {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid Panels: Documents You Need & Deadlines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Documents Panel */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>{t.docsHeading}</span>
            </h3>
            {currentResult.documentsNeeded && currentResult.documentsNeeded.length > 0 ? (
              <ul className="space-y-2">
                {currentResult.documentsNeeded.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">{t.docsEmpty}</p>
            )}
          </div>

          {/* Deadlines Panel */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>{t.deadlinesHeading}</span>
            </h3>
            {currentResult.deadlines && currentResult.deadlines.length > 0 ? (
              <div className="space-y-2">
                {currentResult.deadlines.map((dl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-semibold text-slate-900">{dl.label}</span>
                    <span className="font-bold text-amber-800 font-mono text-xs px-2 py-0.5 rounded-md bg-amber-100/90">
                      {dl.date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">{t.deadlinesEmpty}</p>
            )}
          </div>
        </div>

        {/* Common Mistakes to Avoid (Warning Style) */}
        {currentResult.commonMistakes && currentResult.commonMistakes.length > 0 && (
          <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-300 space-y-3">
            <h3 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <span>{t.mistakesHeading}</span>
            </h3>
            <ul className="space-y-2">
              {currentResult.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-amber-950">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Privacy & Safety Alert Panel */}
        <div className="p-5 rounded-xl bg-red-50/80 border border-red-200 space-y-3">
          <div className="flex items-center gap-2.5 text-red-900 font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
            <span>{t.privacyAlertHeading}</span>
          </div>
          <p className="text-xs sm:text-sm text-red-950 leading-relaxed">
            {currentResult.privacyFlags && currentResult.privacyFlags.length > 0
              ? currentResult.privacyFlags.join(' ')
              : t.privacyAlertDefault}
          </p>
        </div>

        {/* Hard Words Explained (Glossary) */}
        {currentResult.glossary && currentResult.glossary.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookA className="w-5 h-5 text-blue-700" />
              <span>{t.glossaryHeading}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentResult.glossary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <span className="text-sm font-bold text-blue-900 font-mono block">
                    {item.term}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-700 block leading-relaxed">
                    {item.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In-Context Follow-Up Question Box */}
        <div className="p-5 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4 no-print">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-700" />
              <span>{t.followupHeading}</span>
            </h3>
            <p className="text-xs text-slate-600">
              {language === 'Hindi'
                ? 'हम केवल इस दस्तावेज़ के आधार पर शांति से उत्तर देंगे।'
                : language === 'Marathi'
                ? 'आम्ही केवळ या कागदपत्राच्या आधारे सोपे उत्तर देऊ.'
                : 'Ask questions grounded strictly in this document.'}
            </p>
          </div>

          <form onSubmit={handleFollowupSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={followupQuestion}
                onChange={(e) => setFollowupQuestion(e.target.value)}
                placeholder={t.followupPlaceholder}
                className="flex-1 px-4 py-3 bg-white text-slate-900 text-sm sm:text-base border border-slate-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
              <button
                type="submit"
                disabled={isAskingFollowup || !followupQuestion.trim()}
                className="px-4 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-1.5 shrink-0 min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t.btnAsk}</span>
              </button>
            </div>
          </form>

          {isAskingFollowup && (
            <p className="text-xs text-blue-700 animate-pulse font-medium">
              {t.askingQuestion}
            </p>
          )}

          {followupError && (
            <p className="text-xs text-red-600 font-semibold">{followupError}</p>
          )}

          {followupAnswer && (
            <div className="p-4 rounded-xl bg-white border border-blue-200 text-sm sm:text-base text-slate-800 leading-relaxed shadow-2xs">
              <span className="font-bold text-blue-800 block mb-1">
                {language === 'Hindi' ? 'उत्तर:' : language === 'Marathi' ? 'उत्तर:' : 'Answer:'}
              </span>
              <p>{followupAnswer}</p>
            </div>
          )}
        </div>

        {/* Share Your Feedback CTA Button at bottom */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{t.privacyBanner}</span>
          </div>

          <Link
            to="/feedback"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-xs min-h-[48px]"
          >
            <MessageSquareQuote className="w-4 h-4 text-teal-400" />
            <span>{t.btnGiveFeedback}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
