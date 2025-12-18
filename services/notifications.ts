import { LocalizedString } from '../types';
import { MODULES } from '../constants';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// ==========================================
// NOTIFICATION STRATEGY
// ==========================================
// 
// Each active mindset journey gets 3 notifications per day:
// 1. Morning Motivation (7:00 AM) - Today's topic intro from actual content
// 2. Midday Nudge (13:00 PM) - Today's task reminder
// 3. Evening Reflection (20:00 PM) - Reflection prompt from actual content
//
// Notifications are personalized based on:
// - Current mindset journey's actual content
// - Current day's title, task, and reflection prompt
// - Redirects to specific day page

export interface NotificationContent {
  title: LocalizedString;
  body: LocalizedString;
  icon?: string;
  url?: string; // URL to redirect when notification is clicked
}

export interface DayNotifications {
  morning: NotificationContent;
  midday: NotificationContent;
  evening: NotificationContent;
}

// Generic motivational messages for any mindset
const GENERIC_NOTIFICATIONS: DayNotifications[] = [
  // Day 1
  {
    morning: {
      title: { en: "🌅 Day 1 Begins!", hi: "🌅 पहला दिन शुरू!" },
      body: { en: "Every master was once a beginner. Your journey starts now!", hi: "हर उस्ताद कभी शुरुआत में था। तुम्हारी यात्रा अभी शुरू होती है!" }
    },
    midday: {
      title: { en: "⏰ 5 Minutes to Level Up", hi: "⏰ लेवल अप के लिए 5 मिनट" },
      body: { en: "Take a quick break and complete today's lesson!", hi: "थोड़ा ब्रेक लो और आज का पाठ पूरा करो!" }
    },
    evening: {
      title: { en: "🌙 End Your Day Strong", hi: "🌙 अपना दिन मजबूती से खत्म करो" },
      body: { en: "Did you complete Day 1? Small steps lead to big wins!", hi: "क्या तुमने Day 1 पूरा किया? छोटे कदम बड़ी जीत लाते हैं!" }
    }
  },
  // Day 2
  {
    morning: {
      title: { en: "🔥 Day 2 - Keep the Fire!", hi: "🔥 दूसरा दिन - आग जलाए रखो!" },
      body: { en: "You showed up yesterday. Show up again today!", hi: "कल तुम आए थे। आज फिर आओ!" }
    },
    midday: {
      title: { en: "💪 Building Momentum", hi: "💪 गति बना रहे हो" },
      body: { en: "2 days in a row? That's how champions are made!", hi: "लगातार 2 दिन? ऐसे ही चैंपियन बनते हैं!" }
    },
    evening: {
      title: { en: "🌟 Day 2 Check-in", hi: "🌟 दूसरे दिन की जांच" },
      body: { en: "Your future self will thank you for today's effort.", hi: "तुम्हारा भविष्य आज की मेहनत के लिए शुक्रिया कहेगा।" }
    }
  },
  // Day 3
  {
    morning: {
      title: { en: "🎯 Day 3 - The Magic Number", hi: "🎯 तीसरा दिन - जादुई नंबर" },
      body: { en: "3 days of consistency? You're building a real habit!", hi: "लगातार 3 दिन? तुम असली आदत बना रहे हो!" }
    },
    midday: {
      title: { en: "🚀 Halfway Through Week 1!", hi: "🚀 पहले हफ्ते में आधा!" },
      body: { en: "You're doing amazing. Keep going!", hi: "तुम कमाल कर रहे हो। चलते रहो!" }
    },
    evening: {
      title: { en: "✨ 3 Day Streak!", hi: "✨ 3 दिन का सिलसिला!" },
      body: { en: "You're officially on a streak. Don't break the chain!", hi: "तुम अब सिलसिले में हो। चेन मत तोड़ो!" }
    }
  },
  // Day 4
  {
    morning: {
      title: { en: "💎 Day 4 - Diamond in Making", hi: "💎 चौथा दिन - हीरा बन रहे हो" },
      body: { en: "Pressure creates diamonds. Keep pushing!", hi: "दबाव से हीरे बनते हैं। आगे बढ़ते रहो!" }
    },
    midday: {
      title: { en: "🎮 Level 4 Unlocked", hi: "🎮 लेवल 4 खुला" },
      body: { en: "New day, new lesson, new you!", hi: "नया दिन, नया पाठ, नए तुम!" }
    },
    evening: {
      title: { en: "🌙 Day 4 Reflection", hi: "🌙 चौथे दिन का मनन" },
      body: { en: "What did you learn today? Write it down!", hi: "आज क्या सीखा? लिख लो!" }
    }
  },
  // Day 5
  {
    morning: {
      title: { en: "🖐️ High Five! Day 5", hi: "🖐️ हाई फाइव! पांचवां दिन" },
      body: { en: "5 days strong! You're unstoppable!", hi: "5 दिन मजबूत! तुम्हें कोई नहीं रोक सकता!" }
    },
    midday: {
      title: { en: "⚡ Midweek Power", hi: "⚡ हफ्ते के बीच की ताकत" },
      body: { en: "Don't slow down now. You're on fire!", hi: "अब धीमे मत पड़ो। तुम आग पर हो!" }
    },
    evening: {
      title: { en: "🎉 5 Days Complete!", hi: "🎉 5 दिन पूरे!" },
      body: { en: "Almost done with week 1. Incredible!", hi: "पहला हफ्ता लगभग पूरा। अविश्वसनीय!" }
    }
  },
  // Day 6
  {
    morning: {
      title: { en: "🏃 Day 6 - Keep Running!", hi: "🏃 छठा दिन - दौड़ते रहो!" },
      body: { en: "One more day to complete week 1!", hi: "पहला हफ्ता पूरा करने में एक दिन बाकी!" }
    },
    midday: {
      title: { en: "🔋 Recharge Time", hi: "🔋 रिचार्ज का समय" },
      body: { en: "Take 5 mins for your mindset lesson!", hi: "अपने माइंडसेट पाठ के लिए 5 मिनट लो!" }
    },
    evening: {
      title: { en: "🌃 Day 6 Done?", hi: "🌃 छठा दिन पूरा?" },
      body: { en: "Tomorrow you complete week 1. Finish today strong!", hi: "कल पहला हफ्ता पूरा। आज मजबूती से खत्म करो!" }
    }
  },
  // Day 7
  {
    morning: {
      title: { en: "🏆 Day 7 - Week 1 Finale!", hi: "🏆 सातवां दिन - पहले हफ्ते का अंत!" },
      body: { en: "You made it to day 7! Complete the week!", hi: "तुम दिन 7 तक आ गए! हफ्ता पूरा करो!" }
    },
    midday: {
      title: { en: "🎖️ Badge Unlocking Soon", hi: "🎖️ बैज जल्द खुलेगा" },
      body: { en: "Complete today to earn your Week 1 badge!", hi: "आज पूरा करो और पहले हफ्ते का बैज पाओ!" }
    },
    evening: {
      title: { en: "👑 Week 1 Champion!", hi: "👑 पहले हफ्ते के चैंपियन!" },
      body: { en: "1 week down, 2 more to go. You're 33% there!", hi: "1 हफ्ता हुआ, 2 और बाकी। तुम 33% वहां हो!" }
    }
  },
  // Day 8
  {
    morning: {
      title: { en: "🌈 Week 2 Starts!", hi: "🌈 दूसरा हफ्ता शुरू!" },
      body: { en: "New week, stronger you. Let's go!", hi: "नया हफ्ता, मजबूत तुम। चलो!" }
    },
    midday: {
      title: { en: "📈 Growing Every Day", hi: "📈 हर दिन बढ़ रहे हो" },
      body: { en: "8 days of growth. That's real change!", hi: "8 दिन की ग्रोथ। यह असली बदलाव है!" }
    },
    evening: {
      title: { en: "🌙 Day 8 Wrap Up", hi: "🌙 आठवां दिन समाप्त" },
      body: { en: "Keep the momentum going!", hi: "गति बनाए रखो!" }
    }
  },
  // Day 9
  {
    morning: {
      title: { en: "9️⃣ Day 9 Power!", hi: "9️⃣ नौवें दिन की ताकत!" },
      body: { en: "Single digits ending soon. You're almost there!", hi: "सिंगल डिजिट खत्म होने वाले। तुम लगभग वहां हो!" }
    },
    midday: {
      title: { en: "💭 Time for Learning", hi: "💭 सीखने का समय" },
      body: { en: "Your brain is ready for today's wisdom!", hi: "तुम्हारा दिमाग आज की समझदारी के लिए तैयार है!" }
    },
    evening: {
      title: { en: "✅ Day 9 Check", hi: "✅ नौवें दिन की जांच" },
      body: { en: "Did you learn something new today?", hi: "क्या आज कुछ नया सीखा?" }
    }
  },
  // Day 10
  {
    morning: {
      title: { en: "🔟 Double Digits! Day 10", hi: "🔟 डबल डिजिट! दसवां दिन" },
      body: { en: "10 days! You're in the top 5% of starters!", hi: "10 दिन! तुम शुरू करने वालों में टॉप 5% में हो!" }
    },
    midday: {
      title: { en: "🎯 Halfway Point Near", hi: "🎯 आधा रास्ता नजदीक" },
      body: { en: "Just 1 more day to reach the middle!", hi: "बीच तक पहुंचने में बस 1 दिन और!" }
    },
    evening: {
      title: { en: "🌟 10 Days Strong", hi: "🌟 10 दिन मजबूत" },
      body: { en: "You're building something amazing!", hi: "तुम कुछ कमाल बना रहे हो!" }
    }
  },
  // Day 11
  {
    morning: {
      title: { en: "🎊 Day 11 - Past Halfway!", hi: "🎊 ग्यारहवां दिन - आधे से आगे!" },
      body: { en: "You've crossed the middle. Finish line awaits!", hi: "तुम बीच पार कर गए। फिनिश लाइन इंतजार कर रही है!" }
    },
    midday: {
      title: { en: "⏰ Mindset Moment", hi: "⏰ माइंडसेट का पल" },
      body: { en: "5 minutes now = lifetime of benefits!", hi: "अभी 5 मिनट = जीवन भर के फायदे!" }
    },
    evening: {
      title: { en: "🌙 Day 11 Done", hi: "🌙 ग्यारहवां दिन पूरा" },
      body: { en: "More than halfway. You're committed!", hi: "आधे से ज्यादा। तुम प्रतिबद्ध हो!" }
    }
  },
  // Day 12
  {
    morning: {
      title: { en: "📚 Day 12 Wisdom", hi: "📚 बारहवें दिन की समझदारी" },
      body: { en: "New day, new insights awaiting you!", hi: "नया दिन, नई समझ तुम्हारा इंतजार कर रही है!" }
    },
    midday: {
      title: { en: "🧠 Feed Your Mind", hi: "🧠 अपने दिमाग को खिलाओ" },
      body: { en: "Time for today's brain food!", hi: "आज के दिमागी खाने का समय!" }
    },
    evening: {
      title: { en: "✨ Day 12 Complete?", hi: "✨ बारहवां दिन पूरा?" },
      body: { en: "You're getting closer every day!", hi: "तुम हर दिन करीब आ रहे हो!" }
    }
  },
  // Day 13
  {
    morning: {
      title: { en: "🍀 Lucky Day 13!", hi: "🍀 लकी दिन 13!" },
      body: { en: "Some say 13 is lucky. Prove them right!", hi: "कुछ कहते हैं 13 लकी है। उन्हें सही साबित करो!" }
    },
    midday: {
      title: { en: "💪 You're Stronger Now", hi: "💪 तुम अब मजबूत हो" },
      body: { en: "12 days have changed you. Keep going!", hi: "12 दिनों ने तुम्हें बदल दिया। चलते रहो!" }
    },
    evening: {
      title: { en: "🌃 Day 13 Reflection", hi: "🌃 तेरहवें दिन का मनन" },
      body: { en: "What's the biggest change you've noticed?", hi: "सबसे बड़ा बदलाव क्या देखा?" }
    }
  },
  // Day 14
  {
    morning: {
      title: { en: "🏆 Day 14 - Week 2 Finale!", hi: "🏆 चौदहवां दिन - दूसरे हफ्ते का अंत!" },
      body: { en: "Complete week 2 today. You're amazing!", hi: "आज दूसरा हफ्ता पूरा करो। तुम कमाल हो!" }
    },
    midday: {
      title: { en: "🎖️ Two Weeks Strong", hi: "🎖️ दो हफ्ते मजबूत" },
      body: { en: "14 days of dedication. That's real commitment!", hi: "14 दिन की लगन। यह असली प्रतिबद्धता है!" }
    },
    evening: {
      title: { en: "👑 Week 2 Champion!", hi: "👑 दूसरे हफ्ते के चैंपियन!" },
      body: { en: "2 weeks done! Only 1 week left. You got this!", hi: "2 हफ्ते हुए! सिर्फ 1 हफ्ता बाकी। तुम कर सकते हो!" }
    }
  },
  // Day 15
  {
    morning: {
      title: { en: "🚀 Final Week Begins!", hi: "🚀 आखिरी हफ्ता शुरू!" },
      body: { en: "Week 3 - The transformation week!", hi: "हफ्ता 3 - परिवर्तन का हफ्ता!" }
    },
    midday: {
      title: { en: "⚡ 15 Days Strong", hi: "⚡ 15 दिन मजबूत" },
      body: { en: "You've built a real habit. Don't stop now!", hi: "तुमने असली आदत बनाई। अब मत रुको!" }
    },
    evening: {
      title: { en: "🌙 Day 15 Check-in", hi: "🌙 पंद्रहवें दिन की जांच" },
      body: { en: "6 more days to complete your journey!", hi: "यात्रा पूरी करने में 6 दिन और!" }
    }
  },
  // Day 16
  {
    morning: {
      title: { en: "🔥 Day 16 Fire!", hi: "🔥 सोलहवें दिन की आग!" },
      body: { en: "5 days left. You're so close!", hi: "5 दिन बाकी। तुम बहुत करीब हो!" }
    },
    midday: {
      title: { en: "🎯 Stay Focused", hi: "🎯 ध्यान केंद्रित रहो" },
      body: { en: "The finish line is in sight!", hi: "फिनिश लाइन दिख रही है!" }
    },
    evening: {
      title: { en: "✨ Day 16 Complete?", hi: "✨ सोलहवां दिन पूरा?" },
      body: { en: "Every day counts. You're almost there!", hi: "हर दिन मायने रखता है। तुम लगभग वहां हो!" }
    }
  },
  // Day 17
  {
    morning: {
      title: { en: "💎 Day 17 - Diamond Status", hi: "💎 सत्रहवां दिन - हीरे का दर्जा" },
      body: { en: "Only 4 days left. You're rare!", hi: "सिर्फ 4 दिन बाकी। तुम दुर्लभ हो!" }
    },
    midday: {
      title: { en: "🏃 Keep Running!", hi: "🏃 दौड़ते रहो!" },
      body: { en: "Don't slow down now!", hi: "अब धीमे मत पड़ो!" }
    },
    evening: {
      title: { en: "🌃 Day 17 Done", hi: "🌃 सत्रहवां दिन पूरा" },
      body: { en: "3 more days to legend status!", hi: "लेजेंड बनने में 3 दिन और!" }
    }
  },
  // Day 18
  {
    morning: {
      title: { en: "⭐ Day 18 - Almost There!", hi: "⭐ अठारहवां दिन - लगभग पहुंच गए!" },
      body: { en: "3 days to go. You can taste the victory!", hi: "3 दिन बाकी। जीत का स्वाद आ रहा है!" }
    },
    midday: {
      title: { en: "🎮 Final Levels", hi: "🎮 आखिरी लेवल" },
      body: { en: "These are the boss levels. Stay strong!", hi: "ये बॉस लेवल हैं। मजबूत रहो!" }
    },
    evening: {
      title: { en: "🌙 Day 18 Wrap Up", hi: "🌙 अठारहवां दिन समाप्त" },
      body: { en: "2 more days after this. Incredible journey!", hi: "इसके बाद 2 दिन और। अविश्वसनीय यात्रा!" }
    }
  },
  // Day 19
  {
    morning: {
      title: { en: "🔥 Day 19 - Penultimate!", hi: "🔥 उन्नीसवां दिन - दूसरा आखिरी!" },
      body: { en: "Just 2 more days! The end is near!", hi: "बस 2 दिन और! अंत नजदीक है!" }
    },
    midday: {
      title: { en: "💪 19 Days Strong", hi: "💪 19 दिन मजबूत" },
      body: { en: "You've done what most people never do!", hi: "तुमने वो किया जो ज्यादातर लोग कभी नहीं करते!" }
    },
    evening: {
      title: { en: "✅ Day 19 Check", hi: "✅ उन्नीसवें दिन की जांच" },
      body: { en: "Tomorrow is your second-to-last day!", hi: "कल तुम्हारा दूसरा आखिरी दिन है!" }
    }
  },
  // Day 20
  {
    morning: {
      title: { en: "🎊 Day 20 - One Day Left!", hi: "🎊 बीसवां दिन - एक दिन बाकी!" },
      body: { en: "Tomorrow you become a legend!", hi: "कल तुम लेजेंड बन जाओगे!" }
    },
    midday: {
      title: { en: "🏆 Victory is Close", hi: "🏆 जीत करीब है" },
      body: { en: "20 days of transformation. One more to go!", hi: "20 दिन का परिवर्तन। एक और बाकी!" }
    },
    evening: {
      title: { en: "🌟 Day 20 Complete!", hi: "🌟 बीसवां दिन पूरा!" },
      body: { en: "Tomorrow is the BIG day. Get ready!", hi: "कल बड़ा दिन है। तैयार हो जाओ!" }
    }
  },
  // Day 21
  {
    morning: {
      title: { en: "👑 DAY 21 - THE FINALE!", hi: "👑 दिन 21 - आखिरी दिन!" },
      body: { en: "This is it! Complete your 21-day journey today!", hi: "यह है वो दिन! आज अपनी 21 दिन की यात्रा पूरी करो!" }
    },
    midday: {
      title: { en: "🎯 Final Mission", hi: "🎯 आखिरी मिशन" },
      body: { en: "One last lesson. One giant transformation!", hi: "आखिरी पाठ। बड़ा परिवर्तन!" }
    },
    evening: {
      title: { en: "🏆 CONGRATULATIONS!", hi: "🏆 बधाई हो!" },
      body: { en: "You completed 21 days! You're a true champion!", hi: "तुमने 21 दिन पूरे किए! तुम सच्चे चैंपियन हो!" }
    }
  }
];

