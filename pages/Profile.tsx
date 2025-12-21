import React, { useState, useEffect } from 'react';
import { UserState, ModuleProgress, JournalEntry, Theme, ReminderSettings } from '../types';
import { UI_LABELS, MODULES } from '../constants';
import * as Icons from 'lucide-react';
import { 
  Languages, Trash2, Trophy, Flame, Calendar as CalendarIcon, Settings, User, ChevronLeft, ChevronRight, Share2, Moon, Bell, X, BookOpen, CheckSquare, ArrowRight, Edit3, Medal, Star, Footprints, Crown, Plus, Check, LogOut, Cloud, Loader2,
  Target, Smile, Zap, Heart, Anchor, Feather, Code, Music, Coffee, CloudLightning, PenTool, Info, Download, Smartphone, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Certificate from '../components/Certificate';
import { setUserName, updateUserProfile, saveStorageData, getStorageData, addDailyGoal, deleteDailyGoal, toggleDailyGoal, triggerHaptic } from '../services/storage';

interface ProfileProps {
  userState: UserState;
  installPrompt?: any;
  onToggleLang: () => void;
  onReset: () => void;
  onSetTheme: (theme: Theme) => void;
  onSetReminder: (settings: ReminderSettings) => void;
  onUpdate?: () => void;
}

// XP System Constants
const XP_PER_DAY = 100;
const XP_PER_JOURNAL = 20;
const XP_PER_STREAK_DAY = 10;
const XP_PER_DAILY_GOAL = 50;

// Format time in seconds to human-readable string
const formatTimeSpent = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

// Avatar Options (Lucide Icon Names)
const AVATAR_OPTIONS = [
    'User', 'Smile', 'Star', 'Zap', 'Heart', 'Crown', 
    'Anchor', 'Feather', 'Code', 'Music', 'Coffee', 'CloudLightning'
];

const calculateStats = (userState: UserState) => {
    // Total entries
    let totalEntries = 0;
    let completedDaysCount = 0;
    const allTimestamps: number[] = [];
    const completedMilestones: {moduleId: string, dayNumber: number, timestamp: number}[] = [];
    const allJournalEntries: {moduleId: string, dayNumber: number, text: string, timestamp: number}[] = [];

    // XP Calculation components
    let xpFromDays = 0;
    let xpFromJournal = 0;
    let xpFromGoals = 0;
    let xpFromStreak = 0;

    Object.keys(userState.progress).forEach((moduleId) => {
      const prog = userState.progress[moduleId];
      // XP for Completed Days
      const days = prog.completedDays.length;
      completedDaysCount += days;
      xpFromDays += days * XP_PER_DAY;

      prog.completedDays.forEach(dayNum => {
         let ts = prog.journal[dayNum]?.timestamp || prog.lastAccessedAt;
         completedMilestones.push({ moduleId, dayNumber: dayNum, timestamp: ts });
      });

      if (prog.journal) {
        // XP for Journaling
        const entries = Object.keys(prog.journal).length;
        totalEntries += entries;
        xpFromJournal += entries * XP_PER_JOURNAL;
        
        Object.values(prog.journal).forEach((e: JournalEntry) => {
            allTimestamps.push(e.timestamp);
            const dNum = parseInt(Object.keys(prog.journal).find(key => prog.journal[parseInt(key)] === e) || '0');
            allJournalEntries.push({ moduleId, dayNumber: dNum, text: e.text, timestamp: e.timestamp });
        });
      }
    });

    // XP for Daily Goals
    if (userState.dailyGoals) {
        userState.dailyGoals.forEach(goal => {
            xpFromGoals += goal.history.length * XP_PER_DAILY_GOAL;
        });
    }

    // Streak Logic
    let currentStreak = 0;
    let longestStreak = 0;
    let cumulativeStreakDays = 0;
    
    if (allTimestamps.length > 0) {
        // Sort timestamps and get unique days
        const uniqueDays = Array.from(new Set(allTimestamps.map(ts => {
            const d = new Date(ts);
            d.setHours(0,0,0,0);
            return d.getTime();
        }))).sort((a, b) => a - b);

        // Calculate Longest Streak & Cumulative Streak Days
        let tempStreak = 1;
        if (uniqueDays.length > 0) longestStreak = 1;

        for (let i = 1; i < uniqueDays.length; i++) {
            const prev = uniqueDays[i-1];
            const curr = uniqueDays[i];
            const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                tempStreak++;
                cumulativeStreakDays++;
            } else {
                tempStreak = 1;
            }
            if (tempStreak > longestStreak) longestStreak = tempStreak;
        }

        // Calculate Current Streak
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayTime = today.getTime();
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayTime = yesterday.getTime();
        
        const hasToday = uniqueDays.includes(todayTime);
        const hasYesterday = uniqueDays.includes(yesterdayTime);

        if (hasToday || hasYesterday) {
             let checkTime = hasToday ? todayTime : yesterdayTime;
             currentStreak = 0;
             // Re-check unique days from end or efficiently
             // Simple backward check since we have sorted array
             for (let i = uniqueDays.length - 1; i >= 0; i--) {
                 const t = uniqueDays[i];
                 if (t === checkTime) {
                     currentStreak++;
                     const d = new Date(checkTime);
                     d.setDate(d.getDate() - 1);
                     checkTime = d.getTime();
                 }
                 if (t < checkTime) break; // Optimization
             }
        }
    }

    // XP for Streak (Cumulative)
    xpFromStreak = cumulativeStreakDays * XP_PER_STREAK_DAY;

    const totalXp = xpFromDays + xpFromJournal + xpFromGoals + xpFromStreak;

    // Sort lists
    completedMilestones.sort((a,b) => b.timestamp - a.timestamp);
    allJournalEntries.sort((a,b) => b.timestamp - a.timestamp);

    return { 
        totalEntries, 
        completedDaysCount, 
        currentStreak, 
        longestStreak, 
        xp: totalXp,
        xpBreakdown: {
            days: xpFromDays,
            journal: xpFromJournal,
            goals: xpFromGoals,
            streak: xpFromStreak
        },
        completedMilestones,
        allJournalEntries
    };
};

