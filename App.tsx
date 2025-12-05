
import React, { useEffect, useState, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getStorageData, setLanguagePreference, setThemePreference, setReminderPreference, resetApp } from './services/storage';
import { UserState, Theme, ReminderSettings, ModuleProgress } from './types';
import { UI_LABELS } from './constants';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import ModuleDetail from './pages/ModuleDetail';
import DayView from './pages/DayView';
import ReviewModule from './pages/ReviewModule';
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import InstallPrompt from './components/InstallPrompt';

// Layout wrapper to handle conditional rendering of Nav elements based on route
// Also handles the install prompt trigger logic for Day 1
const Layout: React.FC<{ 
  children: React.ReactNode, 
  userState: UserState, 
  onToggleLang: () => void,
  deferredPrompt: any,
  setShowInstallPrompt: (show: boolean) => void 
}> = ({ children, userState, onToggleLang, deferredPrompt, setShowInstallPrompt }) => {
  const location = useLocation();
  // Hide header and bottom nav on DayView for immersion, and Onboarding
  const isImmersive = location.pathname.includes('/day/') || location.pathname.includes('/onboarding');
  const showNav = userState.hasCompletedOnboarding && !isImmersive;

  useEffect(() => {
    // Check if we are on Day 1 of any module (ends with /day/1)
    if (deferredPrompt && location.pathname.match(/\/day\/1$/)) {
       setShowInstallPrompt(true);
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
    loadData();
  }, []);

  // Theme Management Effect
  useEffect(() => {
    if (!userState) return;

    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isSystemDark = mediaQuery.matches;
      const shouldBeDark = userState.theme === 'dark' || (userState.theme === 'system' && isSystemDark);

      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system changes only if theme is set to system
    if (userState.theme === 'system') {
        mediaQuery.addEventListener('change', applyTheme);
        return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [userState?.theme]);

  // Reminder Notification Logic
  useEffect(() => {
      if (!userState || !userState.reminder.enabled) return;

      const checkReminder = () => {
          const now = new Date();
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const currentTime = `${hours}:${minutes}`;

          // Avoid duplicate notifications in same minute
          if (lastNotifiedRef.current === currentTime) return;

          if (currentTime === userState.reminder.time) {
             if (Notification.permission === 'granted') {
                 const title = UI_LABELS.reminderTitle[userState.language];
                 const options = {
                     body: UI_LABELS.reminderBody[userState.language],
                     icon: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg',
                     badge: 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain-circuit.svg',
                     tag: 'daily-reminder',
                     requireInteraction: true,
                     renotify: true
                 };

                 try {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.showNotification(title, options);
                        });
                    } else {
                        new Notification(title, options);
                    }
                    lastNotifiedRef.current = currentTime;
                 } catch (e) {
                    console.error("Notification failed", e);
                 }
             }
          }
      };

      // Check every 30 seconds to be more precise but respect lastNotifiedRef
      const intervalId = setInterval(checkReminder, 30000);
      
      // Also check immediately
      checkReminder();

      return () => clearInterval(intervalId);
  }, [userState?.reminder.enabled, userState?.reminder.time, userState?.language]);

  // Install Prompt Logic
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Removed initial logic that checked for progress to show prompt immediately
      // Now handled in Layout based on route
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const toggleLanguage = () => {
    if (!userState) return;
    const newLang = userState.language === 'en' ? 'hi' : 'en';
    const updated = setLanguagePreference(newLang);
    setUserState(updated);
  };

  const handleSetTheme = (newTheme: Theme) => {
     const updated = setThemePreference(newTheme);
     setUserState(updated);
  };

  const handleSetReminder = (settings: ReminderSettings) => {
      const updated = setReminderPreference(settings);
      setUserState(updated);
  };

  const handleResetApp = () => {
      resetApp();
      loadData();
  };

  const handleInstallClick = () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
          } else {
              console.log('User dismissed the install prompt');
          }
          setDeferredPrompt(null);
          setShowInstallPrompt(false);
      });
  };

  const handleDismissInstall = () => {
      setShowInstallPrompt(false);
  };

  if (!userState) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-100 selection:text-orange-900 pb-safe transition-colors duration-300">
        <Layout 
            userState={userState} 
            onToggleLang={toggleLanguage}
            deferredPrompt={deferredPrompt}
            setShowInstallPrompt={setShowInstallPrompt}
        >
            <Routes>
            <Route 
                path="/" 
                element={
                userState.hasCompletedOnboarding 
                    ? <Home userState={userState} />
                    : <Navigate to="/onboarding" replace />
                } 
            />
            <Route 
                path="/onboarding" 
                element={
                <Onboarding 
                    lang={userState.language} 
                    onComplete={loadData} 
                />
                } 
            />
            <Route 
                path="/journal" 
                element={<Journal userState={userState} />} 
            />
            <Route 
                path="/profile" 
                element={
                    <Profile 
                        userState={userState} 
                        onToggleLang={toggleLanguage} 
                        onReset={handleResetApp} 
                        onSetTheme={handleSetTheme}
                        onSetReminder={handleSetReminder}
                        onUpdate={loadData}
                    />
                } 
            />
            <Route 
                path="/module/:moduleId" 
                element={<ModuleDetail userState={userState} onUpdate={loadData} />} 
            />
            <Route 
                path="/module/:moduleId/day/:dayNumber" 
                element={<DayView userState={userState} onUpdate={loadData} onToggleLang={toggleLanguage} />} 
            />
            <Route 
                path="/module/:moduleId/review" 
                element={<ReviewModule userState={userState} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
        
        {showInstallPrompt && (
            <InstallPrompt 
                onInstall={handleInstallClick} 
                onDismiss={handleDismissInstall} 
                lang={userState.language} 
            />
        )}
      </div>
    </HashRouter>
  );
};

export default App;
