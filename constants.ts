
import { Module, QuizQuestion, DayContent, LocalizedString, VocabularyItem } from './types';

// ==========================================
// CONTENT GENERATION ENGINE
// ==========================================

// This helper generates friendly, conversational, 10-year-old understandable content.
// It structures the content into: A Hook, The Big Idea, A Simple Story, and The "Why" (Limiting Beliefs).
const generateLongFormContent = (
  topic: { en: string, hi: string },
  bookRef: string,
  category: string
): { en: string, hi: string } => {
  
  // English Expansion - Conversational & Simple
  const enContent = `
# Hey Friend! Let's talk about ${topic.en}

**Reading Time: ~4 Minutes**
**The Big Idea: ${category}**

---

### 👋 The Big Question
Have you ever felt like you *want* to do something, but a little voice in your head says, "I can't do this"?

Maybe you want to be better at ${category}. But that voice whispers, "It's too hard," or "I'm not smart enough."

Guess what? That voice is lying! 

Today, we are going to learn a "cheat code" to beat that voice. We are going to talk about **${topic.en}**. It might sound like a big word, but it is actually super simple.

---

### 🧠 Your Brain is Like a Video Game
Imagine your brain is a video game character. It has an energy bar.

When you try something new like ${topic.en}, your brain gets scared. It thinks, "Oh no! A new boss fight!" It wants to run away and hide. This is why you feel lazy or scared. It's not because you are weak. It's just your brain trying to stay safe in Level 1.

But here is the secret from a great book called *"${bookRef}"*: **You can level up.**

You don't level up by fighting the biggest boss on day one. You level up by fighting tiny slimes. Small wins. Easy wins. That is how ${topic.en} works.

---

### 🌟 Story Time: The Magic of "Yet"
Let me tell you about a kid named Alex.

Alex wanted to be amazing at ${category}. But every time Alex tried, it went wrong. Alex thought, "I am a failure."

Then, Alex learned one magic word: **"Yet"**.

Instead of saying "I can't do this," Alex started saying "I can't do this **yet**."

*   **Old Thought:** "I'm bad at this."
*   **New Thought:** "I am learning."

Alex stopped trying to be perfect. Alex just tried to be 1% better than yesterday. If Alex wanted to run, he didn't run a marathon; he just put on his shoes. If he wanted to read, he read one page.

Slowly, those tiny things added up. Alex became a master. Not by magic, but by not giving up.

---

### 🛑 The Trap: "I'll Do It Tomorrow"
Be careful! There is a trap on this journey. It is called the **"Tomorrow Trap"**.

Your brain loves to say, "I am tired today. I will start ${topic.en} tomorrow."

Here is the truth: Tomorrow never comes. There is only **Today**. There is only **Now**. Even if you do a tiny, tiny bit today, it is better than planning a huge thing for tomorrow.

---

### 🚀 Your Cheat Code
So, how do we win today?

1.  **Don't aim for perfect:** Perfect is boring. Aim for "Done".
2.  **Be kind to yourself:** If you mess up, don't beat yourself up. Just say, "Oops," and try again.
3.  **Believe in the New You:** Tell yourself, "I am the kind of person who practices ${topic.en}."

You are stronger than you think. You got this!

**End of Reading**
  `;

  // Hindi Expansion - Conversational & Simple
  const hiContent = `
# नमस्ते दोस्त! चलो बात करते हैं ${topic.hi} के बारे में

**पढ़ने का समय: ~4 मिनट**
**आज की बात: ${category}**

---

### 👋 एक ज़रूरी सवाल
क्या कभी तुम्हारे साथ ऐसा हुआ है कि तुम कुछ करना चाहते हो, लेकिन अंदर से एक आवाज़ आती है, "मैं यह नहीं कर सकता"?

हो सकता है तुम ${category} में बहुत अच्छे बनना चाहते हो। लेकिन वह आवाज़ कहती है, "यह बहुत मुश्किल है," या "मुझसे नहीं होगा।"

एक राज़ की बात बताऊँ? वह आवाज़ झूठ बोल रही है!

आज हम उस आवाज़ को हराने का एक "जादुई तरीका" (Cheat Code) सीखेंगे। हम **${topic.hi}** के बारे में जानेंगे। यह सुनने में भारी लग सकता है, लेकिन यह बहुत ही सरल है।

---

### 🧠 तुम्हारा दिमाग एक वीडियो गेम जैसा है
सोचो कि तुम्हारा दिमाग एक वीडियो गेम का हीरो है।

जब तुम कुछ नया करने की कोशिश करते हो, जैसे ${topic.hi}, तो तुम्हारा दिमाग डर जाता है। वह सोचता है, "अरे बाप रे! नया दुश्मन!" वह भाग जाना चाहता है। इसीलिए तुम्हें आलस आता है या डर लगता है। इसका मतलब यह नहीं है कि तुम कमज़ोर हो। इसका मतलब बस यह है कि तुम्हारा दिमाग तुम्हें 'लेवल 1' पर सुरक्षित रखना चाहता है।

लेकिन एक बहुत अच्छी किताब *"${bookRef}"* से हमने यह सीखा है: **तुम अपना लेवल बढ़ा सकते हो।**

तुम पहले ही दिन सबसे बड़े दुश्मन से नहीं लड़ते। तुम छोटे-छोटे दुश्मनों को हराकर लेवल बढ़ाते हो। छोटी जीत। आसान जीत। ${topic.hi} बिल्कुल ऐसे ही काम करता है।

---

### 🌟 कहानी: "अभी नहीं" का जादू
चलो मैं तुम्हें एलेक्स की कहानी सुनाता हूँ।

एलेक्स ${category} में बहुत अच्छा बनना चाहता था। लेकिन जब भी उसने कोशिश की, गड़बड़ हो गई। एलेक्स ने सोचा, "मैं इसमें बेकार हूँ।"

फिर, एलेक्स ने एक जादुई शब्द सीखा: **"अभी नहीं" (Yet)**।

यह कहने के बजाय कि "मैं यह नहीं कर सकता," एलेक्स ने कहना शुरू किया, "मैं यह **अभी** नहीं कर सकता (लेकिन सीख रहा हूँ)।"

*   **पुरानी सोच:** "मुझसे नहीं होगा।"
*   **नई सोच:** "मैं कोशिश कर रहा हूँ।"

एलेक्स ने 'परफेक्ट' बनने की कोशिश छोड़ दी। उसने बस कल से 1% बेहतर बनने की कोशिश की। अगर उसे दौड़ना था, तो उसने सिर्फ जूते पहने। अगर उसे पढ़ना था, तो उसने सिर्फ एक पन्ना पढ़ा।

धीरे-धीरे, वह सब जुड़ता गया। एलेक्स उस्ताद बन गया। जादू से नहीं, बल्कि हार न मानने से।

---

### 🛑 जाल: "कल करूँगा"
सावधान रहो! रास्ते में एक जाल है। इसका नाम है **"कल करूँगा" जाल**।

तुम्हारा दिमाग कहना पसंद करता है, "मैं आज थक गया हूँ। मैं ${topic.hi} कल शुरू करूँगा।"

सच यह है: कल कभी नहीं आता। सिर्फ **आज** है। सिर्फ **अभी** है। अगर तुम आज थोड़ा सा भी करते हो, तो वह कल के बड़े प्लान से लाख गुना बेहतर है।

---

### 🚀 आज का मंत्र
तो, आज हम कैसे जीतेंगे?

1.  **परफेक्ट मत बनो:** बस काम पूरा करो।
2.  **खुद को माफ़ करो:** अगर गलती हो जाए, तो खुद को डांटो मत। बस कहो, "ओह, कोई बात नहीं," और फिर से कोशिश करो।
3.  **नए 'तुम' पर भरोसा करो:** खुद से कहो, "मैं वह इंसान हूँ जो ${topic.hi} की प्रैक्टिस करता है।"

तुम अपनी सोच से ज़्यादा ताकतवर हो। तुम यह कर सकते हो!

**पढ़ना समाप्त**
  `;

  return { en: enContent, hi: hiContent };
};

