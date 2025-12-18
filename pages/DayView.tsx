import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MODULES, UI_LABELS, ADDITIONAL_REFLECTION_PROMPTS } from '../constants';
import { UserState, LocalizedString } from '../types';
import { updateModuleProgress, triggerHaptic, addTimeSpent } from '../services/storage';
import { ArrowLeft, BookOpen, CheckCircle, ChevronLeft, ChevronRight, PenTool, CheckSquare, Languages, Mic, MicOff, Clock, Trophy, ArrowRight, Check, Sparkles, Lock, SkipForward, Volume2, StopCircle, Play, Home } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

interface DayViewProps {
  userState: UserState;
  onUpdate: () => void;
  onToggleLang: () => void;
}

type Step = 'reading' | 'task' | 'reflection';

// --- Markdown Rendering Helpers ---

const parseInline = (text: string): React.ReactNode[] => {
    // Split by bold (**...**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
        }
        // Then split by italic (*...*)
        const italicParts = part.split(/(\*[^*]+?\*)/g);
        return italicParts.map((subPart, j) => {
             if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
                 return <em key={`${i}-${j}`} className="italic text-slate-700 dark:text-slate-300">{subPart.slice(1, -1)}</em>;
             }
             return subPart;
        });
    }).flat();
};

const ContentRenderer: React.FC<{ content: string; onComplete?: () => void }> = ({ content, onComplete }) => {
  const lines = content.trim().split('\n');
  
  return (
    <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-4" />; 

        // H1: # Title
        if (trimmed.startsWith('# ')) {
          return <h1 key={index} className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-6 mb-4 leading-tight">{trimmed.replace('# ', '')}</h1>;
        }

        // H3: ### Subtitle
        if (trimmed.startsWith('### ')) {
           return <h3 key={index} className="text-lg md:text-xl font-bold text-orange-700 dark:text-orange-400 mt-8 mb-3 uppercase tracking-wide flex items-center"><span className="w-8 h-1 bg-orange-200 dark:bg-orange-800 mr-3 rounded-full"></span>{trimmed.replace('### ', '')}</h3>;
        }
        
        // H2: ## Heading
        if (trimmed.startsWith('## ')) {
           return <h2 key={index} className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-6 mb-3">{trimmed.replace('## ', '')}</h2>;
        }

        // Divider: ---
        if (trimmed === '---') {
          return <div key={index} className="py-6 flex justify-center"><div className="w-24 border-t-2 border-orange-100 dark:border-slate-700"></div></div>;
        }

        // List Item (Numbered): 1. Text
        if (/^\d+\.\s/.test(trimmed)) {
            const firstSpaceIndex = trimmed.indexOf(' ');
            const num = trimmed.substring(0, firstSpaceIndex);
            const text = trimmed.substring(firstSpaceIndex + 1);
            return (
                <div key={index} className="flex items-start mb-3 pl-2">
                    <span className="font-bold text-orange-600 dark:text-orange-400 mr-3 mt-0.5 min-w-[1.5rem]">{num}</span>
                    <div className="flex-1">{parseInline(text)}</div>
                </div>
            );
        }
        
        // List Item (Bullet): * Text or - Text
        if (/^[\*\-]\s/.test(trimmed)) {
            const text = trimmed.substring(2);
            return (
                <div key={index} className="flex items-start mb-3 pl-4">
                    <span className="text-orange-400 mr-3 mt-1.5 text-xl leading-none">•</span>
                    <div className="flex-1">{parseInline(text)}</div>
                </div>
            );
        }

        // Metadata block (e.g. **Reading Time: ...**) - Render as chips/badges
        if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80) {
             const text = trimmed.replace(/\*\*/g, '');
             const isEndMarker = text === 'End of Reading' || text === 'पढ़ना समाप्त';

             if (isEndMarker && onComplete) {
                 return (
                   <button 
                     key={index}
                     onClick={onComplete}
                     className="mt-6 inline-flex items-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
                   >
                     {text}
                     <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                   </button>
                 );
             }

             return (
               <div key={index} className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 mr-2 border border-slate-200 dark:border-slate-700">
                 {text}
               </div>
             );
        }

        // Standard Paragraph
        return <p key={index} className="mb-2 text-justify">{parseInline(trimmed)}</p>;
      })}
    </div>
  );
};