// Module-specific motivational prefixes
const MODULE_PREFIXES: Record<string, { en: string; hi: string }> = {
  financial: { en: "💰 Money Mindset", hi: "💰 पैसे की सोच" },
  health: { en: "💪 Health Power", hi: "💪 स्वास्थ्य शक्ति" },
  mindful_eating: { en: "🍎 Mindful Eating", hi: "🍎 सजग भोजन" },
  relationships: { en: "❤️ Relationships", hi: "❤️ रिश्ते" },
  productivity: { en: "⚡ Productivity", hi: "⚡ उत्पादकता" },
  confidence: { en: "🦁 Confidence", hi: "🦁 आत्मविश्वास" },
  public_speaking: { en: "🎤 Speaking", hi: "🎤 भाषण" },
  negotiation: { en: "🤝 Negotiation", hi: "🤝 बातचीत" },
  critical_thinking: { en: "🧠 Thinking", hi: "🧠 सोच" },
  emotional_intelligence: { en: "💜 EQ", hi: "💜 भावनात्मक बुद्धि" },
  digital_detox: { en: "📵 Digital Detox", hi: "📵 डिजिटल डिटॉक्स" },
  stoicism: { en: "🏛️ Stoicism", hi: "🏛️ स्थिरता" },
  minimalism: { en: "✨ Minimalism", hi: "✨ न्यूनतावाद" },
  learning: { en: "📚 Learning", hi: "📚 सीखना" },
  networking: { en: "🌐 Networking", hi: "🌐 नेटवर्किंग" },
  entrepreneurship: { en: "🚀 Entrepreneur", hi: "🚀 उद्यमी" },
  happiness: { en: "😊 Happiness", hi: "😊 खुशी" },
  anger_management: { en: "🧘 Calm Mind", hi: "🧘 शांत मन" },
  decision_making: { en: "🎯 Decisions", hi: "🎯 निर्णय" },
  sales: { en: "💼 Sales", hi: "💼 बिक्री" },
  body_language: { en: "🕺 Body Language", hi: "🕺 शारीरिक भाषा" },
  burnout: { en: "🔋 Energy", hi: "🔋 ऊर्जा" },
  parenting: { en: "👨‍👩‍👧 Parenting", hi: "👨‍👩‍👧 पालन-पोषण" },
  spirituality: { en: "🕯️ Spirituality", hi: "🕯️ आध्यात्मिकता" },
  dopamine: { en: "🧪 Dopamine", hi: "🧪 डोपामाइन" },
  personal_branding: { en: "🎭 Personal Brand", hi: "🎭 व्यक्तिगत ब्रांड" }
};

