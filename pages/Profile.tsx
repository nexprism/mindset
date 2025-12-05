import React, { useState } from 'react';
import { UserState, ModuleProgress, JournalEntry, Theme, ReminderSettings } from '../types';
import { UI_LABELS, MODULES } from '../constants';
import * as Icons from 'lucide-react';
import { Languages, Trash2, Trophy, Flame, Calendar as CalendarIcon, Settings, User, ChevronLeft, ChevronRight, Share2, Moon, Bell, X, BookOpen, CheckSquare, ArrowRight, Edit3, Medal, Star, Target, Zap, Footprints, Crown, PenTool, Camera, Smile, Heart, Anchor, Feather, Code, Music, Coffee, CloudLightning, TrendingUp, Hash, Circle, CheckCircle, MessageCircle, Twitter, Linkedin, Facebook, Link as LinkIcon, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { setUserName, updateUserProfile, saveStorageData, getStorageData } from '../services/storage';

interface ProfileProps {
  userState: UserState;
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

    // XP Calculation
    let xp = 0;

    Object.keys(userState.progress).forEach((moduleId) => {
      const prog = userState.progress[moduleId];
      // XP for Completed Days
      const days = prog.completedDays.length;
      completedDaysCount += days;
      xp += days * XP_PER_DAY;

      prog.completedDays.forEach(dayNum => {
         // Approximate timestamp for completion if not explicitly tracked per day (using lastAccessed or journal)
         // For sorting, we'll try to find journal timestamp, else use startedAt/lastAccessed
         let ts = prog.journal[dayNum]?.timestamp || prog.lastAccessedAt;
         completedMilestones.push({ moduleId, dayNumber: dayNum, timestamp: ts });
      });

      if (prog.journal) {
        // XP for Journaling
        const entries = Object.keys(prog.journal).length;
        totalEntries += entries;
        xp += entries * XP_PER_JOURNAL;
        
        Object.values(prog.journal).forEach((e: JournalEntry) => {
            allTimestamps.push(e.timestamp);
            // Find day num
            const dNum = parseInt(Object.keys(prog.journal).find(key => prog.journal[parseInt(key)] === e) || '0');
            allJournalEntries.push({ moduleId, dayNumber: dNum, text: e.text, timestamp: e.timestamp });
        });
      }
    });

    // Streak Logic
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (allTimestamps.length > 0) {
        // Sort timestamps and get unique days
        const uniqueDays = Array.from(new Set(allTimestamps.map(ts => {
            const d = new Date(ts);
            d.setHours(0,0,0,0);
            return d.getTime();
        }))).sort((a, b) => a - b);

        // Calculate Longest Streak
        let tempStreak = 1;
        if (uniqueDays.length > 0) longestStreak = 1;

        for (let i = 1; i < uniqueDays.length; i++) {
            const prev = uniqueDays[i-1];
            const curr = uniqueDays[i];
            const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
                tempStreak++;
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
             while (uniqueDays.includes(checkTime)) {
                 currentStreak++;
                 const d = new Date(checkTime);
                 d.setDate(d.getDate() - 1);
                 checkTime = d.getTime();
             }
        }
    }

    // XP for Streak (Bonus)
    xp += currentStreak * XP_PER_STREAK_DAY;

    // Sort lists
    completedMilestones.sort((a,b) => b.timestamp - a.timestamp);
    allJournalEntries.sort((a,b) => b.timestamp - a.timestamp);

    return { 
        totalEntries, 
        completedDaysCount, 
        currentStreak, 
        longestStreak, 
        xp, 
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

// Helper for Icon rendering - Hardened against missing icons/namespace issues
const DynamicIcon = ({ name, size, className }: { name: string, size: number, className?: string }) => {
    // Try to get from namespace
    let IconComponent = Icons && (Icons as any)[name];

    // If undefined or not a valid component, fallback to named imports map (for common ones) or User
    if (!IconComponent) {
        const fallbackMap: Record<string, any> = {
            User, Smile, Star, Zap, Heart, Crown, 
            Anchor, Feather, Code, Music, Coffee, CloudLightning, Circle
        };
        IconComponent = fallbackMap[name] || User;
    }

    return <IconComponent size={size} className={className} />;
};

// Badge Icon Helper
const BadgeIcon: React.FC<{ icon: any, unlocked: boolean }> = ({ icon: Icon, unlocked }) => (
    <div className={`p-3 rounded-full mb-2 ${unlocked ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 ring-2 ring-orange-200 dark:ring-orange-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
        <Icon size={24} />
    </div>
);

const Profile: React.FC<ProfileProps> = ({ userState, onToggleLang, onReset, onSetTheme, onSetReminder, onUpdate }) => {
  const lang = userState.language;
  const stats = calculateStats(userState);
  const levelInfo = getLevelInfo(stats.xp);
  const nextLevelProgressPercent = ((stats.xp - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100;
  
  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Activity Modal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<any[]>([]);

  // Detailed Stats Modal State
  const [activeStatModal, setActiveStatModal] = useState<'streak' | 'levels' | 'entries' | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userState.name || '');
  const [editBio, setEditBio] = useState(userState.bio || '');
  const [editAvatar, setEditAvatar] = useState(userState.avatar || 'User');
  
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);

  // Badges Data
  const badges = [
      { id: 'first_step', icon: Footprints, label: 'First Step', desc: 'Complete 1 Day', unlocked: stats.completedDaysCount >= 1 },
      { id: 'streak_3', icon: Flame, label: 'Spark', desc: '3 Day Streak', unlocked: stats.currentStreak >= 3 },
      { id: 'streak_7', icon: Zap, label: 'On Fire', desc: '7 Day Streak', unlocked: stats.currentStreak >= 7 },
      { id: 'writer', icon: PenTool, label: 'Reflective', desc: '10 Journal Entries', unlocked: stats.totalEntries >= 10 },
      { id: 'champion', icon: Trophy, label: 'Champion', desc: 'Finish a Journey', unlocked: Object.values(userState.progress).some((p: any) => p.completedDays.length >= 21) },
  ];

  const shareText = lang === 'en'
      ? `I'm a Level ${levelInfo.level} ${levelInfo.title} on Lapaas Mindset! 🔥\n${stats.xp} XP earned so far.\n${stats.currentStreak} day streak.`
      : `लपास माइंडसेट पर मैं लेवल ${levelInfo.level} ${levelInfo.title} हूँ! 🔥\n${stats.xp} XP अब तक अर्जित किए।`;
  
  const shareUrl = window.location.origin;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lapaas Mindset Progress',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
       handleCopy();
    }
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert(UI_LABELS.copied[lang]);
      setShowShareModal(false);
  };

  const openSocial = (platform: string) => {
      const text = encodeURIComponent(shareText);
      const url = encodeURIComponent(shareUrl);
      let link = '';

      switch(platform) {
          case 'whatsapp':
              link = `https://api.whatsapp.com/send?text=${text}%20${url}`;
              break;
          case 'twitter':
              link = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
              break;
          case 'linkedin':
              link = `https://www.linkedin.com/feed/?shareActive=true&text=${text}%20${url}`;
              break;
          case 'facebook':
              link = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
              break;
      }
      
      if(link) window.open(link, '_blank');
      setShowShareModal(false);
  };

  const handleSaveProfile = () => {
      const trimmedName = editName.trim();
      // Use existing name or 'Friend' if empty
      const updatedName = trimmedName.length > 0 ? trimmedName : (userState.name || 'Friend');

      updateUserProfile({ 
          name: updatedName, 
          bio: editBio.trim(), 
          avatar: editAvatar 
      });
      
      setIsEditingProfile(false);

      if (onUpdate) {
          onUpdate();
      } else {
          window.location.reload(); 
      }
  };
  
  // JSON Export / Import Handlers
  const handleExportData = () => {
    const dataStr = JSON.stringify(getStorageData(), null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lapaas_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (json && json.progress) {
                    if (confirm("This will overwrite your current progress. Are you sure?")) {
                        saveStorageData(json);
                        window.location.reload();
                    }
                } else {
                    alert("Invalid backup file.");
                }
            } catch (err) {
                alert("Error parsing file.");
            }
        };
        reader.readAsText(file);
    };
    input.click();
  };

  const handleReminderToggle = async () => {
      const newEnabled = !userState.reminder.enabled;
      
      if (newEnabled) {
          if (!("Notification" in window)) {
              alert("This browser does not support desktop notifications.");
              return;
          }
          if (Notification.permission === "granted") {
          } else if (Notification.permission === "denied") {
               alert(UI_LABELS.permissionDenied[lang]);
               return;
          } else {
               try {
                   const permission = await Notification.requestPermission();
                   if (permission !== "granted") return;
               } catch (error) {
                   console.error("Notification permission error:", error);
                   return;
               }
          }
      }
      onSetReminder({ ...userState.reminder, enabled: newEnabled });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onSetReminder({ ...userState.reminder, time: e.target.value });
  };

  const getActivitiesForDate = (date: Date) => {
    const activities: any[] = [];
    const checkDateStr = date.toDateString();

    Object.keys(userState.progress).forEach(moduleId => {
        const prog = userState.progress[moduleId];
        const module = MODULES.find(m => m.id === moduleId);
        if (prog.journal) {
            Object.keys(prog.journal).forEach(dayNumStr => {
                const entry = prog.journal[parseInt(dayNumStr)];
                const entryDate = new Date(entry.timestamp);
                if (entryDate.toDateString() === checkDateStr) {
                    const dayContent = module?.days.find(d => d.dayNumber === parseInt(dayNumStr));
                    activities.push({
                        moduleId,
                        moduleTitle: module?.title[lang],
                        iconName: module?.iconName,
                        dayNumber: dayNumStr,
                        dayTitle: dayContent?.title[lang],
                        journal: entry.text,
                        task: entry.taskResponse
                    });
                }
            });
        }
    });
    return activities;
  };

  const handleDateClick = (year: number, month: number, day: number) => {
      const date = new Date(year, month, day);
      const activities = getActivitiesForDate(date);
      setSelectedDate(date);
      setSelectedActivities(activities);
  };

  const renderCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Status: 'full' (Journal + Task), 'partial' (One of them), 'none'
    const dayStats = new Map<number, { status: 'full' | 'partial' | 'none', count: number }>();
    
    Object.values(userState.progress).forEach((prog: ModuleProgress) => {
      if (prog.journal) {
        Object.values(prog.journal).forEach((entry: JournalEntry) => {
          const d = new Date(entry.timestamp);
          if (d.getFullYear() === year && d.getMonth() === month) {
             const day = d.getDate();
             const current = dayStats.get(day) || { status: 'none', count: 0 };
             
             const hasJournal = entry.text && entry.text.length > 5;
             const hasTask = entry.taskResponse && entry.taskResponse.length > 0;
             
             let newStatus: 'full' | 'partial' | 'none' = 'none';
             if (hasJournal && hasTask) newStatus = 'full';
             else if (hasJournal || hasTask) newStatus = 'partial';
             
             // Upgrade status if we find a better entry for this day (e.g. from another module)
             let finalStatus = current.status;
             if (newStatus === 'full') finalStatus = 'full';
             else if (newStatus === 'partial' && current.status !== 'full') finalStatus = 'partial';

             dayStats.set(day, { status: finalStatus, count: current.count + 1 });
          }
        });
      }
    });

    const days = [];
    const weekDays = lang === 'en' ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'];
    const headers = weekDays.map((d, i) => (
        <div key={`head-${i}`} className="h-8 w-8 flex items-center justify-center text-xs font-bold text-slate-300 dark:text-slate-600">{d}</div>
    ));
    for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`blank-${i}`} className="h-8 w-8" />);
    for (let d = 1; d <= daysInMonth; d++) {
        const stats = dayStats.get(d);
        const hasActivity = !!stats && stats.status !== 'none';
        const isFull = stats?.status === 'full';
        const isPartial = stats?.status === 'partial';
        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
        
        days.push(
            <div key={`day-${d}`} className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 relative">
                <button 
                    onClick={() => handleDateClick(year, month, d)}
                    className={`h-8 w-8 md:h-9 md:w-9 rounded-full flex flex-col items-center justify-center text-xs transition-all relative
                    ${hasActivity
                        ? isFull 
                            ? 'bg-emerald-500 text-white font-bold shadow-sm hover:bg-emerald-600' // Full Mastery
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-800' // Progress
                        : isToday 
                            ? 'bg-transparent text-slate-900 dark:text-white font-black'
                            : 'text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                    ${isToday ? 'ring-2 ring-indigo-500 z-10' : ''}
                    `}
                >
                    <span className={hasActivity ? 'mb-0' : ''}>{d}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-slate-700 dark:text-slate-200">{UI_LABELS.activityCalendar[lang]}</h3>
                 <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-1">
                     <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-all text-slate-500 dark:text-slate-400 hover:text-orange-600"><ChevronLeft size={14} /></button>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[80px] text-center capitalize">{calendarDate.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', year: 'numeric' })}</span>
                     <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-all text-slate-500 dark:text-slate-400 hover:text-orange-600"><ChevronRight size={14} /></button>
                 </div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-3 justify-items-center mb-6">{headers}{days}</div>

            {/* Calendar Legend */}
            <div className="flex items-center justify-center space-x-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Complete</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-200 dark:bg-orange-900/50 border border-orange-300 dark:border-orange-800 mr-2"></div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Partial</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full border-2 border-indigo-500 mr-2"></div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Today</span>
                </div>
            </div>
        </div>
    );
  };

  const renderStatsModalContent = () => {
    if (activeStatModal === 'streak') {
        return (
            <div className="space-y-4 text-center animate-fade-in">
                <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto text-orange-600 dark:text-orange-500">
                    <Flame size={48} />
                </div>
                <div>
                    <h4 className="text-3xl font-black text-slate-800 dark:text-white">{stats.currentStreak} Days</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{UI_LABELS.streak[lang]}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                     <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                         <span className="block text-xs font-bold text-slate-400 uppercase">Longest Streak</span>
                         <span className="text-xl font-bold text-slate-800 dark:text-white">{stats.longestStreak} Days</span>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                         <span className="block text-xs font-bold text-slate-400 uppercase">Total Days Active</span>
                         <span className="text-xl font-bold text-slate-800 dark:text-white">{stats.completedDaysCount} Days</span>
                     </div>
                </div>
            </div>
        );
    }
    
    if (activeStatModal === 'levels') {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center space-x-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-500">
                        <levelInfo.icon size={32} />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">Level {levelInfo.level}: {levelInfo.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stats.xp} / {levelInfo.max} XP</p>
                    </div>
                </div>
                
                <div>
                    <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Recent Milestones</h5>
                    <div className="space-y-3">
                         {stats.completedMilestones.slice(0, 5).map((milestone, i) => {
                             const mod = MODULES.find(m => m.id === milestone.moduleId);
                             const day = mod?.days.find(d => d.dayNumber === milestone.dayNumber);
                             return (
                                 <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                     <div>
                                         <span className="block text-xs font-bold text-slate-400 uppercase">{mod?.title[lang]}</span>
                                         <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{UI_LABELS.day[lang]} {milestone.dayNumber}: {day?.title[lang]}</span>
                                     </div>
                                     <span className="text-xs font-mono text-slate-400">{new Date(milestone.timestamp).toLocaleDateString()}</span>
                                 </div>
                             );
                         })}
                         {stats.completedMilestones.length === 0 && <p className="text-sm text-slate-400 italic">No milestones yet.</p>}
                    </div>
                </div>
            </div>
        );
    }
    
    if (activeStatModal === 'entries') {
        return (
            <div className="space-y-4 animate-fade-in">
                 <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-center">
                     <span className="block text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{stats.totalEntries}</span>
                     <span className="text-sm font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-wide">Total Journal Entries</span>
                 </div>
                 
                 <div>
                     <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Recent Thoughts</h5>
                     <div className="space-y-3">
                         {stats.allJournalEntries.slice(0, 5).map((entry, i) => {
                             const mod = MODULES.find(m => m.id === entry.moduleId);
                             return (
                                 <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                     <div className="flex justify-between items-center mb-2">
                                         <span className="text-[10px] font-bold bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">{mod?.title[lang]}</span>
                                         <span className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</span>
                                     </div>
                                     <p className="text-sm text-slate-600 dark:text-slate-300 italic line-clamp-2">"{entry.text}"</p>
                                 </div>
                             );
                         })}
                          {stats.allJournalEntries.length === 0 && <p className="text-sm text-slate-400 italic">No journal entries yet.</p>}
                     </div>
                 </div>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 px-4 pt-6 transition-colors duration-300">
       
       {/* -------------------------------------------------- */}
       {/* EXPANDED PROFILE HEADER (IDENTITY CARD) */}
       {/* -------------------------------------------------- */}
       <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 mb-6 relative overflow-hidden animate-fade-in">
           {/* ... existing header code ... */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
           
           <div className="p-6 relative z-10">
               <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                  
                  {/* Avatar */}
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

                  {/* Info */}
                  <div className="flex-1 w-full">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start">
                                  {userState.name || 'Friend'}
                                  {userState.joinedAt && (
                                     <span className="hidden md:inline-block ml-3 text-[10px] font-normal text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                        Joined {new Date(userState.joinedAt).getFullYear()}
                                     </span>
                                  )}
                              </h1>
                              
                              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 italic min-h-[1.25rem]">
                                {userState.bio ? `"${userState.bio}"` : (lang === 'en' ? "Ready to grow 🌱" : "बढ़ने के लिए तैयार 🌱")}
                              </p>
                          </div>
                          
                          <button onClick={() => setShowShareModal(true)} className="hidden md:flex p-2 text-slate-400 hover:text-orange-600 transition-colors">
                              <Share2 size={20} />
                          </button>
                      </div>

                      {/* Level & XP Bar */}
                      <div className="mt-6 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
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
                              <div 
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${Math.min(100, nextLevelProgressPercent)}%` }}
                              ></div>
                          </div>
                          
                          <div className="mt-2 text-[10px] text-slate-400 text-right">
                              Next: Level {levelInfo.level + 1}
                          </div>
                      </div>
                  </div>
               </div>
               
               {/* Mobile Only Share Button (Bottom Right of card) */}
               <button onClick={() => setShowShareModal(true)} className="md:hidden absolute top-4 right-4 p-2 text-slate-300 hover:text-orange-600 transition-colors">
                   <Share2 size={18} />
               </button>
           </div>
       </div>
       
       {/* Share Modal */}
       {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowShareModal(false)}>
           <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-800">Share Progress</h3>
                   <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">
                       <X size={24} />
                   </button>
               </div>
               
               <div className="grid grid-cols-4 gap-4 mb-6">
                   <button onClick={() => openSocial('whatsapp')} className="flex flex-col items-center space-y-2 group">
                       <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                           <MessageCircle size={24} />
                       </div>
                       <span className="text-xs font-medium text-slate-600">WhatsApp</span>
                   </button>
                   <button onClick={() => openSocial('twitter')} className="flex flex-col items-center space-y-2 group">
                       <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-colors">
                           <Twitter size={24} />
                       </div>
                       <span className="text-xs font-medium text-slate-600">X / Twitter</span>
                   </button>
                   <button onClick={() => openSocial('linkedin')} className="flex flex-col items-center space-y-2 group">
                       <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                           <Linkedin size={24} />
                       </div>
                       <span className="text-xs font-medium text-slate-600">LinkedIn</span>
                   </button>
                   <button onClick={() => openSocial('facebook')} className="flex flex-col items-center space-y-2 group">
                       <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                           <Facebook size={24} />
                       </div>
                       <span className="text-xs font-medium text-slate-600">Facebook</span>
                   </button>
               </div>

               <div className="flex flex-col space-y-3">
                   <button onClick={handleCopy} className="flex items-center justify-center w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors">
                       <LinkIcon size={18} className="mr-2" />
                       Copy Link
                   </button>
                   {navigator.share && (
                       <button onClick={handleNativeShare} className="flex items-center justify-center w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-600 transition-colors">
                           <MoreHorizontal size={18} className="mr-2" />
                           More Options
                       </button>
                   )}
               </div>
           </div>
        </div>
       )}

       {/* -------------------------------------------------- */}
       {/* CLICKABLE QUICK STATS GRID */}
       {/* -------------------------------------------------- */}
       <div className="grid grid-cols-3 gap-3 mb-8">
          <button 
            onClick={() => setActiveStatModal('streak')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:scale-105 transition-transform active:scale-95 group"
          >
             <Flame className="mx-auto text-orange-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
             <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.currentStreak}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-orange-500 transition-colors">{UI_LABELS.streak[lang]}</div>
          </button>
          <button 
            onClick={() => setActiveStatModal('levels')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:scale-105 transition-transform active:scale-95 group"
          >
             <Trophy className="mx-auto text-yellow-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
             <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.completedDaysCount}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-yellow-500 transition-colors">{UI_LABELS.daysDone[lang]}</div>
          </button>
          <button 
            onClick={() => setActiveStatModal('entries')}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center hover:scale-105 transition-transform active:scale-95 group"
          >
             <CalendarIcon className="mx-auto text-indigo-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
             <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalEntries}</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">{UI_LABELS.entries[lang]}</div>
          </button>
       </div>
       
       {/* ... existing Stats Detail Modal, Edit Profile Modal, Badges, Journey Breakdown, Calendar, Settings, Danger Zone, and Activity Modal ... */}
       {activeStatModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveStatModal(null)}>
               <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                   <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                       <h3 className="font-bold text-slate-800 dark:text-white capitalize flex items-center">
                           {activeStatModal === 'streak' && <Flame size={18} className="mr-2 text-orange-500" />}
                           {activeStatModal === 'levels' && <Trophy size={18} className="mr-2 text-yellow-500" />}
                           {activeStatModal === 'entries' && <CalendarIcon size={18} className="mr-2 text-indigo-500" />}
                           {activeStatModal === 'entries' ? 'Pages' : activeStatModal} Breakdown
                       </h3>
                       <button onClick={() => setActiveStatModal(null)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"><X size={20} /></button>
                   </div>
                   <div className="p-6 overflow-y-auto">
                       {renderStatsModalContent()}
                   </div>
               </div>
           </div>
       )}

       {/* Edit Profile Modal */}
       {isEditingProfile && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditingProfile(false)}>
               <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                   <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                       <h3 className="font-bold text-slate-800 dark:text-white">Edit Profile</h3>
                       <button onClick={() => setIsEditingProfile(false)}><X size={20} className="text-slate-400" /></button>
                   </div>
                   
                   <div className="p-6 space-y-6">
                       {/* Avatar Selection */}
                       <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Choose Avatar</label>
                           <div className="grid grid-cols-6 gap-2">
                               {AVATAR_OPTIONS.map(iconName => (
                                   <button
                                     type="button"
                                     key={iconName}
                                     onClick={() => setEditAvatar(iconName)}
                                     className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                                         editAvatar === iconName 
                                         ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 ring-2 ring-orange-500' 
                                         : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                     }`}
                                   >
                                       <DynamicIcon name={iconName} size={24} />
                                   </button>
                               ))}
                           </div>
                       </div>

                       {/* Name Input */}
                       <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                           <input 
                             type="text" 
                             value={editName}
                             onChange={(e) => setEditName(e.target.value)}
                             className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-orange-500 outline-none text-slate-800 dark:text-white font-bold"
                           />
                       </div>

                       {/* Bio Input */}
                       <div>
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">My Motto / Bio</label>
                           <input 
                             type="text" 
                             value={editBio}
                             onChange={(e) => setEditBio(e.target.value)}
                             maxLength={40}
                             placeholder="e.g. Learning everyday..."
                             className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-orange-500 outline-none text-slate-800 dark:text-white"
                           />
                           <p className="text-[10px] text-slate-400 mt-1 text-right">{editBio.length}/40</p>
                       </div>
                   </div>

                   <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                       <button 
                         type="button"
                         onClick={handleSaveProfile}
                         className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition-colors"
                       >
                           Save Changes
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* Badges Section */}
       <div className="mb-8">
           <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">Achievements</h3>
           <div className="grid grid-cols-5 gap-2">
               {badges.map((badge) => (
                   <div key={badge.id} className="flex flex-col items-center text-center group relative">
                       <BadgeIcon icon={badge.icon} unlocked={badge.unlocked} />
                       <span className={`text-[10px] font-medium leading-tight ${badge.unlocked ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>{badge.label}</span>
                       
                       {/* Tooltip */}
                       <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                           {badge.desc}
                           <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                       </div>
                   </div>
               ))}
           </div>
       </div>

       {/* Active Journeys Progress Breakdown */}
       <div className="mb-8">
           <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">Journey Breakdown</h3>
           <div className="space-y-3">
               {Object.entries(userState.progress).map(([moduleId, prog]) => {
                   const mp = prog as ModuleProgress;
                   const module = MODULES.find(m => m.id === moduleId);
                   if (!module) return null;
                   const percent = Math.round((mp.completedDays.length / 21) * 100);
                   const IconComponent = (Icons && (Icons as any)[module.iconName]) || Circle;
                   
                   return (
                       <div key={moduleId} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                               <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                                   <IconComponent size={18} />
                               </div>
                               <div>
                                   <h4 className="text-sm font-bold text-slate-800 dark:text-white">{module.title[lang]}</h4>
                                   <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                       <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                                   </div>
                               </div>
                           </div>
                           <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{percent}%</span>
                       </div>
                   );
               })}
               {Object.keys(userState.progress).length === 0 && (
                   <p className="text-center text-sm text-slate-400 italic py-4">No active journeys yet.</p>
               )}
           </div>
       </div>

       {/* Calendar Section (Still rendered here for quick access) */}
       {renderCalendar()}

       {/* Settings Section */}
       <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between" onClick={onToggleLang}>
             <div className="flex items-center">
                <Languages size={18} className="text-slate-400 mr-3" />
                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{UI_LABELS.language[lang]}</span>
             </div>
             <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">
                {lang === 'en' ? 'English' : 'हिन्दी'}
             </span>
          </div>

          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                   <Moon size={18} className="text-slate-400 mr-3" />
                   <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{UI_LABELS.theme[lang]}</span>
                </div>
             </div>
             <div className="flex gap-2">
                 {(['light', 'dark', 'system'] as Theme[]).map(theme => (
                     <button
                        key={theme}
                        onClick={() => onSetTheme(theme)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            userState.theme === theme 
                            ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900' 
                            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                     >
                        {UI_LABELS[theme][lang]}
                     </button>
                 ))}
             </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
             <div className="flex items-center">
                <Bell size={18} className="text-slate-400 mr-3" />
                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{UI_LABELS.reminder[lang]}</span>
             </div>
             
             <div className="flex items-center space-x-3">
                 {userState.reminder.enabled && (
                     <input 
                       type="time" 
                       value={userState.reminder.time} 
                       onChange={handleTimeChange}
                       className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-2 py-0.5 text-xs outline-none"
                     />
                 )}
                 <button 
                   onClick={handleReminderToggle}
                   className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${userState.reminder.enabled ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                 >
                   <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${userState.reminder.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                 </button>
             </div>
          </div>

          {/* Backup & Restore */}
          <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                 <Settings size={18} className="text-slate-400 mr-3" />
                 <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Data & Backup</span>
              </div>
              <div className="flex space-x-2">
                  <button onClick={handleExportData} className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg font-bold text-slate-600 dark:text-slate-300 transition-colors">Export</button>
                  <button onClick={handleImportData} className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg font-bold text-slate-600 dark:text-slate-300 transition-colors">Import</button>
              </div>
          </div>
       </div>

       {/* Danger Zone */}
       <div className="text-center pb-8">
          <button 
            onClick={() => {
                if(confirm("Are you sure? This will delete ALL progress.")) {
                    onReset();
                }
            }}
            className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors flex items-center justify-center mx-auto"
          >
             <Trash2 size={12} className="mr-1.5" />
             {UI_LABELS.resetAll[lang]}
          </button>
       </div>

       {/* Activity Modal (Day Click) */}
       {selectedDate && (
         <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4 animate-fade-in" onClick={() => setSelectedDate(null)}>
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity History</span>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            {selectedDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                        </h3>
                    </div>
                    <button 
                        onClick={() => setSelectedDate(null)}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {selectedActivities.length > 0 ? (
                        <div className="space-y-6">
                            {selectedActivities.map((act, idx) => {
                                const IconComponent = (Icons && (Icons as any)[act.iconName]) || Circle;
                                return (
                                    <div key={idx} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-orange-500"></div>
                                        
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                                <IconComponent size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                {act.moduleTitle}
                                            </span>
                                        </div>

                                        <Link 
                                            to={`/module/${act.moduleId}/day/${act.dayNumber}`}
                                            className="block group"
                                            onClick={() => setSelectedDate(null)}
                                        >
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-3 group-hover:text-orange-600 transition-colors flex items-center">
                                                {UI_LABELS.day[lang]} {act.dayNumber}: {act.dayTitle}
                                                <ArrowRight size={14} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h4>
                                        </Link>

                                        {act.journal && (
                                            <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30 mb-2">
                                                <div className="flex items-center text-xs font-bold text-orange-400 uppercase tracking-wide mb-1">
                                                    <BookOpen size={12} className="mr-1" /> Journal
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-3 italic">
                                                    "{act.journal}"
                                                </p>
                                            </div>
                                        )}
                                        
                                        {act.task && (
                                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                                <div className="flex items-center text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">
                                                    <CheckSquare size={12} className="mr-1" /> Task
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-3">
                                                    {act.task}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                                <CalendarIcon size={32} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No activity recorded for this day.</p>
                        </div>
                    )}
                </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default Profile;