
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUIZ_QUESTIONS, UI_LABELS } from '../constants';
import { Language } from '../types';
import { completeOnboarding, setUserName } from '../services/storage';
import { ArrowRight, CheckCircle, User, Wallet, Zap, Heart, Briefcase, Brain, Smile, Target, Sparkles } from 'lucide-react';

interface OnboardingProps {
  lang: Language;
  onComplete: () => void;
}

const ONBOARDING_GOALS = [
  { 
    id: 'financial', 
    icon: Wallet, 
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    label: { en: 'Financial Freedom', hi: 'आर्थिक आज़ादी' }, 
    desc: { en: 'Master money & wealth', hi: 'पैसे और दौलत में महारत' } 
  },
  { 
    id: 'confidence', 
    icon: Zap, 
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    label: { en: 'Unstoppable Confidence', hi: 'अटूट आत्मविश्वास' }, 
    desc: { en: 'Overcome fear & doubt', hi: 'डर और संदेह को जीतें' } 
  },
  { 
    id: 'health', 
    icon: Heart, 
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    label: { en: 'Health & Energy', hi: 'सेहत और ऊर्जा' }, 
    desc: { en: 'Build a strong body', hi: 'मजबूत शरीर बनाएं' } 
  },
  { 
    id: 'productivity', 
    icon: Briefcase, 
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    label: { en: 'Career & Focus', hi: 'करियर और फोकस' }, 
    desc: { en: 'Achieve more in less time', hi: 'कम समय में ज्यादा हासिल करें' } 
  },
  { 
    id: 'mindfulness', 
    icon: Brain, 
    color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
    label: { en: 'Inner Peace', hi: 'मानसिक शांति' }, 
    desc: { en: 'Calm your mind', hi: 'अपने मन को शांत करें' } 
  },
  { 
    id: 'relationships', 
    icon: Smile, 
    color: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    label: { en: 'Better Relationships', hi: 'बेहतर रिश्ते' }, 
    desc: { en: 'Connect deeply with others', hi: 'दूसरों से गहरा जुड़ाव' } 
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ lang, onComplete }) => {
  const navigate = useNavigate();
  
  // Stages: 'name' -> 'goal' -> 'quiz'
  const [stage, setStage] = useState<'name' | 'goal' | 'quiz'>('name');
  const [nameInput, setNameInput] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setStage('goal');
    }
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    // Give a significant boost to the selected goal category
    setScores({ [goalId]: 5 });
    
    // Add a small delay for visual feedback before moving to quiz
    setTimeout(() => {
        setStage('quiz');
    }, 400);
  };

  const handleOptionSelect = (categories: string[]) => {
    const newScores = { ...scores };
    categories.forEach(cat => {
      newScores[cat] = (newScores[cat] || 0) + 1;
    });
    setScores(newScores);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishQuiz(newScores);
    }
  };

  const finishQuiz = (finalScores: Record<string, number>) => {
    // Find highest scoring category
    const bestCategory = Object.keys(finalScores).reduce((a, b) => 
      finalScores[a] > finalScores[b] ? a : b
    , selectedGoal || 'finance'); // Default fallback to selected goal or finance

    // Map category to module ID (simplified for MVP since they match in constants)
    const recommendedModuleId = bestCategory === 'finance' ? 'financial' : bestCategory;

    completeOnboarding(recommendedModuleId);
    onComplete(); // Update global state
    navigate('/home');
  };

  const handleSkip = () => {
    // If skipping quiz, use the selected goal if available, otherwise default
    const fallbackId = selectedGoal === 'finance' ? 'financial' : (selectedGoal || 'financial');
    completeOnboarding(fallbackId);
    onComplete();
    navigate('/home');
  };

  // 1. Name Input Stage
  if (stage === 'name') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 animate-fade-in border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/10 rounded-bl-full -mr-8 -mt-8"></div>
          
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-8 mx-auto text-orange-600 dark:text-orange-400 shadow-inner relative z-10">
             <User size={40} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3 text-center tracking-tight">
            {lang === 'en' ? 'Welcome Friend!' : 'स्वागत है दोस्त!'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-lg">
            {lang === 'en' ? 'Every great journey begins with a name. What is yours?' : 'हर महान यात्रा एक नाम से शुरू होती है। आपका नाम क्या है?'}
          </p>

          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="relative">
                <input 
                  type="text" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={lang === 'en' ? "Your Name" : "आपका नाम"}
                  className="w-full p-4 text-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 focus:outline-none transition-all text-center font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600"
                  autoFocus
                />
            </div>
            
            <button 
              type="submit"
              disabled={!nameInput.trim()}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                nameInput.trim() 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>{lang === 'en' ? 'Let\'s Go' : 'चलो चलें'}</span>
              <ArrowRight size={20} className="ml-2" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Goal Selection Stage (New Personalized Flow)
  if (stage === 'goal') {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">
            <div className="w-full max-w-2xl animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
                        {lang === 'en' ? `Hi, ${nameInput}!` : `नमस्ते, ${nameInput}!`}
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        {lang === 'en' ? 'What is your main focus right now?' : 'अभी आपका मुख्य ध्यान किस पर है?'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ONBOARDING_GOALS.map((goal) => (
                        <button
                            key={goal.id}
                            onClick={() => handleGoalSelect(goal.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden bg-white dark:bg-slate-900 hover:scale-[1.02] ${
                                selectedGoal === goal.id
                                    ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900' 
                                    : 'border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-lg'
                            }`}
                        >
                            <div className="flex items-start space-x-4 relative z-10">
                                <div className={`p-3 rounded-xl border ${goal.color}`}>
                                    <goal.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                        {goal.label[lang]}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                                        {goal.desc[lang]}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  // 3. Quiz Stage
  const question = QUIZ_QUESTIONS[currentStep];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 animate-fade-in border border-slate-100 dark:border-slate-800 relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
             <Sparkles size={16} className="text-orange-500" />
             <span className="text-xs font-bold text-orange-600 dark:text-orange-400 tracking-wider uppercase">
                {lang === 'en' ? 'Personalizing...' : 'निजीकरण...'}
             </span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
            {currentStep + 1} / {QUIZ_QUESTIONS.length}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 leading-tight">
          {question.question[lang]}
        </h2>

        <div className="space-y-3">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleOptionSelect(opt.relatedCategories)}
              className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all duration-200 flex items-center justify-between group bg-white dark:bg-slate-900"
            >
              <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">
                {opt.text[lang]}
              </span>
              <ArrowRight className="text-slate-300 dark:text-slate-600 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" size={20} />
            </button>
          ))}
        </div>

        <button 
          onClick={handleSkip}
          className="mt-8 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold w-full text-center transition-colors uppercase tracking-wide"
        >
          {UI_LABELS.skip[lang]}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
