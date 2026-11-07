import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TextSize, AnalysisResult } from '../types';
import { translations } from '../i18n/translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  currentResult: AnalysisResult | null;
  setCurrentResult: (result: AnalysisResult | null) => void;
  completedStepIds: string[];
  toggleStep: (stepId: string) => void;
  resetStepProgress: () => void;
  t: typeof translations['English'];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('action_path_lang');
    if (saved === 'Hindi' || saved === 'Marathi' || saved === 'English') {
      return saved;
    }
    return 'English';
  });

  const [textSize, setTextSizeState] = useState<TextSize>(() => {
    const saved = localStorage.getItem('action_path_text_size');
    if (saved === 'normal' || saved === 'large' || saved === 'xlarge') {
      return saved;
    }
    return 'normal';
  });

  const [currentResult, setCurrentResultState] = useState<AnalysisResult | null>(() => {
    try {
      const saved = localStorage.getItem('action_path_active_result');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [completedStepIds, setCompletedStepIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('action_path_completed_steps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('action_path_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('action_path_text_size', textSize);
    document.documentElement.setAttribute('data-text-size', textSize);
  }, [textSize]);

  useEffect(() => {
    if (currentResult) {
      localStorage.setItem('action_path_active_result', JSON.stringify(currentResult));
    } else {
      localStorage.removeItem('action_path_active_result');
    }
  }, [currentResult]);

  useEffect(() => {
    localStorage.setItem('action_path_completed_steps', JSON.stringify(completedStepIds));
  }, [completedStepIds]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
  };

  const increaseTextSize = () => {
    if (textSize === 'normal') setTextSizeState('large');
    else if (textSize === 'large') setTextSizeState('xlarge');
  };

  const decreaseTextSize = () => {
    if (textSize === 'xlarge') setTextSizeState('large');
    else if (textSize === 'large') setTextSizeState('normal');
  };

  const setCurrentResult = (result: AnalysisResult | null) => {
    setCurrentResultState(result);
    setCompletedStepIds([]);
  };

  const toggleStep = (stepId: string) => {
    setCompletedStepIds((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const resetStepProgress = () => {
    setCompletedStepIds([]);
  };

  const t = translations[language] || translations.English;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        textSize,
        setTextSize,
        increaseTextSize,
        decreaseTextSize,
        currentResult,
        setCurrentResult,
        completedStepIds,
        toggleStep,
        resetStepProgress,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
