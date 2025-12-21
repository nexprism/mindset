import React from 'react';
import { Award, Calendar, CheckCircle, Clock, BookOpen, Flame, Star, Trophy, X, Share2, Download } from 'lucide-react';
import { ModuleProgress } from '../types';
import { MODULES } from '../constants';

interface CertificateProps {
  moduleId: string;
  progress: ModuleProgress;
  userName: string;
  lang: 'en' | 'hi';
  onClose: () => void;
  onShare?: () => void;
}

const Certificate: React.FC<CertificateProps> = ({
  moduleId,
  progress,
  userName,
  lang,
  onClose,
  onShare
}) => {
  const module = MODULES.find(m => m.id === moduleId);
  if (!module) return null;

  const completedDays = progress.completedDays.length;
  const isCompleted = completedDays >= 21;
  
  // Calculate journey stats
  const journalEntries = Object.keys(progress.journal || {}).length;
  const startDate = progress.startedAt ? new Date(progress.startedAt) : null;
  const completionDate = progress.completedAt ? new Date(progress.completedAt) : new Date();
  
  // Get completion dates for calendar
  const completionDates = new Set<string>();
  if (progress.journal) {
    Object.values(progress.journal).forEach((entry: any) => {
      const date = new Date(entry.timestamp);
      completionDates.add(date.toLocaleDateString('en-CA'));
    });
  }

  // Generate 21-day journey grid
  const generateJourneyGrid = () => {
    const days = [];
    
    for (let d = 1; d <= 21; d++) {
      const isCompleted = progress.completedDays.includes(d);
      
      days.push(
        <div
          key={d}
          className={`h-8 w-8 rounded-lg text-[10px] flex items-center justify-center font-bold transition-all ${
            isCompleted 
              ? 'bg-emerald-400 text-emerald-900 shadow-sm shadow-emerald-400/30' 
              : 'bg-slate-700/50 text-slate-500'
          }`}
        >
          {d}
        </div>
      );
    }
    
    return days;
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate total days taken
  const daysTaken = startDate && completionDate
    ? Math.ceil((completionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 21;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-orange-600 via-amber-500 to-orange-600 rounded-3xl p-1 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[22px] overflow-hidden relative">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* Certificate Content */}
          <div className="p-6 relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-amber-500/20 to-transparent rounded-tl-full"></div>
            <div className="absolute top-1/2 left-0 w-2 h-32 bg-gradient-to-b from-orange-500/0 via-orange-500/30 to-orange-500/0 -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-0 w-2 h-32 bg-gradient-to-b from-amber-500/0 via-amber-500/30 to-amber-500/0 -translate-y-1/2"></div>

            {/* Header */}
            <div className="relative z-10 text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 rotate-3">
                  <Award size={32} className="text-white" />
                </div>
              </div>
              <p className="text-orange-300 text-xs uppercase tracking-[0.3em] font-bold mb-1">
                {lang === 'en' ? 'Certificate of Completion' : 'पूर्णता प्रमाणपत्र'}
              </p>
              <h2 className="text-2xl font-black text-white mb-1">
                {module.title[lang]}
              </h2>
              <p className="text-orange-200/70 text-sm">21-Day Mindset Journey</p>
            </div>

            {/* Recipient */}
            <div className="relative z-10 text-center mb-6 py-4 border-y border-orange-500/20">
              <p className="text-orange-300/70 text-xs uppercase tracking-wider mb-1">
                {lang === 'en' ? 'Awarded to' : 'प्राप्तकर्ता'}
              </p>
              <h3 className="text-3xl font-black text-white" style={{ fontFamily: 'Georgia, serif' }}>
                {userName || 'Champion'}
              </h3>
            </div>

            {/* Stats Grid */}
            <div className="relative z-10 grid grid-cols-4 gap-2 mb-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <CheckCircle size={18} className="mx-auto mb-1 text-emerald-400" />
                <div className="text-xl font-black text-white">{completedDays}</div>
                <div className="text-[8px] uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Days' : 'दिन'}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <BookOpen size={18} className="mx-auto mb-1 text-blue-400" />
                <div className="text-xl font-black text-white">{journalEntries}</div>
                <div className="text-[8px] uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Journals' : 'जर्नल'}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <Clock size={18} className="mx-auto mb-1 text-purple-400" />
                <div className="text-xl font-black text-white">{daysTaken}</div>
                <div className="text-[8px] uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Total Days' : 'कुल दिन'}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <Trophy size={18} className="mx-auto mb-1 text-amber-400" />
                <div className="text-xl font-black text-white">100%</div>
                <div className="text-[8px] uppercase tracking-wider text-slate-400">
                  {lang === 'en' ? 'Complete' : 'पूर्ण'}
                </div>
              </div>
            </div>

            {/* 21-Day Progress Grid */}
            <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-orange-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {lang === 'en' ? '21-Day Progress' : '21-दिन की प्रगति'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {completedDays}/21 {lang === 'en' ? 'Days' : 'दिन'}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2 justify-items-center">
                {generateJourneyGrid()}
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-400"></div>
                  <span className="text-[9px] text-slate-400">
                    {lang === 'en' ? 'Completed' : 'पूर्ण'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-slate-700/50"></div>
                  <span className="text-[9px] text-slate-400">
                    {lang === 'en' ? 'Remaining' : 'बाकी'}
                  </span>
                </div>
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={14} className="text-orange-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === 'en' ? 'Journey Timeline' : 'यात्रा समयरेखा'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <p className="text-[9px] text-slate-400 uppercase mb-1">
                    {lang === 'en' ? 'Started' : 'शुरुआत'}
                  </p>
                  <p className="text-sm font-bold text-white">
                    {startDate ? formatDate(startDate) : '-'}
                  </p>
                </div>
                <div className="flex-1 mx-3 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 rounded-full relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-slate-400 uppercase mb-1">
                    {lang === 'en' ? 'Completed' : 'पूर्ण'}
                  </p>
                  <p className="text-sm font-bold text-emerald-400">
                    {formatDate(completionDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="relative z-10 flex justify-center mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full px-6 py-3 border border-amber-500/30">
                <Star size={20} className="text-amber-400" fill="currentColor" />
                <span className="text-sm font-bold text-amber-300">
                  {lang === 'en' ? 'Mindset Champion' : 'माइंडसेट चैंपियन'}
                </span>
                <Star size={20} className="text-amber-400" fill="currentColor" />
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Lapaas" className="w-6 h-6 rounded" />
                <div>
                  <p className="text-[10px] font-bold text-white">LAPAAS MINDSET</p>
                  <p className="text-[8px] text-slate-500">lapaas.com</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-slate-500 uppercase">Certificate ID</p>
                <p className="text-[10px] font-mono text-slate-400">
                  {moduleId.toUpperCase()}-{Date.now().toString(36).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-900/50 border-t border-white/10 space-y-2">
            {navigator.share && onShare && (
              <button
                onClick={onShare}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center shadow-lg shadow-orange-500/20"
              >
                <Share2 size={18} className="mr-2" />
                {lang === 'en' ? 'Share Certificate' : 'प्रमाणपत्र साझा करें'}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-2 text-slate-500 rounded-xl font-medium transition-colors text-sm"
            >
              {lang === 'en' ? 'Close' : 'बंद करें'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
