export type Language = 'English' | 'Hindi' | 'Marathi';
export type TextSize = 'normal' | 'large' | 'xlarge';
export type ReadingLevel = 'Simple' | 'Very simple';

export interface ActionStep {
  id: string;
  action: string;
  detail: string;
  difficulty: 'Easy' | 'Medium' | 'Needs Help';
  estimatedTime: string;
}

export interface DeadlineItem {
  label: string;
  date: string;
}

export interface GlossaryItem {
  term: string;
  meaning: string;
}

export interface AnalysisResult {
  title: string;
  summary: string;
  steps: ActionStep[];
  documentsNeeded: string[];
  deadlines: DeadlineItem[];
  commonMistakes: string[];
  privacyFlags: string[];
  glossary: GlossaryItem[];
  confidence: 'High' | 'Medium' | 'Low';
  disclaimer: string;
}

export interface SampleDocument {
  id: string;
  titleKey: string;
  category: string;
  descriptionKey: string;
  sourceLabel: string;
  content: Record<Language, string>;
}

export interface FeedbackSubmission {
  id: string;
  timestamp: string;
  overallRating: number;
  clarityRating: number;
  completedTask: 'Yes' | 'Partly' | 'No';
  understoodIndependently: boolean;
  confusingParts?: string;
  suggestedImprovements?: string;
  contact?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface FeedbackStats {
  totalReviews: number;
  averageRating: number;
  clarityRating: number;
  independentPercentage: number;
  recentComments?: Array<{
    rating: number;
    text: string;
    completedTask: string;
    date: string;
  }>;
}
