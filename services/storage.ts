
import { UserState, ModuleProgress, Language, JournalEntry, Theme, ReminderSettings } from '../types';

const STORAGE_KEY = 'lapaas_mindset_data_v2'; // Bumped version for new schema

const DEFAULT_STATE: UserState = {
  name: '',
  bio: '',
  avatar: 'User',
  joinedAt: Date.now(),
  language: 'en',
  theme: 'system',
  reminder: {
    enabled: false,
    time: "09:00"
  },
  hasCompletedOnboarding: false,
  progress: {},
};

export const getStorageData = (): UserState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        // Ensure new fields exist if loading from older state
        return { 
            ...DEFAULT_STATE, 
            ...parsed,
            name: parsed.name || '',
            bio: parsed.bio || '',
            avatar: parsed.avatar || 'User',
            joinedAt: parsed.joinedAt || Date.now(),
            reminder: parsed.reminder ? parsed.reminder : DEFAULT_STATE.reminder
        };
    }
    return DEFAULT_STATE;
  } catch (e) {
    console.error("Storage load error", e);
    return DEFAULT_STATE;
  }
};

export const saveStorageData = (data: UserState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage save error", e);
  }
};

export const updateModuleProgress = (
  moduleId: string, 
  dayNumber: number, 
  journalText: string, 
  taskResponse: string
) => {
  const data = getStorageData();
  
  if (!data.progress[moduleId]) {
    data.progress[moduleId] = {
      startedAt: Date.now(),
      lastAccessedAt: Date.now(),
      completedDays: [],
      journal: {}
    };
  }

  const modProgress = data.progress[moduleId];
  modProgress.lastAccessedAt = Date.now();

  // Save journal and task response
  const entry: JournalEntry = { 
    text: journalText, 
    taskResponse: taskResponse,
    timestamp: Date.now() 
  };
  modProgress.journal[dayNumber] = entry;

  // Mark completed if not already
  if (!modProgress.completedDays.includes(dayNumber)) {
    modProgress.completedDays.push(dayNumber);
  }

  saveStorageData(data);
  return data;
};

export const setLanguagePreference = (lang: Language) => {
  const data = getStorageData();
  data.language = lang;
  saveStorageData(data);
  return data;
};

export const setThemePreference = (theme: Theme) => {
  const data = getStorageData();
  data.theme = theme;
  saveStorageData(data);
  return data;
};

export const setReminderPreference = (settings: ReminderSettings) => {
    const data = getStorageData();
    data.reminder = settings;
    saveStorageData(data);
    return data;
};

export const setUserName = (name: string) => {
  const data = getStorageData();
  data.name = name;
  saveStorageData(data);
  return data;
};

export const updateUserProfile = (updates: { name?: string; bio?: string; avatar?: string }) => {
    const data = getStorageData();
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.bio !== undefined) data.bio = updates.bio;
    if (updates.avatar !== undefined) data.avatar = updates.avatar;
    saveStorageData(data);
    return data;
};

export const completeOnboarding = (recommendedId?: string) => {
  const data = getStorageData();
  data.hasCompletedOnboarding = true;
  data.joinedAt = Date.now(); // Set join date on onboarding completion
  if (recommendedId) {
    data.recommendedModuleId = recommendedId;
  }
  saveStorageData(data);
  return data;
};

export const resetModule = (moduleId: string) => {
  const data = getStorageData();
  if (data.progress[moduleId]) {
    delete data.progress[moduleId];
    saveStorageData(data);
  }
  return data;
};

export const resetApp = () => {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_STATE;
};
