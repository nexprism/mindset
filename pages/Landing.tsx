import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, Sparkles, Target, Trophy, Clock, BookOpen, 
  CheckCircle, Star, Users, Zap, Heart, Shield,
  ChevronRight, Play, ArrowRight, Quote, Smartphone,
  Bell, Calendar, TrendingUp, Award, Flame, Globe
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

const Landing: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    trackPageView('/', 'Landing Page');
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
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
      title: 'Full Bilingual Experience',
      description: 'Complete content available in both English and Hindi. Switch languages anytime and learn in the language that resonates with your heart and mind.',
      color: 'from-blue-500 to-cyan-600',
      highlight: 'English & हिंदी',
    },
  ];

  const journeys = [
    { title: 'Financial Freedom', emoji: '💰', days: 21, description: 'Master the wealth mindset with lessons from Rich Dad Poor Dad and Think & Grow Rich', book: 'Rich Dad Poor Dad' },
    { title: 'Health & Vitality', emoji: '💪', days: 21, description: 'Build sustainable healthy habits using principles from Atomic Habits', book: 'Atomic Habits' },
    { title: 'Unshakeable Confidence', emoji: '🦁', days: 21, description: 'Overcome fear, self-doubt and imposter syndrome once and for all', book: 'The Confidence Gap' },
    { title: 'Peak Productivity', emoji: '🚀', days: 21, description: 'Master deep work and achieve 10x more with proven time management techniques', book: 'Deep Work' },
    { title: 'Inner Peace', emoji: '🧘', days: 21, description: 'Find lasting calm and mental clarity through mindfulness practices', book: 'The Power of Now' },
    { title: 'Better Relationships', emoji: '❤️', days: 21, description: 'Transform how you connect with family, friends and colleagues', book: 'How to Win Friends' },
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
        style={{ width: `${Math.min((scrollY / (document.body.scrollHeight - window.innerHeight)) * 100, 100)}%` }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
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

        <div className={`relative z-10 max-w-4xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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

          <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Unlock your potential with bite-sized lessons from world-famous books. 
            Just 5 minutes a day to build habits that last a lifetime.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/home"
              onClick={() => trackLandingPageCTA('Start Free Journey - Hero')}
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:scale-105"
            >
              Start Free Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-slate-700 transition-all"
            >
              <Play className="w-5 h-5" />
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4 hover:border-orange-500/30 transition-all hover:scale-105">
                <div className="flex items-center justify-center gap-2 text-orange-400 mb-1">
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-orange-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
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
              <div
                key={i}
                className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10"
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0
                }}
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* Journeys Section */}
      <section className="py-20 px-6">
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
              <div
                key={i}
                className="group bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
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
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-500">+ More journeys added regularly</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-500/10 text-emerald-400 text-sm font-bold px-4 py-2 rounded-full mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Simple. <span className="text-emerald-400">Effective.</span> Fun.
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '01',
                title: 'Read the Story',
                description: 'Each day brings a powerful concept wrapped in an engaging story. No boring lectures!',
                icon: <BookOpen className="w-6 h-6" />,
                time: '3 min',
              },
              {
                step: '02',
                title: 'Complete Your Mission',
                description: 'A tiny action that takes the learning from your head to your hands.',
                icon: <Target className="w-6 h-6" />,
                time: '1 min',
              },
              {
                step: '03',
                title: 'Reflect & Grow',
                description: 'Write your thoughts. Watch yourself transform as you journal your journey.',
                icon: <Heart className="w-6 h-6" />,
                time: '1 min',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      ~{item.time}
                    </span>
                  </div>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-amber-500/10 text-amber-400 text-sm font-bold px-4 py-2 rounded-full mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl md:text-5xl font-black">
              Loved by <span className="text-amber-400">Thousands</span>
            </h2>
          </div>

          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 md:p-12">
            <Quote className="absolute top-6 left-6 w-12 h-12 text-orange-500/20" />
            
            <div className="relative z-10">
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

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeTestimonial ? 'w-8 bg-orange-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* App Features */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
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
            </div>

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
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
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
        </div>
      </section>

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
