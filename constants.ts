
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
      en: `Game Time: Spend just 2 minutes practicing ${topic.en}. Don't worry about being perfect. Just do one tiny thing right now!`,
      hi: `खेल का समय: अभी सिर्फ 2 मिनट ${topic.hi} की प्रैक्टिस करें। परफेक्ट होने की चिंता न करें। बस अभी कोई एक छोटी सी चीज़ करें!`
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

// Helper to generate days 2-21 based on curriculum
// Updated to support generating Day 1 if startDay is 1
const getCurriculumDays = (
  curriculumKey: string,
  categoryLabel: string,
  startDay: number = 2
): DayContent[] => {
  const curriculum = CURRICULUMS[curriculumKey] || CURRICULUMS['generic'];
  const days: DayContent[] = [];

  // Generate Day startDay to Day 21 (Total up to 21 days)
  for (let i = startDay; i <= 21; i++) {
    let topic, book;
    
    if (i === 1) {
        // Automatically generate Day 1 topic if requested
        topic = { en: `The Power of ${categoryLabel}`, hi: `${categoryLabel} की शक्ति` };
        book = curriculum.books[0] || "Self-Improvement Book";
    } else {
        // Topic index 0 corresponds to Day 2, effectively keeping alignment
        const topicIndex = i - 2;
        topic = curriculum.topics[topicIndex] || { en: `Topic ${i}`, hi: `विषय ${i}` };
        book = curriculum.books[topicIndex % curriculum.books.length] || "Self-Improvement Book";
    }
    
    days.push(generateDayContent(i, topic, book, categoryLabel));
  }
  return days;
};

// ==========================================
// MODULES DEFINITIONS
// ==========================================