const DayView: React.FC<DayViewProps> = ({ userState, onUpdate, onToggleLang }) => {
  const { moduleId, dayNumber } = useParams<{ moduleId: string, dayNumber: string }>();
  const navigate = useNavigate();
  const lang = userState.language;
  const dayNum = parseInt(dayNumber || '1', 10);
  
  const module = MODULES.find(m => m.id === moduleId);
  const dayContent = module?.days.find(d => d.dayNumber === dayNum);
  const progress = userState.progress[moduleId || ''];
  
  // State
  const [currentStep, setCurrentStep] = useState<Step>('reading');
  const [journalText, setJournalText] = useState('');
  const [taskResponse, setTaskResponse] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [readingConfirmed, setReadingConfirmed] = useState(false);
  const [activePrompt, setActivePrompt] = useState<LocalizedString | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unlockTimer, setUnlockTimer] = useState('');
  
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  
  // Refs
  const journalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Speech Recognition State
  const [activeMicField, setActiveMicField] = useState<'task' | 'reflection' | null>(null);
  const recognitionRef = useRef<any>(null);

  // --- ACCESS CONTROL CHECK ---
  useEffect(() => {
    if (!progress || !moduleId) return;
    const completedDays = progress.completedDays || [];
    const maxCompleted = completedDays.length > 0 ? Math.max(...completedDays) : 0;
    if (dayNum > maxCompleted + 1) {
       navigate(`/module/${moduleId}`, { replace: true });
       return;
    }
    if (dayNum === maxCompleted + 1 && maxCompleted > 0) {
        const lastEntry = progress.journal[maxCompleted];
        if (lastEntry) {
            const lastDate = new Date(lastEntry.timestamp);
            const today = new Date();
            if (lastDate.toDateString() === today.toDateString()) {
                const msg = lang === 'en' 
                    ? "You've already completed a session today. Great habits are built with consistency, not intensity. Please come back tomorrow!"
                    : "आपने आज का सत्र पूरा कर लिया है। महान आदतें निरंतरता से बनती हैं, तीव्रता से नहीं। कृपया कल वापस आएं!";
                alert(msg);
                navigate(`/module/${moduleId}`, { replace: true });
            }
        }
    }
  }, [moduleId, dayNum, progress, navigate, lang]);

  useEffect(() => {
    setCurrentStep('reading');
    setReadingConfirmed(false);
    stopSpeaking(); // Stop any previous audio
    if (dayContent) {
        setActivePrompt(dayContent.reflectionPrompt);
    }
    window.scrollTo(0, 0);
  }, [moduleId, dayNum, dayContent]);

  useEffect(() => {
    let newJournalText = '';
    let newTaskResponse = '';
    let newIsCompleted = false;

    if (moduleId && userState.progress[moduleId]) {
      const modProgress = userState.progress[moduleId];
      const entry = modProgress.journal[dayNum];
      if (entry) {
        newJournalText = entry.text || '';
        newTaskResponse = entry.taskResponse || '';
      }
      if (modProgress.completedDays.includes(dayNum)) {
        newIsCompleted = true;
      }
    }
    setJournalText(newJournalText);
    setTaskResponse(newTaskResponse);
    setIsCompleted(newIsCompleted);
    setHasUnsavedChanges(false);
  }, [moduleId, dayNum, userState.progress]);

  useEffect(() => {
    setTimerSeconds(0);
  }, [currentStep]);

  useEffect(() => {
    let intervalId: any;
    const tick = () => {
      if (document.hidden) return;
      setTimerSeconds(prev => {
        if (currentStep === 'reading' && prev >= 300) return 300;
        return prev + 1;
      });
    };
    if (currentStep === 'task' || currentStep === 'reading' || currentStep === 'reflection') {
      intervalId = setInterval(tick, 1000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      stopSpeaking();
    };
  }, []);

  // Time tracking - track reading time and total time on page
  const sessionStartRef = useRef<number>(Date.now());
  const readingTimeRef = useRef<number>(0);
  const lastStepRef = useRef<Step>('reading');

  useEffect(() => {
    // Track time when step changes
    const now = Date.now();
    const elapsed = Math.floor((now - sessionStartRef.current) / 1000);
    
    if (lastStepRef.current === 'reading' && elapsed > 0) {
      readingTimeRef.current += elapsed;
    }
    
    sessionStartRef.current = now;
    lastStepRef.current = currentStep;
  }, [currentStep]);

  // Save time when leaving the page
  useEffect(() => {
    return () => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStartRef.current) / 1000);
      
      // Add final reading time if was on reading step
      if (lastStepRef.current === 'reading') {
        readingTimeRef.current += elapsed;
      }
      
      // Save total time spent
      const totalTime = Math.floor((now - sessionStartRef.current) / 1000) + elapsed;
      if (readingTimeRef.current > 0) {
        addTimeSpent('reading', readingTimeRef.current);
      }
      if (totalTime > 0) {
        addTimeSpent('total', totalTime);
      }
    };
  }, []);

  if (!module || !dayContent) return <div>Day not found</div>;

  // --- TTS Logic ---
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingWord(null);
  };

  const speakText = (text: string, isWord = false, wordId?: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop current speech
    window.speechSynthesis.cancel();

    if (isSpeaking && !isWord) {
        setIsSpeaking(false);
        return;
    }

    if (speakingWord === wordId && isWord) {
        setSpeakingWord(null);
        return;
    }

    // Sanitize markdown
    const cleanText = text.replace(/[*#]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9; // Slightly slower for better comprehension

    utterance.onstart = () => {
        if (isWord) setSpeakingWord(wordId || null);
        else setIsSpeaking(true);
    };

    utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingWord(null);
    };

    utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingWord(null);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleReadingComplete = () => {
      triggerHaptic('medium');
      stopSpeaking();
      setReadingConfirmed(true);
      setCurrentStep('task');
      window.scrollTo(0,0);
  };

  const handleComplete = () => {
    if (!moduleId) return;
    triggerHaptic('success');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#ea580c', '#f97316', '#fb923c', '#ffffff'],
      disableForReducedMotion: true
    });
    updateModuleProgress(moduleId, dayNum, journalText, taskResponse);
    setIsCompleted(true);
    setHasUnsavedChanges(false);
    onUpdate(); 
  };

  const handleNextQuestion = () => {
    let availablePrompts = ADDITIONAL_REFLECTION_PROMPTS;
    if (activePrompt) {
        availablePrompts = ADDITIONAL_REFLECTION_PROMPTS.filter(p => p.en !== activePrompt.en);
    }
    if (availablePrompts.length === 0) availablePrompts = ADDITIONAL_REFLECTION_PROMPTS;
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    setActivePrompt(availablePrompts[randomIndex]);
    triggerHaptic('light');
    if (journalText && !journalText.endsWith('\n\n')) {
        setJournalText(prev => prev.trim() + '\n\n');
        setHasUnsavedChanges(true);
    }
    setTimeout(() => {
        if (journalTextareaRef.current) {
            journalTextareaRef.current.focus();
            journalTextareaRef.current.scrollTop = journalTextareaRef.current.scrollHeight;
        }
    }, 50);
  };

  const handleMicToggle = (field: 'task' | 'reflection') => {
    triggerHaptic('light');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; 
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (activeMicField === field) {
      setActiveMicField(null);
      return;
    }
    setTimeout(() => {
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onstart = () => { setActiveMicField(field); triggerHaptic('light'); };
        recognition.onend = () => { setActiveMicField(null); recognitionRef.current = null; triggerHaptic('light'); };
        recognition.onerror = (event: any) => { console.error("Speech recognition error", event.error); setActiveMicField(null); recognitionRef.current = null; };
        recognition.onresult = (event: any) => {
          let newTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) newTranscript += event.results[i][0].transcript;
          }
          const cleanTranscript = newTranscript.trim();
          if (cleanTranscript) {
             const updateText = (prev: string) => {
                 let textToAppend = cleanTranscript;
                 const needsSpace = prev.length > 0 && !/\s$/.test(prev);
                 const isStartOfSentence = prev.trim().length === 0 || /[.!?]$/.test(prev.trim());
                 if (isStartOfSentence && textToAppend.length > 0) textToAppend = textToAppend.charAt(0).toUpperCase() + textToAppend.slice(1);
                 return prev + (needsSpace ? ' ' : '') + textToAppend + ' ';
             };
             if (field === 'task') setTaskResponse(prev => updateText(prev));
             else setJournalText(prev => updateText(prev));
             setHasUnsavedChanges(true);
          }
        };
        try { recognition.start(); recognitionRef.current = recognition; } 
        catch (e) { console.error("Failed to start recognition", e); setActiveMicField(null); }
    }, 150);
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const nextDay = dayNum < 21 ? dayNum + 1 : null;
  const prevDay = dayNum > 1 ? dayNum - 1 : null;

  const maxCompleted = progress?.completedDays.length > 0 ? Math.max(...progress.completedDays) : 0;
  let isNextDayLocked = false;
  if (dayNum === maxCompleted && nextDay) {
       const lastEntry = progress?.journal[maxCompleted];
       if (lastEntry) {
           const lastDate = new Date(lastEntry.timestamp);
           const today = new Date();
           if (lastDate.toDateString() === today.toDateString()) {
               isNextDayLocked = true;
           }
       }
  }

  useEffect(() => {
    if (!isNextDayLocked) return;
    const updateUnlockTimer = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); 
        const diff = tomorrow.getTime() - now.getTime();
        if (diff <= 0) { setUnlockTimer(''); return; }
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setUnlockTimer(`${h}h ${m}m ${s}s`);
    };
    updateUnlockTimer(); 
    const interval = setInterval(updateUnlockTimer, 1000);
    return () => clearInterval(interval);
  }, [isNextDayLocked]);

  const renderStep = () => {
    switch (currentStep) {
      case 'reading':
        const readingDuration = 300; 
        const timeLeft = Math.max(0, readingDuration - timerSeconds);
        const progressPercent = Math.min((timerSeconds / readingDuration) * 100, 100);

        return (
          <section className="animate-fade-in pb-32">
            <div className={`bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border mb-6 transition-all duration-300 ${readingConfirmed ? 'border-green-400 ring-1 ring-green-50 dark:ring-green-900' : 'border-slate-100 dark:border-slate-800'}`}>
              <div className={`flex items-center justify-between mb-8 border-b pb-4 ${readingConfirmed ? 'text-green-600 dark:text-green-400 border-green-100 dark:border-green-900' : 'text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900'}`}>
                 <div className="flex items-center">
                   {readingConfirmed ? <CheckCircle size={24} className="mr-3 text-green-500" /> : <BookOpen size={24} className="mr-3" />}
                   <div>
                      <span className={`block text-xs font-bold uppercase tracking-wider mb-1 ${readingConfirmed ? 'text-green-500' : 'text-orange-400'}`}>Step 1: Read</span>
                      <h3 className="font-bold text-xl leading-tight text-slate-900 dark:text-white">{dayContent.title[lang]}</h3>
                   </div>
                 </div>
                 <div className={`flex items-center px-3 py-1.5 rounded-lg border shadow-sm ml-2 ${readingConfirmed ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'}`}>
                    <Clock size={16} className="mr-2" />
                    <span className="font-mono font-bold text-lg tabular-nums">{formatTime(timerSeconds)}</span>
                 </div>
              </div>

              {/* Action Bar: Translate & TTS */}
              <div className="flex justify-between items-center mb-6">
                 {/* TTS Player */}
                 <button 
                   onClick={() => speakText(dayContent.reading[lang])}
                   className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                     isSpeaking 
                       ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 animate-pulse border border-orange-200 dark:border-orange-800' 
                       : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                   }`}
                 >
                    {isSpeaking ? <StopCircle size={18} className="fill-current" /> : <Volume2 size={18} />}
                    <span className="text-sm font-bold">{isSpeaking ? (lang === 'en' ? 'Stop Listening' : 'रुकें') : (lang === 'en' ? 'Listen' : 'सुनें')}</span>
                 </button>

                 <button 
                    onClick={() => { stopSpeaking(); onToggleLang(); }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold border border-indigo-100 dark:border-indigo-800 transition-all group"
                    title={lang === 'en' ? "Click to read in Hindi" : "Click to read in English"}
                >
                    <Languages size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">{lang === 'en' ? 'Hindi (हिंदी)' : 'English'}</span>
                </button>
              </div>

              <ContentRenderer 
                content={dayContent.reading[lang]} 
                onComplete={handleReadingComplete}
              />
              
              {/* Vocabulary Section if present */}
              {dayContent.vocabulary && dayContent.vocabulary.length > 0 && (
                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                    <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wide mb-3 flex items-center">
                        <Sparkles size={14} className="mr-2" /> {lang === 'en' ? 'Key Words' : 'मुख्य शब्द'}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {dayContent.vocabulary.map((vocab, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30 flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-white">{vocab.word}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">{vocab.transliteration}</div>
                                </div>
                                <button 
                                  onClick={() => speakText(vocab.word, true, `vocab-${idx}`)}
                                  className={`p-2 rounded-full transition-colors ${speakingWord === `vocab-${idx}` ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500'}`}
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center space-y-6">
                 {(readingConfirmed || isCompleted) && (
                     <div className="w-full p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-center text-green-700 dark:text-green-300 font-bold animate-fade-in">
                        <CheckCircle size={24} className="mr-2" />
                        {lang === 'en' ? 'Reading Completed' : 'पठन पूरा हुआ'}
                     </div>
                 )}
              </div>
            </div>

            {!isCompleted && (
                <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 animate-slide-up">
                    <div className="max-w-2xl mx-auto">
                        {!readingConfirmed ? (
                             timerSeconds < readingDuration ? (
                                 <>
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse mr-2"></div>
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reading in progress</span>
                                        </div>
                                        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{formatTime(timeLeft)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all duration-1000 ease-linear rounded-full"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-3">
                                        <p className="text-xs text-slate-400 font-medium">
                                            {lang === 'en' ? 'Keep reading to unlock' : 'अनलॉक करने के लिए पढ़ते रहें'}
                                        </p>
                                        <button
                                            onClick={handleReadingComplete}
                                            className="flex items-center text-xs font-bold text-slate-400 hover:text-orange-600 dark:text-slate-500 dark:hover:text-orange-400 transition-colors"
                                        >
                                            {UI_LABELS.skip[lang]} <SkipForward size={12} className="ml-1" />
                                        </button>
                                    </div>
                                 </>
                            ) : (
                                <button
                                    onClick={handleReadingComplete}
                                    className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-all animate-bounce-in flex items-center justify-center text-lg transform hover:scale-[1.02] active:scale-95"
                                >
                                    <CheckCircle size={24} className="mr-3" />
                                    {lang === 'en' ? 'Mark as Complete' : 'पूर्ण के रूप में चिह्नित करें'}
                                </button>
                            )
                        ) : (
                            <button
                                onClick={() => {
                                    triggerHaptic('light');
                                    setCurrentStep('task');
                                    window.scrollTo(0,0);
                                }}
                                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all animate-fade-in flex items-center justify-center text-lg transform hover:scale-[1.02] active:scale-95"
                            >
                                <CheckCircle size={24} className="mr-3" />
                                <span>{UI_LABELS.goToTask[lang]}</span>
                                <ChevronRight size={24} className="ml-2" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {isCompleted && (
                <button
                onClick={() => {
                    triggerHaptic('light');
                    setCurrentStep('task');
                    window.scrollTo(0,0);
                }}
                className="w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-colors bg-orange-600 text-white hover:bg-orange-700 active:scale-95"
                >
                {UI_LABELS.goToTask[lang]} <ChevronRight size={20} className="ml-2" />
                </button>
            )}
          </section>
        );

      case 'task':
        return (
          <section className="animate-fade-in pb-24">
            <div className="bg-indigo-50 dark:bg-indigo-950 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900 mb-6">
              <div className="flex items-center justify-between mb-6 text-indigo-900 dark:text-indigo-200 border-b border-indigo-200 dark:border-indigo-900 pb-4">
                 <div className="flex items-center">
                    <CheckSquare size={24} className="mr-3" />
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-indigo-400 dark:text-indigo-500 mb-1">Step 2: Do</span>
                        <h3 className="font-bold text-xl leading-tight">{UI_LABELS.task[lang]}</h3>
                    </div>
                 </div>
                 <div className="flex items-center bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm">
                    <Clock size={16} className="mr-2" />
                    <span className="font-mono font-bold text-lg tabular-nums">{formatTime(timerSeconds)}</span>
                 </div>
              </div>

              <div className="relative">
                  <button 
                    onClick={() => speakText(dayContent.task[lang])}
                    className="absolute top-0 right-0 p-2 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                    title="Read Aloud"
                  >
                      {isSpeaking ? <StopCircle size={18} /> : <Volume2 size={18} />}
                  </button>
                  <p className="text-indigo-800 dark:text-indigo-300 mb-6 font-medium text-lg leading-relaxed pr-8">
                    {dayContent.task[lang]}
                  </p>
              </div>
              
              <div className="flex gap-3 items-end">
                <textarea
                  className={`flex-1 p-4 outline-none resize-y min-h-[120px] text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 rounded-xl border transition-colors ${
                    activeMicField === 'task' 
                      ? 'border-red-400 focus:border-red-500 ring-2 ring-red-50 dark:ring-red-900/30' 
                      : 'border-white dark:border-slate-800 focus:border-indigo-400 shadow-sm'
                  }`}
                  placeholder={UI_LABELS.taskInputPlaceholder[lang]}
                  value={taskResponse}
                  onChange={(e) => {
                    setTaskResponse(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                />
                
                <button 
                  onClick={() => handleMicToggle('task')}
                  className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl shadow-sm border transition-all duration-200 ${
                      activeMicField === 'task' 
                      ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                      : 'bg-white dark:bg-slate-900 text-indigo-500 dark:text-indigo-400 border-indigo-100 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-200'
                  }`}
                  title="Dictate response"
                >
                  {activeMicField === 'task' ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                    triggerHaptic('light');
                    stopSpeaking();
                    setCurrentStep('reading');
                }}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
              >
                {UI_LABELS.prev[lang]}
              </button>
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  stopSpeaking();
                  setCurrentStep('reflection');
                  window.scrollTo(0,0);
                }}
                className="flex-1 py-4 bg-orange-600 text-white rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-colors flex items-center justify-center active:scale-95"
              >
                {UI_LABELS.goToReflection[lang]} <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          </section>
        );

      case 'reflection':
        return (
          <section className="animate-fade-in pb-24">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
              <div className="flex items-center justify-between mb-6 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-4">
                 <div className="flex items-center">
                   <PenTool size={24} className="mr-3" />
                   <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Step 3: Reflect</span>
                      <h3 className="font-bold text-xl leading-tight">{UI_LABELS.reflection[lang]}</h3>
                   </div>
                 </div>
                 <div className="flex items-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Clock size={16} className="mr-2" />
                    <span className="font-mono font-bold text-lg tabular-nums">{formatTime(timerSeconds)}</span>
                 </div>
              </div>

              <div className="relative">
                  <button 
                    onClick={() => speakText(activePrompt ? activePrompt[lang] : dayContent.reflectionPrompt[lang])}
                    className="absolute top-0 right-0 p-2 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400"
                    title="Read Aloud"
                  >
                      {isSpeaking ? <StopCircle size={18} /> : <Volume2 size={18} />}
                  </button>
                  <p key={activePrompt ? activePrompt.en : 'default'} className="text-slate-600 dark:text-slate-300 italic mb-6 text-lg animate-fade-in pr-8">
                    {activePrompt ? activePrompt[lang] : dayContent.reflectionPrompt[lang]}
                  </p>
              </div>
              
              <div className="relative">
                <textarea
                    ref={journalTextareaRef}
                    className={`w-full p-4 pb-12 rounded-xl border outline-none transition-all resize-y min-h-[150px] bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${
                        activeMicField === 'reflection' 
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-50 dark:ring-red-900/30' 
                        : 'border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900/30'
                    }`}
                    placeholder={UI_LABELS.journalPlaceholder[lang]}
                    value={journalText}
                    onChange={(e) => {
                      setJournalText(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                />
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                   {activeMicField === 'reflection' && (
                       <span className="text-xs font-bold text-red-500 animate-pulse bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full border border-red-100 dark:border-red-900">
                           Listening...
                       </span>
                   )}
                   <button 
                        onClick={() => handleMicToggle('reflection')}
                        className={`p-2 rounded-full transition-all duration-300 ${
                            activeMicField === 'reflection' 
                            ? 'bg-red-100 text-red-600 ring-4 ring-red-50 dark:ring-red-900/30' 
                            : 'bg-white dark:bg-slate-700 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 shadow-sm border border-slate-100 dark:border-slate-600'
                        }`}
                        title="Dictate response"
                    >
                        {activeMicField === 'reflection' ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                </div>
              </div>

              {journalText.length > 5 && (
                <div className="mt-4 flex justify-end animate-fade-in">
                    <button 
                        onClick={handleNextQuestion}
                        className="flex items-center space-x-2 text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 bg-orange-50 dark:bg-orange-900/30 px-4 py-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
                    >
                        <Sparkles size={16} />
                        <span>{lang === 'en' ? 'Deepen Reflection' : 'और गहरा चिंतन करें'}</span>
                    </button>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-4 mb-8">
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                        triggerHaptic('light');
                        stopSpeaking();
                        setCurrentStep('task');
                    }}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
                  >
                    {UI_LABELS.prev[lang]}
                  </button>
                  <button
                    onClick={handleComplete}
                    className={`flex-1 py-4 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center active:scale-95 ${
                         isCompleted && !hasUnsavedChanges
                         ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                         : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isCompleted && !hasUnsavedChanges ? (
                        <>
                            <CheckCircle size={20} className="mr-2" />
                            {UI_LABELS.saved[lang]}
                        </>
                    ) : UI_LABELS.save[lang]}
                  </button>
                </div>

                {/* Go to Dashboard button - shows after completion */}
                {isCompleted && !hasUnsavedChanges && (
                  <Link
                    to="/"
                    className="w-full py-4 mt-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-colors flex items-center justify-center active:scale-95"
                  >
                    <Home size={20} className="mr-2" />
                    {lang === 'en' ? 'Go to Dashboard' : 'डैशबोर्ड पर जाएं'}
                  </Link>
                )}
            </div>
          </section>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Top Nav */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 sticky top-0 z-40 shadow-sm pt-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-center">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{module.title[lang]}</h2>
            <p className="font-bold text-slate-800 dark:text-white">{UI_LABELS.day[lang]} {dayNum}</p>
          </div>
          
          <button 
            onClick={onToggleLang}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            <Languages size={16} />
            <span className="hidden sm:inline">{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mt-4 flex justify-center space-x-2">
          <div className={`h-1.5 w-8 rounded-full transition-colors ${currentStep === 'reading' ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${currentStep === 'task' ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          <div className={`h-1.5 w-8 rounded-full transition-colors ${currentStep === 'reflection' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        
        {isCompleted && currentStep === 'reading' && (
          <div className="mb-6 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl flex items-center justify-center animate-fade-in">
            <CheckCircle size={20} className="mr-2" />
            <span className="font-medium">{UI_LABELS.completed[lang]}</span>
          </div>
        )}

        {renderStep()}

        {isCompleted && (
           <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 w-full animate-fade-in pb-safe">
             <div className="flex flex-col space-y-4">
                 {isNextDayLocked ? (
                     <div className="space-y-3">
                         <div className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                             <Lock size={20} className="mr-3" />
                             <span>
                                 {lang === 'en' 
                                   ? `Next Session Unlocks in ${unlockTimer}` 
                                   : `अगला सत्र ${unlockTimer} में खुलेगा`}
                             </span>
                         </div>
                         {nextDay && (
                           <button
                             onClick={() => {
                               const confirmMsg = lang === 'en'
                                 ? '⚠️ Not Recommended!\n\nFor best results, complete one day at a time with proper rest. Rushing through days reduces the effectiveness of habit formation.\n\nAre you sure you want to continue to the next day?'
                                 : '⚠️ अनुशंसित नहीं!\n\nसर्वोत्तम परिणामों के लिए, उचित आराम के साथ एक दिन में एक दिन पूरा करें। दिनों में जल्दबाजी करने से आदत निर्माण की प्रभावशीलता कम हो जाती है।\n\nक्या आप वाकई अगले दिन जारी रखना चाहते हैं?';
                               if (confirm(confirmMsg)) {
                                 window.location.href = `/module/${moduleId}/day/${nextDay}`;
                               }
                             }}
                             className="w-full py-3 bg-transparent text-slate-400 dark:text-slate-500 rounded-xl font-medium text-sm border border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all flex items-center justify-center"
                           >
                             <SkipForward size={16} className="mr-2" />
                             {lang === 'en' ? 'Skip Wait (Not Recommended)' : 'प्रतीक्षा छोड़ें (अनुशंसित नहीं)'}
                           </button>
                         )}
                     </div>
                 ) : nextDay ? (
                   <Link 
                     to={`/module/${moduleId}/day/${nextDay}`} 
                     className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center group active:scale-95"
                   >
                     <span>{UI_LABELS.nextDay[lang]}</span> 
                     <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                   </Link>
                 ) : (
                    <Link 
                      to={`/module/${moduleId}/review`} 
                      className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center group active:scale-95"
                    >
                      <span>{UI_LABELS.reviewJourney[lang]}</span>
                      <Trophy size={20} className="ml-2 group-hover:scale-110 transition-transform" />
                    </Link>
                 )}

                 {prevDay && (
                   <Link 
                     to={`/module/${moduleId}/day/${prevDay}`} 
                     className="flex items-center justify-center text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium py-2 transition-colors"
                   >
                     <ChevronLeft size={16} className="mr-1" /> {UI_LABELS.prev[lang]}
                   </Link>
                 )}
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default DayView;