
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Module, UserState, ModuleProgress } from '../types';
import { MODULES, UI_LABELS } from '../constants';
import * as Icons from 'lucide-react';
import { Lock, ImageOff, Star, ArrowRight, Flame, Clock, Calendar, Trophy, List, Quote, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import AdBanner from '../components/AdBanner';
import { trackPageView } from '../services/analytics';

interface HomeProps {
  userState: UserState;
}

interface ModuleCardProps {
  module: Module;
  userState: UserState;
  isHighlight?: boolean;
  isLocked?: boolean;
  onLockedClick?: () => void;
}

const CATEGORY_QUOTES: Record<string, { en: string, hi: string }> = {
  finance: { en: "Wealth consists not in having great possessions, but in having few wants.", hi: "दौलत का मतलब बहुत सारी चीजें होना नहीं, बल्कि कम जरूरतें होना है।" },
  health: { en: "Take care of your body. It's the only place you have to live.", hi: "अपने शरीर का ख्याल रखें। यही वह एकमात्र जगह है जहां आपको रहना है।" },
  confidence: { en: "No one can make you feel inferior without your consent.", hi: "आपकी मर्जी के बिना कोई आपको नीचा महसूस नहीं करा सकता।" },
  productivity: { en: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", hi: "शौकिया लोग प्रेरणा का इंतज़ार करते हैं, बाकी हम बस उठकर काम पर लग जाते हैं।" },
  relationships: { en: "The only way to have a friend is to be one.", hi: "दोस्त बनाने का एकमात्र तरीका खुद दोस्त बनना है।" },
  growth: { en: "Live as if you were to die tomorrow. Learn as if you were to live forever.", hi: "ऐसे जियो जैसे कि तुम कल मरने वाले हो। ऐसे सीखो जैसे कि तुम हमेशा जीने वाले हो।" },
  mindfulness: { en: "The present moment is the only moment available to us.", hi: "वर्तमान पल ही हमारे पास उपलब्ध एकमात्र पल है।" },
  default: { en: "The journey of a thousand miles begins with a single step.", hi: "हजारों मील की यात्रा एक कदम से शुरू होती है।" }
};

const calculateStreak = (userState: UserState): number => {
  try {
    const allTimestamps: number[] = [];
    Object.values(userState.progress).forEach(prog => {
      if (prog.journal) {
        Object.values(prog.journal).forEach(entry => {
          allTimestamps.push(entry.timestamp);
        });
      }
    });

    if (allTimestamps.length === 0) return 0;

    const uniqueDays = new Set<number>();
    allTimestamps.forEach(ts => {
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      uniqueDays.add(d.getTime());
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    let streak = 0;
    let currentCheck = todayTime;

    // Check if streak is active (today or yesterday present)
    if (!uniqueDays.has(currentCheck)) {
      if (uniqueDays.has(yesterdayTime)) {
        currentCheck = yesterdayTime;
      } else {
        return 0; // Streak broken
      }
    }

    // Count backwards
    while (uniqueDays.has(currentCheck)) {
      streak++;
      const d = new Date(currentCheck);
      d.setDate(d.getDate() - 1);
      currentCheck = d.getTime();
    }

    return streak;
  } catch (e) {
    console.error("Streak calc error", e);
    return 0;
  }
};

const ModuleCard: React.FC<ModuleCardProps> = ({ module, userState, isHighlight = false, isLocked = false, onLockedClick }) => {
  const lang = userState.language;
  const IconComponent = (Icons as any)[module.iconName] || Icons.Circle;
  const progress = userState.progress[module.id];
  const completedCount = progress?.completedDays?.length || 0;
  const totalDays = module.days.length;
  const percent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
  const isStarted = completedCount > 0;
  const isCompleted = completedCount === totalDays;
  const [imgError, setImgError] = useState(false);

  // Get Quote
  const quoteObj = CATEGORY_QUOTES[module.category] || CATEGORY_QUOTES['default'];
  const quote = quoteObj[lang];

  // Define some fallback gradients based on category or just random
  const getFallbackGradient = () => {
    switch(module.category) {
        case 'finance': return 'from-emerald-400 to-emerald-600';
        case 'health': return 'from-rose-400 to-rose-600';
        case 'confidence': return 'from-amber-400 to-amber-600';
        case 'productivity': return 'from-blue-400 to-blue-600';
        default: return 'from-slate-400 to-slate-600';
    }
  };

  return (
    <div className={`relative group h-full ${isLocked ? 'cursor-not-allowed' : ''}`} onClick={isLocked ? onLockedClick : undefined}>
        <Link 
          to={isLocked ? '#' : `/module/${module.id}`}
          className={`block h-full relative overflow-hidden rounded-2xl transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border ${
            isHighlight 
                ? 'border-orange-400 dark:border-orange-600 shadow-lg ring-2 ring-orange-100 dark:ring-orange-900/20' 
                : 'border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-xl hover:-translate-y-1'
          }`}
        >
            {/* Image Section - Increased height to h-48 */}
            <div className={`relative h-48 w-full overflow-hidden ${imgError ? `bg-gradient-to-br ${getFallbackGradient()}` : 'bg-slate-100 dark:bg-slate-800'}`}>
                {/* Decorative Pattern for Fallback */}
                {imgError && (
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                )}
                
                {!imgError ? (
                    <img 
                        src={module.bannerImage} 
                        alt={module.title[lang]}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLocked ? 'grayscale opacity-40' : ''}`}
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 relative z-10">
                        <IconComponent size={64} className="opacity-50 drop-shadow-md" />
                    </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {isHighlight && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center">
                            <Star size={10} className="mr-1 fill-white" /> Recommended
                        </span>
                    )}
                </div>

                <div className="absolute top-3 right-3 flex gap-2">
                    {isCompleted && (
                        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                            {UI_LABELS.completed[lang]}
                        </span>
                    )}
                    {isLocked && (
                        <span className="bg-slate-800/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center">
                            <Lock size={10} className="mr-1" /> Locked
                        </span>
                    )}
                </div>
            </div>

            {/* Content Section - Added subtle pattern background */}
            <div className={`p-5 flex-1 flex flex-col relative overflow-hidden ${isHighlight ? 'bg-gradient-to-b from-white to-orange-50/30 dark:from-slate-900 dark:to-slate-900' : ''}`}>
                {/* Subtle pattern for white space */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Large Background Icon for Texture */}
                <div className={`absolute -right-6 -bottom-6 pointer-events-none transform -rotate-12 transition-transform duration-700 group-hover:rotate-0 ${isHighlight ? 'opacity-[0.1] dark:opacity-[0.15] scale-125' : 'opacity-[0.05] dark:opacity-[0.1]'}`}>
                    <IconComponent size={180} />
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className={`text-lg font-bold leading-tight ${isHighlight ? 'text-orange-700 dark:text-orange-400' : 'text-slate-800 dark:text-white'} group-hover:text-orange-600 transition-colors line-clamp-2`}>
                            {module.title[lang]}
                        </h3>
                    </div>

                    {/* Meta Data Chips to fill space */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="flex items-center text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <Calendar size={10} className="mr-1" /> 21 Days
                        </span>
                        <span className="flex items-center text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <Clock size={10} className="mr-1" /> 5 Min/Day
                        </span>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                        {module.description[lang]}
                    </p>

                    {/* Highlight Only: Quote Block to fill vertical space nicely */}
                    {isHighlight && (
                        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 relative overflow-hidden">
                           <div className="absolute top-2 left-2 opacity-10">
                              <Quote size={24} className="text-orange-500" />
                           </div>
                           <p className="text-xs font-medium text-slate-600 dark:text-slate-300 italic relative z-10 leading-relaxed text-center">
                              "{quote}"
                           </p>
                        </div>
                    )}

                    {/* Topics Preview - Fills empty space with value */}
                    <div className="mb-6 flex-1">
                         <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 opacity-80 flex items-center">
                            {isHighlight ? <Sparkles size={10} className="mr-1 text-orange-400" /> : <List size={10} className="mr-1" />}
                            {lang === 'en' ? (isHighlight ? "What's Inside" : "Topics") : (isHighlight ? "इसमें क्या है" : "विषय")}:
                         </div>
                         <div className="space-y-1.5">
                            {/* Show 4 topics for highlighted card to fill space, 3 for regular */}
                            {module.days.slice(0, isHighlight ? 4 : 3).map((day, i) => (
                                <div key={i} className="flex items-center text-xs text-slate-600 dark:text-slate-300">
                                    <div className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${isHighlight ? 'bg-orange-400' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                    <span className="truncate opacity-90">{day.title[lang]}</span>
                                </div>
                            ))}
                            {isHighlight && (
                                <div className="text-[10px] text-slate-400 pl-3.5 mt-1 italic">
                                    + {module.days.length - 4} more lessons...
                                </div>
                            )}
                         </div>
                    </div>

                    <div className="mt-auto pt-2">
                        {isStarted && !isCompleted ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <span>Progress</span>
                                    <span>{percent}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600" 
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={`flex items-center justify-between text-sm font-bold uppercase tracking-wide transition-colors ${
                                isCompleted 
                                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-xl' 
                                : isHighlight 
                                    ? 'text-white bg-orange-600 px-4 py-3.5 rounded-xl shadow-md group-hover:bg-orange-700 justify-center'
                                    : 'text-orange-600 dark:text-orange-500'
                            }`}>
                                <span>{isCompleted ? 'Review Journey' : UI_LABELS.startJourney[lang]}</span>
                                <ArrowRight size={16} className={`ml-2 group-hover:translate-x-1 transition-transform ${isHighlight ? 'text-white' : ''}`} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ userState }) => {
  const lang = userState.language;
  const streak = calculateStreak(userState);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/home', 'Home');
  }, []);

  // Identify Active Journeys (allow up to 5 concurrent)
  // A journey is active if > 0 days completed AND not fully completed
  const MAX_CONCURRENT_JOURNEYS = 5;
  const activeJourneys = Object.entries(userState.progress).filter((entry) => {
      const [id, rawProg] = entry;
      const prog = rawProg as ModuleProgress;
      const mod = MODULES.find(m => m.id === id);
      if (!mod) return false;
      const totalDays = mod.days.length;
      return prog.completedDays.length > 0 && prog.completedDays.length < totalDays;
  });
  
  const activeJourneyIds = activeJourneys.map(([id]) => id);
  const hasReachedLimit = activeJourneys.length >= MAX_CONCURRENT_JOURNEYS;

  const handleLockedClick = () => {
     setShowLimitModal(true);
  };

  // Split modules into recommended and others
  const recommendedModule = userState.recommendedModuleId 
    ? MODULES.find(m => m.category === userState.recommendedModuleId || m.id === userState.recommendedModuleId) 
    : null;
    
  const otherModules = MODULES.filter(m => m.id !== recommendedModule?.id);

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return lang === 'en' ? 'Good morning' : 'सुप्रभात';
      if (hour < 18) return lang === 'en' ? 'Good afternoon' : 'नमस्कार';
      return lang === 'en' ? 'Good evening' : 'शुभ संध्या';
  };
  
  // Daily Goal Stats
  const dailyGoals = userState.dailyGoals || [];
  const completedGoals = dailyGoals.filter(g => g.history.includes(new Date().toLocaleDateString('en-CA')));
  const goalsProgress = dailyGoals.length > 0 ? (completedGoals.length / dailyGoals.length) * 100 : 0;

  return (
    <div className="pb-20 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-8 px-4 mb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                {getGreeting()}, <span className="text-orange-600 dark:text-orange-500">{userState.name || (lang === 'en' ? 'Friend' : 'दोस्त')}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">{UI_LABELS.tagline[lang]}</p>
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-center bg-orange-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-orange-100 dark:border-slate-700 shadow-sm animate-fade-in">
            <div className="flex items-center space-x-1.5">
              <Flame 
                size={22} 
                className={`transition-colors duration-300 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-300 dark:text-slate-600'}`} 
              />
              <span className={`text-xl font-black ${streak > 0 ? 'text-orange-600 dark:text-orange-500' : 'text-slate-300 dark:text-slate-600'}`}>
                {streak}
              </span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${streak > 0 ? 'text-orange-400' : 'text-slate-300 dark:text-slate-600'}`}>
              {lang === 'en' ? 'Day Streak' : 'सिलसिला'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Daily Goals Summary Widget */}
        {dailyGoals.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 dark:shadow-none animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-indigo-50 flex items-center">
                        <CheckCircle2 size={18} className="mr-2" />
                        {lang === 'en' ? "Today's Targets" : "आज के लक्ष्य"}
                    </h3>
                    <Link to="/profile" className="text-xs font-bold text-indigo-200 hover:text-white transition-colors">
                        {lang === 'en' ? 'View All' : 'सभी देखें'}
                    </Link>
                </div>
                
                <div className="flex items-center space-x-4">
                     <div className="flex-1">
                         <div className="flex justify-between text-xs font-bold text-indigo-200 mb-1.5 uppercase tracking-wide">
                             <span>{completedGoals.length}/{dailyGoals.length} Completed</span>
                             <span>{Math.round(goalsProgress)}%</span>
                         </div>
                         <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                             <div 
                                className="h-full bg-white rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${goalsProgress}%` }}
                             ></div>
                         </div>
                     </div>
                </div>
            </div>
        )}

        {recommendedModule && (
          <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <Star size={16} className="mr-2 text-yellow-500" />
                    {UI_LABELS.recommended[lang]}
                </h2>
                {userState.name && (
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-md">
                        Curated for {userState.name}
                    </span>
                )}
            </div>
            <ModuleCard 
              module={recommendedModule} 
              userState={userState} 
              isHighlight={true}
              isLocked={hasReachedLimit && !activeJourneyIds.includes(recommendedModule.id)}
              onLockedClick={handleLockedClick}
            />
          </section>
        )}

        {/* Ad Banner */}
        <div className="my-4">
          <AdBanner className="rounded-xl overflow-hidden" />
        </div>

        <section>
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            {UI_LABELS.allJourneys[lang]}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherModules.map(m => (
              <ModuleCard 
                key={m.id} 
                module={m} 
                userState={userState}
                isLocked={hasReachedLimit && !activeJourneyIds.includes(m.id)}
                onLockedClick={handleLockedClick}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Journey Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Lock size={24} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {lang === 'en' ? 'Journey Limit Reached' : 'यात्रा सीमा पूरी'}
              </h3>
            </div>
            <p className="text-slate-300 mb-6">
              {lang === 'en' 
                ? `You can only have ${MAX_CONCURRENT_JOURNEYS} active journeys at a time. Complete one of your current journeys to start a new one.`
                : `आप एक समय में केवल ${MAX_CONCURRENT_JOURNEYS} सक्रिय यात्राएं कर सकते हैं। नई यात्रा शुरू करने के लिए अपनी वर्तमान यात्राओं में से एक पूरी करें।`}
            </p>
            <button 
              onClick={() => setShowLimitModal(false)} 
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors"
            >
              {lang === 'en' ? 'Got it' : 'समझ गया'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