export const MODULES: Module[] = [
  // 1. Financial
  {
    id: 'financial',
    category: 'finance',
    iconName: 'IndianRupee',
    title: { en: 'Money Smarts', hi: 'पैसे की समझ' },
    description: { en: 'Learn how to be smart with money using ideas from "The Psychology of Money".', hi: '"द साइकोलॉजी ऑफ मनी" से पैसे को समझदारी से इस्तेमाल करना सीखें।' },
    bannerImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    days: [
      {
        dayNumber: 1,
        title: { en: 'The Psychology of Money', hi: 'पैसे का खेल' },
        reading: generateLongFormContent(
          { en: "Money is a Game", hi: "पैसा एक खेल है" }, 
          "The Psychology of Money", 
          "Financial Mindset"
        ),
        vocabulary: [
             { word: "Saving", transliteration: "Bachat", phonetic: "ba-chat" },
             { word: "Value", transliteration: "Keemat", phonetic: "kee-mat" },
             { word: "Goal", transliteration: "Lakshya", phonetic: "lak-shya" }
        ],
        task: { 
          en: "Game Time: Write down your first memory of money. Was it happy or sad? Just write one sentence.", 
          hi: "खेल का समय: पैसे से जुड़ी अपनी सबसे पहली याद लिखें। क्या वह खुशी की थी या दुख की? बस एक वाक्य लिखें।" 
        },
        reflectionPrompt: { 
          en: "How does thinking about money make you feel right now? Happy? Scared? Bored?", 
          hi: "पैसे के बारे में सोचकर अभी आपको कैसा लग रहा है? खुश? डरा हुआ? या बोर?" 
        }
      },
      ...getCurriculumDays('financial', 'Finance')
    ]
  },
  // 2. Health
  {
    id: 'health',
    category: 'health',
    iconName: 'Heart',
    title: { en: 'Super Health', hi: 'सुपर हेल्थ' },
    description: { en: 'Build a strong body and mind with "Atomic Habits".', hi: '"एटॉमिक हैबिट्स" के साथ एक मजबूत शरीर और दिमाग बनाएं।' },
    bannerImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    days: [
      {
        dayNumber: 1,
        title: { en: 'Tiny Habits', hi: 'छोटी आदतें' },
        reading: generateLongFormContent(
          { en: "Tiny Changes", hi: "छोटे बदलाव" }, 
          "Atomic Habits", 
          "Health"
        ),
        vocabulary: [
             { word: "Habit", transliteration: "Aadat", phonetic: "aa-dat" },
             { word: "Health", transliteration: "Swasthya", phonetic: "swaas-thya" },
             { word: "Strong", transliteration: "Mazboot", phonetic: "maz-boot" }
        ],
        task: { 
          en: "Tiny Mission: Do 3 jumping jacks right now. Yes, just 3! It takes 5 seconds.", 
          hi: "छोटा मिशन: अभी 3 जंपिंग जैक (उछल-कूद) करें। हाँ, सिर्फ 3! इसमें 5 सेकंड लगते हैं।" 
        },
        reflectionPrompt: { 
          en: "Did doing something so small feel easy? That's the secret!", 
          hi: "क्या इतना छोटा कुछ करना आसान लगा? यही तो राज है!" 
        }
      },
      ...getCurriculumDays('health', 'Health')
    ]
  },
  // Mindful Eating Module
  {
    id: 'mindful_eating',
    category: 'health',
    iconName: 'Apple',
    title: { en: 'Mindful Eating', hi: 'ध्यानपूर्वक भोजन' },
    description: { en: 'Make peace with food using insights from "Savor".', hi: '"सेवर" के विचारों का उपयोग करके भोजन के साथ शांति बनाएं।' },
    bannerImage: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80',
    days: [
      {
        dayNumber: 1,
        title: { en: 'Waking Up at the Table', hi: 'खाने की मेज पर जागना' },
        reading: generateLongFormContent(
          { en: "Eating on Autopilot", hi: "ऑटोपायलट पर खाना" }, 
          "Savor", 
          "Mindful Eating"
        ),
        vocabulary: [
             { word: "Taste", transliteration: "Swad", phonetic: "swa-ad" },
             { word: "Hunger", transliteration: "Bhookh", phonetic: "bhoo-kh" },
             { word: "Peace", transliteration: "Shanti", phonetic: "shaan-ti" }
        ],
        task: { 
          en: "Game Time: Eat one snack (like an apple or a biscuit) completely slowly today. No TV, no phone. Just taste it.", 
          hi: "खेल का समय: आज एक स्नैक (जैसे सेब या बिस्किट) बिल्कुल धीरे-धीरे खाएं। कोई टीवी नहीं, कोई फोन नहीं। बस उसका स्वाद लें।" 
        },
        reflectionPrompt: { 
          en: "Did the food taste different when you paid attention?", 
          hi: "जब आपने ध्यान दिया तो क्या खाने का स्वाद अलग लगा?" 
        }
      },
      ...getCurriculumDays('mindful_eating', 'Mindful Eating')
    ]
  },
  // 3. Confidence
  {
    id: 'confidence',
    category: 'confidence',
    iconName: 'Zap',
    title: { en: 'Unstoppable You', hi: 'आत्मविश्वास' },
    description: { en: 'Believe in yourself with "The Six Pillars of Self-Esteem".', hi: '"द सिक्स पिलर ऑफ सेल्फ-एस्टीम" के साथ खुद पर भरोसा करें।' },
    bannerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    days: [
      {
        dayNumber: 1,
        title: { en: 'Waking Up', hi: 'जागना' },
        reading: generateLongFormContent(
          { en: "Living Wide Awake", hi: "जागते हुए जीना" },
          "The Six Pillars of Self-Esteem",
          "Confidence"
        ),
        vocabulary: [
             { word: "Brave", transliteration: "Bahadur", phonetic: "ba-haa-dur" },
             { word: "Proud", transliteration: "Garv", phonetic: "garv" },
             { word: "Trust", transliteration: "Bharosa", phonetic: "bha-ro-sa" }
        ],
        task: {
          en: "Mirror Game: Look in the mirror and say 'I matter'. Say it 3 times.",
          hi: "शीशा खेल: शीशे में देखो और कहो 'मैं महत्वपूर्ण हूँ'। इसे 3 बार कहो।"
        },
        reflectionPrompt: {
          en: "Did it feel weird saying nice things to yourself? Why?",
          hi: "क्या खुद से अच्छी बातें कहना अजीब लगा? क्यों?"
        }
      },
      ...getCurriculumDays('confidence', 'Self-Esteem')
    ]
  },
  // 4. Productivity
  {
    id: 'productivity',
    category: 'productivity',
    iconName: 'Clock',
    title: { en: 'Laser Focus', hi: 'लेज़र फोकस' },
    description: { en: 'Get things done without stress using "Deep Work".', hi: '"दीप वर्क" के साथ बिना तनाव के काम पूरा करें।' },
    bannerImage: 'https://images.unsplash.com/photo-1506784926709-b2f9c216652a?auto=format&fit=crop&w=800&q=80',
    days: [
       {
        dayNumber: 1,
        title: { en: 'Deep Work', hi: 'गहरा काम' },
        reading: generateLongFormContent(
          { en: "Working Like a Pro", hi: "प्रो की तरह काम करना" },
          "Deep Work",
          "Productivity"
        ),
        vocabulary: [
             { word: "Focus", transliteration: "Dhyan", phonetic: "dh-yaan" },
             { word: "Work", transliteration: "Kaam", phonetic: "kaam" },
             { word: "Fast", transliteration: "Tez", phonetic: "tez" }
        ],
        task: {
          en: "No Phone Zone: Put your phone in another room for just 10 minutes while you do something.",
          hi: "नो फोन ज़ोन: अपना फोन 10 मिनट के लिए दूसरे कमरे में रख दें और कुछ काम करें।"
        },
        reflectionPrompt: {
          en: "Did you feel the urge to check your phone? It's okay, just notice it.",
          hi: "क्या आपको फोन चेक करने की तलब हुई? कोई बात नहीं, बस इस पर ध्यान दें।"
        }
      },
      ...getCurriculumDays('productivity', 'Productivity')
    ]
  },
  // 5. Resilience
  {
    id: 'resilience',
    category: 'resilience',
    iconName: 'Shield',
    title: { en: 'Bounce Back', hi: 'वापसी' },
    description: { en: 'Learn to handle hard times.', hi: 'मुश्किल समय को संभालना सीखें।' },
    bannerImage: 'https://images.unsplash.com/photo-1525011268546-bf3f9b006f6b?auto=format&fit=crop&w=800&q=80',
    days: [
        {
            dayNumber: 1,
            title: { en: 'You Have a Choice', hi: 'तुम्हारे पास विकल्प है' },
            reading: generateLongFormContent(
              { en: "Choosing Your Mood", hi: "अपना मूड चुनना" },
              "Man's Search for Meaning",
              "Resilience"
            ),
            vocabulary: [
                { word: "Strong", transliteration: "Mazboot", phonetic: "maz-boot" },
                { word: "Hope", transliteration: "Umeed", phonetic: "u-meed" },
                { word: "Choice", transliteration: "Chunaav", phonetic: "chu-naav" }
            ],
            task: {
                en: "Think of one thing that annoyed you today. Now think of one way you could have laughed at it.",
                hi: "आज आपको परेशान करने वाली एक चीज़ के बारे में सोचें। अब सोचें कि आप उस पर कैसे हंस सकते थे।"
            },
            reflectionPrompt: {
                en: "Does knowing you can choose your reaction make you feel powerful?",
                hi: "क्या यह जानकर आपको ताकतवर महसूस होता है कि आप अपनी प्रतिक्रिया चुन सकते हैं?"
            }
        },
        ...getCurriculumDays('resilience', 'Resilience')
    ]
  },
  {
    id: 'relationships',
    category: 'relationships',
    iconName: 'Users',
    title: { en: 'Better Friends', hi: 'बेहतर दोस्त' },
    description: { en: 'Build great friendships.', hi: 'शानदार दोस्ती बनाएं।' },
    bannerImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    days: [
        {
            dayNumber: 1,
            title: { en: 'Emotional Bank', hi: 'इमोशनल बैंक' },
            reading: generateLongFormContent({ en: "The Trust Bank", hi: "विश्वास का बैंक" }, "The 7 Habits of Highly Effective People", "Relationships"),
            task: { en: "Say 'Thank You' to someone for something specific today.", hi: "आज किसी को किसी खास बात के लिए 'धन्यवाद' कहें।" },
            reflectionPrompt: { en: "How did they react?", hi: "उनकी प्रतिक्रिया क्या थी?" },
            vocabulary: [{ word: "Trust", transliteration: "Bharosa", phonetic: "bha-ro-sa" }, { word: "Love", transliteration: "Pyar", phonetic: "pyaar" }, { word: "Friend", transliteration: "Dost", phonetic: "dost" }]
        },
        ...getCurriculumDays('relationships', 'Relationships')
    ]
  },
  {
    id: 'growth',
    category: 'growth',
    iconName: 'TrendingUp',
    title: { en: 'Growth Mindset', hi: 'बढ़ने की सोच' },
    description: { en: 'Learn anything you want.', hi: 'जो चाहो वो सीखो।' },
    bannerImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    days: [
        {
            dayNumber: 1,
            title: { en: 'The Power of Yet', hi: 'अभी नहीं' },
            reading: generateLongFormContent({ en: "The Magic Word: Yet", hi: "जादुई शब्द: अभी नहीं" }, "Mindset", "Growth"),
            task: { en: "Say out loud: 'I am not a master YET'.", hi: "ज़ोर से कहें: 'मैं अभी उस्ताद नहीं हूँ, लेकिन बनूंगा'।" },
            reflectionPrompt: { en: "Does 'Yet' make failure feel less scary?", hi: "क्या 'अभी नहीं' कहने से असफलता कम डरावनी लगती है?" },
            vocabulary: [{ word: "Learn", transliteration: "Seekhna", phonetic: "seekh-na" }, { word: "Try", transliteration: "Koshish", phonetic: "ko-shish" }, { word: "Grow", transliteration: "Badhna", phonetic: "badh-na" }]
        },
        ...getCurriculumDays('growth', 'Growth')
    ]
  },
  { id: 'discipline', category: 'discipline', iconName: 'Target', title: { en: 'Self-Discipline', hi: 'आत्म-अनुशासन' }, description: { en: 'Do hard things.', hi: 'मुश्किल काम करें।' }, bannerImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('discipline', 'Discipline', 1) },
  { id: 'mindfulness', category: 'mindfulness', iconName: 'Sun', title: { en: 'Mindfulness', hi: 'माइंडफुलनेस' }, description: { en: 'Be present now.', hi: 'वर्तमान में रहें।' }, bannerImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('mindfulness', 'Mindfulness', 1) },
  { id: 'leadership', category: 'leadership', iconName: 'Award', title: { en: 'Leadership', hi: 'नेतृत्व' }, description: { en: 'Inspire others.', hi: 'दूसरों को प्रेरित करें।' }, bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('leadership', 'Leadership', 1) },
  { id: 'communication', category: 'communication', iconName: 'Mic', title: { en: 'Communication', hi: 'बातचीत' }, description: { en: 'Speak clearly.', hi: 'स्पष्ट बोलें।' }, bannerImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('communication', 'Communication', 1) },
  { id: 'creativity', category: 'creativity', iconName: 'Lightbulb', title: { en: 'Creativity', hi: 'रचनात्मकता' }, description: { en: 'Unlock ideas.', hi: 'विचारों को अनलॉक करें।' }, bannerImage: 'https://images.unsplash.com/photo-1491245338813-c6832976196e?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('creativity', 'Creativity', 1) },
  { id: 'gratitude', category: 'gratitude', iconName: 'Smile', title: { en: 'Gratitude', hi: 'आभार' }, description: { en: 'Be thankful.', hi: 'आभारी रहें।' }, bannerImage: 'https://images.unsplash.com/photo-1518531933037-9a82bf55564d?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('gratitude', 'Gratitude', 1) },
  { id: 'career', category: 'career', iconName: 'Briefcase', title: { en: 'Career', hi: 'करियर' }, description: { en: 'Love your work.', hi: 'अपने काम से प्यार करें।' }, bannerImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('career', 'Career', 1) },
  { id: 'goals', category: 'goals', iconName: 'Flag', title: { en: 'Goal Setting', hi: 'लक्ष्य निर्धारण' }, description: { en: 'Reach your dreams.', hi: 'अपने सपनों तक पहुँचें।' }, bannerImage: 'https://images.unsplash.com/photo-1533227297464-942973f0e60f?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('goals', 'Goals', 1) },
  { id: 'public_speaking', category: 'public_speaking', iconName: 'Mic2', title: { en: 'Public Speaking', hi: 'भाषण' }, description: { en: 'Speak without fear.', hi: 'बिना डर ​​के बोलें।' }, bannerImage: 'https://images.unsplash.com/photo-1475721027760-4416354854d1?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('public_speaking', 'Speaking', 1) },
  { id: 'negotiation', category: 'negotiation', iconName: 'Handshake', title: { en: 'Negotiation', hi: 'मोलभाव' }, description: { en: 'Get what is fair.', hi: 'जो उचित है उसे प्राप्त करें।' }, bannerImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('negotiation', 'Negotiation', 1) },
  { id: 'critical_thinking', category: 'critical_thinking', iconName: 'Brain', title: { en: 'Smart Thinking', hi: 'समझदारी' }, description: { en: 'Think clearly.', hi: 'स्पष्ट सोचें।' }, bannerImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('critical_thinking', 'Thinking', 1) },
  { id: 'emotional_intelligence', category: 'emotional_intelligence', iconName: 'HeartHandshake', title: { en: 'EQ', hi: 'भावनाएं' }, description: { en: 'Understand feelings.', hi: 'भावनाओं को समझें।' }, bannerImage: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('emotional_intelligence', 'Emotions', 1) },
  { id: 'digital_detox', category: 'digital_detox', iconName: 'SmartphoneOff', title: { en: 'Digital Detox', hi: 'डिजिटल डिटॉक्स' }, description: { en: 'Less phone, more life.', hi: 'कम फोन, ज्यादा जीवन।' }, bannerImage: 'https://images.unsplash.com/photo-1511871893393-82e9c16b8d77?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('digital_detox', 'Detox', 1) },
  { id: 'stoicism', category: 'stoicism', iconName: 'Pillar', title: { en: 'Stoicism', hi: 'स्टोइसिज्म' }, description: { en: 'Be calm and strong.', hi: 'शांत और मजबूत रहें।' }, bannerImage: 'https://images.unsplash.com/photo-1529402500854-8c83a73c9902?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('stoicism', 'Stoicism', 1) },
  { id: 'minimalism', category: 'minimalism', iconName: 'BoxSelect', title: { en: 'Minimalism', hi: 'न्यूनतमवाद' }, description: { en: 'Live with less.', hi: 'कम में जिएं।' }, bannerImage: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('minimalism', 'Minimalism', 1) },
  { id: 'learning', category: 'learning', iconName: 'GraduationCap', title: { en: 'Super Learning', hi: 'सीखना' }, description: { en: 'Learn fast.', hi: 'तेजी से सीखें।' }, bannerImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('learning', 'Learning', 1) },
  { id: 'networking', category: 'networking', iconName: 'Network', title: { en: 'Networking', hi: 'नेटवर्किंग' }, description: { en: 'Make friends.', hi: 'दोस्त बनाएं।' }, bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('networking', 'Networking', 1) },
  { id: 'entrepreneurship', category: 'entrepreneurship', iconName: 'Rocket', title: { en: 'Business', hi: 'व्यापार' }, description: { en: 'Start something new.', hi: 'कुछ नया शुरू करें।' }, bannerImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('entrepreneurship', 'Business', 1) },
  { id: 'happiness', category: 'happiness', iconName: 'SmilePlus', title: { en: 'Happiness', hi: 'खुशी' }, description: { en: 'Find joy.', hi: 'खुशी पाएं।' }, bannerImage: 'https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('happiness', 'Happiness', 1) },
  { id: 'anger_management', category: 'anger_management', iconName: 'Flame', title: { en: 'Anger Control', hi: 'गुस्सा नियंत्रण' }, description: { en: 'Cool your temper.', hi: 'अपना गुस्सा शांत करें।' }, bannerImage: 'https://images.unsplash.com/photo-1503914066224-1c607f2df27f?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('anger_management', 'Anger', 1) },
  { id: 'decision_making', category: 'decision_making', iconName: 'Split', title: { en: 'Decisions', hi: 'फैसले' }, description: { en: 'Choose wisely.', hi: 'बुद्धिमानी से चुनें।' }, bannerImage: 'https://images.unsplash.com/photo-1477281765962-ef9f18d975e4?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('decision_making', 'Decisions', 1) },
  { id: 'sales', category: 'sales', iconName: 'BadgeDollarSign', title: { en: 'Sales', hi: 'बिक्री' }, description: { en: 'Convince others.', hi: 'दूसरों को मनाएं।' }, bannerImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('sales', 'Sales', 1) },
  { id: 'body_language', category: 'body_language', iconName: 'Eye', title: { en: 'Body Language', hi: 'बॉडी लैंग्वेज' }, description: { en: 'Read people.', hi: 'लोगों को पढ़ें।' }, bannerImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('body_language', 'Body Language', 1) },
  { id: 'burnout', category: 'burnout', iconName: 'BatteryCharging', title: { en: 'Energy', hi: 'ऊर्जा' }, description: { en: 'Stop being tired.', hi: 'थकना बंद करें।' }, bannerImage: 'https://images.unsplash.com/photo-1502472584811-0a2f2ca899fa?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('burnout', 'Energy', 1) },
  { id: 'parenting', category: 'parenting', iconName: 'Baby', title: { en: 'Parenting', hi: 'पेरेंटिंग' }, description: { en: 'Raise happy kids.', hi: 'खुश बच्चे पालें।' }, bannerImage: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('parenting', 'Parenting', 1) },
  { id: 'spirituality', category: 'spirituality', iconName: 'Sparkles', title: { en: 'Spirituality', hi: 'आध्यात्मिकता' }, description: { en: 'Find peace inside.', hi: 'अंदर शांति पाएं।' }, bannerImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('spirituality', 'Spirit', 1) },
  { id: 'dopamine', category: 'dopamine', iconName: 'ZapOff', title: { en: 'Brain Control', hi: 'दिमाग नियंत्रण' }, description: { en: 'Stop bad habits.', hi: 'बुरी आदतें रोकें।' }, bannerImage: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('dopamine', 'Control', 1) },
  { id: 'personal_branding', category: 'personal_branding', iconName: 'Fingerprint', title: { en: 'Your Brand', hi: 'आपका ब्रांड' }, description: { en: 'Stand out.', hi: 'सबसे अलग दिखें।' }, bannerImage: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=800&q=80', days: getCurriculumDays('personal_branding', 'Brand', 1) }
];

export const UI_LABELS = {
  welcome: { en: "Lapaas Mindset", hi: "लपास माइंडसेट" },
  tagline: { en: "Change your life in 21 days.", hi: "21 दिनों में अपना जीवन बदलें।" },
  startJourney: { en: "Start Game", hi: "खेल शुरू करें" }, // Changed to "Game" for fun
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
  resetAll: { en: "Reset Game", hi: "गेम रीसेट करें" },
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
  reminderBody: { en: "Come play your daily mind game.", hi: "आओ अपना दैनिक दिमागी खेल खेलें।" },
  installApp: { en: "Get App", hi: "ऐप लें" },
  installDescription: { en: "Install for offline play.", hi: "ऑफ़लाइन खेलने के लिए इंस्टॉल करें।" },
  installButton: { en: "Install", hi: "इंस्टॉल" },
  dismissButton: { en: "Later", hi: "बाद में" },
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
        relatedCategories: ["finance", "career", "goals"]
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
        relatedCategories: ["health", "mindfulness"]
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
        relatedCategories: ["relationships", "communication"]
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
        relatedCategories: ["productivity", "digital_detox", "focus"]
      },
      {
        id: "anger",
        text: { en: "Getting angry fast", hi: "जल्दी गुस्सा आना" },
        relatedCategories: ["mindfulness", "anger_management", "relationships"]
      },
      {
        id: "tired",
        text: { en: "Always tired", hi: "हमेशा थकान" },
        relatedCategories: ["health", "burnout", "energy"]
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
        relatedCategories: ["confidence", "public_speaking", "communication"]
      },
      {
        id: "learning",
        text: { en: "Learning super fast", hi: "बहुत तेजी से सीखना" },
        relatedCategories: ["productivity", "learning", "growth"]
      },
      {
        id: "people",
        text: { en: "Reading people's minds", hi: "लोगों का दिमाग पढ़ना" },
        relatedCategories: ["relationships", "emotional_intelligence", "sales"]
      },
      {
        id: "decisions",
        text: { en: "Making hard choices", hi: "मुश्किल फैसले लेना" },
        relatedCategories: ["confidence", "decision_making", "leadership"]
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
        relatedCategories: ["mindfulness", "minimalism", "happiness"]
      },
      {
        id: "business",
        text: { en: "Running a big business", hi: "बड़ा व्यापार चलाना" },
        relatedCategories: ["financial", "entrepreneurship", "leadership"]
      },
      {
        id: "family",
        text: { en: "Happy Family", hi: "खुशहाल परिवार" },
        relatedCategories: ["relationships", "parenting", "happiness"]
      },
      {
        id: "wise",
        text: { en: "Wise & Spiritual", hi: "समझदार और आध्यात्मिक" },
        relatedCategories: ["mindfulness", "spirituality", "stoicism"]
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
        relatedCategories: ["mindfulness", "anxiety", "stoicism"]
      },
      {
        id: "anger",
        text: { en: "I get frustrated easily", hi: "मुझे जल्दी निराशा होती है" },
        relatedCategories: ["mindfulness", "anger_management"]
      },
      {
        id: "shutdown",
        text: { en: "I just shut down", hi: "मैं चुप हो जाता हूँ" },
        relatedCategories: ["confidence", "resilience"]
      },
      {
        id: "distraction",
        text: { en: "I scroll on my phone", hi: "मैं फोन चलाता हूँ" },
        relatedCategories: ["productivity", "digital_detox"]
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
        relatedCategories: ["confidence", "public_speaking"]
      },
      {
        id: "discipline",
        text: { en: "Lack of consistency", hi: "निरंतरता की कमी" },
        relatedCategories: ["productivity", "discipline"]
      },
      {
        id: "knowledge",
        text: { en: "Don't know where to start", hi: "पता नहीं कहाँ से शुरू करूँ" },
        relatedCategories: ["productivity", "learning", "growth"]
      },
      {
        id: "negativity",
        text: { en: "Negative thoughts", hi: "नकारात्मक विचार" },
        relatedCategories: ["mindfulness", "gratitude"]
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
        relatedCategories: ["financial", "minimalism"]
      },
      {
        id: "power",
        text: { en: "Power & Influence", hi: "शक्ति और प्रभाव" },
        relatedCategories: ["confidence", "leadership"]
      },
      {
        id: "peace",
        text: { en: "Peace", hi: "शांति" },
        relatedCategories: ["mindfulness", "spirituality"]
      },
      {
        id: "love",
        text: { en: "Deep Connection", hi: "गहरा जुड़ाव" },
        relatedCategories: ["relationships", "networking"]
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
        relatedCategories: ["health", "energy"]
      },
      {
        id: "insomnia",
        text: { en: "Hard to fall asleep", hi: "सोने में मुश्किल होती है" },
        relatedCategories: ["health", "mindfulness"]
      },
      {
        id: "tired_morning",
        text: { en: "Waking up tired", hi: "थकान के साथ जागना" },
        relatedCategories: ["health", "burnout"]
      },
      {
        id: "irregular",
        text: { en: "Very irregular timings", hi: "बहुत अनियमित समय" },
        relatedCategories: ["productivity", "discipline"]
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
        relatedCategories: ["financial", "wealth"]
      },
      {
        id: "physique",
        text: { en: "My Body/Health", hi: "मेरा शरीर/स्वास्थ्य" },
        relatedCategories: ["health", "confidence"]
      },
      {
        id: "mindset",
        text: { en: "My Anxiety/Stress", hi: "मेरी चिंता/तनाव" },
        relatedCategories: ["mindfulness", "stoicism"]
      },
      {
        id: "social",
        text: { en: "My Social Circle", hi: "मेरा सामाजिक दायरा" },
        relatedCategories: ["relationships", "networking"]
      }
    ]
  }
];

// Re-exporting Reflection Prompts with simpler language
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
