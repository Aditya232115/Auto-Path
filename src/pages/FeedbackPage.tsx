import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FeedbackStats } from '../types';
import confetti from 'canvas-confetti';
import {
  Star,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Heart,
  Shield,
  HelpCircle,
  MessageSquareQuote,
  ThumbsUp,
  RotateCcw,
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { t, language } = useApp();
  const navigate = useNavigate();

  // Form Fields
  const [overallRating, setOverallRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [clarityRating, setClarityRating] = useState<number>(0);
  const [completedTask, setCompletedTask] = useState<'Yes' | 'Partly' | 'No' | ''>('');
  const [understoodIndependently, setUnderstoodIndependently] = useState<boolean | null>(null);
  const [confusedText, setConfusedText] = useState('');
  const [improveText, setImproveText] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Aggregate stats
  const [stats, setStats] = useState<FeedbackStats | null>(null);

  // Fetch community stats
  useEffect(() => {
    fetch('/api/feedback/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.warn('Could not load feedback stats:', err));
  }, []);

  const ratingLabels: Record<number, { emoji: string; text: string }> = {
    1: { emoji: '😟', text: t.rating1 },
    2: { emoji: '😕', text: t.rating2 },
    3: { emoji: '😐', text: t.rating3 },
    4: { emoji: '🙂', text: t.rating4 },
    5: { emoji: '🌟', text: t.rating5 },
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (overallRating === 0) {
      newErrors.overallRating = t.errorRatingRequired;
    }
    if (clarityRating === 0) {
      newErrors.clarityRating =
        language === 'Hindi'
          ? 'कृपया स्पष्टता का स्तर भी चुनें।'
          : language === 'Marathi'
          ? 'कृपया पायऱ्यांच्या स्पष्टतेचे रेटिंग निवडा.'
          : 'Please rate how clear the steps were.';
    }
    if (!completedTask) {
      newErrors.completedTask =
        language === 'Hindi'
          ? 'कृपया बताएं कि क्या आप काम पूरा कर पाए।'
          : language === 'Marathi'
          ? 'कृपया सांगा की आपण काम पूर्ण करू शकलात का.'
          : 'Please tell us if you could finish your task.';
    }
    if (understoodIndependently === null) {
      newErrors.understoodIndependently =
        language === 'Hindi'
          ? 'कृपया बताएं कि क्या आपने इसे स्वयं समझा।'
          : language === 'Marathi'
          ? 'कृपया सांगा की आपण कोणाच्या मदतीशिवाय समजून घेतले का.'
          : 'Please choose whether you understood it without help.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      overallRating,
      clarityRating,
      completedTask,
      understoodIndependently,
      confusingParts: confusedText.slice(0, 500),
      suggestedImprovements: improveText.slice(0, 500),
      contact: contactInfo.slice(0, 100),
    };

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Save locally as well
      const savedHistory = JSON.parse(localStorage.getItem('action_path_my_feedback') || '[]');
      savedHistory.push(payload);
      localStorage.setItem('action_path_my_feedback', JSON.stringify(savedHistory));

      if (data.stats) {
        setStats(data.stats);
      }

      setIsSubmitted(true);

      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1D4ED8', '#0F766E', '#16A34A', '#F59E0B'],
        });
      } catch (err) {
        // Fallback without confetti
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      // Still show thanks to user if local submission succeeded
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If submitted, display animated thank-you screen
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8 animate-fade-in">
        {/* Animated Check Mark Draw */}
        <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-scale-in">
            <svg
              className="w-14 h-14 text-emerald-600"
              viewBox="0 0 52 52"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="26"
                cy="26"
                r="24"
                className="opacity-20"
                stroke="currentColor"
              />
              <path
                d="M14 27l8 8 16-16"
                className="animate-[drawCheck_0.6s_ease-out_forwards]"
                style={{
                  strokeDasharray: 50,
                  strokeDashoffset: 0,
                }}
              />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.thankYouTitle}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
            {t.thankYouDesc}
          </p>
        </div>

        {/* Buttons on Thank-You screen */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate('/#analyze-section')}
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors min-h-[48px]"
          >
            {t.btnAnotherDoc}
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors min-h-[48px] flex items-center justify-center gap-2"
          >
            <span>{t.btnBackHome}</span>
          </Link>
        </div>

        {/* Aggregate community strip after submission */}
        {stats && (
          <div className="pt-8 border-t border-slate-200 mt-8">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.communityTitle}
              </span>
              <div className="flex items-center justify-center gap-2 text-xl font-extrabold text-slate-900">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                <span>{stats.averageRating} / 5</span>
                <span className="text-xs font-normal text-slate-500">
                  ({stats.totalReviews} total reviews)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.resultBack}</span>
        </Link>
      </div>

      {/* Intro Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
          <MessageSquareQuote className="w-3.5 h-3.5 text-teal-600" />
          <span>{t.feedbackTitle}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {t.feedbackTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {t.feedbackSubtitle}
        </p>
      </div>

      {/* "What Others Said" Aggregate Strip */}
      {stats && stats.totalReviews > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{t.avgRatingLabel}</p>
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="font-mono tabular-nums">{stats.averageRating}</span>
                <span className="text-xs font-normal text-slate-500">
                  ({stats.totalReviews} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-teal-800 font-semibold bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200/60">
            <ThumbsUp className="w-4 h-4 text-teal-600" />
            <span>{stats.independentPercentage}% {t.independentBadge}</span>
          </div>
        </div>
      )}

      {/* Feedback Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-8"
      >
        {/* Field (a): Overall Rating 1-5 with Emoji */}
        <div className="space-y-3">
          <label className="block text-base sm:text-lg font-bold text-slate-900">
            1. {t.overallRatingLabel} <span className="text-red-500">*</span>
          </label>
          <div
            className="flex items-center gap-2 sm:gap-3"
            role="radiogroup"
            aria-label="Overall Rating"
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = (hoverRating || overallRating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isActive
                      ? 'bg-amber-100 text-amber-600 scale-105 shadow-2xs'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                  aria-label={`${star} Star: ${ratingLabels[star]?.text}`}
                >
                  <Star className={`w-7 h-7 ${isActive ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>
              );
            })}
          </div>

          {/* Active Rating Emoji & Text Feedback */}
          {(hoverRating || overallRating) > 0 && (
            <p className="text-sm font-semibold text-slate-700 animate-fade-in">
              <span className="text-lg mr-1.5">{ratingLabels[hoverRating || overallRating]?.emoji}</span>
              <span>{ratingLabels[hoverRating || overallRating]?.text}</span>
            </p>
          )}

          {errors.overallRating && (
            <p className="text-xs text-red-600 font-semibold">{errors.overallRating}</p>
          )}
        </div>

        {/* Field (b): How Clear Were the Steps? (1 to 5 scale) */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-base sm:text-lg font-bold text-slate-900">
            2. {t.clarityLabel} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2" role="radiogroup">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setClarityRating(num)}
                className={`py-3 px-2 text-sm sm:text-base font-bold rounded-xl border transition-all min-h-[48px] ${
                  clarityRating === num
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 px-1">
            <span>1 ({t.rating1})</span>
            <span>5 ({t.rating5})</span>
          </div>
          {errors.clarityRating && (
            <p className="text-xs text-red-600 font-semibold">{errors.clarityRating}</p>
          )}
        </div>

        {/* Field (c): Could You Finish the Task? (Big Selectable Buttons) */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-base sm:text-lg font-bold text-slate-900">
            3. {t.finishTaskLabel} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup">
            {[
              { val: 'Yes', label: t.finishYes },
              { val: 'Partly', label: t.finishPartly },
              { val: 'No', label: t.finishNo },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setCompletedTask(item.val as any)}
                className={`p-4 text-sm sm:text-base font-bold rounded-xl border transition-all min-h-[50px] flex items-center justify-center gap-2 ${
                  completedTask === item.val
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          {errors.completedTask && (
            <p className="text-xs text-red-600 font-semibold">{errors.completedTask}</p>
          )}
        </div>

        {/* Field (d): Did you understand it without anyone's help? (Yes/No Toggle) */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-base sm:text-lg font-bold text-slate-900">
            4. {t.independentLabel} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup">
            <button
              type="button"
              onClick={() => setUnderstoodIndependently(true)}
              className={`p-4 text-sm sm:text-base font-bold rounded-xl border transition-all min-h-[50px] ${
                understoodIndependently === true
                  ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.yesLabel}
            </button>
            <button
              type="button"
              onClick={() => setUnderstoodIndependently(false)}
              className={`p-4 text-sm sm:text-base font-bold rounded-xl border transition-all min-h-[50px] ${
                understoodIndependently === false
                  ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.noLabel}
            </button>
          </div>
          {errors.understoodIndependently && (
            <p className="text-xs text-red-600 font-semibold">
              {errors.understoodIndependently}
            </p>
          )}
        </div>

        {/* Field (e1): What confused you? (500 char max with live counter) */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-baseline">
            <label className="block text-sm sm:text-base font-bold text-slate-900">
              5. {t.confusedLabel}
            </label>
            <span className="text-xs text-slate-500 font-mono">
              {confusedText.length} / 500
            </span>
          </div>
          <textarea
            value={confusedText}
            maxLength={500}
            onChange={(e) => setConfusedText(e.target.value)}
            placeholder={t.confusedPlaceholder}
            rows={3}
            className="w-full p-3.5 text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm leading-relaxed"
          />
        </div>

        {/* Field (e2): What should we improve? (500 char max with live counter) */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label className="block text-sm sm:text-base font-bold text-slate-900">
              6. {t.improveLabel}
            </label>
            <span className="text-xs text-slate-500 font-mono">
              {improveText.length} / 500
            </span>
          </div>
          <textarea
            value={improveText}
            maxLength={500}
            onChange={(e) => setImproveText(e.target.value)}
            placeholder={t.improvePlaceholder}
            rows={3}
            className="w-full p-3.5 text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm leading-relaxed"
          />
        </div>

        {/* Field (f): Optional Contact Field */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-sm sm:text-base font-bold text-slate-900">
            7. {t.contactLabel}
          </label>
          <input
            type="text"
            value={contactInfo}
            maxLength={100}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder={t.contactPlaceholder}
            className="w-full p-3.5 text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm"
          />
        </div>

        {/* Field (g): Privacy Note Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>{t.feedbackPrivacyNote}</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 to-teal-700 hover:from-blue-800 hover:to-teal-800 text-white font-bold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 min-h-[52px] focus-visible:ring-3 focus-visible:ring-blue-600 cursor-pointer"
        >
          {isSubmitting ? (
            <span>{t.submittingFeedback}</span>
          ) : (
            <>
              <Heart className="w-5 h-5 text-red-300 fill-current" />
              <span>{t.btnSubmitFeedback}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