const getLevelInfo = (xp: number) => {
    // Level Curve
    const levels = [
        { level: 1, title: 'Novice', min: 0, max: 500, icon: Footprints },
        { level: 2, title: 'Seeker', min: 500, max: 1500, icon: Target },
        { level: 3, title: 'Explorer', min: 1500, max: 3000, icon: Star },
        { level: 4, title: 'Builder', min: 3000, max: 5500, icon: Icons.Hammer },
        { level: 5, title: 'Achiever', min: 5500, max: 9000, icon: Medal },
        { level: 6, title: 'Master', min: 9000, max: 999999, icon: Crown },
    ];

    const currentLevel = levels.find(l => xp >= l.min && xp < l.max) || levels[levels.length - 1];
    return currentLevel;
};

// Helper for Icon rendering
const DynamicIcon = ({ name, size, className }: { name: string, size: number, className?: string }) => {
    let IconComponent = Icons && (Icons as any)[name];
    if (!IconComponent) {
        const fallbackMap: Record<string, any> = {
            User, Smile, Star, Zap, Heart, Crown, 
            Anchor, Feather, Code, Music, Coffee, CloudLightning, Circle: Icons.Circle
        };
        IconComponent = fallbackMap[name] || User;
    }
    return <IconComponent size={size} className={className} />;
};

