import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, Sparkles, Target, Trophy, Clock, BookOpen, 
  CheckCircle, Star, Users, Zap, Heart, Shield,
  ChevronLeft, ChevronRight, Play, ArrowRight, Quote, Smartphone,
  Bell, Calendar, TrendingUp, Award, Flame, Globe, Menu, X
} from 'lucide-react';
import { trackPageView, trackLandingPageCTA } from '../services/analytics';

// Custom hook for scroll reveal animations
const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Animated counter component
const AnimatedCounter: React.FC<{ target: string; duration?: number }> = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const numericTarget = parseInt(target.replace(/\D/g, '')) || 0;
          const startTime = Date.now();
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * numericTarget));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration]);

  const suffix = target.replace(/[0-9]/g, '');
  return <span ref={ref}>{count}{suffix}</span>;
};

type RevealProps = {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
};

const Reveal: React.FC<RevealProps> = ({ children, delayMs = 0, className = '' }) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out will-change-transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
};

type TiltProps = {
  children: React.ReactNode;
  className?: string;
  maxDeg?: number;
};

const Tilt: React.FC<TiltProps> = ({ children, className = '', maxDeg = 8 }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 2 * maxDeg;
    const rotateX = (0.5 - py) * 2 * maxDeg;

    el.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
  };

  const handlePointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`will-change-transform [transform-style:preserve-3d] transition-transform duration-150 [transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] ${className}`}
    >
      {children}
    </div>
  );
};

const NAV_ITEMS: Array<{ id: string; label: string }> = [
  { id: 'features', label: 'Features' },
  { id: 'journeys', label: 'Journeys' },
  { id: 'how', label: 'How it works' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'install', label: 'Install' },
];

type LandingProps = {
  deferredPrompt?: any;
  onInstall?: () => void;
};

