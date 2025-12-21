import React from 'react';
import { Link } from 'react-router-dom';
import { Languages } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  currentLang: Language;
  onToggleLang: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentLang, onToggleLang }) => {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm border-b border-orange-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/home" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="Lapaas" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            LAPAAS <span className="text-orange-600 dark:text-orange-500">MINDSET</span>
          </span>
        </Link>
        
        <button 
          onClick={onToggleLang}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          <Languages size={16} />
          <span>{currentLang === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;