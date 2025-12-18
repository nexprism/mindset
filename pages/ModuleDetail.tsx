
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MODULES, UI_LABELS } from '../constants';
import { UserState } from '../types';
import { ArrowLeft, Check, Lock, PlayCircle, RefreshCw, Trophy, BookOpen, Clock, ImageOff, Layout } from 'lucide-react';
import { resetModule } from '../services/storage';

interface ModuleDetailProps {
  userState: UserState;
  onUpdate: () => void;
}

const ModuleDetail: React.FC<ModuleDetailProps> = ({ userState, onUpdate }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const lang = userState.language;
  const [imgError, setImgError] = useState(false);
  const currentDayRef = useRef<HTMLDivElement>(null);
  
  const module = MODULES.find(m => m.id === moduleId);
  const progress = userState.progress[moduleId || ''];
  const completedDays = progress?.completedDays || [];
  const maxCompletedDay = completedDays.length > 0 ? Math.max(...completedDays) : 0;
  
  // Scroll behavior: scroll to current/next day if progress exists, otherwise top
  useEffect(() => {
    if (maxCompletedDay > 0 && currentDayRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        currentDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [moduleId, maxCompletedDay]);
  
  if (!module) return <div className="p-8 text-center text-slate-500">Module not found</div>;

  const totalDays = module.days.length;
  const completedCount = completedDays.length;
  const percent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
  const isFullyCompleted = completedCount === totalDays && totalDays > 0;

  // Day Locking Logic (maxCompletedDay already calculated above)
  
  // Check if the last completed day was done TODAY
  let isNextDayLockedByTime = false;
  if (maxCompletedDay > 0) {
    const lastEntry = progress.journal[maxCompletedDay];
    if (lastEntry) {
        const lastDate = new Date(lastEntry.timestamp);
        const today = new Date();
        
        // Strict same-day check
        const isSameDay = lastDate.toDateString() === today.toDateString();
        
        // If last completed day was today, lock the next one (unless we finished the whole module)
        if (isSameDay && maxCompletedDay < 21) {
            isNextDayLockedByTime = true;
        }
    }
  }

  // The next playable day is maxCompleted + 1
  // But if we locked by time, then no next day is playable right now
  const nextPlayableDay = isNextDayLockedByTime ? -1 : maxCompletedDay + 1;

  const handleReset = () => {
    const confirmMsg = lang === 'en' 
        ? "Are you sure? This will delete all progress and journals for this journey. You will be able to pick a new journey."
        : "क्या आप निश्चित हैं? यह इस यात्रा के लिए सभी प्रगति और पत्रिकाओं को हटा देगा। आप एक नई यात्रा चुनने में सक्षम होंगे।";
        
    if (confirm(confirmMsg)) {
      resetModule(module.id);
      onUpdate();
      navigate('/');
    }
  };

  // Helper for banner fallback gradient
  const getBannerGradient = () => {
     switch(module.category) {
        case 'finance': return 'from-emerald-800 to-emerald-950';
        case 'health': return 'from-rose-800 to-rose-950';
        case 'confidence': return 'from-amber-800 to-amber-950';
        case 'productivity': return 'from-blue-800 to-blue-950';
        default: return 'from-slate-800 to-slate-950';
     }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
      {/* Banner */}
      <div className={`relative overflow-hidden transition-all duration-700 ease-in-out min-h-[280px] flex flex-col justify-end ${isFullyCompleted ? 'bg-emerald-900' : 'bg-slate-900'}`}>
        {/* Background Image / Fallback */}
        <div className="absolute inset-0 z-0">
             {!imgError ? (
                 <img 
                   src={module.bannerImage} 
                   alt={module.title[lang]} 
                   className={`w-full h-full object-cover transition-opacity duration-700 ${isFullyCompleted ? 'opacity-20 grayscale' : 'opacity-60'}`}
                   onError={() => setImgError(true)}
                 />
             ) : (
                 <div className={`w-full h-full bg-gradient-to-br ${getBannerGradient()} flex items-center justify-center opacity-80`}>
                     {/* Decorative Pattern for empty space */}
                     <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                     <Layout className="text-white/10 w-32 h-32 absolute top-10 right-10 opacity-20 transform rotate-12" />
                 </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>

        {isFullyCompleted ? (
             <div className="pt-12 pb-16 px-6 relative z-10 text-center text-white">
                <Trophy size={48} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
                <h1 className="text-4xl font-black mb-2 drop-shadow-lg">{UI_LABELS.congrats[lang]}</h1>
                <p className="text-emerald-200 mb-8 drop-shadow-md">{UI_LABELS.moduleComplete[lang]}</p>
                <Link 
                  to={`/module/${moduleId}/review`}
                  className="inline-flex items-center bg-white text-emerald-900 font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  <BookOpen size={20} className="mr-2" /> {UI_LABELS.reviewJourney[lang]}
                </Link>
             </div>
        ) : (
            <div className="pt-24 pb-12 px-6 relative z-10 text-white">
                <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <ArrowLeft size={16} className="mr-2" /> {UI_LABELS.home[lang]}
                </Link>
                <h1 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-lg leading-tight">{module.title[lang]}</h1>
                <p className="text-white/80 max-w-lg mb-6 leading-relaxed text-sm drop-shadow-md font-medium">{module.description[lang]}</p>
                
                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
                    <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-white">{percent}%</span>
                </div>
                
                {isNextDayLockedByTime && !isFullyCompleted && (
                    <div className="mt-4 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 text-orange-200 text-xs px-4 py-3 rounded-xl flex items-center animate-fade-in font-medium">
                        <Clock size={16} className="mr-2" />
                        <span>{lang === 'en' ? 'Complete! Come back tomorrow for the next step.' : 'पूरा हुआ! अगले चरण के लिए कल वापस आएं।'}</span>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Days Grid */}
      <div className="max-w-md mx-auto px-4 mt-6">
        <div className="space-y-3">
          {module.days.map((day) => {
            const isCompleted = completedDays.includes(day.dayNumber);
            const isLocked = !isCompleted && day.dayNumber !== nextPlayableDay;
            const isCurrent = !isCompleted && day.dayNumber === nextPlayableDay;

            return (
              <div 
                key={day.dayNumber} 
                className="relative group"
                ref={isCurrent || (isCompleted && day.dayNumber === maxCompletedDay) ? currentDayRef : null}
              >
                  <Link 
                    to={isLocked ? '#' : `/module/${module.id}/day/${day.dayNumber}`}
                    className={`flex items-center p-4 rounded-2xl border transition-all duration-200 ${
                      isLocked 
                        ? 'bg-slate-50 dark:bg-slate-900 border-transparent opacity-60 cursor-not-allowed' 
                        : isCompleted
                          ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-orange-200 dark:border-orange-800 shadow-md ring-1 ring-orange-100 dark:ring-orange-900/30 transform scale-[1.02] z-10'
                    }`}
                    onClick={(e) => isLocked && e.preventDefault()}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold text-sm transition-colors ${
                      isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : isCurrent 
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                    }`}>
                      {isCompleted ? <Check size={18} /> : isLocked ? <Lock size={16} /> : day.dayNumber}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm truncate pr-2 ${isCompleted ? 'text-emerald-900 dark:text-emerald-400' : isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                        {UI_LABELS.day[lang]} {day.dayNumber}: {day.title[lang]}
                      </h4>
                      {isCurrent && (
                        <div className="flex items-center mt-1 text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wide">
                           <PlayCircle size={12} className="mr-1" /> Start
                        </div>
                      )}
                    </div>
                  </Link>
                  {/* Connector Line */}
                  {day.dayNumber !== totalDays && (
                      <div className={`absolute left-[2.4rem] top-14 h-6 w-0.5 ${isCompleted ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                  )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center pb-8">
            <button onClick={handleReset} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center mx-auto text-xs font-medium transition-colors px-4 py-2">
               <RefreshCw size={12} className="mr-2" /> {UI_LABELS.reset[lang]}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
