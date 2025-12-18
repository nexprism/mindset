
import React from 'react';
import { Download, X } from 'lucide-react';
import { UI_LABELS } from '../constants';
import { Language } from '../types';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
  lang: Language;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss, lang }) => {
  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 p-4 z-[999] animate-slide-up">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
           <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
             <Download size={20} />
           </div>
           <h3 className="font-bold text-slate-800 dark:text-white">{UI_LABELS.installApp[lang]}</h3>
        </div>
        <button 
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
        {UI_LABELS.installDescription[lang]}
      </p>
      
      <div className="flex space-x-3">
        <button 
          onClick={onDismiss}
          className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          {UI_LABELS.dismissButton[lang]}
        </button>
        <button 
          onClick={onInstall}
          className="flex-1 py-2 px-3 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-md flex items-center justify-center"
        >
          <Download size={16} className="mr-2" />
          {UI_LABELS.installButton[lang]}
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
