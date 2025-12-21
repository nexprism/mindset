import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, CheckCircle, AlertCircle, Send, Volume2, Smartphone, Calendar, Zap, Sunrise, Sun, Moon } from 'lucide-react';
import { ReminderSettings } from '../types';
import { showNotification, getNotificationContent, NOTIFICATION_TIMES } from '../services/notifications';

interface NotificationManagerProps {
  reminder: ReminderSettings;
  onSetReminder: (settings: ReminderSettings) => void;
  lang: 'en' | 'hi';
}

const LABELS = {
  title: { en: 'Notifications', hi: 'सूचनाएं' },
  subtitle: { en: 'Stay on track with daily reminders', hi: 'दैनिक रिमाइंडर के साथ ट्रैक पर रहें' },
  enableReminders: { en: 'Daily Reminder', hi: 'दैनिक रिमाइंडर' },
  reminderTime: { en: 'Reminder Time', hi: 'रिमाइंडर का समय' },
  permissionGranted: { en: 'Notifications enabled', hi: 'सूचनाएं चालू हैं' },
  permissionDenied: { en: 'Notifications blocked', hi: 'सूचनाएं अवरुद्ध हैं' },
  permissionDefault: { en: 'Enable notifications', hi: 'सूचनाएं चालू करें' },
  testNotification: { en: 'Test Notification', hi: 'टेस्ट नोटिफिकेशन' },
  testSent: { en: 'Test sent!', hi: 'टेस्ट भेजा गया!' },
  howItWorks: { en: 'How it works', hi: 'यह कैसे काम करता है' },
  step1: { en: "We'll remind you at your chosen time", hi: 'हम आपको चुने हुए समय पर याद दिलाएंगे' },
  step2: { en: 'Complete your daily mindset lesson', hi: 'अपना दैनिक माइंडसेट पाठ पूरा करें' },
  step3: { en: 'Build a lasting habit in 21 days', hi: '21 दिनों में एक स्थायी आदत बनाएं' },
  morning: { en: 'Morning', hi: 'सुबह' },
  afternoon: { en: 'Afternoon', hi: 'दोपहर' },
  evening: { en: 'Evening', hi: 'शाम' },
  custom: { en: 'Custom', hi: 'कस्टम' },
  quickPick: { en: 'Quick Pick', hi: 'जल्दी चुनें' },
  openSettings: { en: 'Open browser settings to enable', hi: 'चालू करने के लिए ब्राउज़र सेटिंग्स खोलें' },
  dailySchedule: { en: 'Daily Notification Schedule', hi: 'दैनिक सूचना अनुसूची' },
  morningMotivation: { en: 'Morning Motivation', hi: 'सुबह की प्रेरणा' },
  middayNudge: { en: 'Midday Nudge', hi: 'दोपहर का संकेत' },
  eveningReflection: { en: 'Evening Reflection', hi: 'शाम का मनन' },
};

const PRESET_TIMES = [
  { id: 'morning', time: '07:00', icon: '🌅' },
  { id: 'afternoon', time: '13:00', icon: '☀️' },
  { id: 'evening', time: '20:00', icon: '🌙' },
];