const COMMON_VOCABULARY: VocabularyItem[] = [
  { word: "Focus", transliteration: "Dhyan", phonetic: "dh-yaan" },
  { word: "Habit", transliteration: "Aadat", phonetic: "aa-dat" },
  { word: "Courage", transliteration: "Himmat", phonetic: "him-mat" },
  { word: "Patience", transliteration: "Sabr", phonetic: "su-br" },
  { word: "Trust", transliteration: "Bharosa", phonetic: "bha-ro-sa" },
  { word: "Change", transliteration: "Badlav", phonetic: "bud-laav" },
  { word: "Action", transliteration: "Karm", phonetic: "karm" },
  { word: "Hope", transliteration: "Umeed", phonetic: "u-meed" },
  { word: "Power", transliteration: "Shakti", phonetic: "shak-ti" },
  { word: "Peace", transliteration: "Shanti", phonetic: "shaan-ti" }
];

// Curriculum definitions for Days 2-21
const generateDayContent = (
  dayNum: number, 
  topic: { en: string, hi: string }, 
  bookRef: string, 
  category: string
): DayContent => {
  const content = generateLongFormContent(topic, bookRef, category);
  
  // Assign 3 random words from the pool for variety
  const startIdx = (dayNum * 2) % (COMMON_VOCABULARY.length - 2);
  const vocab = COMMON_VOCABULARY.slice(startIdx, startIdx + 3);

  return {
    dayNumber: dayNum,
    title: { 
      en: `Day ${dayNum}: ${topic.en}`, 
      hi: `दिन ${dayNum}: ${topic.hi}` 
    },
    reading: content,
    vocabulary: vocab,
    task: {
      en: `Action Time: Spend just 2 minutes practicing ${topic.en}. Don't worry about being perfect. Just do one tiny thing right now!`,
      hi: `एक्शन का समय: अभी सिर्फ 2 मिनट ${topic.hi} की प्रैक्टिस करें। परफेक्ट होने की चिंता न करें। बस अभी कोई एक छोटी सी चीज़ करें!`
    },
    reflectionPrompt: {
      en: `How did it feel to try ${topic.en} today? Did you notice anything new about yourself?`,
      hi: `आज ${topic.hi} को आज़माकर कैसा लगा? क्या आपने अपने बारे में कुछ नया महसूस किया?`
    }
  };
};

