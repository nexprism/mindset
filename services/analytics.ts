// Google Analytics Service for Lapaas Mindset
// Tracking ID: G-8QFNJ1YS25

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize gtag if not already present
if (typeof window !== 'undefined' && !window.gtag) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
}

// Event Categories
export const EventCategory = {
  NAVIGATION: 'navigation',
  ENGAGEMENT: 'engagement',
  LEARNING: 'learning',
  JOURNAL: 'journal',
  GOALS: 'goals',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  PWA: 'pwa',
  ONBOARDING: 'onboarding',
} as const;

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-8QFNJ1YS25', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  category: string,
  label?: string,
  value?: number,
  additionalParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: category,
      event_label: label,
      value: value,
      ...additionalParams,
    });
  }
};

// ============================================
// Navigation Events
// ============================================
export const trackNavigation = (from: string, to: string) => {
  trackEvent('navigate', EventCategory.NAVIGATION, `${from} -> ${to}`);
};

// ============================================
// Onboarding Events
// ============================================
export const trackOnboardingStart = () => {
  trackEvent('onboarding_start', EventCategory.ONBOARDING);
};

export const trackOnboardingStep = (step: number, stepName: string) => {
  trackEvent('onboarding_step', EventCategory.ONBOARDING, stepName, step);
};

export const trackOnboardingComplete = (recommendedModule?: string) => {
  trackEvent('onboarding_complete', EventCategory.ONBOARDING, recommendedModule);
};

// ============================================
// Learning Events
// ============================================
export const trackModuleStart = (moduleId: string, moduleName: string) => {
  trackEvent('module_start', EventCategory.LEARNING, moduleName, undefined, { module_id: moduleId });
};

export const trackDayStart = (moduleId: string, dayNumber: number) => {
  trackEvent('day_start', EventCategory.LEARNING, `Day ${dayNumber}`, dayNumber, { module_id: moduleId });
};

export const trackDayComplete = (moduleId: string, dayNumber: number) => {
  trackEvent('day_complete', EventCategory.LEARNING, `Day ${dayNumber}`, dayNumber, { module_id: moduleId });
};

export const trackModuleComplete = (moduleId: string, moduleName: string) => {
  trackEvent('module_complete', EventCategory.LEARNING, moduleName, undefined, { module_id: moduleId });
};

export const trackQuizAnswer = (moduleId: string, dayNumber: number, isCorrect: boolean) => {
  trackEvent('quiz_answer', EventCategory.LEARNING, isCorrect ? 'correct' : 'incorrect', undefined, {
    module_id: moduleId,
    day_number: dayNumber,
  });
};

export const trackContentInteraction = (type: 'concept' | 'story' | 'summary' | 'vocabulary' | 'task', moduleId: string, dayNumber: number) => {
  trackEvent('content_interaction', EventCategory.LEARNING, type, undefined, {
    module_id: moduleId,
    day_number: dayNumber,
  });
};

// ============================================
// Journal Events
// ============================================
export const trackJournalEntry = (moduleId: string, dayNumber: number, wordCount: number) => {
  trackEvent('journal_entry', EventCategory.JOURNAL, moduleId, wordCount, { day_number: dayNumber });
};

export const trackJournalView = () => {
  trackEvent('journal_view', EventCategory.JOURNAL);
};

// ============================================
// Daily Goals Events
// ============================================
export const trackGoalCreate = (goalText: string) => {
  trackEvent('goal_create', EventCategory.GOALS, goalText.substring(0, 50));
};

export const trackGoalComplete = (goalId: string, streak: number) => {
  trackEvent('goal_complete', EventCategory.GOALS, undefined, streak, { goal_id: goalId });
};

export const trackGoalDelete = (goalId: string) => {
  trackEvent('goal_delete', EventCategory.GOALS, goalId);
};

// ============================================
// Profile Events
// ============================================
export const trackProfileEdit = (field: 'name' | 'bio' | 'avatar') => {
  trackEvent('profile_edit', EventCategory.PROFILE, field);
};

export const trackBadgeUnlock = (badgeId: string, badgeName: string) => {
  trackEvent('badge_unlock', EventCategory.PROFILE, badgeName, undefined, { badge_id: badgeId });
};

export const trackLevelUp = (newLevel: number, levelTitle: string) => {
  trackEvent('level_up', EventCategory.PROFILE, levelTitle, newLevel);
};

export const trackXPGain = (amount: number, source: string) => {
  trackEvent('xp_gain', EventCategory.PROFILE, source, amount);
};

export const trackShareProfile = (method: string) => {
  trackEvent('share_profile', EventCategory.PROFILE, method);
};

// ============================================
// Settings Events
// ============================================
export const trackLanguageChange = (from: string, to: string) => {
  trackEvent('language_change', EventCategory.SETTINGS, `${from} -> ${to}`);
};

export const trackThemeChange = (theme: string) => {
  trackEvent('theme_change', EventCategory.SETTINGS, theme);
};

export const trackReminderSet = (time: string, enabled: boolean) => {
  trackEvent('reminder_set', EventCategory.SETTINGS, time, enabled ? 1 : 0);
};

export const trackAppReset = () => {
  trackEvent('app_reset', EventCategory.SETTINGS);
};

// ============================================
// PWA Events
// ============================================
export const trackInstallPromptShown = () => {
  trackEvent('install_prompt_shown', EventCategory.PWA);
};

export const trackInstallPromptAccepted = () => {
  trackEvent('install_prompt_accepted', EventCategory.PWA);
};

export const trackInstallPromptDismissed = () => {
  trackEvent('install_prompt_dismissed', EventCategory.PWA);
};

export const trackAppInstalled = () => {
  trackEvent('app_installed', EventCategory.PWA);
};

// ============================================
// Engagement Events
// ============================================
export const trackSessionStart = () => {
  trackEvent('session_start', EventCategory.ENGAGEMENT);
};

export const trackTimeSpent = (pageName: string, seconds: number) => {
  trackEvent('time_spent', EventCategory.ENGAGEMENT, pageName, seconds);
};

export const trackScrollDepth = (pageName: string, percentage: number) => {
  trackEvent('scroll_depth', EventCategory.ENGAGEMENT, pageName, percentage);
};

export const trackCTAClick = (ctaName: string, location: string) => {
  trackEvent('cta_click', EventCategory.ENGAGEMENT, ctaName, undefined, { location });
};

export const trackFeatureDiscovery = (featureName: string) => {
  trackEvent('feature_discovery', EventCategory.ENGAGEMENT, featureName);
};

// ============================================
// Error Tracking
// ============================================
export const trackError = (errorType: string, errorMessage: string, componentName?: string) => {
  trackEvent('error', 'error', errorType, undefined, {
    error_message: errorMessage,
    component: componentName,
  });
};

// ============================================
// Landing Page Events
// ============================================
export const trackLandingPageSection = (sectionName: string) => {
  trackEvent('landing_section_view', EventCategory.ENGAGEMENT, sectionName);
};

export const trackLandingPageCTA = (ctaText: string) => {
  trackEvent('landing_cta_click', EventCategory.ENGAGEMENT, ctaText);
};
