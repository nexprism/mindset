import React, { useState } from 'react';
import { UserState, Theme, ReminderSettings, Language } from '../types';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, Bell, Globe, Palette, Cloud, Trash2, Download, Check, X
} from 'lucide-react';
import NotificationManager from '../components/NotificationManager';
import { saveStorageData, getStorageData, triggerHaptic } from '../services/storage';

interface SettingsProps {
  userState: UserState;
  lang: Language;
  onSetLanguage: (lang: Language) => void;
  onSetTheme: (theme: Theme) => void;
  onSetReminder: (settings: ReminderSettings) => void;
  onReset: () => void;
  onUpdate?: () => void;
}

const THEME_LABELS: Record<Theme, Record<Language, string>> = {
  light: { en: 'Light', hi: 'लाइट', es: 'Claro', fr: 'Clair', de: 'Hell', zh: '亮色', ja: 'ライト', pt: 'Claro', ru: 'Светлая', it: 'Chiaro', ar: 'فاتح' },
  dark: { en: 'Dark', hi: 'डार्क', es: 'Oscuro', fr: 'Sombre', de: 'Dunkel', zh: '暗色', ja: 'ダーク', pt: 'Escuro', ru: 'Тёмная', it: 'Scuro', ar: 'داكن' },
  system: { en: 'Auto', hi: 'ऑटो', es: 'Auto', fr: 'Auto', de: 'Auto', zh: '自动', ja: '自動', pt: 'Auto', ru: 'Авто', it: 'Auto', ar: 'تلقائي' },
};

const LANGUAGE_OPTIONS: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

const Settings: React.FC<SettingsProps> = ({
  userState,
  lang,
  onSetLanguage,
  onSetTheme,
  onSetReminder,
  onReset,
  onUpdate
}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = () => {
    triggerHaptic('medium');
    const data = getStorageData();
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: data
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lapaas-mindset-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        
        if (!imported.data || !imported.version) {
          setImportError(lang === 'en' ? 'Invalid backup file format' : 'अमान्य बैकअप फ़ाइल प्रारूप');
          return;
        }
        
        saveStorageData(imported.data);
        setImportSuccess(true);
        setImportError(null);
        triggerHaptic('success');
        setTimeout(() => {
          setShowImportExportModal(false);
          setImportSuccess(false);
          if (onUpdate) onUpdate();
          window.location.reload();
        }, 1500);
      } catch (err) {
        setImportError(lang === 'en' ? 'Failed to read backup file' : 'बैकअप फ़ाइल पढ़ने में विफल');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/profile" className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <ChevronLeft size={24} className="text-slate-600 dark:text-slate-400" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {lang === 'en' ? 'Settings' : 'सेटिंग्स'}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Bell size={18} className="text-orange-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Notifications' : 'सूचनाएं'}
            </span>
          </div>
          <div className="p-4">
            <NotificationManager 
              reminder={userState.reminder} 
              onSetReminder={onSetReminder} 
              lang={lang} 
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Palette size={18} className="text-purple-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Appearance' : 'दिखावट'}
            </span>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Language */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Language' : lang === 'hi' ? 'भाषा' : lang === 'es' ? 'Idioma' : lang === 'fr' ? 'Langue' : lang === 'de' ? 'Sprache' : lang === 'zh' ? '语言' : lang === 'ja' ? '言語' : lang === 'pt' ? 'Idioma' : lang === 'ru' ? 'Язык' : lang === 'it' ? 'Lingua' : 'اللغة'}
                </span>
              </div>
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-bold"
              >
                {LANGUAGE_OPTIONS.find(l => l.code === lang)?.native || 'English'}
              </button>
            </div>

            {/* Theme */}
            <div className="flex justify-between items-center">
              <span className="text-slate-700 dark:text-slate-300">
                {lang === 'en' ? 'Theme' : 'थीम'}
              </span>
              <div className="flex gap-1">
                {(['light', 'dark', 'system'] as Theme[]).map(t => (
                  <button 
                    key={t} 
                    onClick={() => onSetTheme(t)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      userState.theme === t 
                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {THEME_LABELS[t][lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Cloud size={18} className="text-blue-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {lang === 'en' ? 'Data' : 'डेटा'}
            </span>
          </div>
          
          <button 
            onClick={() => setShowImportExportModal(true)}
            className="w-full px-4 py-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
          >
            <span className="text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Backup & Restore' : 'बैकअप और रीस्टोर'}
            </span>
            <Cloud size={18} className="text-slate-400" />
          </button>

          <button 
            onClick={() => setShowResetModal(true)}
            className="w-full px-4 py-3 flex justify-between items-center hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="text-red-500">
              {lang === 'en' ? 'Reset All Progress' : 'सभी प्रगति रीसेट करें'}
            </span>
            <Trash2 size={18} className="text-red-400" />
          </button>
        </div>

        {/* App Info */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-400">Lapaas Mindset v1.0</p>
          <p className="text-xs text-slate-400">lapaas.com</p>
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {lang === 'en' ? 'Reset Progress?' : 'प्रगति रीसेट करें?'}
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {lang === 'en' 
                ? 'This will delete all your progress, journals, and settings. This cannot be undone.'
                : 'यह आपकी सभी प्रगति, जर्नल और सेटिंग्स को हटा देगा। इसे पूर्ववत नहीं किया जा सकता।'}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
              >
                {lang === 'en' ? 'Cancel' : 'रद्द करें'}
              </button>
              <button 
                onClick={() => { onReset(); setShowResetModal(false); }}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium"
              >
                {lang === 'en' ? 'Reset' : 'रीसेट'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {showImportExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Cloud size={24} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {lang === 'en' ? 'Backup & Restore' : 'बैकअप और रीस्टोर'}
                </h3>
              </div>
              <button onClick={() => { setShowImportExportModal(false); setImportError(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            {importSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {lang === 'en' ? 'Restored Successfully!' : 'सफलतापूर्वक रीस्टोर किया!'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <button
                    onClick={handleExport}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Download size={20} className="text-blue-500" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {lang === 'en' ? 'Export Backup' : 'बैकअप निर्यात करें'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {lang === 'en' ? 'Download your data' : 'अपना डेटा डाउनलोड करें'}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  <label className="block w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Cloud size={20} className="text-emerald-500" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {lang === 'en' ? 'Import Backup' : 'बैकअप आयात करें'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {lang === 'en' ? 'Restore from file' : 'फ़ाइल से पुनर्स्थापित करें'}
                        </p>
                      </div>
                    </div>
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                  </label>
                </div>
                
                {importError && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <Globe size={20} className="text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {lang === 'en' ? 'Select Language' : lang === 'hi' ? 'भाषा चुनें' : 'Language'}
                </h3>
              </div>
              <button onClick={() => setShowLanguageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {LANGUAGE_OPTIONS.map(option => (
                <button
                  key={option.code}
                  onClick={() => {
                    onSetLanguage(option.code);
                    setShowLanguageModal(false);
                    triggerHaptic('light');
                  }}
                  className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-colors ${
                    lang === option.code
                      ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${lang === option.code ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>
                      {option.native}
                    </p>
                    <p className="text-xs text-slate-500">{option.label}</p>
                  </div>
                  {lang === option.code && (
                    <Check size={20} className="text-orange-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
