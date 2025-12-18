
import React, { useMemo, useState, useEffect } from 'react';
import { UserState } from '../types';
import { MODULES, UI_LABELS } from '../constants';
import { BookOpen, Calendar, ArrowRight, CheckSquare, PenTool, TrendingUp, Type, Layers, Search, Sparkles, Filter, X, Clock, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdBanner from '../components/AdBanner';
import { trackPageView } from '../services/analytics';

interface JournalProps {
  userState: UserState;
}

const QUOTES = [
  "Journaling is like whispering to one's self and listening at the same time. - Mina Murray",
  "I can shake off everything as I write; my sorrows disappear, my courage is reborn. - Anne Frank",
  "Fill your paper with the breathings of your heart. - William Wordsworth"
];

const Journal: React.FC<JournalProps> = ({ userState }) => {
  const lang = userState.language;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterModule, setActiveFilterModule] = useState<string | null>(null);
  
  // State for the modal
  const [viewingEntry, setViewingEntry] = useState<any | null>(null);

  useEffect(() => {
    trackPageView('/journal', 'Journal');
  }, []);

  // Memoize calculations to avoid re-renders
  const { allEntries, stats, activeModuleIds } = useMemo(() => {
    const entries: any[] = [];
    let totalWords = 0;
    const activeModules = new Set<string>();

    Object.keys(userState.progress).forEach(moduleId => {
      const module = MODULES.find(m => m.id === moduleId);
      const modProgress = userState.progress[moduleId];
      
      if (modProgress) {
        activeModules.add(moduleId);
        if (modProgress.journal) {
          Object.keys(modProgress.journal).forEach(dayNumStr => {
            const dayNum = parseInt(dayNumStr);
            const entry = modProgress.journal[dayNum];
            // Find day title
            const day = module?.days.find(d => d.dayNumber === dayNum);
            
            // Approximate word count
            const words = (entry.text || '').split(/\s+/).length + (entry.taskResponse || '').split(/\s+/).length;
            totalWords += words;

            entries.push({
              moduleId,
              moduleTitle: module?.title[lang] || moduleId,
              moduleCategory: module?.category,
              dayNumber: dayNum,
              dayTitle: day?.title[lang] || `Day ${dayNum}`,
              text: entry.text,
              taskResponse: entry.taskResponse,
              timestamp: entry.timestamp
            });
          });
        }
      }
    });

    // Sort by date desc
    entries.sort((a, b) => b.timestamp - a.timestamp);

    return { 
        allEntries: entries, 
        stats: {
            totalEntries: entries.length,
            totalWords,
            activeJourneys: activeModules.size
        },
        activeModuleIds: Array.from(activeModules)
    };
  }, [userState.progress, lang]);

  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  // Filter entries
  const filteredEntries = allEntries.filter(entry => {
    const matchesSearch = searchQuery === '' || 
        entry.text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        entry.taskResponse?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.dayTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModule = activeFilterModule === null || entry.moduleId === activeFilterModule;

    return matchesSearch && matchesModule;
  });

  // Helper to render the modal content
  const renderDetailModal = () => {
    if (!viewingEntry) return null;

    const module = MODULES.find(m => m.id === viewingEntry.moduleId);
    const dayContent = module?.days.find(d => d.dayNumber === viewingEntry.dayNumber);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setViewingEntry(null)}>
            <div 
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-600 uppercase tracking-wide">
                                {viewingEntry.moduleTitle}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {UI_LABELS.day[lang]} {viewingEntry.dayNumber}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                            {viewingEntry.dayTitle}
                        </h2>
                    </div>
                    <button 
                        onClick={() => setViewingEntry(null)}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-8">
                    
                    {/* Timestamp */}
                    <div className="flex items-center text-xs text-slate-400 font-medium">
                        <Clock size={14} className="mr-1.5" />
                        {new Date(viewingEntry.timestamp).toLocaleDateString(undefined, { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>

                    {/* Task Section */}
                    {viewingEntry.taskResponse && (
                        <div className="space-y-3">
                            <div className="flex items-center text-indigo-600 dark:text-indigo-400">
                                <CheckSquare size={18} className="mr-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Mission & Action</span>
                            </div>
                            
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/30">
                                {dayContent && (
                                    <p className="text-xs font-medium text-indigo-400 dark:text-indigo-500 mb-3 uppercase tracking-wide">
                                        The Prompt
                                    </p>
                                )}
                                {dayContent && (
                                    <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium mb-4 italic">
                                        "{dayContent.task[lang]}"
                                    </p>
                                )}
                                <div className="w-full h-px bg-indigo-200 dark:bg-indigo-800/50 mb-4"></div>
                                <p className="text-xs font-medium text-indigo-400 dark:text-indigo-500 mb-2 uppercase tracking-wide">
                                    Your Response
                                </p>
                                <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
                                    {viewingEntry.taskResponse}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Journal Section */}
                    {viewingEntry.text && (
                        <div className="space-y-3">
                            <div className="flex items-center text-orange-600 dark:text-orange-400">
                                <PenTool size={18} className="mr-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Reflection</span>
                            </div>
                            
                            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-6 border border-orange-100 dark:border-orange-900/30">
                                <p className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed whitespace-pre-wrap font-serif">
                                    {viewingEntry.text}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                        onClick={() => setViewingEntry(null)}
                        className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-bold text-sm shadow-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
       
       {renderDetailModal()}

       {/* Header Section */}
       <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-8 pb-6 px-6 shadow-sm">
           <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-xl text-orange-600 dark:text-orange-400">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{UI_LABELS.myJournal[lang]}</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your personal growth archive</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center space-x-2 text-indigo-500 dark:text-indigo-400 mb-1">
                            <PenTool size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Entries</span>
                        </div>
                        <span className="text-xl font-black text-slate-800 dark:text-white">{stats.totalEntries}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center space-x-2 text-emerald-500 dark:text-emerald-400 mb-1">
                            <Type size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Words</span>
                        </div>
                        <span className="text-xl font-black text-slate-800 dark:text-white">{stats.totalWords}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center space-x-2 text-orange-500 dark:text-orange-400 mb-1">
                            <Layers size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Active</span>
                        </div>
                        <span className="text-xl font-black text-slate-800 dark:text-white">{stats.activeJourneys}</span>
                    </div>
                </div>
           </div>
       </div>
       
       <div className="max-w-2xl mx-auto px-4 pt-6">
            {allEntries.length === 0 ? (
                <div className="animate-fade-in space-y-8">
                    {/* Empty State Hero */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500 dark:text-orange-400">
                            <Sparkles size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Your Story Begins Here</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-sm mx-auto">
                            Journaling connects your conscious goals with your subconscious habits. Start a module to begin writing.
                        </p>
                        <Link 
                            to="/" 
                            className="inline-flex items-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all transform hover:scale-105"
                        >
                            {UI_LABELS.startJourney[lang]} <ArrowRight size={20} className="ml-2" />
                        </Link>
                    </div>

                    {/* Inspiration Quote */}
                    <div className="relative p-6 rounded-2xl bg-indigo-900 text-white overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                            <BookOpen size={120} />
                        </div>
                        <p className="relative z-10 font-serif text-xl italic leading-relaxed opacity-90 mb-4">"{randomQuote}"</p>
                        <div className="w-8 h-1 bg-indigo-500 rounded-full"></div>
                    </div>

                    {/* Benefits Grid */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-2">Why Journal?</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-start p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 mr-4">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Track Progress</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">See how your mindset shifts over 21 days.</p>
                                </div>
                            </div>
                            <div className="flex items-start p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400 mr-4">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Clarity of Thought</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Untangle complex emotions and ideas.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* Search and Filter */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search your entries..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Module Filters */}
                        {activeModuleIds.length > 0 && (
                            <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
                                <Filter size={14} className="text-slate-400 flex-shrink-0" />
                                <button
                                    onClick={() => setActiveFilterModule(null)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                        activeFilterModule === null 
                                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    All
                                </button>
                                {activeModuleIds.map(modId => {
                                    const mod = MODULES.find(m => m.id === modId);
                                    return (
                                        <button
                                            key={modId}
                                            onClick={() => setActiveFilterModule(modId)}
                                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                                activeFilterModule === modId 
                                                ? 'bg-orange-600 text-white' 
                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-orange-50 dark:hover:bg-orange-900/30'
                                            }`}
                                        >
                                            {mod?.title[lang]}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-8 pb-8">
                        {filteredEntries.length === 0 ? (
                             <div className="pl-8 py-8 text-center text-slate-400 italic">
                                 No entries found matching your search.
                             </div>
                        ) : (
                            filteredEntries.map((entry, idx) => (
                                <div key={`${entry.moduleId}-${entry.dayNumber}-${idx}`} className="relative pl-8 animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                                    {/* Timeline Dot */}
                                    <div className="absolute -left-[9px] top-6 w-4 h-4 bg-white dark:bg-slate-900 border-4 border-orange-500 rounded-full"></div>
                                    
                                    <div 
                                        onClick={() => setViewingEntry(entry)}
                                        className="block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-orange-200 dark:hover:border-orange-700/50 transition-all group cursor-pointer"
                                    >
                                        {/* Entry Header */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-600 uppercase tracking-wide">
                                                    {entry.moduleTitle}
                                                </span>
                                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                    {UI_LABELS.day[lang]} {entry.dayNumber}
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-mono font-medium text-slate-400">
                                                {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                {entry.dayTitle}
                                            </h3>
                                            
                                            {/* Reflection Preview */}
                                            {entry.text && (
                                                <div className="mb-4 relative pl-4 border-l-2 border-orange-200 dark:border-orange-900">
                                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3 italic">
                                                        "{entry.text}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* Task Response Preview */}
                                            {entry.taskResponse && (
                                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                                                    <div className="flex items-center text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">
                                                        <CheckSquare size={12} className="mr-1" /> Action
                                                    </div>
                                                    <p className="text-indigo-900 dark:text-indigo-200 text-xs line-clamp-2">
                                                        {entry.taskResponse}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-4 flex justify-end">
                                                <span className="text-xs font-bold text-slate-400 group-hover:text-orange-500 flex items-center transition-colors">
                                                    Read Full Entry <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};

export default Journal;