const Landing: React.FC<LandingProps> = ({ deferredPrompt, onInstall }) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('top');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroTab, setHeroTab] = useState<'lesson' | 'mission' | 'journal'>('lesson');
  const [activeHowStep, setActiveHowStep] = useState(0);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstallHelp, setShowIOSInstallHelp] = useState(false);

  const testimonialStartXRef = useRef<number | null>(null);
  const testimonialStartYRef = useRef<number | null>(null);
  const testimonialPointerIdRef = useRef<number | null>(null);
  const testimonialInteractingRef = useRef(false);
  const testimonialResumeTimerRef = useRef<number | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    setActiveSection(id);
    setMobileMenuOpen(false);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (id === 'top') {
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const handleInstall = () => {
    if (isStandalone) return;
    if (!deferredPrompt) {
      if (isIOS) {
        trackLandingPageCTA('Install App - Landing iOS Help');
        setShowIOSInstallHelp(true);
      }
      return;
    }
    trackLandingPageCTA('Install App - Landing');
    if (onInstall) {
      onInstall();
      return;
    }

    deferredPrompt.prompt();
    deferredPrompt.userChoice?.then(() => {});
  };

  const beginTestimonialInteraction = () => {
    testimonialInteractingRef.current = true;
    if (testimonialResumeTimerRef.current) {
      window.clearTimeout(testimonialResumeTimerRef.current);
    }
    testimonialResumeTimerRef.current = null;
  };

  const pauseTestimonials = () => {
    testimonialInteractingRef.current = true;
    if (testimonialResumeTimerRef.current) {
      window.clearTimeout(testimonialResumeTimerRef.current);
    }
    testimonialResumeTimerRef.current = window.setTimeout(() => {
      testimonialInteractingRef.current = false;
    }, 2500);
  };

  const goToTestimonial = (index: number) => {
    pauseTestimonials();
    const len = testimonials.length;
    if (len === 0) return;
    const next = ((index % len) + len) % len;
    setActiveTestimonial(next);
  };

  const nextTestimonial = () => {
    pauseTestimonials();
    setActiveTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    pauseTestimonials();
    setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleTestimonialPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    beginTestimonialInteraction();
    testimonialStartXRef.current = e.clientX;
    testimonialStartYRef.current = e.clientY;
    testimonialPointerIdRef.current = e.pointerId;
    if (e.pointerType === 'mouse') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleTestimonialPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (testimonialPointerIdRef.current !== e.pointerId) return;
    const startX = testimonialStartXRef.current;
    const startY = testimonialStartYRef.current;
    testimonialStartXRef.current = null;
    testimonialStartYRef.current = null;
    testimonialPointerIdRef.current = null;
    if (startX == null || startY == null) {
      pauseTestimonials();
      return;
    }

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const threshold = 48;

    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > threshold) {
      prevTestimonial();
      return;
    }
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -threshold) {
      nextTestimonial();
      return;
    }

    pauseTestimonials();
  };

  const handleTestimonialPointerCancel = () => {
    testimonialStartXRef.current = null;
    testimonialStartYRef.current = null;
    testimonialPointerIdRef.current = null;
    pauseTestimonials();
  };

  useEffect(() => {
    trackPageView(window.location.pathname, 'Landing Page');
    setIsVisible(true);

    const isStandaloneMode =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      (navigator as any).standalone;
    setIsStandalone(Boolean(isStandaloneMode));
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (testimonialResumeTimerRef.current) {
        window.clearTimeout(testimonialResumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!testimonials || testimonials.length < 2) return;

    const interval = setInterval(() => {
      if (testimonialInteractingRef.current) return;
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sectionIds = ['top', ...NAV_ITEMS.map(item => item.id)];
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (visible.length === 0) return;

        const best = visible.reduce((a, b) => (a.intersectionRatio > b.intersectionRatio ? a : b));
        setActiveSection(best.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.1, 0.2, 0.3, 0.4] }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hash = window.location.hash?.replace('#', '');
    if (!hash) return;

    const timer = window.setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    return () => window.clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: '21-Day Transformation Journeys',
      description: 'Neuroscience-backed programs meticulously designed to rewire your neural pathways, break limiting beliefs, and forge powerful new thinking patterns that stick for life.',
      color: 'from-purple-500 to-indigo-600',
      highlight: 'Based on habit formation research',
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Bite-sized Daily Lessons',
      description: 'Invest just 5 minutes a day to absorb wisdom distilled from best-selling books like Rich Dad Poor Dad, Atomic Habits, and The Power of Now—simplified for instant understanding.',
      color: 'from-orange-500 to-red-500',
      highlight: 'Wisdom from 50+ bestsellers',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Actionable Daily Missions',
      description: 'Theory without practice is useless. Each day includes practical micro-challenges that transform knowledge into real-world action and measurable results.',
      color: 'from-emerald-500 to-teal-600',
      highlight: 'Learn by doing',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Private Reflection Journal',
      description: 'Your personal growth diary stays 100% on your device. Document insights, track emotional patterns, and witness your transformation unfold day by day.',
      color: 'from-pink-500 to-rose-600',
      highlight: '100% private & secure',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Gamified Progress System',
      description: 'Stay motivated with XP points, achievement badges, streak counters, and level-ups. Turn self-improvement into an engaging game you actually want to play.',
      color: 'from-amber-500 to-orange-600',
      highlight: 'Unlock 20+ badges',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: '11 Languages',
      description: 'Complete content available in 11 languages. Switch anytime and learn in the language that feels most natural to you.',
      color: 'from-blue-500 to-cyan-600',
      highlight: '11 languages supported',
    },
  ];

  const canInstall = !isStandalone && Boolean(deferredPrompt || isIOS);

  const journeys = [
    { moduleId: 'financial', title: 'Financial Freedom', emoji: '💰', days: 21, description: 'Master the wealth mindset with lessons from Rich Dad Poor Dad and Think & Grow Rich', book: 'Rich Dad Poor Dad' },
    { moduleId: 'health', title: 'Health & Vitality', emoji: '💪', days: 21, description: 'Build sustainable healthy habits using principles from Atomic Habits', book: 'Atomic Habits' },
    { moduleId: 'confidence', title: 'Unshakeable Confidence', emoji: '🦁', days: 21, description: 'Overcome fear, self-doubt and imposter syndrome once and for all', book: 'The Confidence Gap' },
    { moduleId: 'productivity', title: 'Peak Productivity', emoji: '🚀', days: 21, description: 'Master deep work and achieve 10x more with proven time management techniques', book: 'Deep Work' },
    { moduleId: 'spirituality', title: 'Inner Peace', emoji: '🧘', days: 21, description: 'Find lasting calm and mental clarity through mindfulness practices', book: 'The Power of Now' },
    { moduleId: 'relationships', title: 'Better Relationships', emoji: '❤️', days: 21, description: 'Transform how you connect with family, friends and colleagues', book: 'How to Win Friends' },
  ];

  const testimonials = [
    {
      name: 'Priya S.',
      role: 'Entrepreneur',
      text: 'This app changed how I think about money. The daily lessons are so simple yet powerful!',
      avatar: '👩‍💼',
    },
    {
      name: 'Rahul M.',
      role: 'Student',
      text: 'I used to procrastinate everything. After 21 days, I actually look forward to my tasks.',
      avatar: '👨‍🎓',
    },
    {
      name: 'Anita K.',
      role: 'Working Professional',
      text: 'The Hindi content is amazing. Finally, self-improvement in my mother tongue!',
      avatar: '👩‍💻',
    },
  ];

  const stats = [
    { number: '21', label: 'Days to Transform', icon: <Calendar className="w-5 h-5" /> },
    { number: '5', label: 'Minutes per Day', icon: <Clock className="w-5 h-5" /> },
    { number: '10+', label: 'Life Areas', icon: <Target className="w-5 h-5" /> },
    { number: '100%', label: 'Free Forever', icon: <Heart className="w-5 h-5" /> },
  ];

  const howSteps = [
    {
      step: '01',
      title: 'Read the Story',
      description: 'Each day brings a powerful concept wrapped in an engaging story. No boring lectures!',
      icon: <BookOpen className="w-5 h-5" />,
      time: '3 min',
      accent: 'from-emerald-500 to-teal-600',
      label: "TODAY'S STORY",
      preview: 'A short, high-impact story that makes the idea stick—fast.',
    },
    {
      step: '02',
      title: 'Complete Your Mission',
      description: 'A tiny action that takes the learning from your head to your hands.',
      icon: <Target className="w-5 h-5" />,
      time: '1 min',
      accent: 'from-amber-500 to-orange-600',
      label: "YOUR MISSION",
      preview: 'One micro-action to build confidence and momentum today.',
    },
    {
      step: '03',
      title: 'Reflect & Grow',
      description: 'Write your thoughts. Watch yourself transform as you journal your journey.',
      icon: <Heart className="w-5 h-5" />,
      time: '1 min',
      accent: 'from-purple-500 to-indigo-600',
      label: 'PRIVATE JOURNAL',
      preview: 'Capture insights and patterns—saved locally on your device.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 z-50 transition-all duration-150"
        style={{ width: `${Math.min((scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1)) * 100, 100)}%` }}
      />

      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => scrollToSection('top')}
              className="flex items-center gap-2"
              aria-label="Go to top"
            >
              <img src="/logo.svg" alt="Lapaas" className="w-8 h-8 rounded-lg" />
              <span className="font-bold tracking-wide">LAPAAS MINDSET</span>
            </button>

            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeSection === item.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/home"
                onClick={() => trackLandingPageCTA('Start Free Journey - Navbar')}
                className="hidden sm:inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-4 py-2 rounded-xl text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:scale-105"
              >
                Start
              </Link>

              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileMenuOpen(v => !v)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur">
            <div className="px-6 py-4 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => scrollToSection('top')}
                className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeSection === 'top'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                Overview
              </button>

              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeSection === item.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-3">
                <Link
                  to="/home"
                  onClick={() => trackLandingPageCTA('Start Free Journey - Navbar Mobile')}
                  className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-4 py-3 rounded-xl text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  Start Free Journey
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="top" className="relative scroll-mt-24 min-h-screen flex items-center justify-center px-6 pt-28 pb-20">
        {/* Animated Background with Parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
            style={{ transform: `translateY(${scrollY * -0.2}px)` }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/5 to-purple-500/5 rounded-full blur-3xl"
            style={{ transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.0005})` }}
          />
        </div>

        <div className={`relative z-10 max-w-6xl mx-auto w-full transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              {/* Logo */}
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-8">
                <img src="/logo.svg" alt="Lapaas" className="w-8 h-8 rounded-lg" />
                <span className="text-orange-400 font-semibold">LAPAAS MINDSET</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Mindset in 21 Days
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Unlock your potential with bite-sized lessons from world-famous books.
                Just 5 minutes a day to build habits that last a lifetime.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <Link
                  to="/home"
                  onClick={() => trackLandingPageCTA('Start Free Journey - Hero')}
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:scale-105"
                >
                  Start Free Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('how');
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-slate-700 transition-all"
                >
                  <Play className="w-5 h-5" />
                  See How It Works
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10 text-sm">
                <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full px-3 py-1 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-orange-400" />
                  5 min/day
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full px-3 py-1 text-slate-300">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Private on-device
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full px-3 py-1 text-slate-300">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  11 languages
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4 hover:border-orange-500/30 transition-all hover:scale-105">
                    <div className="flex items-center justify-center lg:justify-start gap-2 text-orange-400 mb-1">
                      {stat.icon}
                      <span className="text-2xl font-black">
                        <AnimatedCounter target={stat.number} />
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="hidden md:flex flex-col items-end gap-2 mb-3">
                <div className="inline-flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200">
                  <Users className="w-4 h-4 text-amber-400" />
                  Built for consistency
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200">
                  <Zap className="w-4 h-4 text-blue-400" />
                  Instant start
                </div>
              </div>

              <Tilt maxDeg={6}>
                <div className="relative bg-slate-900/60 backdrop-blur border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-black">L</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">Day 5 • Confidence</p>
                        <p className="text-xs text-slate-500">5 minutes • Works offline</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        5
                      </div>
                      <div className="inline-flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        240
                      </div>
                      <div className="hidden sm:inline-flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        Badge
                      </div>
                    </div>
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-5">
                    <div className="h-full w-1/4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setHeroTab('lesson')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        heroTab === 'lesson'
                          ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Lesson
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroTab('mission')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        heroTab === 'mission'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Target className="w-4 h-4" />
                        Mission
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroTab('journal')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        heroTab === 'journal'
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4" />
                        Journal
                      </span>
                    </button>
                  </div>

                  <div className="relative bg-slate-950/60 border border-slate-800 rounded-2xl p-4 min-h-[190px]">
                    {heroTab === 'lesson' && (
                      <div key="lesson" style={{ animation: 'fadeInUp 0.35s ease-out' }} className="space-y-3">
                        <div className="text-xs font-bold text-orange-400">TODAY'S BIG QUESTION</div>
                        <div className="text-sm text-slate-200 leading-relaxed">
                          What belief is quietly limiting your confidence right now?
                        </div>
                        <div className="text-xs text-slate-500">Based on “The Confidence Gap”</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          One idea. One action. Real change.
                        </div>
                      </div>
                    )}
                    {heroTab === 'mission' && (
                      <div key="mission" style={{ animation: 'fadeInUp 0.35s ease-out' }} className="space-y-3">
                        <div className="text-xs font-bold text-emerald-400">YOUR 1-MINUTE MISSION</div>
                        <div className="text-sm text-slate-200 leading-relaxed">
                          Do one small thing you’ve been avoiding. Start with 60 seconds.
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          Tap to mark complete (in the app)
                        </div>
                        <div className="inline-flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300">
                          <Clock className="w-4 h-4 text-amber-400" />
                          Estimated time: 1 minute
                        </div>
                      </div>
                    )}
                    {heroTab === 'journal' && (
                      <div key="journal" style={{ animation: 'fadeInUp 0.35s ease-out' }} className="space-y-3">
                        <div className="text-xs font-bold text-purple-300">PRIVATE REFLECTION</div>
                        <div className="text-sm text-slate-200 leading-relaxed">
                          “When I feel stuck, I usually tell myself…”
                        </div>
                        <div className="text-xs text-slate-500">Saved locally on your device.</div>
                        <div className="inline-flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          100% private
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/home"
                      onClick={() => trackLandingPageCTA('Open App - Hero Preview')}
                      className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-5 py-3 rounded-2xl text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                    >
                      Open App
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => scrollToSection('journeys')}
                      className="inline-flex items-center justify-center gap-2 bg-slate-950/40 border border-slate-800 text-slate-200 font-bold px-5 py-3 rounded-2xl text-sm hover:bg-slate-900 transition-colors"
                    >
                      Pick a Journey
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Tilt>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-orange-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-24 py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-orange-500/10 text-orange-400 text-sm font-bold px-4 py-2 rounded-full mb-4">
              FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything You Need to
              <span className="text-orange-400"> Level Up</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete system designed to transform how you think, act, and grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Reveal key={i} delayMs={i * 80} className="h-full">
                <Tilt className="h-full">
                  <div className="h-full group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">{feature.title}</h3>
                    <p className="text-slate-400 mb-3 leading-relaxed">{feature.description}</p>
                    {feature.highlight && (
                      <span className="inline-block text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">
                        {feature.highlight}
                      </span>
                    )}
                  </div>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Journeys Section */}
      <section id="journeys" className="scroll-mt-24 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-purple-500/10 text-purple-400 text-sm font-bold px-4 py-2 rounded-full mb-4">
              JOURNEYS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Choose Your
              <span className="text-purple-400"> Adventure</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Multiple paths to transformation. Pick what matters most to you right now.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {journeys.map((journey, i) => (
              <Reveal key={journey.moduleId} delayMs={i * 90} className="h-full">
                <Tilt className="h-full">
                  <Link
                    to={`/module/${journey.moduleId}`}
                    onClick={() => trackLandingPageCTA(`Journey Card - ${journey.moduleId}`)}
                    className="block h-full group bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{journey.emoji}</span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">
                        {journey.days} DAYS
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-purple-400 transition-colors">
                      {journey.title}
                    </h3>
                    <p className="text-sm text-slate-500">{journey.description}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-400 group-hover:text-purple-300 transition-colors">
                      Start this journey
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </Tilt>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-500">+ More journeys added regularly</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="scroll-mt-24 py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-500/10 text-emerald-400 text-sm font-bold px-4 py-2 rounded-full mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Simple. <span className="text-emerald-400">Effective.</span> Fun.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-3">
              {howSteps.map((item, i) => (
                <Reveal key={item.step} delayMs={i * 120}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveHowStep(i);
                      trackLandingPageCTA(`How It Works Step - ${item.step}`);
                    }}
                    className={`w-full text-left group border rounded-2xl p-5 transition-all ${
                      i === activeHowStep
                        ? 'bg-slate-900/70 border-emerald-500/40 shadow-xl shadow-emerald-500/10'
                        : 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 bg-gradient-to-br ${item.accent} rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-105`}>
                          {item.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <h3 className={`text-lg font-bold transition-colors ${i === activeHowStep ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                            {item.title}
                          </h3>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                            ~{item.time}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal delayMs={150}>
              <Tilt maxDeg={6}>
                <div className="relative bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${howSteps[activeHowStep].accent} rounded-2xl flex items-center justify-center text-white`}>
                      {howSteps[activeHowStep].icon}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-500">STEP {howSteps[activeHowStep].step}</div>
                      <div className="text-xs text-slate-500">~{howSteps[activeHowStep].time}</div>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-emerald-400 mb-2">{howSteps[activeHowStep].label}</div>
                  <h3 className="text-2xl font-black mb-3">{howSteps[activeHowStep].title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">{howSteps[activeHowStep].preview}</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-10 h-10 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-center text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      Bite-sized, high-impact, designed for consistency
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-10 h-10 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-center text-amber-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      Under 5 minutes total — no overwhelm
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-10 h-10 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-center text-purple-300">
                        <Shield className="w-5 h-5" />
                      </div>
                      Your journal stays private on your device
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/home"
                      onClick={() => trackLandingPageCTA('Try It Now - How It Works')}
                      className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-5 py-3 rounded-2xl text-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                    >
                      Try It Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => scrollToSection('journeys')}
                      className="inline-flex items-center justify-center gap-2 bg-slate-950/40 border border-slate-800 text-slate-200 font-bold px-5 py-3 rounded-2xl text-sm hover:bg-slate-900 transition-colors"
                    >
                      Choose a Journey
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="scroll-mt-24 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-amber-500/10 text-amber-400 text-sm font-bold px-4 py-2 rounded-full mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl md:text-5xl font-black">
              Loved by <span className="text-amber-400">Thousands</span>
            </h2>
          </div>

          <Reveal>
            <Tilt maxDeg={6}>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 md:p-12">
                <Quote className="absolute top-6 left-6 w-12 h-12 text-orange-500/20" />

                <div
                  className="relative z-10 touch-pan-y"
                  onPointerDown={handleTestimonialPointerDown}
                  onPointerUp={handleTestimonialPointerUp}
                  onPointerCancel={handleTestimonialPointerCancel}
                  onPointerLeave={handleTestimonialPointerCancel}
                >
                  <div key={activeTestimonial} style={{ animation: 'fadeInUp 0.35s ease-out' }}>
                    <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
                      "{testimonials[activeTestimonial].text}"
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center text-2xl">
                        {testimonials[activeTestimonial].avatar}
                      </div>
                      <div>
                        <p className="font-bold">{testimonials[activeTestimonial].name}</p>
                        <p className="text-slate-500 text-sm">{testimonials[activeTestimonial].role}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevTestimonial();
                  }}
                  className="hidden md:inline-flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl border border-slate-700 bg-slate-950/60 hover:bg-slate-900/70 transition-colors items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextTestimonial();
                  }}
                  className="hidden md:inline-flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl border border-slate-700 bg-slate-950/60 hover:bg-slate-900/70 transition-colors items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToTestimonial(i)}
                      className={`w-2 h-2 rounded-full transition-all hover:bg-slate-500 ${
                        i === activeTestimonial ? 'w-8 bg-orange-500' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Tilt>
          </Reveal>
        </div>
      </section>

      {/* App Features */}
      <section id="install" className="scroll-mt-24 py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
            <div>
              <span className="inline-block bg-blue-500/10 text-blue-400 text-sm font-bold px-4 py-2 rounded-full mb-4">
                MOBILE APP
              </span>
              <h2 className="text-4xl font-black mb-6">
                Your Pocket
                <span className="text-blue-400"> Life Coach</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                Install the app on your phone for the best experience. Works offline, sends reminders, and fits right in your pocket.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Smartphone />, text: 'Install as app on any device' },
                  { icon: <Bell />, text: 'Daily reminders at your time' },
                  { icon: <Shield />, text: 'Works offline, no internet needed' },
                  { icon: <Zap />, text: 'Lightning fast, no downloads' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                      {item.icon}
                    </div>
                    <span className="text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                {isStandalone ? (
                  <div className="inline-flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold px-5 py-3 rounded-2xl text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Installed
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstall}
                    disabled={!canInstall}
                    className={`inline-flex items-center justify-center gap-2 font-bold px-5 py-3 rounded-2xl text-sm transition-all ${
                      canInstall
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/20'
                        : 'bg-slate-950/40 border border-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    Install App
                  </button>
                )}

                <Link
                  to="/home"
                  onClick={() => trackLandingPageCTA('Open App - Install Section')}
                  className="inline-flex items-center justify-center gap-2 bg-slate-950/40 border border-slate-800 text-slate-200 font-bold px-5 py-3 rounded-2xl text-sm hover:bg-slate-900 transition-colors"
                >
                  Open App
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {!isStandalone && !canInstall && !isIOS && (
                <div className="mt-3 text-sm text-slate-500">
                  Install is available in supported browsers (Chrome/Edge on Android/Desktop).
                </div>
              )}
            </div>
            </Reveal>

            <Reveal delayMs={150}>
              <Tilt maxDeg={6}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                  <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-4 shadow-2xl">
                    <div className="bg-slate-950 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-black">L</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">Good morning!</p>
                          <p className="text-xs text-slate-500">Ready for Day 5?</p>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-1/4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['🔥 5', '📖 12', '⭐ 240'].map((stat, i) => (
                          <div key={i} className="bg-slate-800 rounded-lg p-2 text-center text-xs">
                            {stat}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <Tilt maxDeg={6}>
              <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-3xl p-12">
                <h2 className="text-4xl md:text-5xl font-black mb-4">
                  Ready to Transform?
                </h2>
                <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
                  Join thousands who are already building better mindsets.
                  Start your free 21-day journey today.
                </p>
                <Link
                  to="/home"
                  onClick={() => trackLandingPageCTA('Start Building Your Mindset - Final CTA')}
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-10 py-5 rounded-2xl text-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:scale-105"
                >
                  Start Building Your Mindset
                  <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </Link>
                <p className="text-slate-500 text-sm mt-4">
                  No credit card required • 100% Free • Start in 30 seconds
                </p>
              </div>
            </Tilt>
          </Reveal>
        </div>
      </section>

      {showIOSInstallHelp && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowIOSInstallHelp(false)}
            className="absolute inset-0 bg-black/60"
          />

          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-sm font-bold text-orange-400">INSTALL ON iPHONE / iPAD</div>
                <div className="text-2xl font-black">Add to Home Screen</div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowIOSInstallHelp(false)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-slate-300">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                <div className="text-sm font-bold mb-1">1. Open in Safari</div>
                <div className="text-sm text-slate-400">Install works from Safari, not inside other in-app browsers.</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                <div className="text-sm font-bold mb-1">2. Tap Share</div>
                <div className="text-sm text-slate-400">Use the Share button in Safari’s toolbar.</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
                <div className="text-sm font-bold mb-1">3. Add to Home Screen</div>
                <div className="text-sm text-slate-400">Choose “Add to Home Screen” to install the app.</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowIOSInstallHelp(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-5 py-3 rounded-2xl text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all"
              >
                Got it
                <CheckCircle className="w-4 h-4" />
              </button>
              <Link
                to="/home"
                onClick={() => trackLandingPageCTA('Open App - iOS Install Help')}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900/40 border border-slate-800 text-slate-200 font-bold px-5 py-3 rounded-2xl text-sm hover:bg-slate-900 transition-colors"
              >
                Open App
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Lapaas" className="w-8 h-8 rounded-lg" />
              <span className="font-bold">LAPAAS MINDSET</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 Lapaas. Made with ❤️ for your growth.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-slate-500 hover:text-orange-400 transition-colors text-sm">Privacy</Link>
              <Link to="/terms" className="text-slate-500 hover:text-orange-400 transition-colors text-sm">Terms</Link>
              <Link to="/contact" className="text-slate-500 hover:text-orange-400 transition-colors text-sm">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
