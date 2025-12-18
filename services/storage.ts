
import { UserState, ModuleProgress, Language, JournalEntry, Theme, ReminderSettings, DailyGoal, TimeSpent } from '../types';

const STORAGE_KEY = 'lapaas_mindset_data_v2'; 

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
  dailyGoals: [],
  timeSpent: {
    reading: 0,
    total: 0,
  },
};

// --- Haptic Feedback Utility ---
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  switch (type) {
    case 'light':
      navigator.vibrate(10); // Subtle tick
      break;
    case 'medium':
      navigator.vibrate(20); // Normal click
      break;
    case 'heavy':
      navigator.vibrate(40); // Hard press
      break;
    case 'success':
      navigator.vibrate([30, 50, 30]); // Da-da-da pattern
      break;
  }
};


// --- Local Storage Wrappers ---

export const getStorageData = (): UserState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        return { 
            ...DEFAULT_STATE, 
            ...parsed,
            // Ensure strictly typed fields exist
            name: parsed.name || '',
            bio: parsed.bio || '',
            avatar: parsed.avatar || 'User',
            joinedAt: parsed.joinedAt || Date.now(),
            reminder: parsed.reminder ? parsed.reminder : DEFAULT_STATE.reminder,
            dailyGoals: parsed.dailyGoals || [],
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

// --- Actions ---

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
  data.joinedAt = Date.now(); 
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

// --- Daily Goals Helpers ---

export const addDailyGoal = (text: string) => {
  const data = getStorageData();
  const newGoal: DailyGoal = {
    id: Date.now().toString(),
    text,
    createdAt: Date.now(),
    history: []
  };
  if (!data.dailyGoals) data.dailyGoals = [];
  
  data.dailyGoals.push(newGoal);
  saveStorageData(data);
  return data;
};

export const deleteDailyGoal = (id: string) => {
  const data = getStorageData();
  if (data.dailyGoals) {
    data.dailyGoals = data.dailyGoals.filter(g => g.id !== id);
    saveStorageData(data);
  }
  return data;
};

export const toggleDailyGoal = (id: string) => {
  const data = getStorageData();
  if (data.dailyGoals) {
    const goal = data.dailyGoals.find(g => g.id === id);
    if (goal) {
        const today = new Date().toLocaleDateString('en-CA'); 
        if (goal.history.includes(today)) {
            goal.history = goal.history.filter(d => d !== today);
        } else {
            goal.history.push(today);
        }
        saveStorageData(data);
    }
  }
  return data;
};

// --- Time Tracking ---

export const startTimeTracking = () => {
  const data = getStorageData();
  if (!data.timeSpent) {
    data.timeSpent = { reading: 0, total: 0 };
  }
  data.timeSpent.lastSessionStart = Date.now();
  saveStorageData(data);
};

export const addTimeSpent = (type: 'reading' | 'total', seconds: number) => {
  const data = getStorageData();
  if (!data.timeSpent) {
    data.timeSpent = { reading: 0, total: 0 };
  }
  data.timeSpent[type] += seconds;
  saveStorageData(data);
  return data;
};

export const getTimeSpent = (): TimeSpent => {
  const data = getStorageData();
  return data.timeSpent || { reading: 0, total: 0 };
};
