
import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getStorageData, setLanguagePreference, setThemePreference, setReminderPreference, resetApp } from './services/storage';
import { UserState, Theme, ReminderSettings } from './types';
import { UI_LABELS, MODULES } from './constants';
import { checkAndTriggerNotifications, getNotificationContent, showNotification, NOTIFICATION_TIMES, setupNativeNotificationListener, isNativePlatform, scheduleNativeDailyNotifications } from './services/notifications';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import ModuleDetail from './pages/ModuleDetail';
import DayView from './pages/DayView';
import ReviewModule from './pages/ReviewModule';
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import InstallPrompt from './components/InstallPrompt';

const Layout: React.FC<{ 
  children: React.ReactNode, 
  userState: UserState, 
  onToggleLang: () => void,
  deferredPrompt: any,
  setShowInstallPrompt: (show: boolean) => void 
}> = ({ children, userState, onToggleLang, deferredPrompt, setShowInstallPrompt }) => {
  const location = useLocation();
  const isImmersive = location.pathname === '/' || location.pathname.includes('/day/') || location.pathname.includes('/onboarding') || location.pathname.includes('/landing') || location.pathname.includes('/privacy') || location.pathname.includes('/terms') || location.pathname.includes('/contact');
  const showNav = userState.hasCompletedOnboarding && !isImmersive;
  
  // Use a ref to track if we've shown the prompt in this session to avoid spamming on navigation
  const hasShownPromptRef = useRef(false);

  useEffect(() => {
    // Check if we are on any day view (e.g. /module/x/day/y)
    const isDayView = location.pathname.includes('/day/');
    
    if (deferredPrompt && isDayView && !hasShownPromptRef.current) {
       // Add a small delay so it doesn't appear immediately upon page load
       const timer = setTimeout(() => {
           setShowInstallPrompt(true);
           hasShownPromptRef.current = true;
       }, 3000);
       return () => clearTimeout(timer);
    }
  }, [location, deferredPrompt, setShowInstallPrompt]);

  return (
    <>
      {!isImmersive && <Header currentLang={userState.language} onToggleLang={onToggleLang} />}
      <div className={showNav ? 'pb-20' : ''}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </>
  );
};

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const lastNotifiedRef = useRef<string | null>(null);

  const loadData = () => {
    const data = getStorageData();
    setUserState(data);
  };

  useEffect(() => {
    // Initial Load
    loadData();
    
    // Setup native notification listener for mobile
    if (isNativePlatform()) {
      setupNativeNotificationListener();
    }
  }, []);

  // Theme Management Effect
  useEffect(() => {
    if (!userState) return;

    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isSystemDark = mediaQuery.matches;
      const shouldBeDark = userState.theme === 'dark' || (userState.theme === 'system' && isSystemDark);
      if (shouldBeDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    applyTheme();
    if (userState.theme === 'system') {
        mediaQuery.addEventListener('change', applyTheme);
        return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [userState?.theme]);

  // Reminder Notification Logic - Enhanced with journey-specific notifications
  useEffect(() => {
      if (!userState || !userState.reminder.enabled) return;
      
      // Get active journeys for personalized notifications
      const getActiveJourneys = () => {
        return Object.entries(userState.progress)
          .filter(([_, progress]) => {
            const p = progress as { completedDays: number[] } | undefined;
            return p && p.completedDays && p.completedDays.length > 0 && p.completedDays.length < 21;
          })
          .map(([moduleId, progress]) => {
            const p = progress as { completedDays: number[] };
            return {
              moduleId,
              currentDay: Math.max(...p.completedDays) + 1
            };
          });
      };

      const checkReminder = async () => {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
          
          if (lastNotifiedRef.current === currentTime) return;
          if (Notification.permission !== 'granted') return;

          const activeJourneys = getActiveJourneys();
          
          // Check for scheduled notification times (morning, midday, evening)
          let notificationType: 'morning' | 'midday' | 'evening' | null = null;
          
          if (currentHour === NOTIFICATION_TIMES.morning.hour && currentMinute >= 0 && currentMinute < 5) {
            notificationType = 'morning';
          } else if (currentHour === NOTIFICATION_TIMES.midday.hour && currentMinute >= 0 && currentMinute < 5) {
            notificationType = 'midday';
          } else if (currentHour === NOTIFICATION_TIMES.evening.hour && currentMinute >= 0 && currentMinute < 5) {
            notificationType = 'evening';
          }

          // Check if it's the user's custom reminder time
          const isCustomReminderTime = currentTime === userState.reminder.time;

          if (notificationType && activeJourneys.length > 0) {
            // Send journey-specific notification with redirect URL
            const journey = activeJourneys[0];
            const content = getNotificationContent(
              journey.moduleId,
              journey.currentDay,
              notificationType,
              userState.language
            );
            await showNotification(content.title, content.body, content.url);
            lastNotifiedRef.current = currentTime;
          } else if (isCustomReminderTime) {
            // Send generic reminder at user's custom time - redirect to home
            const title = UI_LABELS.reminderTitle[userState.language];
            const body = UI_LABELS.reminderBody[userState.language];
            await showNotification(title, body, '/home');
            lastNotifiedRef.current = currentTime;
          }
      };
      
      const intervalId = setInterval(checkReminder, 30000);
      checkReminder();
      return () => clearInterval(intervalId);
  }, [userState?.reminder.enabled, userState?.reminder.time, userState?.language, userState?.progress]);

  // Install Prompt Logic
  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const toggleLanguage = () => { if (!userState) return; const updated = setLanguagePreference(userState.language === 'en' ? 'hi' : 'en'); setUserState(updated); };
  const handleSetTheme = (newTheme: Theme) => { const updated = setThemePreference(newTheme); setUserState(updated); };
  const handleSetReminder = (settings: ReminderSettings) => { const updated = setReminderPreference(settings); setUserState(updated); };
  const handleResetApp = () => { resetApp(); loadData(); };

  const handleInstallClick = () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
          setDeferredPrompt(null);
          setShowInstallPrompt(false);
      });
  };

  if (!userState) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-100 selection:text-orange-900 pb-safe transition-colors duration-300">
        <Layout userState={userState} onToggleLang={toggleLanguage} deferredPrompt={deferredPrompt} setShowInstallPrompt={setShowInstallPrompt}>
            <Routes>
            <Route path="/" element={userState.hasCompletedOnboarding ? <Home userState={userState} /> : <Landing />} />
            <Route path="/home" element={userState.hasCompletedOnboarding ? <Home userState={userState} /> : <Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<Onboarding lang={userState.language} onComplete={loadData} />} />
            <Route path="/journal" element={<Journal userState={userState} />} />
            <Route path="/profile" element={<Profile userState={userState} installPrompt={deferredPrompt} onToggleLang={toggleLanguage} onReset={handleResetApp} onSetTheme={handleSetTheme} onSetReminder={handleSetReminder} onUpdate={loadData} />} />
            <Route path="/module/:moduleId" element={<ModuleDetail userState={userState} onUpdate={loadData} />} />
            <Route path="/module/:moduleId/day/:dayNumber" element={<DayView userState={userState} onUpdate={loadData} onToggleLang={toggleLanguage} />} />
            <Route path="/module/:moduleId/review" element={<ReviewModule userState={userState} />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
        {showInstallPrompt && <InstallPrompt onInstall={handleInstallClick} onDismiss={() => setShowInstallPrompt(false)} lang={userState.language} />}
      </div>
    </BrowserRouter>
  );
};
export default App;
