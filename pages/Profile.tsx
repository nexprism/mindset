import React, { useState, useEffect } from 'react';
import { UserState, ModuleProgress, JournalEntry, Theme, ReminderSettings } from '../types';
import { UI_LABELS, MODULES } from '../constants';
import * as Icons from 'lucide-react';
import { 
  Languages, Trash2, Trophy, Flame, Calendar as CalendarIcon, Settings, User, ChevronLeft, ChevronRight, Share2, Moon, Bell, X, BookOpen, CheckSquare, ArrowRight, Edit3, Medal, Star, Footprints, Crown, Plus, Check, LogOut, Cloud, Loader2,
  Target, Smile, Zap, Heart, Anchor, Feather, Code, Music, Coffee, CloudLightning, PenTool, Info, Download, Smartphone, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationManager from '../components/NotificationManager';
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
  const handleCopy = () => { navigator.clipboard.writeText(`${shareText}\n${shareUrl}`); setShowShareModal(false); };
  
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
      if(confirm('Delete this goal?')) {
        deleteDailyGoal(id);
        if(onUpdate) onUpdate();
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

       {/* -------------------------------------------------- */}
       {/* APP INSTALLATION SECTION (NEW) */}
       {/* -------------------------------------------------- */}
       {!isStandalone && (
           <div className="mb-8">
               <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">
                   {lang === 'en' ? 'Get the App' : 'ऐप इंस्टॉल करें'}
               </h3>
               <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Smartphone size={120} /></div>
                   
                   <div className="relative z-10">
                       <h4 className="font-bold text-lg mb-2">{lang === 'en' ? 'Install for Offline Use' : 'ऑफ़लाइन उपयोग के लिए इंस्टॉल करें'}</h4>
                       <p className="text-slate-300 text-sm mb-6 max-w-xs">
                           {lang === 'en' 
                            ? 'Get the full fullscreen experience and access your journal without internet.' 
                            : 'फुलस्क्रीन अनुभव प्राप्त करें और इंटरनेट के बिना अपनी डायरी एक्सेस करें।'}
                       </p>
                       
                       {installPrompt ? (
                           <button 
                               onClick={handleInstallClick}
                               className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-bold text-sm shadow-lg"
                           >
                               <Download size={18} />
                               <span>{lang === 'en' ? 'Install App' : 'ऐप इंस्टॉल करें'}</span>
                           </button>
                       ) : isIOS ? (
                           <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                               <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">iOS Instructions</p>
                               <ol className="text-sm space-y-2 list-decimal list-inside text-slate-200">
                                   <li>Tap the <span className="font-bold">Share</span> button below.</li>
                                   <li>Scroll down and tap <span className="font-bold">Add to Home Screen</span>.</li>
                               </ol>
                           </div>
                       ) : (
                           <div className="text-xs text-slate-400 italic border-t border-white/10 pt-4">
                               {lang === 'en' 
                                ? 'To install, look for "Add to Home Screen" in your browser menu.' 
                                : 'इंस्टॉल करने के लिए, अपने ब्राउज़र मेनू में "होम स्क्रीन पर जोड़ें" देखें।'}
                           </div>
                       )}
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

       {/* Time Spent Section */}
       <div className="mb-8">
           <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">
               {lang === 'en' ? 'Time Invested' : 'समय निवेश'}
           </h3>
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
               <div className="grid grid-cols-2 gap-4">
                   <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                       <BookOpen className="mx-auto text-blue-500 mb-2" size={24} />
                       <div className="text-2xl font-black text-slate-800 dark:text-white">
                           {formatTimeSpent(userState.timeSpent?.reading || 0)}
                       </div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                           {lang === 'en' ? 'Reading' : 'पढ़ना'}
                       </div>
                   </div>
                   <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                       <Clock className="mx-auto text-emerald-500 mb-2" size={24} />
                       <div className="text-2xl font-black text-slate-800 dark:text-white">
                           {formatTimeSpent(userState.timeSpent?.total || 0)}
                       </div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                           {lang === 'en' ? 'Total Time' : 'कुल समय'}
                       </div>
                   </div>
               </div>
           </div>
       </div>

       {/* DAILY GOALS */}
       <div className="mb-8 animate-fade-in">
           <div className="flex items-center justify-between mb-4 px-2">
               <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{lang === 'en' ? 'Daily Targets' : 'दैनिक लक्ष्य'}</h3>
           </div>
           
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
               {userState.dailyGoals && userState.dailyGoals.length > 0 ? (
                   <div className="divide-y divide-slate-100 dark:divide-slate-800">
                       {userState.dailyGoals.map(goal => {
                           const streak = calculateGoalStreak(goal.history);
                           const isCompletedToday = goal.history.includes(new Date().toLocaleDateString('en-CA'));
                           return (
                               <div key={goal.id} className="p-4 flex items-center justify-between group">
                                   <div className="flex items-center flex-1 mr-4">
                                       <button 
                                           onClick={() => handleToggleGoal(goal.id)}
                                           className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mr-3 flex-shrink-0 ${isCompletedToday ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-green-400'}`}
                                       >
                                           <Check size={14} strokeWidth={3} />
                                       </button>
                                       <span className={`text-sm font-medium transition-all ${isCompletedToday ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>{goal.text}</span>
                                   </div>
                                   <div className="flex items-center space-x-3">
                                       {streak > 0 && <div className="flex items-center space-x-1 text-orange-500"><Flame size={14} fill="currentColor" /><span className="text-xs font-bold">{streak}</span></div>}
                                       <button onClick={() => handleDeleteGoal(goal.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               ) : (
                   <div className="p-6 text-center text-slate-400 text-sm italic">No daily targets yet.</div>
               )}
               <form onSubmit={handleAddGoal} className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                   <div className="flex items-center">
                       <input 
                           type="text" 
                           value={newGoalText}
                           onChange={(e) => setNewGoalText(e.target.value)}
                           placeholder="Add a new daily target..."
                           className="flex-1 bg-transparent border-none outline-none text-sm p-3 text-slate-800 dark:text-white placeholder-slate-400"
                       />
                       <button type="submit" disabled={!newGoalText.trim()} className={`p-2 rounded-xl transition-all ${newGoalText.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}><Plus size={20} /></button>
                   </div>
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

       {renderCalendar()}

       {/* Notification Manager */}
       <div className="mb-6">
         <NotificationManager 
           reminder={userState.reminder} 
           onSetReminder={onSetReminder} 
           lang={lang} 
         />
       </div>

       {/* Settings */}
       <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between" onClick={onToggleLang}>
             <span className="font-medium dark:text-white">Language</span><span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">{lang === 'en' ? 'English' : 'हिन्दी'}</span>
          </div>
          <div className="px-6 py-4 flex justify-between border-b border-slate-100 dark:border-slate-800">
             <span className="font-medium dark:text-white">Theme</span>
             <div className="flex gap-2">{(['light', 'dark', 'system'] as Theme[]).map(t => <button key={t} onClick={() => onSetTheme(t)} className={`px-2 py-1 rounded text-xs font-bold border ${userState.theme === t ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>{UI_LABELS[t][lang]}</button>)}</div>
          </div>
       </div>

       <div className="text-center pb-8"><button onClick={() => confirm("Reset all?") && onReset()} className="text-xs font-bold text-red-400 flex items-center justify-center mx-auto"><Trash2 size={12} className="mr-1.5" /> Reset Progress</button></div>
    </div>
  );
};

export default Profile;