const CURRICULUMS: Record<string, { books: string[], topics: { en: string, hi: string }[] }> = {
  // Existing Curriculums
  financial: {
    books: ["Rich Dad Poor Dad", "The Richest Man in Babylon", "Your Money or Your Life", "The Psychology of Money"],
    topics: [
      { en: "Saving One Coin", hi: "एक सिक्का बचाना" },
      { en: "Needs vs Wants", hi: "ज़रूरत बनाम चाहत" },
      { en: "Paying Yourself", hi: "खुद को भुगतान" },
      { en: "Patient Money", hi: "धैर्यवान पैसा" },
      { en: "Smart Spending", hi: "समझदारी से खर्च" },
      { en: "Safety Net", hi: "सुरक्षा कवच" },
      { en: "Time is Money", hi: "समय ही धन है" },
      { en: "Investing 101", hi: "निवेश की शुरुआत" },
      { en: "Good Debt vs Bad Debt", hi: "अच्छा कर्ज बनाम बुरा कर्ज" },
      { en: "Money Goals", hi: "पैसे के लक्ष्य" },
      { en: "Knowing Your Value", hi: "अपनी कीमत जानना" },
      { en: "Giving Back", hi: "वापस देना" },
      { en: "Future You", hi: "भविष्य का तुम" },
      { en: "Tracking", hi: "हिसाब रखना" },
      { en: "Extra Earning", hi: "अतिरिक्त कमाई" },
      { en: "Market Ups & Downs", hi: "बाज़ार के उतार-चढ़ाव" },
      { en: "Thinking Long Term", hi: "लंबी सोच" },
      { en: "Wealth Mindset", hi: "अमीरी वाली सोच" },
      { en: "Generosity", hi: "उदारता" },
      { en: "Freedom", hi: "आज़ादी" }
    ]
  },
  health: {
    books: ["Atomic Habits", "Why We Sleep", "Breath"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Healthy Habit ${i+1}`, hi: `स्वस्थ आदत ${i+1}`})) 
  },
  // New Mindful Eating Curriculum
  mindful_eating: {
    books: ["Savor", "Intuitive Eating", "Mindful Eating"],
    topics: [
      { en: "Slow Down", hi: "धीरे खाओ" },
      { en: "Real Hunger", hi: "असली भूख" },
      { en: "No Screens", hi: "बिना स्क्रीन के" },
      { en: "Chew More", hi: "ज़्यादा चबाओ" },
      { en: "Taste It", hi: "स्वाद लो" },
      { en: "Stop at 80%", hi: "80% पर रुको" },
      { en: "Emotion Check", hi: "मूड चेक" },
      { en: "Drink Water", hi: "पानी पियो" },
      { en: "Gratitude", hi: "शुक्रिया" },
      { en: "No Guilt", hi: "बुरा मत मानो" },
      { en: "Body Talk", hi: "शरीर की सुनो" },
      { en: "Kind Thoughts", hi: "प्यारी सोच" },
      { en: "Joy of Eating", hi: "खाने का आनंद" },
      { en: "Cravings", hi: "तलब" },
      { en: "After the Meal", hi: "खाने के बाद" },
      { en: "Nature's Gift", hi: "कुदरत का तोहफा" },
      { en: "Silence", hi: "शांति" },
      { en: "Sharing", hi: "बांटना" },
      { en: "Love Yourself", hi: "खुद से प्यार" },
      { en: "Food Freedom", hi: "खाने की आज़ादी" }
    ]
  },
  relationships: {
    books: ["The 7 Habits of Highly Effective People", "Nonviolent Communication"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Friendship Skill ${i+1}`, hi: `दोस्ती कौशल ${i+1}`})) 
  },
  productivity: {
    books: ["Getting Things Done", "Deep Work", "Eat That Frog"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Focus Power ${i+1}`, hi: `फोकस पावर ${i+1}`}))
  },
  confidence: {
    books: ["The Six Pillars of Self-Esteem", "Daring Greatly"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Brave Step ${i+1}`, hi: `बहादुर कदम ${i+1}`}))
  },
  public_speaking: {
    books: ["Talk Like TED", "The Art of Public Speaking"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Speaking Tip ${i+1}`, hi: `बोलने का सुझाव ${i+1}`}))
  },
  negotiation: {
    books: ["Never Split the Difference", "Getting to Yes"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Deal Making ${i+1}`, hi: `सौदा करना ${i+1}`}))
  },
  critical_thinking: {
    books: ["Thinking, Fast and Slow", "The Art of Thinking Clearly"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Smart Thinking ${i+1}`, hi: `स्मार्ट सोच ${i+1}`}))
  },
  emotional_intelligence: {
    books: ["Emotional Intelligence 2.0", "Primal Leadership"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Feeling Smart ${i+1}`, hi: `भावनाओं की समझ ${i+1}`}))
  },
  digital_detox: {
    books: ["Digital Minimalism", "Stolen Focus"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Screen Control ${i+1}`, hi: `स्क्रीन कंट्रोल ${i+1}`}))
  },
  stoicism: {
    books: ["Meditations", "Letters from a Stoic"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Inner Strength ${i+1}`, hi: `आंतरिक शक्ति ${i+1}`}))
  },
  minimalism: {
    books: ["Goodbye, Things", "The Life-Changing Magic of Tidying Up"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Living Light ${i+1}`, hi: `हल्का जीवन ${i+1}`}))
  },
  learning: {
    books: ["Ultralearning", "Make It Stick"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Super Learner ${i+1}`, hi: `सुपर लर्नर ${i+1}`}))
  },
  networking: {
    books: ["Never Eat Alone", "How to Win Friends and Influence People"],
    topics: Array.from({length: 20}, (_, i) => ({en: `People Skills ${i+1}`, hi: `लोगों से जुड़ना ${i+1}`}))
  },
  entrepreneurship: {
    books: ["The Lean Startup", "Zero to One"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Startup Idea ${i+1}`, hi: `स्टार्टअप विचार ${i+1}`}))
  },
  happiness: {
    books: ["The Happiness Project", "The Art of Happiness"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Joy Spark ${i+1}`, hi: `खुशी की चमक ${i+1}`}))
  },
  anger_management: {
    books: ["Anger", "The Cow in the Parking Lot"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Cool Down ${i+1}`, hi: `शांत रहना ${i+1}`}))
  },
  decision_making: {
    books: ["Decisive", "Smart Choices"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Choosing Well ${i+1}`, hi: `सही चुनाव ${i+1}`}))
  },
  sales: {
    books: ["To Sell Is Human", "The Psychology of Selling"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Persuasion ${i+1}`, hi: `मनाना ${i+1}`}))
  },
  body_language: {
    books: ["What Every Body Is Saying", "The Definitive Book of Body Language"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Body Talk ${i+1}`, hi: `शारीरिक भाषा ${i+1}`}))
  },
  burnout: {
    books: ["Burnout", "Peak Performance"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Recharging ${i+1}`, hi: `रिचार्ज होना ${i+1}`}))
  },
  parenting: {
    books: ["The Conscious Parent", "Whole-Brain Child"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Family Bond ${i+1}`, hi: `पारिवारिक बंधन ${i+1}`}))
  },
  spirituality: {
    books: ["The Untethered Soul", "The Power of Now"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Soul Connection ${i+1}`, hi: `आत्मिक जुड़ाव ${i+1}`}))
  },
  dopamine: {
    books: ["Dopamine Nation", "The Hacking of the American Mind"],
    topics: Array.from({length: 20}, (_, i) => ({en: `Brain Balance ${i+1}`, hi: `दिमागी संतुलन ${i+1}`}))
  },
  personal_branding: {
    books: ["Crushing It!", "Building a StoryBrand"],
    topics: Array.from({length: 20}, (_, i) => ({en: `My Brand ${i+1}`, hi: `मेरा ब्रांड ${i+1}`}))
  },
  // Default curriculum for any missing ones
  generic: {
    books: ["The Compound Effect", "Mindset", "Grit"],
    topics: Array.from({ length: 20 }, (_, i) => ({ en: `Winning Habit ${i+1}`, hi: `जीतने की आदत ${i+1}` }))
  }
};

export const UI_LABELS = {
  welcome: { en: "Lapaas Mindset", hi: "लपास माइंडसेट" },
  tagline: { en: "Change your life in 21 days.", hi: "21 दिनों में अपना जीवन बदलें।" },
  startJourney: { en: "Build Mindset", hi: "माइंडसेट बनाएं" },
  continueJourney: { en: "Continue", hi: "जारी रखें" },
  recommended: { en: "Best For You", hi: "आपके लिए सबसे अच्छा" },
  allJourneys: { en: "Choose Your Adventure", hi: "अपना रोमांच चुनें" },
  day: { en: "Level", hi: "लेवल" }, // Changed Day to Level
  completed: { en: "Won", hi: "जीत गए" },
  task: { en: "Mission", hi: "मिशन" }, // Changed Task to Mission
  reading: { en: "Story", hi: "कहानी" }, // Changed Reading to Story
  reflection: { en: "Think", hi: "सोचें" },
  save: { en: "Save Progress", hi: "प्रगति सहेजें" },
  saved: { en: "Saved!", hi: "सहेजा गया!" },
  next: { en: "Next", hi: "अगला" },
  nextStep: { en: "Next Step", hi: "अगला कदम" },
  prev: { en: "Back", hi: "पीछे" },
  nextDay: { en: "Next Level", hi: "अगला लेवल" },
  home: { en: "Home", hi: "होम" },
  quizTitle: { en: "Find Your Path", hi: "अपनी राह खोजें" },
  skip: { en: "Skip", hi: "छोड़ें" },
  journalPlaceholder: { en: "Type your thoughts here...", hi: "अपने विचार यहाँ लिखें..." },
  taskInputPlaceholder: { en: "Type your answer here...", hi: "अपना उत्तर यहाँ लिखें..." },
  progress: { en: "XP", hi: "XP" },
  congrats: { en: "You Won!", hi: "आप जीत गए!" },
  moduleComplete: { en: "Journey Complete!", hi: "यात्रा पूरी हुई!" },
  reset: { en: "Restart", hi: "फिर से शुरू करें" },
  reviewJourney: { en: "Look Back", hi: "पीछे देखें" },
  myJournal: { en: "My Diary", hi: "मेरी डायरी" },
  stepReading: { en: "Read", hi: "पढें" },
  stepTask: { en: "Do", hi: "करें" },
  stepReflection: { en: "Think", hi: "सोचें" },
  goToTask: { en: "Go to Mission", hi: "मिशन पर जाएं" },
  goToReflection: { en: "Go to Thinking", hi: "सोचने पर जाएं" },
  activityCalendar: { en: "Activity Map", hi: "गतिविधि नक्शा" },
  share: { en: "Share", hi: "शेयर करें" },
  shareAchievement: { en: "Share Win", hi: "जीत शेयर करें" },
  shareProgress: { en: "Share XP", hi: "XP शेयर करें" },
  copied: { en: "Copied!", hi: "कॉपी किया गया!" },
  settings: { en: "Settings", hi: "सेटिंग्स" },
  dangerZone: { en: "Danger Zone", hi: "खतरा क्षेत्र" },
  resetAll: { en: "Reset Progress", hi: "प्रगति रीसेट करें" },
  entries: { en: "Pages", hi: "पन्ने" },
  daysDone: { en: "Levels Done", hi: "लेवल पूरे" },
  streak: { en: "Streak", hi: "सिलसिला" },
  viewDay: { en: "View Level", hi: "लेवल देखें" },
  noEntries: { en: "Empty diary.", hi: "खाली डायरी।" },
  profile: { en: "My Player", hi: "मेरा खिलाड़ी" }, // Gamified
  language: { en: "Language", hi: "भाषा" },
  theme: { en: "Look", hi: "दिखावट" },
  light: { en: "Light", hi: "लाइट" },
  dark: { en: "Dark", hi: "डार्क" },
  system: { en: "Auto", hi: "ऑटो" },
  reminder: { en: "Daily Alarm", hi: "दैनिक अलार्म" },
  enableNotifications: { en: "Turn On Alerts", hi: "अलर्ट चालू करें" },
  reminderTime: { en: "Time", hi: "समय" },
  permissionDenied: { en: "Please allow notifications in settings.", hi: "कृपया सेटिंग्स में सूचनाओं की अनुमति दें।" },
  reminderTitle: { en: "Level Up Time!", hi: "लेवल बढ़ाने का समय!" },
  reminderBody: { en: "Time to build your mindset today.", hi: "आज अपना माइंडसेट बनाने का समय।" },
  installApp: { en: "Install Lapaas Mindset", hi: "Lapaas Mindset इंस्टॉल करें" },
  installDescription: { en: "Add to your home screen for quick access and daily reminders. Works offline too!", hi: "त्वरित एक्सेस और दैनिक रिमाइंडर के लिए होम स्क्रीन पर जोड़ें। ऑफ़लाइन भी काम करता है!" },
  installButton: { en: "Install", hi: "इंस्टॉल" },
  dismissButton: { en: "Maybe Later", hi: "बाद में" },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Keeping questions same structure but ensuring simple language in options
  {
    id: 1,
    question: {
      en: "What feels hardest for you right now?",
      hi: "अभी आपके लिए सबसे मुश्किल क्या है?"
    },
    options: [
      {
        id: "money",
        text: { en: "Understanding Money", hi: "पैसे को समझना" },
        relatedCategories: ["financial", "career", "goals"]
      },
      {
        id: "focus",
        text: { en: "Staying Focused", hi: "ध्यान केंद्रित रखना" },
        relatedCategories: ["productivity", "discipline", "goals"]
      },
      {
        id: "confidence",
        text: { en: "Feeling Brave", hi: "बहादुर महसूस करना" },
        relatedCategories: ["confidence", "resilience", "growth"]
      },
      {
        id: "health",
        text: { en: "Feeling Healthy", hi: "स्वस्थ महसूस करना" },
        relatedCategories: ["health", "mindful_eating", "mindfulness"]
      }
    ]
  },
  {
    id: 2,
    question: {
      en: "What do you want to win at?",
      hi: "आप किसमें जीतना चाहते हैं?"
    },
    options: [
      {
        id: "relationships",
        text: { en: "Making Friends", hi: "दोस्त बनाना" },
        relatedCategories: ["relationships", "communication", "networking"]
      },
      {
        id: "inner_peace",
        text: { en: "Being Calm", hi: "शांत रहना" },
        relatedCategories: ["mindfulness", "stoicism"]
      },
      {
        id: "leadership",
        text: { en: "Leading Others", hi: "दूसरों का नेतृत्व करना" },
        relatedCategories: ["leadership", "confidence"]
      },
      {
        id: "creativity",
        text: { en: "Creating Things", hi: "नई चीजें बनाना" },
        relatedCategories: ["creativity", "growth"]
      }
    ]
  },
  {
    id: 3,
    question: {
      en: "What bad habit do you want to break?",
      hi: "आप कौन सी बुरी आदत छोड़ना चाहते हैं?"
    },
    options: [
      {
        id: "procrastination",
        text: { en: "I delay things", hi: "मैं काम टालता हूँ" },
        relatedCategories: ["productivity", "discipline", "goals"]
      },
      {
        id: "phone",
        text: { en: "Too much phone", hi: "फोन का ज्यादा इस्तेमाल" },
        relatedCategories: ["digital_detox", "focus"]
      },
      {
        id: "anger",
        text: { en: "Getting angry fast", hi: "जल्दी गुस्सा आना" },
        relatedCategories: ["anger_management", "mindfulness"]
      },
      {
        id: "tired",
        text: { en: "Always tired", hi: "हमेशा थकान" },
        relatedCategories: ["burnout", "health"]
      }
    ]
  },
  {
    id: 4,
    question: {
      en: "Pick a skill you wish you had:",
      hi: "एक कौशल चुनें जो आप चाहते हैं:"
    },
    options: [
      {
        id: "speaking",
        text: { en: "Speaking on stage", hi: "मंच पर बोलना" },
        relatedCategories: ["public_speaking", "confidence", "communication"]
      },
      {
        id: "learning",
        text: { en: "Learning super fast", hi: "बहुत तेजी से सीखना" },
        relatedCategories: ["learning", "growth", "productivity"]
      },
      {
        id: "people",
        text: { en: "Reading people's minds", hi: "लोगों का दिमाग पढ़ना" },
        relatedCategories: ["body_language", "emotional_intelligence", "sales"]
      },
      {
        id: "decisions",
        text: { en: "Making hard choices", hi: "मुश्किल फैसले लेना" },
        relatedCategories: ["decision_making", "leadership", "critical_thinking"]
      }
    ]
  },
  {
    id: 5,
    question: {
      en: "What does your dream life look like?",
      hi: "आपका सपनों का जीवन कैसा दिखता है?"
    },
    options: [
      {
        id: "simple",
        text: { en: "Simple & Free", hi: "सरल और मुक्त" },
        relatedCategories: ["minimalism", "happiness", "mindfulness"]
      },
      {
        id: "business",
        text: { en: "Running a big business", hi: "बड़ा व्यापार चलाना" },
        relatedCategories: ["entrepreneurship", "leadership", "financial"]
      },
      {
        id: "family",
        text: { en: "Happy Family", hi: "खुशहाल परिवार" },
        relatedCategories: ["parenting", "relationships", "happiness"]
      },
      {
        id: "wise",
        text: { en: "Wise & Spiritual", hi: "समझदार और आध्यात्मिक" },
        relatedCategories: ["spirituality", "stoicism", "mindfulness"]
      }
    ]
  },
  {
    id: 6,
    question: {
      en: "How do you usually handle stress?",
      hi: "आप आमतौर पर तनाव को कैसे संभालते हैं?"
    },
    options: [
      {
        id: "overthinking",
        text: { en: "I overthink everything", hi: "मैं हर चीज पर बहुत सोचता हूँ" },
        relatedCategories: ["mindfulness", "stoicism"]
      },
      {
        id: "anger",
        text: { en: "I get frustrated easily", hi: "मुझे जल्दी निराशा होती है" },
        relatedCategories: ["anger_management", "mindfulness"]
      },
      {
        id: "shutdown",
        text: { en: "I just shut down", hi: "मैं चुप हो जाता हूँ" },
        relatedCategories: ["resilience", "confidence"]
      },
      {
        id: "distraction",
        text: { en: "I scroll on my phone", hi: "मैं फोन चलाता हूँ" },
        relatedCategories: ["digital_detox", "dopamine"]
      }
    ]
  },
  {
    id: 7,
    question: {
      en: "What holds you back the most?",
      hi: "आपको सबसे ज्यादा क्या रोकता है?"
    },
    options: [
      {
        id: "fear_judgment",
        text: { en: "Fear of what others think", hi: "लोग क्या सोचेंगे का डर" },
        relatedCategories: ["confidence", "public_speaking", "personal_branding"]
      },
      {
        id: "discipline",
        text: { en: "Lack of consistency", hi: "निरंतरता की कमी" },
        relatedCategories: ["discipline", "productivity", "dopamine"]
      },
      {
        id: "knowledge",
        text: { en: "Don't know where to start", hi: "पता नहीं कहाँ से शुरू करूँ" },
        relatedCategories: ["learning", "growth", "critical_thinking"]
      },
      {
        id: "negativity",
        text: { en: "Negative thoughts", hi: "नकारात्मक विचार" },
        relatedCategories: ["mindfulness", "gratitude", "happiness"]
      }
    ]
  },
  {
    id: 8,
    question: {
      en: "Which word attracts you the most?",
      hi: "कौन सा शब्द आपको सबसे ज्यादा आकर्षित करता है?"
    },
    options: [
      {
        id: "freedom",
        text: { en: "Freedom", hi: "आज़ादी" },
        relatedCategories: ["financial", "minimalism", "entrepreneurship"]
      },
      {
        id: "power",
        text: { en: "Power & Influence", hi: "शक्ति और प्रभाव" },
        relatedCategories: ["leadership", "negotiation", "sales"]
      },
      {
        id: "peace",
        text: { en: "Peace", hi: "शांति" },
        relatedCategories: ["mindfulness", "spirituality", "happiness"]
      },
      {
        id: "love",
        text: { en: "Deep Connection", hi: "गहरा जुड़ाव" },
        relatedCategories: ["relationships", "parenting", "networking"]
      }
    ]
  },
  {
    id: 9,
    question: {
      en: "How is your sleep usually?",
      hi: "आपकी नींद आमतौर पर कैसी होती है?"
    },
    options: [
      {
        id: "great",
        text: { en: "I sleep like a baby", hi: "मैं बच्चे की तरह सोता हूँ" },
        relatedCategories: ["health", "burnout"]
      },
      {
        id: "insomnia",
        text: { en: "Hard to fall asleep", hi: "सोने में मुश्किल होती है" },
        relatedCategories: ["mindfulness", "health", "digital_detox"]
      },
      {
        id: "tired_morning",
        text: { en: "Waking up tired", hi: "थकान के साथ जागना" },
        relatedCategories: ["burnout", "health", "dopamine"]
      },
      {
        id: "irregular",
        text: { en: "Very irregular timings", hi: "बहुत अनियमित समय" },
        relatedCategories: ["discipline", "productivity"]
      }
    ]
  },
  {
    id: 10,
    question: {
      en: "If you could change one thing today...",
      hi: "अगर आप आज एक चीज बदल सकें..."
    },
    options: [
      {
        id: "bank_balance",
        text: { en: "My Bank Balance", hi: "मेरा बैंक बैलेंस" },
        relatedCategories: ["financial", "career", "entrepreneurship"]
      },
      {
        id: "physique",
        text: { en: "My Body/Health", hi: "मेरा शरीर/स्वास्थ्य" },
        relatedCategories: ["health", "mindful_eating", "confidence"]
      },
      {
        id: "mindset",
        text: { en: "My Anxiety/Stress", hi: "मेरी चिंता/तनाव" },
        relatedCategories: ["mindfulness", "stoicism", "resilience"]
      },
      {
        id: "social",
        text: { en: "My Social Circle", hi: "मेरा सामाजिक दायरा" },
        relatedCategories: ["networking", "relationships", "communication"]
      }
    ]
  }
];

export const ADDITIONAL_REFLECTION_PROMPTS: LocalizedString[] = [
  {
    en: "What is one tiny thing you can do tomorrow?",
    hi: "कल आप कौन सा एक छोटा सा काम कर सकते हैं?"
  },
  {
    en: "Why was this hard for you before?",
    hi: "यह आपके लिए पहले मुश्किल क्यों था?"
  },
  {
    en: "Imagine yourself 5 years from now being great at this. How does it look?",
    hi: "कल्पना करें कि 5 साल बाद आप इसमें बहुत अच्छे हैं। यह कैसा दिखता है?"
  },
  {
    en: "Who do you know who is good at this?",
    hi: "आप किसे जानते हैं जो इसमें अच्छा है?"
  },
  {
    en: "What happens if you don't change?",
    hi: "अगर आप नहीं बदलते तो क्या होगा?"
  }
];

export const MODULES: Module[] = Object.keys(CURRICULUMS).map(key => {
    const curr = CURRICULUMS[key];
    
    // Constructing the full map with default fallbacks
    const getMeta = (k: string): any => {
         const defaults = {
             title: { en: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), hi: k },
             description: { en: "Master this skill.", hi: "इस कौशल में महारत हासिल करें।" },
             iconName: "Star",
             bannerImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
             category: k // Default category to key
         };

         switch(k) {
            case 'financial': return { ...defaults, title: { en: "Financial Freedom", hi: "आर्थिक आज़ादी" }, iconName: "Wallet", category: 'finance', bannerImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80" };
            case 'health': return { ...defaults, title: { en: "Health & Vitality", hi: "स्वास्थ्य और ऊर्जा" }, iconName: "Heart", category: 'health', bannerImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80" };
            case 'mindful_eating': return { ...defaults, title: { en: "Mindful Eating", hi: "ध्यानपूर्वक भोजन" }, iconName: "Utensils", category: 'health', bannerImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80" };
            case 'relationships': return { ...defaults, title: { en: "Better Relationships", hi: "बेहतर रिश्ते" }, iconName: "Users", category: 'relationships', bannerImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80" };
            case 'productivity': return { ...defaults, title: { en: "Peak Productivity", hi: "उच्च उत्पादकता" }, iconName: "Zap", category: 'productivity', bannerImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80" };
            case 'confidence': return { ...defaults, title: { en: "Unstoppable Confidence", hi: "अटूट आत्मविश्वास" }, iconName: "Trophy", category: 'confidence', bannerImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" };
            case 'public_speaking': return { ...defaults, title: { en: "Public Speaking", hi: "मंच पर बोलना" }, iconName: "Mic", category: 'public_speaking', bannerImage: "https://images.unsplash.com/photo-1475721027767-f4240278127b?w=800&q=80" };
            case 'negotiation': return { ...defaults, title: { en: "Art of Negotiation", hi: "मोलभाव की कला" }, iconName: "Handshake", category: 'negotiation', bannerImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80" };
            case 'critical_thinking': return { ...defaults, title: { en: "Critical Thinking", hi: "गहन सोच" }, iconName: "Brain", category: 'critical_thinking', bannerImage: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80" };
            case 'emotional_intelligence': return { ...defaults, title: { en: "Emotional Intelligence", hi: "भावनात्मक बुद्धिमत्ता" }, iconName: "HeartHandshake", category: 'emotional_intelligence', bannerImage: "https://images.unsplash.com/photo-1516575150278-77136aed6920?w=800&q=80" };
            case 'digital_detox': return { ...defaults, title: { en: "Digital Detox", hi: "डिजिटल डिटॉक्स" }, iconName: "SmartphoneOff", category: 'digital_detox', bannerImage: "https://images.unsplash.com/photo-1516251193000-18e65848006e?w=800&q=80" };
            case 'stoicism': return { ...defaults, title: { en: "Stoicism", hi: "स्टोइसिज्म" }, iconName: "Scale", category: 'stoicism', bannerImage: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800&q=80" };
            case 'minimalism': return { ...defaults, title: { en: "Minimalism", hi: "न्यूनतमवाद" }, iconName: "Minimize2", category: 'minimalism', bannerImage: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800&q=80" };
            case 'learning': return { ...defaults, title: { en: "Super Learning", hi: "सुपर लर्निंग" }, iconName: "BookOpen", category: 'learning', bannerImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80" };
            case 'networking': return { ...defaults, title: { en: "Networking Mastery", hi: "नेटवर्किंग में महारत" }, iconName: "Share2", category: 'networking', bannerImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80" };
            case 'entrepreneurship': return { ...defaults, title: { en: "Entrepreneurship", hi: "उद्यमिता" }, iconName: "Rocket", category: 'entrepreneurship', bannerImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80" };
            case 'happiness': return { ...defaults, title: { en: "Science of Happiness", hi: "खुशी का विज्ञान" }, iconName: "Smile", category: 'happiness', bannerImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80" };
            case 'anger_management': return { ...defaults, title: { en: "Anger Management", hi: "गुस्सा नियंत्रण" }, iconName: "ThermometerSnowflake", category: 'anger_management', bannerImage: "https://images.unsplash.com/photo-1525770041010-2a1233dd8152?w=800&q=80" };
            case 'decision_making': return { ...defaults, title: { en: "Decision Making", hi: "निर्णय लेना" }, iconName: "GitFork", category: 'decision_making', bannerImage: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80" };
            case 'sales': return { ...defaults, title: { en: "Sales Mastery", hi: "बिक्री में महारत" }, iconName: "TrendingUp", category: 'sales', bannerImage: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800&q=80" };
            case 'body_language': return { ...defaults, title: { en: "Body Language", hi: "शारीरिक भाषा" }, iconName: "Eye", category: 'body_language', bannerImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80" };
            case 'burnout': return { ...defaults, title: { en: "Beating Burnout", hi: "बर्नआउट को हराना" }, iconName: "BatteryCharging", category: 'burnout', bannerImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80" };
            case 'parenting': return { ...defaults, title: { en: "Conscious Parenting", hi: "जागरूक पेरेंटिंग" }, iconName: "Users", category: 'parenting', bannerImage: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?w=800&q=80" };
            case 'spirituality': return { ...defaults, title: { en: "Modern Spirituality", hi: "आधुनिक आध्यात्मिकता" }, iconName: "Sun", category: 'spirituality', bannerImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" };
            case 'dopamine': return { ...defaults, title: { en: "Dopamine Control", hi: "डोपामाइन नियंत्रण" }, iconName: "BrainCircuit", category: 'dopamine', bannerImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80" };
            case 'personal_branding': return { ...defaults, title: { en: "Personal Branding", hi: "पर्सनल ब्रांडिंग" }, iconName: "Fingerprint", category: 'personal_branding', bannerImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80" };
            default: return defaults;
         }
    };

    const meta = getMeta(key);

    return {
        id: key,
        ...meta,
        days: curr.topics.map((t, i) => generateDayContent(i + 1, t, curr.books[i % curr.books.length], meta.category))
    };
});
