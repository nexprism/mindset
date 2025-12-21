
export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'ru' | 'it' | 'ar';
export type Theme = 'light' | 'dark' | 'system';

export interface LocalizedString {
  en: string;
  hi: string;
  es: string;
  fr: string;
  de: string;
  zh: string;
  ja: string;
  pt: string;
  ru: string;
  it: string;
  ar: string;
}

export interface VocabularyItem {
  word: string;
  transliteration: string;
  phonetic: string;
}

export interface DayContent {
  dayNumber: number;
  title: LocalizedString;
  reading: LocalizedString;
  task: LocalizedString;
  reflectionPrompt: LocalizedString;
  vocabulary?: VocabularyItem[];
}

export interface Module {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  iconName: string; // Mapping to Lucide icons
  days: DayContent[];
  bannerImage: string; // URL for the module header image
  category: 
    | 'finance' 
    | 'health' 
    | 'confidence' 
    | 'productivity' 
    | 'resilience' 
    | 'relationships' 
    | 'growth' 
    | 'discipline' 
    | 'mindfulness' 
    | 'leadership' 
    | 'communication' 
    | 'creativity' 
    | 'gratitude' 
    | 'career' 
    | 'goals'
    // New Categories
    | 'public_speaking'
    | 'negotiation'
    | 'critical_thinking'
    | 'emotional_intelligence'
    | 'digital_detox'
    | 'stoicism'
    | 'minimalism'
    | 'learning'
    | 'networking'
    | 'entrepreneurship'
    | 'happiness'
    | 'anger_management'
    | 'decision_making'
    | 'sales'
    | 'body_language'
    | 'burnout'
    | 'parenting'
    | 'spirituality'
    | 'dopamine'
    | 'personal_branding';
}

export interface JournalEntry {
  text: string; // The reflection text
  taskResponse?: string; // The specific input for the micro-task
  timestamp: number;
}

export interface ModuleProgress {
  startedAt: number;
  lastAccessedAt: number;
  completedDays: number[]; // Array of day numbers completed
  journal: Record<number, JournalEntry>; // dayNumber -> entry
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // Format "HH:mm" (24h)
}

export interface DailyGoal {
  id: string;
  text: string;
  createdAt: number;
  history: string[]; // Array of ISO date strings "YYYY-MM-DD" indicating completion
}

export interface TimeSpent {
  reading: number; // Total seconds spent reading
  total: number; // Total seconds in app building mindset
  lastSessionStart?: number; // Timestamp when current session started
}

export interface UserState {
  uid?: string; // Firebase User ID
  email?: string; // Firebase Email
  name: string; // User's name for personalization
  bio?: string; // User's personal motto or bio
  avatar?: string; // Icon name for the avatar
  joinedAt?: number; // Timestamp when user started
  language: Language;
  theme: Theme;
  reminder: ReminderSettings;
  hasCompletedOnboarding: boolean;
  progress: Record<string, ModuleProgress>; // moduleId -> progress
  recommendedModuleId?: string;
  dailyGoals: DailyGoal[];
  timeSpent?: TimeSpent; // Time tracking
}

export interface QuizQuestion {
  id: number;
  question: LocalizedString;
  options: {
    id: string;
    text: LocalizedString;
    relatedCategories: string[];
  }[];
}