// Get actual day content from module
const getDayContent = (moduleId: string, dayNumber: number) => {
  const module = MODULES.find(m => m.id === moduleId);
  if (!module) return null;
  const day = module.days.find(d => d.dayNumber === dayNumber);
  return day ? { day, module } : null;
};

// Get notification content for a specific day - uses ACTUAL day content
export const getNotificationContent = (
  moduleId: string,
  dayNumber: number,
  notificationType: 'morning' | 'midday' | 'evening',
  lang: 'en' | 'hi' = 'en'
): { title: string; body: string; url: string } => {
  const prefix = MODULE_PREFIXES[moduleId] || MODULE_PREFIXES.financial;
  const dayContent = getDayContent(moduleId, dayNumber);
  const url = `/module/${moduleId}/day/${dayNumber}`;
  
  // If we have actual content, use it
  if (dayContent) {
    const { day, module } = dayContent;
    
    switch (notificationType) {
      case 'morning':
        // Morning: Introduce today's topic
        return {
          title: `${prefix[lang]} - ${lang === 'en' ? 'Good Morning!' : 'सुप्रभात!'}`,
          body: `${lang === 'en' ? "Today's lesson:" : 'आज का पाठ:'} ${day.title[lang]}`,
          url
        };
      
      case 'midday':
        // Midday: Remind about today's task
        const taskPreview = day.task[lang].substring(0, 80) + (day.task[lang].length > 80 ? '...' : '');
        return {
          title: `${prefix[lang]} - ${lang === 'en' ? 'Time for Action!' : 'एक्शन का समय!'}`,
          body: taskPreview,
          url
        };
      
      case 'evening':
        // Evening: Reflection prompt
        return {
          title: `${prefix[lang]} - ${lang === 'en' ? '🌙 Reflection Time' : '🌙 मनन का समय'}`,
          body: day.reflectionPrompt[lang],
          url
        };
      
      default:
        return {
          title: prefix[lang],
          body: day.title[lang],
          url
        };
    }
  }
  
  // Fallback to generic notifications if content not found
  const dayIndex = Math.min(dayNumber - 1, GENERIC_NOTIFICATIONS.length - 1);
  const notification = GENERIC_NOTIFICATIONS[dayIndex][notificationType];
  
  return {
    title: `${prefix[lang]} - ${notification.title[lang]}`,
    body: notification.body[lang],
    url
  };
};

