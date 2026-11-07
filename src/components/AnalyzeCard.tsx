import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { sampleDocuments } from '../data/samples';
import { ReadingLevel } from '../types';
import {
  FileText,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  X,
  Search,
  RotateCcw,
} from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';

interface AnalyzeCardProps {
  id?: string;
  defaultTab?: 'paste' | 'upload' | 'sample';
  initialSearchQuery?: string;
  externalSelectedSampleId?: string;
}

export const AnalyzeCard: React.FC<AnalyzeCardProps> = ({
  id = 'analyze-section',
  defaultTab = 'sample',
  initialSearchQuery = '',
  externalSelectedSampleId,
}) => {
  const { language, setLanguage, setCurrentResult, t } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'sample'>(defaultTab);
  const [pasteText, setPasteText] = useState('');
  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    externalSelectedSampleId || sampleDocuments[0].id
  );
  const [sampleSearchQuery, setSampleSearchQuery] = useState(initialSearchQuery);
  const [sampleCategoryFilter, setSampleCategoryFilter] = useState<string>('all');
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('Simple');

  useEffect(() => {
    if (initialSearchQuery) {
      setSampleSearchQuery(initialSearchQuery);
      setActiveTab('sample');
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (externalSelectedSampleId) {
      setSelectedSampleId(externalSelectedSampleId);
      setActiveTab('sample');
    }
  }, [externalSelectedSampleId]);

  // File upload state
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/jpeg');

  // Request state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a photo or image of your document (JPG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setUploadedFileName(file.name);
    setUploadedMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageBase64(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMessage('Could not read the uploaded photo. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedFile = () => {
    setUploadedImageBase64(null);
    setUploadedFileName(null);
  };

  const filteredSamples = sampleDocuments.filter((sample) => {
    // Category pill filter
    if (sampleCategoryFilter === 'pension' && sample.id !== 'pension-kyc') return false;
    if (sampleCategoryFilter === 'bank' && sample.id !== 'bank-kyc') return false;
    if (sampleCategoryFilter === 'scholarship' && sample.id !== 'scholarship-waiver') return false;

    // Search query filter
    if (!sampleSearchQuery.trim()) return true;
    const q = sampleSearchQuery.toLowerCase().trim();
    return (
      sample.id.toLowerCase().includes(q) ||
      sample.titleKey.toLowerCase().includes(q) ||
      sample.category.toLowerCase().includes(q) ||
      sample.descriptionKey.toLowerCase().includes(q) ||
      sample.sourceLabel.toLowerCase().includes(q) ||
      (sample.content.English && sample.content.English.toLowerCase().includes(q)) ||
      (sample.content.Hindi && sample.content.Hindi.toLowerCase().includes(q)) ||
      (sample.content.Marathi && sample.content.Marathi.toLowerCase().includes(q))
    );
  });

  const currentSample =
    filteredSamples.find((s) => s.id === selectedSampleId) ||
    filteredSamples[0] ||
    sampleDocuments[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let textPayload = '';
    let imagePayload = null;
    let mimeTypePayload = 'image/jpeg';

    if (activeTab === 'paste') {
      if (!pasteText.trim()) {
        setErrorMessage(
          language === 'Hindi'
            ? 'कृपया पहले पत्र या नोटिस का कुछ टेक्स्ट यहाँ पेस्ट करें।'
            : language === 'Marathi'
            ? 'कृपया प्रथम पत्राचा किंवा नोटीसचा काही मजकूर येथे पेस्ट करा.'
            : 'Please paste some text from your document or notice first.'
        );
        return;
      }
      textPayload = pasteText.trim();
    } else if (activeTab === 'upload') {
      if (!uploadedImageBase64) {
        setErrorMessage(
          language === 'Hindi'
            ? 'कृपया अपने दस्तावेज़ की फ़ोटो चुनें।'
            : language === 'Marathi'
            ? 'कृपया आपल्या कागदपत्राचा फोटो निवडा.'
            : 'Please select or capture a photo of your document.'
        );
        return;
      }
      imagePayload = uploadedImageBase64;
      mimeTypePayload = uploadedMimeType;
    } else {
      // Sample tab
      textPayload = currentSample.content[language] || currentSample.content.English;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textPayload,
          imageBase64: imagePayload,
          mimeType: mimeTypePayload,
          language,
          readingLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze document.');
      }

      setCurrentResult(data.data);
      // Navigate to result view
      navigate('/result');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message ||
          (language === 'Hindi'
            ? 'दस्तावेज़ की जांच करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : language === 'Marathi'
            ? 'कागदपत्र तपासताना अडचण आली. कृपया पुन्हा प्रयत्न करा.'
            : 'Could not analyze document. Please check your connection or try a sample.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id={id} className="scroll-mt-24">
      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 p-6 sm:p-8 max-w-4xl mx-auto transition-all">
          {/* Card Header */}
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {t.analyzeTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {t.analyzeSubtitle}
            </p>
          </div>

          {/* Privacy Banner */}
          <div className="mb-6 p-3.5 rounded-xl bg-teal-50/80 border border-teal-200/90 flex items-center gap-3 text-teal-900">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{t.privacyBanner}</span>
          </div>

          {/* Input Method Tabs */}
          <div
            className="flex p-1.5 bg-slate-100 rounded-xl mb-6 gap-1"
            role="tablist"
            aria-label="Document Input Mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'paste'}
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-3 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                activeTab === 'paste'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t.tabPaste}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'upload'}
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>{t.tabUpload}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'sample'}
              onClick={() => setActiveTab('sample')}
              className={`flex-1 py-3 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                activeTab === 'sample'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t.tabSample}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tab 1: Paste Text */}
            {activeTab === 'paste' && (
              <div className="space-y-2">
                <label htmlFor="paste-textarea" className="block text-sm font-semibold text-slate-800">
                  {language === 'Hindi'
                    ? 'पत्र या नोटिस का टेक्स्ट यहाँ डालें:'
                    : language === 'Marathi'
                    ? 'पत्राचा किंवा नोटीसचा मजकूर येथे टाका:'
                    : 'Paste the notice or website text here:'}
                </label>
                <textarea
                  id="paste-textarea"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={t.pastePlaceholder}
                  rows={7}
                  className="w-full p-4 text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm sm:text-base leading-relaxed transition-colors"
                />
                <p className="text-xs text-slate-500 text-right">
                  {pasteText.length} characters entered
                </p>
              </div>
            )}

            {/* Tab 2: Upload Photo / PDF */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                {!uploadedImageBase64 ? (
                  <label
                    htmlFor="document-file-input"
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-blue-700 mb-3 transition-colors">
                      <Upload className="w-7 h-7" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-slate-800 mb-1">
                      {t.uploadPrompt}
                    </span>
                    <span className="text-xs text-slate-500">{t.uploadHint}</span>
                    <input
                      id="document-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={uploadedImageBase64}
                        alt="Uploaded Document Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-blue-200 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {uploadedFileName}
                        </p>
                        <p className="text-xs text-teal-700 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Photo ready for analysis</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeUploadedFile}
                      className="p-2 text-slate-500 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                      title={t.removePhoto}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Sample Notices */}
            {activeTab === 'sample' && (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-slate-800">{t.samplePrompt}</p>

                  {/* Search Bar for Sample Documents */}
                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={sampleSearchQuery}
                      onChange={(e) => setSampleSearchQuery(e.target.value)}
                      placeholder={t.sampleSearchPlaceholder}
                      className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                    />
                    {sampleSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setSampleSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                        title={t.clearSearch}
                        aria-label={t.clearSearch}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick Category Filter Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[
                      { id: 'all', label: t.filterAll },
                      { id: 'pension', label: t.filterPension },
                      { id: 'bank', label: t.filterBank },
                      { id: 'scholarship', label: t.filterScholarship },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSampleCategoryFilter(cat.id);
                          if (cat.id !== 'all' && sampleSearchQuery) {
                            setSampleSearchQuery('');
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[34px] flex items-center justify-center ${
                          sampleCategoryFilter === cat.id
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                    {(sampleSearchQuery || sampleCategoryFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSampleSearchQuery('');
                          setSampleCategoryFilter('all');
                        }}
                        className="text-xs text-blue-700 hover:text-blue-900 underline ml-2 font-medium"
                      >
                        {t.clearSearch}
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtered Sample Cards */}
                {filteredSamples.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredSamples.map((sample) => {
                      const isSelected = selectedSampleId === sample.id;
                      return (
                        <div
                          key={sample.id}
                          onClick={() => setSelectedSampleId(sample.id)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3.5 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-blue-600 text-white' : 'border border-slate-400 bg-white'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                {sample.titleKey}
                              </h4>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-medium">
                                {sample.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{sample.descriptionKey}</p>
                            <p className="text-xs text-slate-400 italic">Source: {sample.sourceLabel}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="text-sm font-bold text-slate-800">{t.noSampleFound}</p>
                    <p className="text-xs text-slate-500">{t.tryKeywords}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSampleSearchQuery('');
                        setSampleCategoryFilter('all');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.clearSearch}</span>
                    </button>
                  </div>
                )}

                {/* Sample Preview Snippet */}
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    {language === 'Hindi'
                      ? 'चुने गए नमूने का प्रारंभिक अंश:'
                      : language === 'Marathi'
                      ? 'निवडलेल्या नमुन्याचा सुरुवातीचा भाग:'
                      : 'Sample text preview:'}
                  </span>
                  <p className="text-xs text-slate-600 font-mono line-clamp-3 leading-relaxed">
                    {currentSample.content[language] || currentSample.content.English}
                  </p>
                </div>
              </div>
            )}

            {/* Reading Level & Language Configuration Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t.languageLabel}
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  {(['English', 'Hindi', 'Marathi'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`py-2 px-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                        language === lang
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {lang === 'English' ? 'English' : lang === 'Hindi' ? 'हिन्दी' : 'मराठी'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading Level Toggle */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t.readingLevelLabel}
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReadingLevel('Simple')}
                    className={`py-2 px-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                      readingLevel === 'Simple'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t.levelSimple}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingLevel('Very simple')}
                    className={`py-2 px-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                      readingLevel === 'Very simple'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t.levelVerySimple}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message Callout */}
            {errorMessage && (
              <div
                className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{errorMessage}</p>
                  <p className="text-xs text-red-700">
                    {language === 'Hindi'
                      ? 'यदि आपके पास अभी कोई पत्र नहीं है, तो कृपया ऊपर दिए गए "नमूना पत्र आज़माएं" टैब का उपयोग करें।'
                      : language === 'Marathi'
                      ? 'आपल्याकडे सध्या कागदपत्र नसल्यास वरील "नमुना पत्र निवडा" टॅब वापरा.'
                      : 'Tip: You can use the "Try a Sample" tab above to test without uploading your own document.'}
                  </p>
                </div>
              </div>
            )}

            {/* Big Accessible Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 to-teal-700 hover:from-blue-800 hover:to-teal-800 text-white font-bold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 min-h-[52px] group focus-visible:ring-3 focus-visible:ring-blue-600 cursor-pointer"
            >
              <FileCheck2 className="w-6 h-6 shrink-0" />
              <span>{t.btnAnalyze}</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