const BadgeIcon: React.FC<{ icon: any, unlocked: boolean }> = ({ icon: Icon, unlocked }) => (
    <div className={`p-3 rounded-full mb-2 ${unlocked ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-200 dark:ring-orange-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
        <Icon size={24} />
    </div>
);

const Profile: React.FC<ProfileProps> = ({ userState, installPrompt, onToggleLang, onReset, onSetTheme, onSetReminder, onUpdate }) => {
  const lang = userState.language;
  const stats = calculateStats(userState);
  const levelInfo = getLevelInfo(stats.xp);
  const nextLevelProgressPercent = ((stats.xp - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100;
  

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Activity Modal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // XP Modal State
  const [showXPModal, setShowXPModal] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userState.name || '');
  const [editBio, setEditBio] = useState(userState.bio || '');
  const [editAvatar, setEditAvatar] = useState(userState.avatar || 'User');
  
  // Daily Goals State
  const [newGoalText, setNewGoalText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteGoalModal, setShowDeleteGoalModal] = useState<string | null>(null);
  const [showResetAllModal, setShowResetAllModal] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [showCalendarDetail, setShowCalendarDetail] = useState(false);
  const [showCertificate, setShowCertificate] = useState<string | null>(null);

  // Install State
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check Platform for Install Instructions
  useEffect(() => {
     const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
     setIsIOS(checkIOS);
     const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
     setIsStandalone(checkStandalone);
  }, []);



  const handleInstallClick = () => {
      triggerHaptic('medium');
      if (installPrompt) {
          installPrompt.prompt();
          installPrompt.userChoice.then((choiceResult: any) => {
              console.log(choiceResult.outcome);
          });
      }
  };

  const badges = [
      { id: 'first_step', icon: Footprints, label: 'First Step', desc: 'Complete 1 Day', unlocked: stats.completedDaysCount >= 1 },
      { id: 'streak_3', icon: Flame, label: 'Spark', desc: '3 Day Streak', unlocked: stats.currentStreak >= 3 },
      { id: 'streak_7', icon: Zap, label: 'On Fire', desc: '7 Day Streak', unlocked: stats.currentStreak >= 7 },
      { id: 'writer', icon: PenTool, label: 'Reflective', desc: '10 Journal Entries', unlocked: stats.totalEntries >= 10 },
      { id: 'champion', icon: Trophy, label: 'Champion', desc: 'Finish a Journey', unlocked: Object.values(userState.progress).some((p: any) => p.completedDays.length >= 21) },
  ];

  const shareText = `I'm a Level ${levelInfo.level} ${levelInfo.title} on Lapaas Mindset! 🔥\n${stats.xp} XP earned.`;
  const shareUrl = window.location.origin;
  const handleCopy = () => { navigator.clipboard.writeText(`${shareText}\n${shareUrl}`); };


  // Get activities for selected date
  const getSelectedDateActivities = () => {
    if (!selectedDate) return [];
    const activities: { moduleId: string; moduleName: string; dayNumber: number; type: 'completed' | 'journal'; text?: string }[] = [];
    const selectedDateStr = selectedDate.toLocaleDateString('en-CA');
    
    Object.entries(userState.progress).forEach(([moduleId, prog]: [string, any]) => {
      const module = MODULES.find(m => m.id === moduleId);
      if (!module) return;
      
      if (prog.journal) {
        Object.entries(prog.journal).forEach(([dayNum, entry]: [string, any]) => {
          const entryDate = new Date(entry.timestamp).toLocaleDateString('en-CA');
          if (entryDate === selectedDateStr) {
            activities.push({
              moduleId,
              moduleName: module.title[lang],
              dayNumber: parseInt(dayNum),
              type: 'journal',
              text: entry.text
            });
          }
        });
      }
    });
    
    return activities;
  };

  // Share via Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Lapaas Mindset Progress',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };
  
  const handleSaveProfile = () => {
      triggerHaptic('success');
      const trimmedName = editName.trim();
      const updatedName = trimmedName.length > 0 ? trimmedName : (userState.name || 'Friend');
      updateUserProfile({ name: updatedName, bio: editBio.trim(), avatar: editAvatar });
      setIsEditingProfile(false);
      if (onUpdate) onUpdate();
  };
  
  const handleAddGoal = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newGoalText.trim()) return;
      triggerHaptic('medium');
      addDailyGoal(newGoalText.trim());
      setNewGoalText('');
      if(onUpdate) onUpdate();
  };

  const handleToggleGoal = (id: string) => {
      triggerHaptic('medium');
      toggleDailyGoal(id);
      if(onUpdate) onUpdate();
  };

  const handleDeleteGoal = (id: string) => {
      triggerHaptic('heavy');
      setShowDeleteGoalModal(id);
  };

  const confirmDeleteGoal = () => {
      if (showDeleteGoalModal) {
        deleteDailyGoal(showDeleteGoalModal);
        if(onUpdate) onUpdate();
        setShowDeleteGoalModal(null);
      }
  };
  
  const calculateGoalStreak = (history: string[]) => {
      if (!history || history.length === 0) return 0;
      const sorted = [...history].sort();
      const today = new Date().toLocaleDateString('en-CA');
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toLocaleDateString('en-CA');
      const lastEntry = sorted[sorted.length - 1];
      if (lastEntry !== today && lastEntry !== yesterday) return 0;
      let streak = 1;
      let currentDate = new Date(lastEntry);
      for (let i = sorted.length - 2; i >= 0; i--) {
          currentDate.setDate(currentDate.getDate() - 1);
          const expectedDate = currentDate.toLocaleDateString('en-CA');
          if (sorted[i] === expectedDate) streak++; else break;
      }
      return streak;
  };

  const handleDateClick = (y:number, m:number, d:number) => {
      triggerHaptic('light');
      const date = new Date(y, m, d);
      setSelectedDate(date);
      setShowCalendarDetail(true);
  };
  
  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayStats = new Map<number, boolean>();
    Object.values(userState.progress).forEach((prog: any) => {
      if (prog.journal) Object.values(prog.journal).forEach((e: any) => {
          const d = new Date(e.timestamp);
          if (d.getFullYear() === year && d.getMonth() === month) dayStats.set(d.getDate(), true);
      });
    });
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`blank-${i}`} className="h-8 w-8" />);
    for (let d = 1; d <= daysInMonth; d++) {
        const hasActivity = dayStats.has(d);
        days.push(<div key={d} className="flex justify-center"><button onClick={()=>handleDateClick(year,month,d)} className={`w-8 h-8 rounded-full text-xs font-bold ${hasActivity ? 'bg-orange-100 text-orange-600' : 'text-slate-400'}`}>{d}</button></div>)
    }
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex justify-between mb-4"><h3 className="font-bold dark:text-white">Activity</h3><span className="text-xs dark:text-slate-400">{calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span></div>
            <div className="grid grid-cols-7 gap-y-2">{days}</div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 px-4 pt-6 transition-colors duration-300">
       
       {/* -------------------------------------------------- */}
       {/* IDENTITY CARD */}
       {/* -------------------------------------------------- */}
       <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 mb-6 relative overflow-hidden animate-fade-in">
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
           
           <div className="p-6 relative z-10">
               <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                  <div className="relative mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-inner border-4 border-white dark:border-slate-900">
                         <DynamicIcon name={userState.avatar || 'User'} size={48} />
                      </div>
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="absolute bottom-0 right-0 p-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-md hover:scale-110 transition-transform"
                      >
                         <Edit3 size={12} />
                      </button>
                  </div>

                  <div className="flex-1 w-full">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start">
                                  {userState.name || 'Friend'}
                              </h1>
                              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 italic min-h-[1.25rem]">
                                {userState.bio || (lang === 'en' ? "Ready to grow 🌱" : "बढ़ने के लिए तैयार 🌱")}
                              </p>
                          </div>
                          
                          <button onClick={() => setShowShareModal(true)} className="hidden md:flex p-2 text-slate-400 hover:text-orange-600 transition-colors">
                              <Share2 size={20} />
                          </button>
                      </div>

                      <div className="mt-6 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 relative group cursor-pointer" onClick={() => setShowXPModal(true)}>
                          <div className="absolute top-2 right-2 text-slate-300 dark:text-slate-600 group-hover:text-orange-500 transition-colors">
                             <Info size={16} />
                          </div>
                          <div className="flex justify-between items-end mb-2">
                              <div className="flex items-center space-x-2">
                                  <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded text-orange-600">
                                     <levelInfo.icon size={16} />
                                  </div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                    Level {levelInfo.level}: <span className="text-orange-600 dark:text-orange-400">{levelInfo.title}</span>
                                  </span>
                              </div>
                              <span className="text-xs font-bold text-slate-400 font-mono">
                                {stats.xp} / {levelInfo.max} XP
                              </span>
                          </div>
                          <div className="w-full h-2.5 bg-white dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700/50">
                              <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, nextLevelProgressPercent)}%` }}></div>
                          </div>
                      </div>
                  </div>
               </div>
           </div>
       </div>

       {/* XP BREAKDOWN MODAL */}
       {showXPModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowXPModal(false)}>
               <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                   <button onClick={() => setShowXPModal(false)} className="absolute top-4 right-4 text-slate-400"><X size={20} /></button>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                       <Star className="text-orange-500 mr-2" fill="currentColor" size={20} /> XP Breakdown
                   </h3>
                   
                   <div className="space-y-4">
                       <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                           <div className="flex items-center space-x-3">
                               <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600"><CheckSquare size={16} /></div>
                               <div>
                                   <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Days Completed</div>
                                   <div className="text-sm font-semibold dark:text-white">{Math.floor(stats.xpBreakdown.days / XP_PER_DAY)} x {XP_PER_DAY} XP</div>
                               </div>
                           </div>
                           <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">+{stats.xpBreakdown.days}</div>
                       </div>
                       
                       <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                           <div className="flex items-center space-x-3">
                               <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600"><BookOpen size={16} /></div>
                               <div>
                                   <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Journals</div>
                                   <div className="text-sm font-semibold dark:text-white">{Math.floor(stats.xpBreakdown.journal / XP_PER_JOURNAL)} x {XP_PER_JOURNAL} XP</div>
                               </div>
                           </div>
                           <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{stats.xpBreakdown.journal}</div>
                       </div>

                       <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                           <div className="flex items-center space-x-3">
                               <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600"><Flame size={16} /></div>
                               <div>
                                   <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Streak Bonus</div>
                                   <div className="text-sm font-semibold dark:text-white">Consecutive days</div>
                               </div>
                           </div>
                           <div className="font-mono font-bold text-orange-600 dark:text-orange-400">+{stats.xpBreakdown.streak}</div>
                       </div>

                       <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                           <div className="flex items-center space-x-3">
                               <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg text-pink-600"><Target size={16} /></div>
                               <div>
                                   <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Daily Goals</div>
                                   <div className="text-sm font-semibold dark:text-white">{Math.floor(stats.xpBreakdown.goals / XP_PER_DAILY_GOAL)} x {XP_PER_DAILY_GOAL} XP</div>
                               </div>
                           </div>
                           <div className="font-mono font-bold text-pink-600 dark:text-pink-400">+{stats.xpBreakdown.goals}</div>
                       </div>
                   </div>

                   <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                       <span className="font-bold text-slate-800 dark:text-white">Total Lifetime XP</span>
                       <span className="text-xl font-black text-orange-600 dark:text-orange-500">{stats.xp}</span>
                   </div>
               </div>
           </div>
       )}

       {/* Quick Stats Grid */}
       <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
             <Flame className="mx-auto text-orange-500 mb-2" size={24} />
             <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.currentStreak}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{UI_LABELS.streak[lang]}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
             <Trophy className="mx-auto text-yellow-500 mb-2" size={24} />
             <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.completedDaysCount}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{UI_LABELS.daysDone[lang]}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
             <CalendarIcon className="mx-auto text-indigo-500 mb-2" size={24} />
             <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalEntries}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{UI_LABELS.entries[lang]}</div>
          </div>
       </div>

       {/* Time Invested */}
       <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 mb-8">
           <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                   <Clock className="text-emerald-500" size={20} />
                   <span className="font-medium text-slate-700 dark:text-slate-300">{lang === 'en' ? 'Time Invested' : 'समय निवेश'}</span>
               </div>
               <div className="text-right">
                   <span className="text-xl font-black text-slate-800 dark:text-white">{formatTimeSpent(userState.timeSpent?.total || 0)}</span>
                   <span className="text-xs text-slate-400 ml-1">{lang === 'en' ? 'total' : 'कुल'}</span>
               </div>
           </div>
       </div>

       {/* Daily Targets */}
       <div className="mb-8">
           <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">{lang === 'en' ? 'Daily Targets' : 'दैनिक लक्ष्य'}</h3>
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
               {userState.dailyGoals && userState.dailyGoals.length > 0 ? (
                   <div className="divide-y divide-slate-100 dark:divide-slate-800">
                       {userState.dailyGoals.map(goal => {
                           const streak = calculateGoalStreak(goal.history);
                           const isCompletedToday = goal.history.includes(new Date().toLocaleDateString('en-CA'));
                           return (
                               <div key={goal.id} className="p-4 flex items-center justify-between">
                                   <div className="flex items-center flex-1 mr-4">
                                       <button 
                                           onClick={() => handleToggleGoal(goal.id)}
                                           className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${isCompletedToday ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}
                                       >
                                           {isCompletedToday && <Check size={14} strokeWidth={3} />}
                                       </button>
                                       <span className={`text-sm ${isCompletedToday ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>{goal.text}</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       {streak > 0 && <div className="flex items-center text-orange-500"><Flame size={14} /><span className="text-xs font-bold ml-1">{streak}</span></div>}
                                       <button onClick={() => handleDeleteGoal(goal.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               ) : (
                   <div className="p-4 text-center text-slate-400 text-sm">{lang === 'en' ? 'No daily targets yet' : 'कोई दैनिक लक्ष्य नहीं'}</div>
               )}
               <form onSubmit={handleAddGoal} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-2">
                   <input 
                       id="daily-target"
                       name="daily-target"
                       type="text" 
                       value={newGoalText}
                       onChange={(e) => setNewGoalText(e.target.value)}
                       placeholder={lang === 'en' ? 'Add target...' : 'लक्ष्य जोड़ें...'}
                       className="flex-1 bg-transparent text-sm p-2 text-slate-800 dark:text-white placeholder-slate-400 outline-none"
                   />
                   <button type="submit" disabled={!newGoalText.trim()} className={`px-3 py-2 rounded-lg ${newGoalText.trim() ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}><Plus size={18} /></button>
               </form>
           </div>
       </div>

       {/* Edit Profile Modal */}
       {isEditingProfile && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditingProfile(false)}>
               <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                   <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center"><h3 className="font-bold dark:text-white">Edit Profile</h3><button onClick={() => setIsEditingProfile(false)} className="text-slate-400"><X size={20} /></button></div>
                   <div className="p-6 space-y-4">
                       <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-white" placeholder="Name" />
                       <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-white" placeholder="Bio" maxLength={40} />
                       <div className="grid grid-cols-6 gap-2">{AVATAR_OPTIONS.map(i => <button key={i} onClick={() => setEditAvatar(i)} className={`p-2 rounded-xl flex justify-center ${editAvatar === i ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}><DynamicIcon name={i} size={20} /></button>)}</div>
                       <button onClick={handleSaveProfile} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl">Save</button>
                   </div>
               </div>
           </div>
       )}

       {/* Badges */}
       <div className="mb-8">
           <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">Achievements</h3>
           <div className="grid grid-cols-5 gap-2">{badges.map(b => <div key={b.id} className="flex flex-col items-center text-center"><BadgeIcon icon={b.icon} unlocked={b.unlocked} /><span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{b.label}</span></div>)}</div>
       </div>

       {/* Completed Journeys / Certificates */}
       {(() => {
         const completedJourneys = Object.entries(userState.progress)
           .filter(([_, prog]: [string, any]) => prog.completedDays.length >= 21)
           .map(([moduleId, prog]) => {
             const module = MODULES.find(m => m.id === moduleId);
             return { moduleId, progress: prog, module };
           })
           .filter(j => j.module);
         
         if (completedJourneys.length === 0) return null;
         
         return (
           <div className="mb-8">
             <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">
               {lang === 'en' ? 'Certificates' : 'प्रमाणपत्र'}
             </h3>
             <div className="space-y-3">
               {completedJourneys.map(({ moduleId, progress, module }) => (
                 <button
                   key={moduleId}
                   onClick={() => { triggerHaptic('medium'); setShowCertificate(moduleId); }}
                   className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 hover:from-amber-500/20 hover:to-orange-500/20 transition-all group"
                 >
                   <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                     <Icons.Award size={28} className="text-white" />
                   </div>
                   <div className="flex-1 text-left">
                     <p className="font-bold text-slate-900 dark:text-white">{module?.title[lang]}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400">
                       {lang === 'en' ? '21-Day Journey Completed' : '21-दिन की यात्रा पूर्ण'}
                     </p>
                   </div>
                   <div className="flex items-center gap-2 text-orange-500">
                     <span className="text-xs font-bold uppercase">{lang === 'en' ? 'View' : 'देखें'}</span>
                     <ArrowRight size={16} />
                   </div>
                 </button>
               ))}
             </div>
           </div>
         );
       })()}

       {/* Quick Actions */}
       <div className="grid grid-cols-2 gap-3 mb-8">
          <button 
            onClick={() => setShowShareModal(true)}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors text-center"
          >
            <Share2 size={24} className="mx-auto mb-2 text-orange-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Share Progress' : 'प्रगति साझा करें'}
            </span>
          </button>
          <Link 
            to="/settings"
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-center"
          >
            <Settings size={24} className="mx-auto mb-2 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Settings' : 'सेटिंग्स'}
            </span>
          </Link>
       </div>

       {/* Install App - Simplified */}
       {!isStandalone && (
           <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 mb-8 flex items-center justify-between">
               <div className="flex items-center gap-3">
                   <Smartphone size={20} className="text-slate-500" />
                   <span className="text-sm text-slate-600 dark:text-slate-400">
                       {lang === 'en' ? 'Install for offline use' : 'ऑफ़लाइन के लिए इंस्टॉल करें'}
                   </span>
               </div>
               {installPrompt ? (
                   <button onClick={handleInstallClick} className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg">
                       {lang === 'en' ? 'Install' : 'इंस्टॉल'}
                   </button>
               ) : (
                   <button onClick={() => setShowInstallInstructions(true)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg">
                       {lang === 'en' ? 'How to' : 'कैसे करें'}
                   </button>
               )}
           </div>
       )}

      {/* Delete Goal Confirmation Modal */}
      {showDeleteGoalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {lang === 'en' ? 'Delete Goal?' : 'लक्ष्य हटाएं?'}
              </h3>
            </div>
            <p className="text-slate-300 mb-6">
              {lang === 'en' ? 'This goal will be permanently deleted.' : 'यह लक्ष्य स्थायी रूप से हटा दिया जाएगा।'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteGoalModal(null)} className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">
                {lang === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>
              <button onClick={confirmDeleteGoal} className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
                {lang === 'en' ? 'Delete' : 'हटाएं'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset All Confirmation Modal */}
      {showResetAllModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {lang === 'en' ? 'Reset All Progress?' : 'सभी प्रगति रीसेट करें?'}
              </h3>
            </div>
            <p className="text-slate-300 mb-6">
              {lang === 'en' 
                ? 'This will permanently delete all your journeys, journals, and progress. This action cannot be undone.'
                : 'यह आपकी सभी यात्राओं, पत्रिकाओं और प्रगति को स्थायी रूप से हटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती।'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetAllModal(false)} className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">
                {lang === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>
              <button onClick={() => { setShowResetAllModal(false); onReset(); }} className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
                {lang === 'en' ? 'Reset All' : 'सब रीसेट करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Instructions Modal */}
      {showInstallInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Download size={24} className="text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {lang === 'en' ? 'How to Install' : 'इंस्टॉल कैसे करें'}
              </h3>
            </div>
            <div className="text-slate-300 mb-6 space-y-3">
              <p className="font-medium">{lang === 'en' ? 'Follow these steps:' : 'इन चरणों का पालन करें:'}</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>{lang === 'en' ? 'Click the menu icon (⋮) in your browser' : 'ब्राउज़र में मेनू आइकन (⋮) पर क्लिक करें'}</li>
                <li>{lang === 'en' ? 'Look for "Install App" or "Add to Home Screen"' : '"ऐप इंस्टॉल करें" या "होम स्क्रीन पर जोड़ें" देखें'}</li>
                <li>{lang === 'en' ? 'Tap Install to add the app' : 'ऐप जोड़ने के लिए इंस्टॉल पर टैप करें'}</li>
              </ol>
            </div>
            <button 
              onClick={() => setShowInstallInstructions(false)}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors"
            >
              {lang === 'en' ? 'Got it' : 'समझ गया'}
            </button>
          </div>
        </div>
      )}

      {/* Share Progress Modal */}
      {showShareModal && (() => {
        const journeysStarted = Object.keys(userState.progress).length;
        const journeysCompleted = Object.values(userState.progress).filter((p: any) => p.completedDays.length >= 21).length;
        const totalTimeFormatted = formatTimeSpent(userState.timeSpent?.total || 0);
        const unlockedBadges = badges.filter(b => b.unlocked);
        
        return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-1 max-w-md w-full shadow-2xl">
            <div className="bg-slate-900 rounded-[22px] overflow-hidden">
              {/* Share Card Preview */}
              <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                <div className="absolute top-1/2 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10"></div>
                
                <div className="relative z-10">
                  {/* Header with Avatar & Name */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <DynamicIcon name={userState.avatar || 'User'} size={32} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-black">{userState.name || 'Friend'}</h3>
                      <div className="flex items-center gap-2">
                        <levelInfo.icon size={14} className="text-orange-200" />
                        <span className="text-orange-100 text-sm font-medium">Level {levelInfo.level} • {levelInfo.title}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* XP Progress Bar */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/10">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold">{stats.xp} XP</span>
                      <span className="text-orange-200">{levelInfo.max} XP to next level</span>
                    </div>
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, nextLevelProgressPercent)}%` }}></div>
                    </div>
                  </div>
                  
                  {/* Main Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                      <Flame size={18} className="mx-auto mb-1 text-orange-200" />
                      <div className="text-xl font-black">{stats.currentStreak}</div>
                      <div className="text-[9px] uppercase tracking-wider text-orange-200">Streak</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                      <Trophy size={18} className="mx-auto mb-1 text-yellow-300" />
                      <div className="text-xl font-black">{stats.completedDaysCount}</div>
                      <div className="text-[9px] uppercase tracking-wider text-orange-200">Days</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                      <BookOpen size={18} className="mx-auto mb-1 text-blue-300" />
                      <div className="text-xl font-black">{stats.totalEntries}</div>
                      <div className="text-[9px] uppercase tracking-wider text-orange-200">Journals</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                      <Clock size={18} className="mx-auto mb-1 text-emerald-300" />
                      <div className="text-xl font-black">{totalTimeFormatted}</div>
                      <div className="text-[9px] uppercase tracking-wider text-orange-200">Time</div>
                    </div>
                  </div>

                  {/* Journeys Progress */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-orange-200" />
                        <span className="text-sm font-medium">Journeys</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black">{journeysStarted}</span>
                        <span className="text-orange-200 text-sm"> started</span>
                        {journeysCompleted > 0 && (
                          <span className="ml-2 text-emerald-300 text-sm">• {journeysCompleted} completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Badges Row */}
                  {unlockedBadges.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] uppercase tracking-wider text-orange-200 font-bold">Badges:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {unlockedBadges.map(badge => (
                          <div key={badge.id} className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10">
                            <badge.icon size={12} />
                            <span className="text-[10px] font-medium">{badge.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <img src="/logo.svg" alt="Lapaas" className="w-5 h-5 rounded" />
                      <span className="text-xs font-bold">LAPAAS MINDSET</span>
                    </div>
                    <span className="text-[10px] text-orange-200">21-Day Journey</span>
                  </div>
                </div>
              </div>
              
              {/* Share Actions */}
              <div className="p-4 space-y-2">
                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center"
                  >
                    <Share2 size={18} className="mr-2" />
                    {lang === 'en' ? 'Share' : 'साझा करें'}
                  </button>
                )}
                <button
                  onClick={() => { handleCopy(); triggerHaptic('medium'); }}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                >
                  <Icons.Copy size={18} className="mr-2" />
                  {lang === 'en' ? 'Copy to Clipboard' : 'क्लिपबोर्ड पर कॉपी करें'}
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full py-2 text-slate-500 rounded-xl font-medium transition-colors text-sm"
                >
                  {lang === 'en' ? 'Close' : 'बंद करें'}
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Calendar Detail Modal */}
      {showCalendarDetail && selectedDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <CalendarIcon size={24} className="text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'hi-IN', { weekday: 'long' })}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCalendarDetail(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            {(() => {
              const activities = getSelectedDateActivities();
              if (activities.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon size={32} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      {lang === 'en' ? 'No activity on this day' : 'इस दिन कोई गतिविधि नहीं'}
                    </p>
                  </div>
                );
              }
              
              return (
                <div className="space-y-3">
                  {activities.map((activity, i) => (
                    <Link 
                      key={i}
                      to={`/module/${activity.moduleId}/day/${activity.dayNumber}`}
                      className="block p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setShowCalendarDetail(false)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <BookOpen size={18} className="text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{activity.moduleName}</p>
                          <p className="text-xs text-slate-500 mb-2">Day {activity.dayNumber}</p>
                          {activity.text && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                              "{activity.text.substring(0, 100)}{activity.text.length > 100 ? '...' : ''}"
                            </p>
                          )}
                        </div>
                        <ArrowRight size={16} className="text-slate-400 flex-shrink-0 mt-3" />
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && userState.progress[showCertificate] && (
        <Certificate
          moduleId={showCertificate}
          progress={userState.progress[showCertificate]}
          userName={userState.name || 'Champion'}
          lang={lang}
          onClose={() => setShowCertificate(null)}
          onShare={() => {
            const module = MODULES.find(m => m.id === showCertificate);
            if (navigator.share && module) {
              navigator.share({
                title: `${module.title[lang]} - Certificate`,
                text: lang === 'en' 
                  ? `I completed the 21-Day ${module.title.en} Journey on Lapaas Mindset! 🏆`
                  : `मैंने Lapaas Mindset पर 21-दिन की ${module.title.hi} यात्रा पूरी की! 🏆`,
                url: window.location.origin
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default Profile;