// Notification scheduling times
export const NOTIFICATION_TIMES = {
  morning: { hour: 7, minute: 0 },
  midday: { hour: 13, minute: 0 },
  evening: { hour: 20, minute: 0 }
};

// Check if running on native platform
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
  if (isNativePlatform()) {
    return true; // Capacitor handles notifications
  }
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (isNativePlatform()) {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted' ? 'granted' : 'denied';
    } catch (e) {
      console.error('Native notification permission error:', e);
      return 'denied';
    }
  }
  
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return await Notification.requestPermission();
};

// Get current notification permission
export const getNotificationPermission = (): NotificationPermission => {
  if (isNativePlatform()) {
    // For native, we'll check asynchronously but return default for sync call
    return 'default';
  }
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

// Check native notification permission asynchronously
export const checkNativeNotificationPermission = async (): Promise<NotificationPermission> => {
  if (isNativePlatform()) {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted' ? 'granted' : 'denied';
    } catch (e) {
      return 'denied';
    }
  }
  return getNotificationPermission();
};

// Show a notification immediately with optional redirect URL
export const showNotification = async (
  title: string,
  body: string,
  url?: string,
  options?: NotificationOptions
): Promise<boolean> => {
  // For native platforms, use Capacitor Local Notifications
  if (isNativePlatform()) {
    try {
      const permission = await checkNativeNotificationPermission();
      if (permission !== 'granted') {
        return false;
      }
      
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title,
            body,
            schedule: { at: new Date(Date.now() + 100) }, // Immediate
            extra: { url },
            sound: 'default',
            actionTypeId: 'OPEN_APP'
          }
        ]
      });
      return true;
    } catch (error) {
      console.error('Native notification error:', error);
      return false;
    }
  }

  // Web notifications
  if (getNotificationPermission() !== 'granted') {
    return false;
  }

  try {
    // Include URL in notification data for service worker to handle click
    const notificationData = url ? { url } : undefined;
    
    // Try to use service worker for better PWA support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: `mindset-${Date.now()}`,
        data: notificationData,
        ...options
      });
    } else {
      // Fallback to regular notification - store URL for click handling
      const notification = new Notification(title, { body, icon: '/logo.svg', ...options });
      if (url) {
        notification.onclick = () => {
          window.focus();
          window.location.href = url;
        };
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return false;
  }
};