const NotificationManager: React.FC<NotificationManagerProps> = ({ reminder, onSetReminder, lang }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    // Check which preset matches current time
    const matchingPreset = PRESET_TIMES.find(p => p.time === reminder.time);
    setSelectedPreset(matchingPreset?.id || 'custom');
  }, [reminder.time]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        onSetReminder({ ...reminder, enabled: true });
      }
    }
  };

  const handleAllowNotifications = async () => {
    setShowPermissionModal(false);
    await requestPermission();
  };

  const handleToggle = async () => {
    if (!reminder.enabled) {
      if (permission !== 'granted') {
        setShowPermissionModal(true);
      } else {
        onSetReminder({ ...reminder, enabled: true });
      }
    } else {
      onSetReminder({ ...reminder, enabled: false });
    }
  };

  const handleTimeChange = (time: string) => {
    onSetReminder({ ...reminder, time });
  };

  const handlePresetSelect = (presetId: string, time: string) => {
    setSelectedPreset(presetId);
    onSetReminder({ ...reminder, time, enabled: true });
  };

  const sendTestNotification = async () => {
    if (permission !== 'granted') {
      setShowPermissionModal(true);
      return;
    }

    try {
      // Show a sample evening reflection notification
      const title = lang === 'en' ? '🌙 Reflection Time - Test' : '🌙 मनन का समय - टेस्ट';
      const body = lang === 'en' 
        ? 'How did it feel to practice today? Click to open your journal!' 
        : 'आज प्रैक्टिस करके कैसा लगा? अपना जर्नल खोलने के लिए क्लिक करें!';

      await showNotification(title, body, '/home');

      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (e) {
      console.error('Notification error:', e);
    }
  };

  const getPermissionStatus = () => {
    if (permission === 'granted') {
      return {
        icon: <CheckCircle size={16} className="text-green-500" />,
        text: LABELS.permissionGranted[lang],
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
      };
    }
    if (permission === 'denied') {
      return {
        icon: <AlertCircle size={16} className="text-red-500" />,
        text: LABELS.permissionDenied[lang],
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
      };
    }
    return {
      icon: <Bell size={16} className="text-orange-500" />,
      text: LABELS.permissionDefault[lang],
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    };
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{LABELS.title[lang]}</h2>
            <p className="text-orange-100 text-sm">{LABELS.subtitle[lang]}</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Permission Status */}
        <div className={`flex items-center justify-between p-3 rounded-xl ${permissionStatus.bg}`}>
          <div className="flex items-center gap-2">
            {permissionStatus.icon}
            <span className={`text-sm font-medium ${permissionStatus.color}`}>
              {permissionStatus.text}
            </span>
          </div>
          {permission === 'denied' && (
            <button 
              onClick={() => window.open('app-settings:', '_self')}
              className="text-xs text-slate-500 underline"
            >
              {LABELS.openSettings[lang]}
            </button>
          )}
        </div>

        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center gap-3">
            {reminder.enabled ? (
              <Bell size={22} className="text-orange-500" />
            ) : (
              <BellOff size={22} className="text-slate-400" />
            )}
            <div>
              <p className="font-semibold dark:text-white">{LABELS.enableReminders[lang]}</p>
              <p className="text-sm text-slate-500">
                {reminder.enabled ? reminder.time : '--:--'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
              reminder.enabled ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                reminder.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Quick Time Presets */}
        {reminder.enabled && (
          <>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                {LABELS.quickPick[lang]}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_TIMES.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id, preset.time)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedPreset === preset.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{preset.icon}</div>
                    <div className="text-xs font-medium dark:text-white">
                      {LABELS[preset.id as keyof typeof LABELS]?.[lang] || preset.id}
                    </div>
                    <div className="text-xs text-slate-500">{preset.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Picker */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Clock size={20} className="text-slate-400" />
              <div className="flex-1">
                <p className="text-sm font-medium dark:text-white">{LABELS.custom[lang]}</p>
              </div>
              <input
                type="time"
                value={reminder.time}
                onChange={(e) => {
                  setSelectedPreset('custom');
                  handleTimeChange(e.target.value);
                }}
                className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </>
        )}

        {/* Test Notification Button */}
        <button
          onClick={sendTestNotification}
          disabled={testSent}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
            testSent
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {testSent ? (
            <>
              <CheckCircle size={18} />
              {LABELS.testSent[lang]}
            </>
          ) : (
            <>
              <Send size={18} />
              {LABELS.testNotification[lang]}
            </>
          )}
        </button>

        {/* Daily Notification Schedule */}
        {reminder.enabled && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {LABELS.dailySchedule[lang]}
            </p>
            <div className="space-y-2">
              {[
                { icon: <Sunrise size={16} />, label: LABELS.morningMotivation[lang], time: '07:00', emoji: '🌅' },
                { icon: <Sun size={16} />, label: LABELS.middayNudge[lang], time: '13:00', emoji: '☀️' },
                { icon: <Moon size={16} />, label: LABELS.eveningReflection[lang], time: '20:00', emoji: '🌙' },
              ].map((schedule, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{schedule.emoji}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{schedule.label}</span>
                  </div>
                  <span className="text-sm font-mono text-slate-500">{schedule.time}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
              {lang === 'en' ? 'Personalized based on your active journey' : 'आपकी सक्रिय यात्रा के आधार पर व्यक्तिगत'}
            </p>
          </div>
        )}

        {/* How It Works */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            {LABELS.howItWorks[lang]}
          </p>
          <div className="space-y-3">
            {[
              { icon: <Bell size={16} />, text: LABELS.step1[lang] },
              { icon: <Calendar size={16} />, text: LABELS.step2[lang] },
              { icon: <Zap size={16} />, text: LABELS.step3[lang] },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                  {step.icon}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Bell size={32} className="text-white" />
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
              {lang === 'en' ? 'Enable Notifications' : 'सूचनाएं चालू करें'}
            </h3>
            
            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6 text-sm">
              {lang === 'en' 
                ? 'Get daily reminders to complete your mindset lessons and stay on track with your 21-day journey.'
                : 'अपने माइंडसेट पाठ पूरे करने और 21 दिन की यात्रा पर बने रहने के लिए दैनिक रिमाइंडर पाएं।'}
            </p>
            
            {/* Benefits */}
            <div className="space-y-3 mb-6">
              {[
                { emoji: '🌅', text: lang === 'en' ? 'Morning motivation to start your day' : 'दिन शुरू करने के लिए सुबह की प्रेरणा' },
                { emoji: '⏰', text: lang === 'en' ? 'Midday nudge to complete lessons' : 'पाठ पूरा करने के लिए दोपहर का संकेत' },
                { emoji: '🌙', text: lang === 'en' ? 'Evening reflection reminders' : 'शाम के मनन रिमाइंडर' },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-lg">{benefit.emoji}</span>
                  <span className="text-slate-700 dark:text-slate-300">{benefit.text}</span>
                </div>
              ))}
            </div>
            
            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleAllowNotifications}
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors"
              >
                {lang === 'en' ? 'Allow Notifications' : 'सूचनाएं अनुमति दें'}
              </button>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
              >
                {lang === 'en' ? 'Not Now' : 'अभी नहीं'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