// Schedule notifications for active journeys
export const scheduleNotificationsForJourney = (
  moduleId: string,
  currentDay: number,
  lang: 'en' | 'hi' = 'en'
): void => {
  // Store scheduled notifications in localStorage
  const scheduledKey = `notifications_${moduleId}`;
  const scheduled = {
    moduleId,
    currentDay,
    scheduledAt: Date.now(),
    lang
  };
  localStorage.setItem(scheduledKey, JSON.stringify(scheduled));
};

// Check and trigger notifications based on time
export const checkAndTriggerNotifications = async (
  activeJourneys: Array<{ moduleId: string; currentDay: number }>,
  lang: 'en' | 'hi' = 'en'
): Promise<void> => {
  if (getNotificationPermission() !== 'granted') {
    return;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Determine which notification type to show based on current time
  let notificationType: 'morning' | 'midday' | 'evening' | null = null;
  
  if (currentHour === NOTIFICATION_TIMES.morning.hour && currentMinute < 30) {
    notificationType = 'morning';
  } else if (currentHour === NOTIFICATION_TIMES.midday.hour && currentMinute < 30) {
    notificationType = 'midday';
  } else if (currentHour === NOTIFICATION_TIMES.evening.hour && currentMinute < 30) {
    notificationType = 'evening';
  }

  if (!notificationType) {
    return;
  }

  // Check if we already showed this notification today
  const notificationKey = `notification_shown_${notificationType}_${now.toDateString()}`;
  if (localStorage.getItem(notificationKey)) {
    return;
  }

  // Show notification for the first active journey
  if (activeJourneys.length > 0) {
    const journey = activeJourneys[0];
    const content = getNotificationContent(
      journey.moduleId,
      journey.currentDay,
      notificationType,
      lang
    );
    
    const shown = await showNotification(content.title, content.body);
    if (shown) {
      localStorage.setItem(notificationKey, 'true');
    }
  }
};

// Clear all scheduled notifications for a journey
export const clearJourneyNotifications = (moduleId: string): void => {
  localStorage.removeItem(`notifications_${moduleId}`);
};

// Get reminder notification content (for manual reminder)
export const getReminderNotification = (lang: 'en' | 'hi' = 'en'): { title: string; body: string } => {
  return {
    title: lang === 'en' ? '🧠 Level Up Time!' : '🧠 लेवल बढ़ाने का समय!',
    body: lang === 'en' 
      ? 'Time to build your mindset today.' 
      : 'आज अपना माइंडसेट बनाने का समय।'
  };
};

// Schedule daily notifications for native mobile (Capacitor)
export const scheduleNativeDailyNotifications = async (
  moduleId: string,
  currentDay: number,
  lang: 'en' | 'hi' = 'en'
): Promise<boolean> => {
  if (!isNativePlatform()) {
    return false;
  }

  try {
    const permission = await checkNativeNotificationPermission();
    if (permission !== 'granted') {
      return false;
    }

    // Cancel existing scheduled notifications
    await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }] });

    const today = new Date();
    const url = `/module/${moduleId}/day/${currentDay}`;

    // Get content for each notification type
    const morningContent = getNotificationContent(moduleId, currentDay, 'morning', lang);
    const middayContent = getNotificationContent(moduleId, currentDay, 'midday', lang);
    const eveningContent = getNotificationContent(moduleId, currentDay, 'evening', lang);

    // Schedule morning notification (7:00 AM)
    const morningTime = new Date(today);
    morningTime.setHours(NOTIFICATION_TIMES.morning.hour, NOTIFICATION_TIMES.morning.minute, 0, 0);
    if (morningTime <= today) morningTime.setDate(morningTime.getDate() + 1);

    // Schedule midday notification (1:00 PM)
    const middayTime = new Date(today);
    middayTime.setHours(NOTIFICATION_TIMES.midday.hour, NOTIFICATION_TIMES.midday.minute, 0, 0);
    if (middayTime <= today) middayTime.setDate(middayTime.getDate() + 1);

    // Schedule evening notification (8:00 PM)
    const eveningTime = new Date(today);
    eveningTime.setHours(NOTIFICATION_TIMES.evening.hour, NOTIFICATION_TIMES.evening.minute, 0, 0);
    if (eveningTime <= today) eveningTime.setDate(eveningTime.getDate() + 1);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: morningContent.title,
          body: morningContent.body,
          schedule: { at: morningTime, repeats: true, every: 'day' },
          extra: { url },
          sound: 'default'
        },
        {
          id: 2,
          title: middayContent.title,
          body: middayContent.body,
          schedule: { at: middayTime, repeats: true, every: 'day' },
          extra: { url },
          sound: 'default'
        },
        {
          id: 3,
          title: eveningContent.title,
          body: eveningContent.body,
          schedule: { at: eveningTime, repeats: true, every: 'day' },
          extra: { url },
          sound: 'default'
        }
      ]
    });

    return true;
  } catch (error) {
    console.error('Failed to schedule native notifications:', error);
    return false;
  }
};

// Setup notification click listener for native
export const setupNativeNotificationListener = (): void => {
  if (!isNativePlatform()) return;

  LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    const url = notification.notification.extra?.url;
    if (url && typeof window !== 'undefined') {
      window.location.href = url;
    }
  });
};

// Export types and constants
export { GENERIC_NOTIFICATIONS, MODULE_PREFIXES };
