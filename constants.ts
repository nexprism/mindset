
import { Module, QuizQuestion, DayContent, LocalizedString, VocabularyItem, Language } from './types';

// ==========================================
// CONTENT GENERATION ENGINE
// ==========================================

const CULTURAL_CONTEXT: Record<string, { greeting: string, kid: string, currency: string, book: string, trap: string, analogy: string, motivation: string }> = {
  en: { greeting: "Hey Friend!", kid: "Alex", currency: "$", book: "Book", trap: "Tomorrow Trap", analogy: "Video Game", motivation: "You got this!" },
  hi: { greeting: "नमस्ते दोस्त!", kid: "आर्यन (Aryan)", currency: "₹", book: "किताब", trap: "कल का जाल", analogy: "वीडियो गेम", motivation: "तुम कर सकते हो!" },
  es: { greeting: "¡Hola Amigo!", kid: "Mateo", currency: "€", book: "Libro", trap: "Trampa del Mañana", analogy: "Videojuego", motivation: "¡Tú puedes!" },
  fr: { greeting: "Salut l'ami !", kid: "Léo", currency: "€", book: "Livre", trap: "Piège de Demain", analogy: "Jeu Vidéo", motivation: "Tu peux le faire !" },
  de: { greeting: "Hallo Freund!", kid: "Felix", currency: "€", book: "Buch", trap: "Morgen-Falle", analogy: "Videospiel", motivation: "Du schaffst das!" },
  zh: { greeting: "你好朋友！", kid: "小明 (Xiao Ming)", currency: "¥", book: "书", trap: "明天的陷阱", analogy: "电子游戏", motivation: "你能行的！" },
  ja: { greeting: "こんにちは！", kid: "健太 (Kenta)", currency: "¥", book: "本", trap: "明日の罠", analogy: "ビデオゲーム", motivation: "君ならできる！" },
  pt: { greeting: "Olá Amigo!", kid: "João", currency: "R$", book: "Livro", trap: "Armadilha do Amanhã", analogy: "Videogame", motivation: "Você consegue!" },
  ru: { greeting: "Привет, друг!", kid: "Иван (Ivan)", currency: "₽", book: "Книга", trap: "Ловушка Завтра", analogy: "Видеоигра", motivation: "Ты сможешь!" },
  it: { greeting: "Ciao Amico!", kid: "Luca", currency: "€", book: "Libro", trap: "Trappola del Domani", analogy: "Videogioco", motivation: "Ce la puoi fare!" },
  ar: { greeting: "مرحباً يا صديقي!", kid: "عمر (Omar)", currency: "د.إ", book: "كتاب", trap: "فخ الغد", analogy: "لعبة فيديو", motivation: "أنت تستطيع!" },
};

// Full content templates for each language with proper cultural context
const CONTENT_TEMPLATES: Record<Language, {
  bigQuestion: string;
  wantToBeBetter: (category: string) => string;
  voiceLying: string;
  learnCheatCode: (topic: string) => string;
  brainAnalogy: (analogy: string) => string;
  brainScared: (topic: string) => string;
  bookSays: (book: string) => string;
  storyIntro: (kid: string) => string;
  storyWanted: (kid: string, category: string) => string;
  storyMagicWord: (kid: string) => string;
  storyYet: (kid: string) => string;
  storyOnePct: (kid: string) => string;
  trapWarning: string;
  tomorrowNever: string;
  mission1: string;
  mission2: string;
  mission3: (topic: string) => string;
  endMarker: string;
  storyTime: string;
  yourMission: string;
  adLabel: string;
}> = {
  en: {
    bigQuestion: "Have you ever felt like you *want* to do something, but a little voice says, \"I can't\"?",
    wantToBeBetter: (cat) => `Maybe you want to be better at **${cat}**. But it feels too hard.`,
    voiceLying: "Guess what? That voice is lying!",
    learnCheatCode: (topic) => `Today, we will learn a "cheat code". We will talk about **${topic}**.`,
    brainAnalogy: (analogy) => `Imagine your brain is a ${analogy} character. It has an energy bar.`,
    brainScared: (topic) => `When you try something new like ${topic}, your brain gets scared. It wants to stay safe in Level 1.`,
    bookSays: (book) => `But a great book *"${book}"* says: **You can level up.**`,
    storyIntro: (kid) => `Let me tell you about ${kid}.`,
    storyWanted: (kid, cat) => `${kid} wanted to be amazing at ${cat}. But failed often.`,
    storyMagicWord: (kid) => `Then, ${kid} learned a magic word: **"Yet"**.`,
    storyYet: (kid) => `Instead of "I can't", ${kid} said "I can't **yet**".`,
    storyOnePct: (kid) => `${kid} stopped trying to be perfect. Just tried to be 1% better.`,
    trapWarning: "Be careful! Don't say \"I'll do it tomorrow\".",
    tomorrowNever: "Tomorrow never comes. Only **Today** exists.",
    mission1: "Don't be perfect.",
    mission2: "Be kind to yourself.",
    mission3: (topic) => `Believe: "I practice ${topic}."`,
    endMarker: "End of Reading",
    storyTime: "Story Time",
    yourMission: "Your Mission",
    adLabel: "Continue reading below"
  },
  hi: {
    bigQuestion: "क्या कभी तुम्हें लगा है कि तुम कुछ करना चाहते हो, पर एक आवाज़ कहती है \"मैं नहीं कर सकता\"?",
    wantToBeBetter: (cat) => `शायद तुम **${cat}** में बेहतर बनना चाहते हो। पर यह मुश्किल लगता है।`,
    voiceLying: "एक बात बताऊँ? वह आवाज़ झूठ बोल रही है!",
    learnCheatCode: (topic) => `आज हम एक "जादुई तरीका" सीखेंगे। हम **${topic}** के बारे में बात करेंगे।`,
    brainAnalogy: (analogy) => `सोचो तुम्हारा दिमाग एक ${analogy} का हीरो है। उसके पास एनर्जी बार है।`,
    brainScared: (topic) => `जब तुम ${topic} जैसी नई चीज़ करते हो, तो दिमाग डर जाता है। वह लेवल 1 पर रहना चाहता है।`,
    bookSays: (book) => `पर एक शानदार किताब *"${book}"* कहती है: **तुम लेवल बढ़ा सकते हो।**`,
    storyIntro: (kid) => `चलो तुम्हें ${kid} की कहानी सुनाता हूँ।`,
    storyWanted: (kid, cat) => `${kid} ${cat} में उस्ताद बनना चाहता था। पर अक्सर फेल हो जाता था।`,
    storyMagicWord: (kid) => `फिर ${kid} ने एक जादुई शब्द सीखा: **"अभी नहीं"**।`,
    storyYet: (kid) => `"मैं नहीं कर सकता" की जगह, उसने कहा "मैं **अभी** नहीं कर सकता"।`,
    storyOnePct: (kid) => `${kid} ने परफेक्ट बनना छोड़ दिया। बस 1% बेहतर बनने की कोशिश की।`,
    trapWarning: "सावधान! \"मैं कल करूँगा\" मत कहो।",
    tomorrowNever: "कल कभी नहीं आता। सिर्फ़ **आज** है।",
    mission1: "परफेक्ट मत बनो।",
    mission2: "खुद पर दया करो।",
    mission3: (topic) => `यकीन करो: "मैं ${topic} करता हूँ।"`,
    endMarker: "पढ़ना समाप्त",
    storyTime: "कहानी का समय",
    yourMission: "तुम्हारा मिशन",
    adLabel: "नीचे पढ़ना जारी रखें"
  },
  es: {
    bigQuestion: "¿Alguna vez has sentido que *quieres* hacer algo, pero una vocecita dice \"No puedo\"?",
    wantToBeBetter: (cat) => `Tal vez quieres ser mejor en **${cat}**. Pero parece muy difícil.`,
    voiceLying: "¿Sabes qué? ¡Esa voz miente!",
    learnCheatCode: (topic) => `Hoy aprenderemos un "truco secreto". Hablaremos sobre **${topic}**.`,
    brainAnalogy: (analogy) => `Imagina que tu cerebro es un personaje de ${analogy}. Tiene una barra de energía.`,
    brainScared: (topic) => `Cuando intentas algo nuevo como ${topic}, tu cerebro se asusta. Quiere quedarse seguro en el Nivel 1.`,
    bookSays: (book) => `Pero un gran libro *"${book}"* dice: **Puedes subir de nivel.**`,
    storyIntro: (kid) => `Déjame contarte sobre ${kid}.`,
    storyWanted: (kid, cat) => `${kid} quería ser increíble en ${cat}. Pero fallaba a menudo.`,
    storyMagicWord: (kid) => `Entonces, ${kid} aprendió una palabra mágica: **"Todavía"**.`,
    storyYet: (kid) => `En lugar de "No puedo", ${kid} dijo "No puedo **todavía**".`,
    storyOnePct: (kid) => `${kid} dejó de intentar ser perfecto. Solo intentó ser 1% mejor.`,
    trapWarning: "¡Cuidado! No digas \"Lo haré mañana\".",
    tomorrowNever: "El mañana nunca llega. Solo existe **Hoy**.",
    mission1: "No seas perfecto.",
    mission2: "Sé amable contigo mismo.",
    mission3: (topic) => `Cree: "Yo practico ${topic}."`,
    endMarker: "Fin de la Lectura",
    storyTime: "Hora del Cuento",
    yourMission: "Tu Misión",
    adLabel: "Continúa leyendo abajo"
  },
  fr: {
    bigQuestion: "As-tu déjà eu envie de faire quelque chose, mais une petite voix dit \"Je ne peux pas\" ?",
    wantToBeBetter: (cat) => `Peut-être que tu veux être meilleur en **${cat}**. Mais ça semble trop difficile.`,
    voiceLying: "Tu sais quoi ? Cette voix ment !",
    learnCheatCode: (topic) => `Aujourd'hui, nous allons apprendre un "code secret". Nous parlerons de **${topic}**.`,
    brainAnalogy: (analogy) => `Imagine que ton cerveau est un personnage de ${analogy}. Il a une barre d'énergie.`,
    brainScared: (topic) => `Quand tu essaies quelque chose de nouveau comme ${topic}, ton cerveau a peur. Il veut rester au Niveau 1.`,
    bookSays: (book) => `Mais un super livre *"${book}"* dit : **Tu peux monter de niveau.**`,
    storyIntro: (kid) => `Laisse-moi te parler de ${kid}.`,
    storyWanted: (kid, cat) => `${kid} voulait être génial en ${cat}. Mais échouait souvent.`,
    storyMagicWord: (kid) => `Puis, ${kid} a appris un mot magique : **"Pas encore"**.`,
    storyYet: (kid) => `Au lieu de "Je ne peux pas", ${kid} a dit "Je ne peux pas **encore**".`,
    storyOnePct: (kid) => `${kid} a arrêté d'essayer d'être parfait. Il a juste essayé d'être 1% meilleur.`,
    trapWarning: "Attention ! Ne dis pas \"Je le ferai demain\".",
    tomorrowNever: "Demain n'arrive jamais. Seul **Aujourd'hui** existe.",
    mission1: "Ne sois pas parfait.",
    mission2: "Sois gentil avec toi-même.",
    mission3: (topic) => `Crois : "Je pratique ${topic}."`,
    endMarker: "Fin de la Lecture",
    storyTime: "L'Heure du Conte",
    yourMission: "Ta Mission",
    adLabel: "Continue à lire ci-dessous"
  },
  de: {
    bigQuestion: "Hattest du jemals das Gefühl, etwas tun zu *wollen*, aber eine Stimme sagt \"Ich kann nicht\"?",
    wantToBeBetter: (cat) => `Vielleicht willst du besser in **${cat}** werden. Aber es fühlt sich zu schwer an.`,
    voiceLying: "Weißt du was? Diese Stimme lügt!",
    learnCheatCode: (topic) => `Heute lernen wir einen "Geheimtrick". Wir sprechen über **${topic}**.`,
    brainAnalogy: (analogy) => `Stell dir vor, dein Gehirn ist ein ${analogy}-Charakter. Es hat einen Energiebalken.`,
    brainScared: (topic) => `Wenn du etwas Neues wie ${topic} versuchst, bekommt dein Gehirn Angst. Es will auf Level 1 bleiben.`,
    bookSays: (book) => `Aber ein tolles Buch *"${book}"* sagt: **Du kannst aufleveln.**`,
    storyIntro: (kid) => `Lass mich dir von ${kid} erzählen.`,
    storyWanted: (kid, cat) => `${kid} wollte großartig in ${cat} sein. Aber scheiterte oft.`,
    storyMagicWord: (kid) => `Dann lernte ${kid} ein Zauberwort: **"Noch nicht"**.`,
    storyYet: (kid) => `Anstatt "Ich kann nicht" sagte ${kid} "Ich kann **noch** nicht".`,
    storyOnePct: (kid) => `${kid} hörte auf, perfekt zu sein. Versuchte nur, 1% besser zu werden.`,
    trapWarning: "Vorsicht! Sag nicht \"Ich mache es morgen\".",
    tomorrowNever: "Morgen kommt nie. Nur **Heute** existiert.",
    mission1: "Sei nicht perfekt.",
    mission2: "Sei nett zu dir selbst.",
    mission3: (topic) => `Glaube: "Ich übe ${topic}."`,
    endMarker: "Ende der Lesung",
    storyTime: "Geschichtenzeit",
    yourMission: "Deine Mission",
    adLabel: "Weiterlesen unten"
  },
  zh: {
    bigQuestion: "你有没有觉得你*想*做某事，但有个小声音说「我做不到」？",
    wantToBeBetter: (cat) => `也许你想在**${cat}**方面变得更好。但感觉太难了。`,
    voiceLying: "你知道吗？那个声音在撒谎！",
    learnCheatCode: (topic) => `今天，我们将学习一个「秘诀」。我们将谈谈**${topic}**。`,
    brainAnalogy: (analogy) => `想象你的大脑是一个${analogy}角色。它有一个能量条。`,
    brainScared: (topic) => `当你尝试像${topic}这样的新事物时，你的大脑会害怕。它想留在第1级。`,
    bookSays: (book) => `但一本伟大的书*「${book}」*说：**你可以升级。**`,
    storyIntro: (kid) => `让我告诉你关于${kid}的故事。`,
    storyWanted: (kid, cat) => `${kid}想在${cat}方面很厉害。但经常失败。`,
    storyMagicWord: (kid) => `然后，${kid}学会了一个神奇的词：**「还没」**。`,
    storyYet: (kid) => `${kid}不再说「我不能」，而是说「我**还**不能」。`,
    storyOnePct: (kid) => `${kid}不再追求完美。只是努力变得好1%。`,
    trapWarning: "小心！不要说「我明天做」。",
    tomorrowNever: "明天永远不会来。只有**今天**存在。",
    mission1: "不要追求完美。",
    mission2: "对自己好一点。",
    mission3: (topic) => `相信：「我在练习${topic}。」`,
    endMarker: "阅读结束",
    storyTime: "故事时间",
    yourMission: "你的任务",
    adLabel: "继续阅读"
  },
  ja: {
    bigQuestion: "何かをしたいのに、「できない」という心の声が聞こえたことはありますか？",
    wantToBeBetter: (cat) => `たぶん、**${cat}**が上手になりたいと思っているでしょう。でも難しそうに感じます。`,
    voiceLying: "実はね？その声は嘘をついているんです！",
    learnCheatCode: (topic) => `今日は「秘密のコツ」を学びます。**${topic}**について話しましょう。`,
    brainAnalogy: (analogy) => `あなたの脳は${analogy}のキャラクターだと想像してください。エネルギーバーがあります。`,
    brainScared: (topic) => `${topic}のような新しいことに挑戦すると、脳は怖がります。レベル1にいたいのです。`,
    bookSays: (book) => `でも素晴らしい本*「${book}」*はこう言います：**レベルアップできる。**`,
    storyIntro: (kid) => `${kid}のことを話しましょう。`,
    storyWanted: (kid, cat) => `${kid}は${cat}が得意になりたかった。でもよく失敗しました。`,
    storyMagicWord: (kid) => `そして、${kid}は魔法の言葉を学びました：**「まだ」**。`,
    storyYet: (kid) => `「できない」の代わりに、${kid}は「**まだ**できない」と言いました。`,
    storyOnePct: (kid) => `${kid}は完璧を目指すのをやめました。ただ1%良くなろうとしました。`,
    trapWarning: "気をつけて！「明日やる」と言わないで。",
    tomorrowNever: "明日は来ません。**今日**だけが存在します。",
    mission1: "完璧を求めない。",
    mission2: "自分に優しく。",
    mission3: (topic) => `信じて：「私は${topic}を練習している。」`,
    endMarker: "読書終了",
    storyTime: "物語の時間",
    yourMission: "あなたのミッション",
    adLabel: "続きを読む"
  },
  pt: {
    bigQuestion: "Já sentiu que *quer* fazer algo, mas uma vozinha diz \"Não consigo\"?",
    wantToBeBetter: (cat) => `Talvez você queira ser melhor em **${cat}**. Mas parece muito difícil.`,
    voiceLying: "Sabe de uma coisa? Essa voz está mentindo!",
    learnCheatCode: (topic) => `Hoje, vamos aprender um "truque secreto". Vamos falar sobre **${topic}**.`,
    brainAnalogy: (analogy) => `Imagine que seu cérebro é um personagem de ${analogy}. Ele tem uma barra de energia.`,
    brainScared: (topic) => `Quando você tenta algo novo como ${topic}, seu cérebro fica com medo. Ele quer ficar seguro no Nível 1.`,
    bookSays: (book) => `Mas um ótimo livro *"${book}"* diz: **Você pode subir de nível.**`,
    storyIntro: (kid) => `Deixe-me contar sobre ${kid}.`,
    storyWanted: (kid, cat) => `${kid} queria ser incrível em ${cat}. Mas falhava frequentemente.`,
    storyMagicWord: (kid) => `Então, ${kid} aprendeu uma palavra mágica: **"Ainda"**.`,
    storyYet: (kid) => `Em vez de "Não consigo", ${kid} disse "Não consigo **ainda**".`,
    storyOnePct: (kid) => `${kid} parou de tentar ser perfeito. Apenas tentou ser 1% melhor.`,
    trapWarning: "Cuidado! Não diga \"Vou fazer amanhã\".",
    tomorrowNever: "O amanhã nunca chega. Só existe **Hoje**.",
    mission1: "Não seja perfeito.",
    mission2: "Seja gentil consigo mesmo.",
    mission3: (topic) => `Acredite: "Eu pratico ${topic}."`,
    endMarker: "Fim da Leitura",
    storyTime: "Hora da História",
    yourMission: "Sua Missão",
    adLabel: "Continue lendo abaixo"
  },
  ru: {
    bigQuestion: "Вы когда-нибудь чувствовали, что *хотите* что-то сделать, но голос внутри говорит \"Я не могу\"?",
    wantToBeBetter: (cat) => `Может быть, вы хотите стать лучше в **${cat}**. Но это кажется слишком сложным.`,
    voiceLying: "Знаете что? Этот голос врёт!",
    learnCheatCode: (topic) => `Сегодня мы узнаем «секретный приём». Поговорим о **${topic}**.`,
    brainAnalogy: (analogy) => `Представьте, что ваш мозг — это персонаж ${analogy}. У него есть шкала энергии.`,
    brainScared: (topic) => `Когда вы пробуете что-то новое, например ${topic}, ваш мозг пугается. Он хочет остаться на Уровне 1.`,
    bookSays: (book) => `Но великая книга *«${book}»* говорит: **Вы можете перейти на новый уровень.**`,
    storyIntro: (kid) => `Позвольте рассказать вам о ${kid}.`,
    storyWanted: (kid, cat) => `${kid} хотел быть потрясающим в ${cat}. Но часто терпел неудачу.`,
    storyMagicWord: (kid) => `Тогда ${kid} выучил волшебное слово: **«Пока»**.`,
    storyYet: (kid) => `Вместо «Я не могу» ${kid} сказал «Я **пока** не могу».`,
    storyOnePct: (kid) => `${kid} перестал стремиться к совершенству. Просто старался стать лучше на 1%.`,
    trapWarning: "Осторожно! Не говорите «Сделаю завтра».",
    tomorrowNever: "Завтра никогда не наступит. Существует только **Сегодня**.",
    mission1: "Не будьте совершенным.",
    mission2: "Будьте добры к себе.",
    mission3: (topic) => `Верьте: «Я практикую ${topic}.»`,
    endMarker: "Конец чтения",
    storyTime: "Время историй",
    yourMission: "Ваша миссия",
    adLabel: "Продолжайте читать ниже"
  },
  it: {
    bigQuestion: "Hai mai sentito di *voler* fare qualcosa, ma una vocina dice \"Non posso\"?",
    wantToBeBetter: (cat) => `Forse vuoi essere migliore in **${cat}**. Ma sembra troppo difficile.`,
    voiceLying: "Sai cosa? Quella voce sta mentendo!",
    learnCheatCode: (topic) => `Oggi impareremo un "trucco segreto". Parleremo di **${topic}**.`,
    brainAnalogy: (analogy) => `Immagina che il tuo cervello sia un personaggio di ${analogy}. Ha una barra di energia.`,
    brainScared: (topic) => `Quando provi qualcosa di nuovo come ${topic}, il tuo cervello si spaventa. Vuole restare al Livello 1.`,
    bookSays: (book) => `Ma un grande libro *"${book}"* dice: **Puoi salire di livello.**`,
    storyIntro: (kid) => `Lascia che ti parli di ${kid}.`,
    storyWanted: (kid, cat) => `${kid} voleva essere fantastico in ${cat}. Ma falliva spesso.`,
    storyMagicWord: (kid) => `Poi, ${kid} ha imparato una parola magica: **"Ancora"**.`,
    storyYet: (kid) => `Invece di "Non posso", ${kid} ha detto "Non posso **ancora**".`,
    storyOnePct: (kid) => `${kid} ha smesso di cercare di essere perfetto. Ha solo provato a essere l'1% migliore.`,
    trapWarning: "Attenzione! Non dire \"Lo farò domani\".",
    tomorrowNever: "Il domani non arriva mai. Esiste solo **Oggi**.",
    mission1: "Non essere perfetto.",
    mission2: "Sii gentile con te stesso.",
    mission3: (topic) => `Credi: "Io pratico ${topic}."`,
    endMarker: "Fine della Lettura",
    storyTime: "Ora della Storia",
    yourMission: "La Tua Missione",
    adLabel: "Continua a leggere sotto"
  },
  ar: {
    bigQuestion: "هل شعرت يوماً أنك *تريد* فعل شيء ما، لكن صوتاً صغيراً يقول \"لا أستطيع\"؟",
    wantToBeBetter: (cat) => `ربما تريد أن تكون أفضل في **${cat}**. لكن يبدو صعباً جداً.`,
    voiceLying: "أتعلم ماذا؟ هذا الصوت يكذب!",
    learnCheatCode: (topic) => `اليوم، سنتعلم "حيلة سرية". سنتحدث عن **${topic}**.`,
    brainAnalogy: (analogy) => `تخيل أن دماغك هو شخصية في ${analogy}. لديه شريط طاقة.`,
    brainScared: (topic) => `عندما تجرب شيئاً جديداً مثل ${topic}، يخاف دماغك. يريد البقاء آمناً في المستوى 1.`,
    bookSays: (book) => `لكن كتاباً رائعاً *"${book}"* يقول: **يمكنك الارتقاء للمستوى التالي.**`,
    storyIntro: (kid) => `دعني أحدثك عن ${kid}.`,
    storyWanted: (kid, cat) => `${kid} أراد أن يكون رائعاً في ${cat}. لكنه فشل كثيراً.`,
    storyMagicWord: (kid) => `ثم، تعلم ${kid} كلمة سحرية: **"بعد"**.`,
    storyYet: (kid) => `بدلاً من "لا أستطيع"، قال ${kid} "لا أستطيع **بعد**".`,
    storyOnePct: (kid) => `${kid} توقف عن محاولة أن يكون مثالياً. فقط حاول أن يكون أفضل بـ 1%.`,
    trapWarning: "انتبه! لا تقل \"سأفعلها غداً\".",
    tomorrowNever: "الغد لا يأتي أبداً. فقط **اليوم** موجود.",
    mission1: "لا تكن مثالياً.",
    mission2: "كن لطيفاً مع نفسك.",
    mission3: (topic) => `آمن: "أنا أمارس ${topic}."`,
    endMarker: "نهاية القراءة",
    storyTime: "وقت القصة",
    yourMission: "مهمتك",
    adLabel: "تابع القراءة أدناه"
  }
};

// Regional examples for cultural context
const REGIONAL_EXAMPLES: Record<Language, string> = {
  en: "Like building a Lego castle, brick by brick.",
  hi: "जैसे क्रिकेट में एक-एक रन से स्कोर बनता है, वैसे ही छोटी आदतों से जीवन बदलता है।",
  es: "Como construir un equipo de fútbol fuerte, paso a paso.",
  fr: "Comme cuisiner un bon repas, ingrédient par ingrédient.",
  de: "Wie das Bauen eines Autos, Teil für Teil.",
  zh: "就像长城不是一天建成的，一砖一瓦慢慢来。",
  ja: "折り紙を折るように、一つ一つのステップが大切です。",
  pt: "Como montar um time de futebol forte, passo a passo.",
  ru: "Как строительство дома, кирпичик за кирпичиком.",
  it: "Come costruire una squadra di calcio forte, passo dopo passo.",
  ar: "مثل بناء ناطحة سحاب، طابقاً تلو الآخر."
};

// This helper generates friendly, conversational, 10-year-old understandable content.
// It structures the content into: A Hook, The Big Idea, A Simple Story, and The "Why" (Limiting Beliefs).
// Includes ad placement markers for monetization.
const generateLongFormContent = (
  topic: LocalizedString,
  bookRef: string,
  category: string
): LocalizedString => {
  
  const generateForLang = (lang: Language): string => {
    const ctx = CULTURAL_CONTEXT[lang];
    const tmpl = CONTENT_TEMPLATES[lang];
    const topicText = topic[lang] || topic.en;
    const regionalExample = REGIONAL_EXAMPLES[lang];

    return `
# ${ctx.greeting}

**⏱️: ~4 min** | **💡: ${category}**

---

### 👋 ${lang === 'en' ? 'The Big Question' : lang === 'hi' ? 'बड़ा सवाल' : lang === 'es' ? 'La Gran Pregunta' : lang === 'fr' ? 'La Grande Question' : lang === 'de' ? 'Die Große Frage' : lang === 'zh' ? '大问题' : lang === 'ja' ? '大きな質問' : lang === 'pt' ? 'A Grande Pergunta' : lang === 'ru' ? 'Большой Вопрос' : lang === 'it' ? 'La Grande Domanda' : 'السؤال الكبير'}

${tmpl.bigQuestion}

${tmpl.wantToBeBetter(category)}

${tmpl.voiceLying}

${tmpl.learnCheatCode(topicText)}

---

### 🧠 ${ctx.analogy}

${tmpl.brainAnalogy(ctx.analogy)}

${tmpl.brainScared(topicText)}

${tmpl.bookSays(bookRef)}

${regionalExample}

---

<!-- AD_PLACEMENT_1 -->

---

### 🌟 ${tmpl.storyTime}: ${ctx.kid}

${tmpl.storyIntro(ctx.kid)}

${tmpl.storyWanted(ctx.kid, category)}

${tmpl.storyMagicWord(ctx.kid)}

${tmpl.storyYet(ctx.kid)}

${tmpl.storyOnePct(ctx.kid)}

---

### 🛑 ${ctx.trap}

${tmpl.trapWarning}

${tmpl.tomorrowNever}

---

<!-- AD_PLACEMENT_2 -->

---

### 🚀 ${tmpl.yourMission}

1. **${tmpl.mission1}**
2. **${tmpl.mission2}**
3. **${tmpl.mission3(topicText)}**

${ctx.motivation}

**${tmpl.endMarker}**
    `.trim();
  };

  return {
    en: generateForLang('en'),
    hi: generateForLang('hi'),
    es: generateForLang('es'),
    fr: generateForLang('fr'),
    de: generateForLang('de'),
    zh: generateForLang('zh'),
    ja: generateForLang('ja'),
    pt: generateForLang('pt'),
    ru: generateForLang('ru'),
    it: generateForLang('it'),
    ar: generateForLang('ar'),
  };
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

// Helper to expand a simple { en, hi } object to a full LocalizedString
const expandTopicToLocalizedString = (topic: { en: string, hi: string }): LocalizedString => ({
  en: topic.en,
  hi: topic.hi,
  es: topic.en,
  fr: topic.en,
  de: topic.en,
  zh: topic.en,
  ja: topic.en,
  pt: topic.en,
  ru: topic.en,
  it: topic.en,
  ar: topic.en,
});

// Curriculum definitions for Days 2-21
const generateDayContent = (
  dayNum: number, 
  topic: LocalizedString,
  bookRef: string, 
  category: string
): DayContent => {
  const content = generateLongFormContent(topic, bookRef, category);
  
  // Assign 3 random words from the pool for variety
  const startIdx = (dayNum * 2) % (COMMON_VOCABULARY.length - 2);
  const vocab = COMMON_VOCABULARY.slice(startIdx, startIdx + 3);

  const getDayTitle = (lang: Language): string => {
    const prefixes: Record<Language, string> = {
      en: `Day ${dayNum}: `,
      hi: `दिन ${dayNum}: `,
      es: `Día ${dayNum}: `,
      fr: `Jour ${dayNum}: `,
      de: `Tag ${dayNum}: `,
      zh: `第${dayNum}天：`,
      ja: `${dayNum}日目：`,
      pt: `Dia ${dayNum}: `,
      ru: `День ${dayNum}: `,
      it: `Giorno ${dayNum}: `,
      ar: `اليوم ${dayNum}: `,
    };
    return `${prefixes[lang]}${topic[lang]}`;
  };

  const getTask = (lang: Language): string => {
    const templates: Record<Language, string> = {
      en: `Action Time: Spend just 2 minutes practicing ${topic[lang]}. Don't worry about being perfect. Just do one tiny thing right now!`,
      hi: `एक्शन का समय: अभी सिर्फ 2 मिनट ${topic[lang]} की प्रैक्टिस करें। परफेक्ट होने की चिंता न करें। बस अभी कोई एक छोटी सी चीज़ करें!`,
      es: `¡Hora de Actuar! Dedica solo 2 minutos a practicar ${topic[lang]}. No te preocupes por ser perfecto. ¡Haz una pequeña cosa ahora!`,
      fr: `C'est l'heure d'agir ! Passe juste 2 minutes à pratiquer ${topic[lang]}. Ne t'inquiète pas d'être parfait. Fais juste une petite chose maintenant !`,
      de: `Aktionszeit: Verbringe nur 2 Minuten damit, ${topic[lang]} zu üben. Mach dir keine Sorgen, perfekt zu sein. Mach einfach eine kleine Sache jetzt!`,
      zh: `行动时间：花2分钟练习${topic[lang]}。别担心完美，现在就做一件小事！`,
      ja: `アクションタイム：${topic[lang]}を2分だけ練習しよう。完璧じゃなくていい。今すぐ小さなことを一つやってみよう！`,
      pt: `Hora da Ação: Gaste apenas 2 minutos praticando ${topic[lang]}. Não se preocupe em ser perfeito. Faça uma pequena coisa agora!`,
      ru: `Время действия: Потратьте всего 2 минуты на практику ${topic[lang]}. Не беспокойтесь о совершенстве. Просто сделайте одну маленькую вещь прямо сейчас!`,
      it: `Tempo di Azione: Dedica solo 2 minuti a praticare ${topic[lang]}. Non preoccuparti di essere perfetto. Fai solo una piccola cosa adesso!`,
      ar: `وقت العمل: اقضِ دقيقتين فقط في ممارسة ${topic[lang]}. لا تقلق بشأن الكمال. فقط افعل شيئًا صغيرًا الآن!`,
    };
    return templates[lang];
  };

  const getReflection = (lang: Language): string => {
    const templates: Record<Language, string> = {
      en: `How did it feel to try ${topic[lang]} today? Did you notice anything new about yourself?`,
      hi: `आज ${topic[lang]} को आज़माकर कैसा लगा? क्या आपने अपने बारे में कुछ नया महसूस किया?`,
      es: `¿Cómo te sentiste al intentar ${topic[lang]} hoy? ¿Notaste algo nuevo sobre ti?`,
      fr: `Comment t'es-tu senti en essayant ${topic[lang]} aujourd'hui ? As-tu remarqué quelque chose de nouveau sur toi ?`,
      de: `Wie hat es sich angefühlt, ${topic[lang]} heute auszuprobieren? Hast du etwas Neues an dir bemerkt?`,
      zh: `今天尝试${topic[lang]}感觉如何？你有没有发现自己有什么新变化？`,
      ja: `今日、${topic[lang]}を試してみてどうだった？自分について何か新しい発見はあった？`,
      pt: `Como você se sentiu ao tentar ${topic[lang]} hoje? Você notou algo novo sobre si mesmo?`,
      ru: `Как вы себя чувствовали, пробуя ${topic[lang]} сегодня? Заметили ли вы что-то новое в себе?`,
      it: `Come ti sei sentito provando ${topic[lang]} oggi? Hai notato qualcosa di nuovo su te stesso?`,
      ar: `كيف شعرت عند تجربة ${topic[lang]} اليوم؟ هل لاحظت شيئًا جديدًا عن نفسك؟`,
    };
    return templates[lang];
  };

  const languages: Language[] = ['en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ru', 'it', 'ar'];
  
  const title = {} as LocalizedString;
  const task = {} as LocalizedString;
  const reflectionPrompt = {} as LocalizedString;
  
  languages.forEach(lang => {
    title[lang] = getDayTitle(lang);
    task[lang] = getTask(lang);
    reflectionPrompt[lang] = getReflection(lang);
  });

  return {
    dayNumber: dayNum,
    title,
    reading: content,
    vocabulary: vocab,
    task,
    reflectionPrompt,
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
    topics: [
      { en: "Morning Routine", hi: "सुबह की दिनचर्या" },
      { en: "Power of Sleep", hi: "नींद की शक्ति" },
      { en: "Drink More Water", hi: "ज़्यादा पानी पियो" },
      { en: "Move Every Hour", hi: "हर घंटे चलो" },
      { en: "Deep Breathing", hi: "गहरी सांस लो" },
      { en: "Eat Real Food", hi: "असली खाना खाओ" },
      { en: "Walk After Meals", hi: "खाने के बाद चलो" },
      { en: "Screen-Free Bedtime", hi: "सोने से पहले फ़ोन बंद" },
      { en: "Stretch Daily", hi: "रोज़ स्ट्रेच करो" },
      { en: "Sunshine Time", hi: "धूप में समय बिताओ" },
      { en: "Posture Check", hi: "अपनी मुद्रा देखो" },
      { en: "Mindful Eating", hi: "ध्यान से खाओ" },
      { en: "Energy Management", hi: "ऊर्जा प्रबंधन" },
      { en: "Stress Release", hi: "तनाव मुक्ति" },
      { en: "Nature Time", hi: "प्रकृति में समय" },
      { en: "Rest Days", hi: "आराम के दिन" },
      { en: "Health Tracking", hi: "स्वास्थ्य पर नज़र" },
      { en: "Healthy Snacking", hi: "स्वस्थ नाश्ता" },
      { en: "Body Signals", hi: "शरीर के संकेत" },
      { en: "Lifetime Habits", hi: "जीवनभर की आदतें" }
    ]
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
    topics: [
      { en: "Listen First", hi: "पहले सुनो" },
      { en: "Speak Kindly", hi: "प्यार से बोलो" },
      { en: "Show Appreciation", hi: "शुक्रिया कहो" },
      { en: "Be Present", hi: "मौजूद रहो" },
      { en: "Ask Questions", hi: "सवाल पूछो" },
      { en: "Share Feelings", hi: "भावनाएं बांटो" },
      { en: "Keep Promises", hi: "वादे निभाओ" },
      { en: "Forgive Quickly", hi: "जल्दी माफ करो" },
      { en: "Give Space", hi: "जगह दो" },
      { en: "Celebrate Others", hi: "दूसरों की खुशी मनाओ" },
      { en: "Set Boundaries", hi: "सीमाएं बनाओ" },
      { en: "Be Vulnerable", hi: "खुलकर बात करो" },
      { en: "Quality Time", hi: "साथ समय बिताओ" },
      { en: "Resolve Conflicts", hi: "झगड़े सुलझाओ" },
      { en: "Trust Building", hi: "भरोसा बनाओ" },
      { en: "Empathy Practice", hi: "समझदारी दिखाओ" },
      { en: "Accept Differences", hi: "अंतर स्वीकारो" },
      { en: "Support Dreams", hi: "सपनों का साथ दो" },
      { en: "Healthy Arguments", hi: "स्वस्थ बहस" },
      { en: "Love Languages", hi: "प्यार की भाषा" }
    ]
  },
  productivity: {
    books: ["Getting Things Done", "Deep Work", "Eat That Frog"],
    topics: [
      { en: "Eat the Frog", hi: "मुश्किल काम पहले" },
      { en: "Deep Work Blocks", hi: "गहरे काम का समय" },
      { en: "Two-Minute Rule", hi: "दो मिनट का नियम" },
      { en: "Distraction Killer", hi: "विकर्षण हटाओ" },
      { en: "Energy Mapping", hi: "ऊर्जा का नक्शा" },
      { en: "Single Tasking", hi: "एक काम एक बार" },
      { en: "Weekly Review", hi: "हफ्ते की समीक्षा" },
      { en: "Say No", hi: "ना कहना सीखो" },
      { en: "Batch Similar Tasks", hi: "मिलते-जुलते काम साथ" },
      { en: "Rest to Perform", hi: "आराम से प्रदर्शन" },
      { en: "Morning Routine", hi: "सुबह की दिनचर्या" },
      { en: "Time Blocking", hi: "समय बांटना" },
      { en: "Clear Inbox", hi: "इनबॉक्स साफ करो" },
      { en: "Priority Matrix", hi: "प्राथमिकता तय करो" },
      { en: "Pomodoro Power", hi: "पोमोडोरो तकनीक" },
      { en: "Environment Design", hi: "वातावरण बनाओ" },
      { en: "Delegation", hi: "काम बांटो" },
      { en: "Saying Done", hi: "काम खत्म करो" },
      { en: "Evening Shutdown", hi: "शाम की समाप्ति" },
      { en: "System Building", hi: "प्रणाली बनाओ" }
    ]
  },
  confidence: {
    books: ["The Six Pillars of Self-Esteem", "Daring Greatly"],
    topics: [
      { en: "Self-Talk Power", hi: "खुद से बात" },
      { en: "Body Language", hi: "शारीरिक भाषा" },
      { en: "Face Small Fears", hi: "छोटे डर से लड़ो" },
      { en: "Celebrate Wins", hi: "जीत मनाओ" },
      { en: "Imposter Syndrome", hi: "धोखेबाज़ सिंड्रोम" },
      { en: "Growth Mindset", hi: "विकास मानसिकता" },
      { en: "Comfort Zone Exit", hi: "आराम क्षेत्र छोड़ो" },
      { en: "Failure is Learning", hi: "असफलता सीखना है" },
      { en: "Prepare to Win", hi: "जीतने की तैयारी" },
      { en: "Speak Up", hi: "बोलो" },
      { en: "Accept Compliments", hi: "तारीफ स्वीकारो" },
      { en: "Compare Less", hi: "तुलना कम करो" },
      { en: "Set Boundaries", hi: "सीमाएं बनाओ" },
      { en: "Own Your Story", hi: "अपनी कहानी अपनाओ" },
      { en: "Ask for Help", hi: "मदद मांगो" },
      { en: "Self-Compassion", hi: "खुद पर दया" },
      { en: "Take Action Now", hi: "अभी कदम उठाओ" },
      { en: "Be Authentic", hi: "असली बनो" },
      { en: "Handle Criticism", hi: "आलोचना संभालो" },
      { en: "Unstoppable You", hi: "अजेय तुम" }
    ]
  },
  public_speaking: {
    books: ["Talk Like TED", "The Art of Public Speaking"],
    topics: [
      { en: "Start Strong", hi: "मज़बूत शुरुआत" },
      { en: "Know Your Audience", hi: "दर्शकों को जानो" },
      { en: "Tell Stories", hi: "कहानियां सुनाओ" },
      { en: "Pause Power", hi: "रुकने की शक्ति" },
      { en: "Eye Contact", hi: "आंखों से बात" },
      { en: "Voice Variety", hi: "आवाज़ में बदलाव" },
      { en: "Body Language", hi: "शारीरिक भाषा" },
      { en: "Handle Nerves", hi: "घबराहट संभालो" },
      { en: "Simple Words", hi: "आसान शब्द" },
      { en: "Rule of Three", hi: "तीन का नियम" },
      { en: "Visual Aids", hi: "दृश्य सहायता" },
      { en: "Practice Aloud", hi: "ज़ोर से अभ्यास" },
      { en: "Handle Questions", hi: "सवाल संभालो" },
      { en: "Connect Emotionally", hi: "भावनात्मक जुड़ाव" },
      { en: "End Memorably", hi: "यादगार अंत" },
      { en: "Timing Mastery", hi: "समय प्रबंधन" },
      { en: "Impromptu Speaking", hi: "तुरंत बोलना" },
      { en: "Record Yourself", hi: "खुद को रिकॉर्ड करो" },
      { en: "Feedback Loop", hi: "प्रतिक्रिया लो" },
      { en: "Stage Presence", hi: "मंच पर छाप" }
    ]
  },
  negotiation: {
    books: ["Never Split the Difference", "Getting to Yes"],
    topics: [
      { en: "Listen More", hi: "ज़्यादा सुनो" },
      { en: "Ask Why", hi: "क्यों पूछो" },
      { en: "Mirror Technique", hi: "दर्पण तकनीक" },
      { en: "Label Emotions", hi: "भावनाओं को नाम दो" },
      { en: "Tactical Empathy", hi: "रणनीतिक सहानुभूति" },
      { en: "No Deal Option", hi: "ना कहने का विकल्प" },
      { en: "Win-Win Mindset", hi: "दोनों की जीत" },
      { en: "Know Your Value", hi: "अपनी कीमत जानो" },
      { en: "Silence Power", hi: "चुप्पी की ताकत" },
      { en: "Anchor First", hi: "पहले अंक रखो" },
      { en: "Ask for More", hi: "ज़्यादा मांगो" },
      { en: "Concession Strategy", hi: "रियायत रणनीति" },
      { en: "Body Reading", hi: "शरीर पढ़ो" },
      { en: "Time Pressure", hi: "समय का दबाव" },
      { en: "Walk Away", hi: "चले जाना" },
      { en: "Creative Options", hi: "रचनात्मक विकल्प" },
      { en: "Written Agreements", hi: "लिखित समझौते" },
      { en: "Follow Through", hi: "वादा पूरा करो" },
      { en: "Long-term View", hi: "लंबी सोच" },
      { en: "Relationship First", hi: "रिश्ता पहले" }
    ]
  },
  critical_thinking: {
    books: ["Thinking, Fast and Slow", "The Art of Thinking Clearly"],
    topics: [
      { en: "Question Everything", hi: "सब पर सवाल करो" },
      { en: "Bias Awareness", hi: "पूर्वाग्रह की जानकारी" },
      { en: "Evidence Check", hi: "सबूत जांचो" },
      { en: "Multiple Perspectives", hi: "अलग-अलग नज़रिये" },
      { en: "First Principles", hi: "मूल सिद्धांत" },
      { en: "Logical Fallacies", hi: "तर्क दोष" },
      { en: "Slow Down Thinking", hi: "धीरे सोचो" },
      { en: "Devil's Advocate", hi: "विरोधी पक्ष" },
      { en: "Data vs Opinion", hi: "तथ्य बनाम राय" },
      { en: "Cause and Effect", hi: "कारण और प्रभाव" },
      { en: "Ask Better Questions", hi: "बेहतर सवाल पूछो" },
      { en: "Admit Ignorance", hi: "अज्ञान स्वीकारो" },
      { en: "Change Your Mind", hi: "राय बदलो" },
      { en: "Probability Thinking", hi: "संभावना सोच" },
      { en: "Second-Order Effects", hi: "दूसरे दरजे के प्रभाव" },
      { en: "Inversion", hi: "उलटा सोचो" },
      { en: "Mental Models", hi: "मानसिक मॉडल" },
      { en: "Systems Thinking", hi: "प्रणाली सोच" },
      { en: "Emotional Check", hi: "भावना जांच" },
      { en: "Wise Decisions", hi: "बुद्धिमान फैसले" }
    ]
  },
  emotional_intelligence: {
    books: ["Emotional Intelligence 2.0", "Primal Leadership"],
    topics: [
      { en: "Know Your Emotions", hi: "अपनी भावनाएं जानो" },
      { en: "Name the Feeling", hi: "भावना को नाम दो" },
      { en: "Pause Before React", hi: "प्रतिक्रिया से पहले रुको" },
      { en: "Read Others", hi: "दूसरों को पढ़ो" },
      { en: "Active Listening", hi: "सक्रिय सुनना" },
      { en: "Empathy Practice", hi: "सहानुभूति अभ्यास" },
      { en: "Manage Anger", hi: "गुस्सा संभालो" },
      { en: "Handle Stress", hi: "तनाव संभालो" },
      { en: "Bounce Back", hi: "वापस उठो" },
      { en: "Social Awareness", hi: "सामाजिक जागरूकता" },
      { en: "Conflict Resolution", hi: "विवाद सुलझाना" },
      { en: "Express Clearly", hi: "स्पष्ट बोलो" },
      { en: "Motivate Others", hi: "दूसरों को प्रेरित करो" },
      { en: "Accept Feedback", hi: "प्रतिक्रिया स्वीकारो" },
      { en: "Influence Positively", hi: "सकारात्मक प्रभाव" },
      { en: "Team Harmony", hi: "टीम सामंजस्य" },
      { en: "Self-Motivation", hi: "आत्म-प्रेरणा" },
      { en: "Gratitude Daily", hi: "रोज़ आभार" },
      { en: "Emotional Balance", hi: "भावनात्मक संतुलन" },
      { en: "EQ Mastery", hi: "EQ में महारत" }
    ]
  },
  digital_detox: {
    books: ["Digital Minimalism", "Stolen Focus"],
    topics: [
      { en: "Phone-Free Morning", hi: "सुबह बिना फ़ोन" },
      { en: "Notification Off", hi: "नोटिफिकेशन बंद" },
      { en: "Social Media Limits", hi: "सोशल मीडिया सीमा" },
      { en: "One-Tab Rule", hi: "एक टैब नियम" },
      { en: "Screen-Free Meals", hi: "खाने में बिना स्क्रीन" },
      { en: "Bedtime Boundary", hi: "सोने से पहले बंद" },
      { en: "App Audit", hi: "एप्प की जांच" },
      { en: "Focus Mode", hi: "फोकस मोड" },
      { en: "Boredom is OK", hi: "बोरियत ठीक है" },
      { en: "Real Conversations", hi: "असली बातचीत" },
      { en: "Nature Time", hi: "प्रकृति में समय" },
      { en: "Reading Over Scrolling", hi: "स्क्रोल नहीं, पढ़ो" },
      { en: "Offline Hobbies", hi: "ऑफलाइन शौक" },
      { en: "Weekly Detox Day", hi: "हफ्ते का डिटॉक्स दिन" },
      { en: "Mindful Usage", hi: "सजग उपयोग" },
      { en: "Device-Free Zone", hi: "बिना डिवाइस क्षेत्र" },
      { en: "Quality Content", hi: "गुणवत्ता सामग्री" },
      { en: "Track Screen Time", hi: "स्क्रीन टाइम ट्रैक" },
      { en: "Digital Boundaries", hi: "डिजिटल सीमाएं" },
      { en: "Presence Over Posts", hi: "पोस्ट नहीं, मौजूदगी" }
    ]
  },
  stoicism: {
    books: ["Meditations", "Letters from a Stoic"],
    topics: [
      { en: "Control What You Can", hi: "जो कर सको वो करो" },
      { en: "Accept What Is", hi: "जो है स्वीकारो" },
      { en: "Morning Reflection", hi: "सुबह का मनन" },
      { en: "Evening Review", hi: "शाम की समीक्षा" },
      { en: "Negative Visualization", hi: "नकारात्मक कल्पना" },
      { en: "Present Moment", hi: "वर्तमान पल" },
      { en: "View from Above", hi: "ऊपर से देखो" },
      { en: "Voluntary Discomfort", hi: "स्वेच्छा से कष्ट" },
      { en: "Response Over Reaction", hi: "प्रतिक्रिया नहीं, जवाब" },
      { en: "Death Awareness", hi: "मृत्यु जागरूकता" },
      { en: "Obstacle is Way", hi: "बाधा ही रास्ता" },
      { en: "Virtue Practice", hi: "सद्गुण अभ्यास" },
      { en: "Detach from Outcome", hi: "फल से अलग" },
      { en: "Amor Fati", hi: "भाग्य से प्रेम" },
      { en: "Simplify Life", hi: "जीवन सरल करो" },
      { en: "Inner Citadel", hi: "आंतरिक किला" },
      { en: "Wisdom Seeking", hi: "ज्ञान की खोज" },
      { en: "Justice Daily", hi: "रोज़ न्याय" },
      { en: "Courage in Action", hi: "कार्य में साहस" },
      { en: "Stoic Calm", hi: "स्टोइक शांति" }
    ]
  },
  minimalism: {
    books: ["Goodbye, Things", "The Life-Changing Magic of Tidying Up"],
    topics: [
      { en: "Less is More", hi: "कम में ज़्यादा" },
      { en: "Declutter Space", hi: "जगह साफ करो" },
      { en: "One In One Out", hi: "एक आया एक गया" },
      { en: "Digital Minimalism", hi: "डिजिटल न्यूनतमवाद" },
      { en: "Quality Over Quantity", hi: "मात्रा नहीं, गुणवत्ता" },
      { en: "Capsule Wardrobe", hi: "कम कपड़े" },
      { en: "Clear Mind", hi: "साफ दिमाग" },
      { en: "Intentional Living", hi: "उद्देश्यपूर्ण जीवन" },
      { en: "Say No to Clutter", hi: "गंदगी को ना" },
      { en: "Time Minimalism", hi: "समय की सरलता" },
      { en: "Experiences Over Things", hi: "चीज़ों से अनुभव" },
      { en: "Gratitude Practice", hi: "आभार अभ्यास" },
      { en: "Financial Freedom", hi: "आर्थिक आज़ादी" },
      { en: "Relationship Quality", hi: "रिश्तों की गुणवत्ता" },
      { en: "Essential Focus", hi: "ज़रूरी पर ध्यान" },
      { en: "Let Go", hi: "छोड़ना सीखो" },
      { en: "Simple Routines", hi: "सरल दिनचर्या" },
      { en: "Mindful Consumption", hi: "सजग उपभोग" },
      { en: "Space to Breathe", hi: "सांस लेने की जगह" },
      { en: "Joy of Less", hi: "कम का आनंद" }
    ]
  },
  learning: {
    books: ["Ultralearning", "Make It Stick"],
    topics: [
      { en: "Learn How to Learn", hi: "सीखना सीखो" },
      { en: "Active Recall", hi: "सक्रिय याद" },
      { en: "Spaced Repetition", hi: "अंतराल दोहराव" },
      { en: "Focus Deeply", hi: "गहरा ध्यान" },
      { en: "Take Notes Right", hi: "सही नोट्स लो" },
      { en: "Teach to Learn", hi: "सिखाकर सीखो" },
      { en: "Make Mistakes", hi: "गलतियां करो" },
      { en: "Curiosity Drive", hi: "जिज्ञासा जगाओ" },
      { en: "Practice Deliberately", hi: "जानबूझकर अभ्यास" },
      { en: "Sleep to Remember", hi: "नींद से याद" },
      { en: "Connect Ideas", hi: "विचार जोड़ो" },
      { en: "Read Actively", hi: "सक्रिय पढ़ाई" },
      { en: "Feedback Loop", hi: "प्रतिक्रिया लो" },
      { en: "Break it Down", hi: "टुकड़ों में सीखो" },
      { en: "Immersive Learning", hi: "डूबकर सीखो" },
      { en: "Build Mental Models", hi: "मानसिक मॉडल बनाओ" },
      { en: "Learning Sprints", hi: "सीखने की दौड़" },
      { en: "Review Regularly", hi: "नियमित समीक्षा" },
      { en: "Apply Knowledge", hi: "ज्ञान लागू करो" },
      { en: "Lifelong Learner", hi: "आजीवन शिक्षार्थी" }
    ]
  },
  networking: {
    books: ["Never Eat Alone", "How to Win Friends and Influence People"],
    topics: [
      { en: "Be Genuinely Interested", hi: "सच्ची दिलचस्पी" },
      { en: "Remember Names", hi: "नाम याद रखो" },
      { en: "Give First", hi: "पहले दो" },
      { en: "Follow Up", hi: "फॉलो-अप करो" },
      { en: "Be a Connector", hi: "जोड़ने वाले बनो" },
      { en: "Listen More", hi: "ज़्यादा सुनो" },
      { en: "Share Knowledge", hi: "ज्ञान बांटो" },
      { en: "Attend Events", hi: "कार्यक्रमों में जाओ" },
      { en: "Online Presence", hi: "ऑनलाइन उपस्थिति" },
      { en: "Add Value", hi: "मूल्य जोड़ो" },
      { en: "Build Trust", hi: "भरोसा बनाओ" },
      { en: "Stay in Touch", hi: "संपर्क में रहो" },
      { en: "Find Mentors", hi: "मेंटर खोजो" },
      { en: "Help Others Grow", hi: "दूसरों को बढ़ाओ" },
      { en: "Be Reliable", hi: "भरोसेमंद बनो" },
      { en: "Ask for Introductions", hi: "परिचय करवाओ" },
      { en: "Be Patient", hi: "धैर्य रखो" },
      { en: "Quality Over Quantity", hi: "मात्रा नहीं, गुणवत्ता" },
      { en: "Express Gratitude", hi: "आभार व्यक्त करो" },
      { en: "Network for Life", hi: "जीवनभर का नेटवर्क" }
    ]
  },
  entrepreneurship: {
    books: ["The Lean Startup", "Zero to One"],
    topics: [
      { en: "Find a Problem", hi: "समस्या खोजो" },
      { en: "Start Small", hi: "छोटे से शुरू" },
      { en: "Talk to Customers", hi: "ग्राहकों से बात" },
      { en: "MVP Mindset", hi: "MVP मानसिकता" },
      { en: "Fail Fast", hi: "जल्दी असफल हो" },
      { en: "Pivot When Needed", hi: "जरूरत पर बदलो" },
      { en: "Build a Team", hi: "टीम बनाओ" },
      { en: "Revenue First", hi: "पहले कमाई" },
      { en: "Marketing Basics", hi: "मार्केटिंग मूल" },
      { en: "Sales Skills", hi: "बिक्री कौशल" },
      { en: "Money Management", hi: "पैसा प्रबंधन" },
      { en: "Time as Currency", hi: "समय ही धन" },
      { en: "Network Building", hi: "नेटवर्क बनाओ" },
      { en: "Handle Rejection", hi: "अस्वीकृति संभालो" },
      { en: "Persist Daily", hi: "रोज़ डटे रहो" },
      { en: "Learn from Others", hi: "दूसरों से सीखो" },
      { en: "Think Big", hi: "बड़ा सोचो" },
      { en: "Stay Lean", hi: "कम में काम" },
      { en: "Customer Focus", hi: "ग्राहक पर ध्यान" },
      { en: "Scale Smart", hi: "समझदारी से बढ़ो" }
    ]
  },
  happiness: {
    books: ["The Happiness Project", "The Art of Happiness"],
    topics: [
      { en: "Gratitude Morning", hi: "सुबह आभार" },
      { en: "Savor Small Moments", hi: "छोटे पल संजो" },
      { en: "Acts of Kindness", hi: "दया के काम" },
      { en: "Move Your Body", hi: "शरीर हिलाओ" },
      { en: "Connect Daily", hi: "रोज़ जुड़ो" },
      { en: "Purpose Finding", hi: "उद्देश्य खोजो" },
      { en: "Let Go of Grudges", hi: "शिकायत छोड़ो" },
      { en: "Nature Therapy", hi: "प्रकृति से जुड़ो" },
      { en: "Play Like a Kid", hi: "बच्चों जैसे खेलो" },
      { en: "Enough is Enough", hi: "पर्याप्त काफी है" },
      { en: "Sleep Well", hi: "अच्छी नींद" },
      { en: "Limit Comparisons", hi: "तुलना कम" },
      { en: "Give to Others", hi: "दूसरों को दो" },
      { en: "Positive Self-Talk", hi: "सकारात्मक आत्म-वार्ता" },
      { en: "Create Something", hi: "कुछ बनाओ" },
      { en: "Celebrate Progress", hi: "प्रगति मनाओ" },
      { en: "Meaningful Work", hi: "अर्थपूर्ण काम" },
      { en: "Accept Imperfection", hi: "अपूर्णता स्वीकारो" },
      { en: "Live in Present", hi: "वर्तमान में जियो" },
      { en: "Choose Happiness", hi: "खुशी चुनो" }
    ]
  },
  anger_management: {
    books: ["Anger", "The Cow in the Parking Lot"],
    topics: [
      { en: "Recognize Triggers", hi: "ट्रिगर पहचानो" },
      { en: "Pause Before React", hi: "प्रतिक्रिया से पहले रुको" },
      { en: "Deep Breaths", hi: "गहरी सांस" },
      { en: "Count to Ten", hi: "दस तक गिनो" },
      { en: "Physical Release", hi: "शारीरिक निकास" },
      { en: "Reframe Thoughts", hi: "सोच बदलो" },
      { en: "Express Calmly", hi: "शांति से बोलो" },
      { en: "Use I-Statements", hi: "मैं-वाक्य उपयोग करो" },
      { en: "Take a Walk", hi: "टहलने जाओ" },
      { en: "Sleep on It", hi: "सोकर देखो" },
      { en: "Forgive to Free", hi: "माफ करो, मुक्त हो" },
      { en: "Empathy Practice", hi: "सहानुभूति अभ्यास" },
      { en: "Healthy Boundaries", hi: "स्वस्थ सीमाएं" },
      { en: "Humor Helps", hi: "हंसी मदद करती है" },
      { en: "Journal Feelings", hi: "भावनाएं लिखो" },
      { en: "Stress Management", hi: "तनाव प्रबंधन" },
      { en: "Let Small Things Go", hi: "छोटी बातें छोड़ो" },
      { en: "Seek Solutions", hi: "समाधान खोजो" },
      { en: "Know Your Worth", hi: "अपनी कीमत जानो" },
      { en: "Inner Peace", hi: "आंतरिक शांति" }
    ]
  },
  decision_making: {
    books: ["Decisive", "Smart Choices"],
    topics: [
      { en: "Define the Problem", hi: "समस्या परिभाषित करो" },
      { en: "Gather Information", hi: "जानकारी इकठ्ठा करो" },
      { en: "List Options", hi: "विकल्प सूचीबद्ध करो" },
      { en: "Pros and Cons", hi: "फायदे और नुकसान" },
      { en: "Trust Your Gut", hi: "अपनी अंतरात्मा सुनो" },
      { en: "Sleep on Big Decisions", hi: "बड़े फैसले सोकर लो" },
      { en: "Avoid Analysis Paralysis", hi: "अति-विश्लेषण से बचो" },
      { en: "Consider Long-term", hi: "लंबे समय सोचो" },
      { en: "Reversible vs Irreversible", hi: "पलटने योग्य या नहीं" },
      { en: "Set a Deadline", hi: "समय सीमा तय करो" },
      { en: "Accept Imperfection", hi: "अपूर्णता स्वीकारो" },
      { en: "Learn from Past", hi: "अतीत से सीखो" },
      { en: "Seek Advice", hi: "सलाह लो" },
      { en: "Consider Others", hi: "दूसरों को सोचो" },
      { en: "Values Alignment", hi: "मूल्यों से मेल" },
      { en: "Risk Assessment", hi: "जोखिम आकलन" },
      { en: "Opportunity Cost", hi: "अवसर लागत" },
      { en: "Commit Fully", hi: "पूरी प्रतिबद्धता" },
      { en: "Review Decisions", hi: "फैसलों की समीक्षा" },
      { en: "Decisive Action", hi: "निर्णायक कार्यवाही" }
    ]
  },
  sales: {
    books: ["To Sell Is Human", "The Psychology of Selling"],
    topics: [
      { en: "Listen First", hi: "पहले सुनो" },
      { en: "Understand Needs", hi: "ज़रूरतें समझो" },
      { en: "Build Trust", hi: "भरोसा बनाओ" },
      { en: "Tell Stories", hi: "कहानियां सुनाओ" },
      { en: "Handle Objections", hi: "आपत्तियां संभालो" },
      { en: "Ask Questions", hi: "सवाल पूछो" },
      { en: "Show Value", hi: "मूल्य दिखाओ" },
      { en: "Follow Up", hi: "फॉलो-अप करो" },
      { en: "Be Authentic", hi: "असली बनो" },
      { en: "Know Your Product", hi: "उत्पाद जानो" },
      { en: "Solve Problems", hi: "समस्याएं सुलझाओ" },
      { en: "Close with Confidence", hi: "आत्मविश्वास से बंद करो" },
      { en: "Handle Rejection", hi: "अस्वीकृति संभालो" },
      { en: "Create Urgency", hi: "तात्कालिकता बनाओ" },
      { en: "Referral Magic", hi: "रेफरल का जादू" },
      { en: "Body Language", hi: "शारीरिक भाषा" },
      { en: "Pricing Psychology", hi: "कीमत मनोविज्ञान" },
      { en: "Long-term Relationships", hi: "लंबे रिश्ते" },
      { en: "Serve Don't Sell", hi: "बेचो नहीं, सेवा करो" },
      { en: "Sales Mindset", hi: "बिक्री मानसिकता" }
    ]
  },
  body_language: {
    books: ["What Every Body Is Saying", "The Definitive Book of Body Language"],
    topics: [
      { en: "First Impressions", hi: "पहली छाप" },
      { en: "Eye Contact Power", hi: "आंखों की ताकत" },
      { en: "Confident Posture", hi: "आत्मविश्वासी मुद्रा" },
      { en: "Hand Gestures", hi: "हाथ के इशारे" },
      { en: "Facial Expressions", hi: "चेहरे के भाव" },
      { en: "Reading Others", hi: "दूसरों को पढ़ो" },
      { en: "Space and Distance", hi: "जगह और दूरी" },
      { en: "Mirroring", hi: "दर्पण" },
      { en: "Detecting Lies", hi: "झूठ पकड़ो" },
      { en: "Nervous Habits", hi: "घबराहट की आदतें" },
      { en: "Power Poses", hi: "शक्ति मुद्राएं" },
      { en: "Open vs Closed", hi: "खुला बनाम बंद" },
      { en: "Feet Don't Lie", hi: "पैर झूठ नहीं बोलते" },
      { en: "Voice Tone", hi: "आवाज़ का लहजा" },
      { en: "Cultural Differences", hi: "सांस्कृतिक अंतर" },
      { en: "Interview Skills", hi: "साक्षात्कार कौशल" },
      { en: "Presentation Body", hi: "प्रस्तुति शरीर" },
      { en: "Dating Signals", hi: "डेटिंग संकेत" },
      { en: "Leadership Presence", hi: "नेतृत्व उपस्थिति" },
      { en: "Authentic Expression", hi: "असली अभिव्यक्ति" }
    ]
  },
  burnout: {
    books: ["Burnout", "Peak Performance"],
    topics: [
      { en: "Recognize Signs", hi: "संकेत पहचानो" },
      { en: "Rest Without Guilt", hi: "बिना दोष आराम" },
      { en: "Set Boundaries", hi: "सीमाएं बनाओ" },
      { en: "Say No", hi: "ना कहो" },
      { en: "Unplug Daily", hi: "रोज़ अनप्लग" },
      { en: "Sleep Priority", hi: "नींद प्राथमिकता" },
      { en: "Energy Audit", hi: "ऊर्जा जांच" },
      { en: "Joy Activities", hi: "खुशी की गतिविधियां" },
      { en: "Social Support", hi: "सामाजिक सहारा" },
      { en: "Work-Life Balance", hi: "काम-जीवन संतुलन" },
      { en: "Mindful Breaks", hi: "सजग विराम" },
      { en: "Physical Care", hi: "शारीरिक देखभाल" },
      { en: "Emotional Release", hi: "भावनात्मक निकास" },
      { en: "Simplify Tasks", hi: "काम सरल करो" },
      { en: "Delegate More", hi: "ज़्यादा बांटो" },
      { en: "Passion Projects", hi: "जुनून परियोजनाएं" },
      { en: "Nature Healing", hi: "प्रकृति से ठीक" },
      { en: "Digital Detox", hi: "डिजिटल डिटॉक्स" },
      { en: "Gratitude Practice", hi: "आभार अभ्यास" },
      { en: "Sustainable Pace", hi: "टिकाऊ गति" }
    ]
  },
  parenting: {
    books: ["The Conscious Parent", "Whole-Brain Child"],
    topics: [
      { en: "Listen to Your Child", hi: "बच्चे की सुनो" },
      { en: "Quality Time", hi: "गुणवत्ता समय" },
      { en: "Be Present", hi: "मौजूद रहो" },
      { en: "Model Behavior", hi: "व्यवहार दिखाओ" },
      { en: "Emotional Coaching", hi: "भावनात्मक मार्गदर्शन" },
      { en: "Positive Discipline", hi: "सकारात्मक अनुशासन" },
      { en: "Encourage Curiosity", hi: "जिज्ञासा बढ़ाओ" },
      { en: "Allow Mistakes", hi: "गलतियां करने दो" },
      { en: "Praise Effort", hi: "प्रयास की तारीफ" },
      { en: "Set Boundaries", hi: "सीमाएं बनाओ" },
      { en: "Connect Before Correct", hi: "सुधार से पहले जुड़ो" },
      { en: "Validate Feelings", hi: "भावनाएं मान्य करो" },
      { en: "Be Consistent", hi: "सुसंगत रहो" },
      { en: "Self-Care First", hi: "पहले अपनी देखभाल" },
      { en: "Family Rituals", hi: "पारिवारिक रीति" },
      { en: "Open Communication", hi: "खुला संवाद" },
      { en: "Respect Individuality", hi: "व्यक्तित्व का सम्मान" },
      { en: "Teach Responsibility", hi: "जिम्मेदारी सिखाओ" },
      { en: "Unconditional Love", hi: "बिना शर्त प्यार" },
      { en: "Growing Together", hi: "साथ बढ़ना" }
    ]
  },
  spirituality: {
    books: ["The Untethered Soul", "The Power of Now"],
    topics: [
      { en: "Present Moment", hi: "वर्तमान पल" },
      { en: "Inner Stillness", hi: "आंतरिक शांति" },
      { en: "Observe Thoughts", hi: "विचार देखो" },
      { en: "Let Go", hi: "छोड़ दो" },
      { en: "Connect to Source", hi: "स्रोत से जुड़ो" },
      { en: "Gratitude Ritual", hi: "आभार रीति" },
      { en: "Compassion Practice", hi: "करुणा अभ्यास" },
      { en: "Sacred Silence", hi: "पवित्र मौन" },
      { en: "Nature Connection", hi: "प्रकृति से जुड़ाव" },
      { en: "Surrender Control", hi: "नियंत्रण छोड़ो" },
      { en: "Finding Purpose", hi: "उद्देश्य खोजना" },
      { en: "Inner Peace", hi: "आंतरिक शांति" },
      { en: "Beyond Ego", hi: "अहंकार से परे" },
      { en: "Faith and Trust", hi: "विश्वास और भरोसा" },
      { en: "Sacred Rituals", hi: "पवित्र रीतियां" },
      { en: "Forgiveness", hi: "क्षमा" },
      { en: "Love Unconditionally", hi: "बिना शर्त प्यार" },
      { en: "Service to Others", hi: "दूसरों की सेवा" },
      { en: "Mindful Living", hi: "सजग जीवन" },
      { en: "Oneness", hi: "एकता" }
    ]
  },
  dopamine: {
    books: ["Dopamine Nation", "The Hacking of the American Mind"],
    topics: [
      { en: "Understand Dopamine", hi: "डोपामाइन समझो" },
      { en: "Pleasure vs Happiness", hi: "आनंद बनाम खुशी" },
      { en: "Digital Addiction", hi: "डिजिटल लत" },
      { en: "Dopamine Fasting", hi: "डोपामाइन उपवास" },
      { en: "Delay Gratification", hi: "संतुष्टि टालो" },
      { en: "Natural Rewards", hi: "प्राकृतिक पुरस्कार" },
      { en: "Boredom Tolerance", hi: "बोरियत सहनशीलता" },
      { en: "Social Media Limits", hi: "सोशल मीडिया सीमा" },
      { en: "Exercise High", hi: "व्यायाम से खुशी" },
      { en: "Cold Exposure", hi: "ठंड का अनुभव" },
      { en: "Mindful Consumption", hi: "सजग उपभोग" },
      { en: "Sleep Quality", hi: "नींद की गुणवत्ता" },
      { en: "Novelty Balance", hi: "नवीनता संतुलन" },
      { en: "Achievement Dopamine", hi: "उपलब्धि डोपामाइन" },
      { en: "Connection Reward", hi: "जुड़ाव का पुरस्कार" },
      { en: "Food and Brain", hi: "भोजन और दिमाग" },
      { en: "Music Therapy", hi: "संगीत चिकित्सा" },
      { en: "Creative Flow", hi: "रचनात्मक प्रवाह" },
      { en: "Reset Baseline", hi: "बेसलाइन रीसेट" },
      { en: "Sustainable Joy", hi: "टिकाऊ खुशी" }
    ]
  },
  personal_branding: {
    books: ["Crushing It!", "Building a StoryBrand"],
    topics: [
      { en: "Know Your Why", hi: "अपना क्यों जानो" },
      { en: "Define Your Niche", hi: "अपना क्षेत्र परिभाषित करो" },
      { en: "Unique Value", hi: "अनोखा मूल्य" },
      { en: "Tell Your Story", hi: "अपनी कहानी सुनाओ" },
      { en: "Consistent Voice", hi: "सुसंगत आवाज़" },
      { en: "Visual Identity", hi: "दृश्य पहचान" },
      { en: "Online Presence", hi: "ऑनलाइन उपस्थिति" },
      { en: "Content Strategy", hi: "सामग्री रणनीति" },
      { en: "Build Credibility", hi: "विश्वसनीयता बनाओ" },
      { en: "Network Smartly", hi: "समझदारी से नेटवर्क" },
      { en: "Share Knowledge", hi: "ज्ञान बांटो" },
      { en: "Be Authentic", hi: "असली बनो" },
      { en: "Engage Community", hi: "समुदाय से जुड़ो" },
      { en: "Handle Criticism", hi: "आलोचना संभालो" },
      { en: "Collaborate", hi: "सहयोग करो" },
      { en: "Measure Impact", hi: "प्रभाव मापो" },
      { en: "Adapt and Evolve", hi: "अनुकूलित और विकसित" },
      { en: "Protect Reputation", hi: "प्रतिष्ठा बचाओ" },
      { en: "Monetize Brand", hi: "ब्रांड से कमाओ" },
      { en: "Legacy Building", hi: "विरासत बनाना" }
    ]
  },
  // Default curriculum for any missing ones
  generic: {
    books: ["The Compound Effect", "Mindset", "Grit"],
    topics: Array.from({ length: 20 }, (_, i) => ({ en: `Winning Habit ${i+1}`, hi: `जीतने की आदत ${i+1}` }))
  }
};

export const UI_LABELS = {
  welcome: { 
    en: "Lapaas Mindset", hi: "लपास माइंडसेट", es: "Mentalidad Lapaas", fr: "Mentalité Lapaas", de: "Lapaas Mindset", 
    zh: "Lapaas 思维模式", ja: "Lapaas マインドセット", pt: "Mentalidade Lapaas", ru: "Мышление Lapaas", it: "Mentalità Lapaas", ar: "عقلية لاباس" 
  },
  tagline: { 
    en: "Change your life in 21 days.", hi: "21 दिनों में अपना जीवन बदलें।", es: "Cambia tu vida en 21 días.", fr: "Changez votre vie en 21 jours.", de: "Ändere dein Leben in 21 Tagen.", 
    zh: "21天改变你的人生。", ja: "21日間で人生を変えよう。", pt: "Mude sua vida em 21 dias.", ru: "Измените свою жизнь за 21 день.", it: "Cambia la tua vita in 21 giorni.", ar: "غير حياتك في 21 يومًا." 
  },
  startJourney: { 
    en: "Build Mindset", hi: "माइंडसेट बनाएं", es: "Construir Mentalidad", fr: "Forger le Mental", de: "Mindset aufbauen", 
    zh: "建立思维模式", ja: "マインドセット構築", pt: "Criar Mentalidade", ru: "Создать мышление", it: "Costruisci Mentalità", ar: "بناء العقلية" 
  },
  continueJourney: { 
    en: "Continue", hi: "जारी रखें", es: "Continuar", fr: "Continuer", de: "Weiter", 
    zh: "继续", ja: "続ける", pt: "Continuar", ru: "Продолжить", it: "Continua", ar: "استمر" 
  },
  recommended: { 
    en: "Best For You", hi: "आपके लिए सबसे अच्छा", es: "Lo Mejor para Ti", fr: "Recommandé pour vous", de: "Beste für dich", 
    zh: "为你推荐", ja: "あなたにおすすめ", pt: "Melhor para Você", ru: "Лучшее для вас", it: "Consigliato per te", ar: "الأفضل لك" 
  },
  allJourneys: { 
    en: "Choose Your Adventure", hi: "अपना रोमांच चुनें", es: "Elige tu Aventura", fr: "Choisissez votre Aventure", de: "Wähle dein Abenteuer", 
    zh: "选择你的冒险", ja: "冒険を選ぼう", pt: "Escolha sua Aventura", ru: "Выберите приключение", it: "Scegli la tua Avventura", ar: "اختر مغامرتك" 
  },
  day: { 
    en: "Level", hi: "लेवल", es: "Nivel", fr: "Niveau", de: "Level", 
    zh: "等级", ja: "レベル", pt: "Nível", ru: "Уровень", it: "Livello", ar: "مستوى" 
  }, 
  completed: { 
    en: "Won", hi: "जीत गए", es: "Ganado", fr: "Gagné", de: "Gewonnen", 
    zh: "赢了", ja: "勝利", pt: "Venceu", ru: "Победа", it: "Vinto", ar: "فزت" 
  },
  task: { 
    en: "Mission", hi: "मिशन", es: "Misión", fr: "Mission", de: "Mission", 
    zh: "任务", ja: "ミッション", pt: "Missão", ru: "Миссия", it: "Missione", ar: "مهمة" 
  }, 
  reading: { 
    en: "Story", hi: "कहानी", es: "Historia", fr: "Histoire", de: "Geschichte", 
    zh: "故事", ja: "ストーリー", pt: "História", ru: "История", it: "Storia", ar: "قصة" 
  }, 
  reflection: { 
    en: "Think", hi: "सोचें", es: "Piensa", fr: "Réfléchir", de: "Nachdenken", 
    zh: "思考", ja: "考える", pt: "Pensar", ru: "Думать", it: "Rifletti", ar: "فكر" 
  },
  save: { 
    en: "Save Progress", hi: "प्रगति सहेजें", es: "Guardar Progreso", fr: "Sauvegarder", de: "Speichern", 
    zh: "保存进度", ja: "保存", pt: "Salvar", ru: "Сохранить", it: "Salva", ar: "حفظ التقدم" 
  },
  saved: { 
    en: "Saved!", hi: "सहेजा गया!", es: "¡Guardado!", fr: "Sauvegardé !", de: "Gespeichert!", 
    zh: "已保存！", ja: "保存しました！", pt: "Salvo!", ru: "Сохранено!", it: "Salvato!", ar: "تم الحفظ!" 
  },
  next: { 
    en: "Next", hi: "अगला", es: "Siguiente", fr: "Suivant", de: "Nächste", 
    zh: "下一个", ja: "次へ", pt: "Próximo", ru: "Далее", it: "Avanti", ar: "التالي" 
  },
  nextStep: { 
    en: "Next Step", hi: "अगला कदम", es: "Siguiente Paso", fr: "Étape Suivante", de: "Nächster Schritt", 
    zh: "下一步", ja: "次のステップ", pt: "Próximo Passo", ru: "Следующий шаг", it: "Prossimo Passo", ar: "الخطوة التالية" 
  },
  prev: { 
    en: "Back", hi: "पीछे", es: "Atrás", fr: "Retour", de: "Zurück", 
    zh: "返回", ja: "戻る", pt: "Voltar", ru: "Назад", it: "Indietro", ar: "رجوع" 
  },
  nextDay: { 
    en: "Next Level", hi: "अगला लेवल", es: "Siguiente Nivel", fr: "Niveau Suivant", de: "Nächstes Level", 
    zh: "下一级", ja: "次のレベル", pt: "Próximo Nível", ru: "Следующий уровень", it: "Prossimo Livello", ar: "المستوى التالي" 
  },
  home: { 
    en: "Home", hi: "होम", es: "Inicio", fr: "Accueil", de: "Startseite", 
    zh: "首页", ja: "ホーム", pt: "Início", ru: "Главная", it: "Home", ar: "الرئيسية" 
  },
  quizTitle: { 
    en: "Find Your Path", hi: "अपनी राह खोजें", es: "Encuentra tu Camino", fr: "Trouvez votre Voie", de: "Finde deinen Weg", 
    zh: "寻找你的道路", ja: "道を見つけよう", pt: "Encontre seu Caminho", ru: "Найдите свой путь", it: "Trova il tuo Percorso", ar: "جد طريقك" 
  },
  skip: { 
    en: "Skip", hi: "छोड़ें", es: "Omitir", fr: "Passer", de: "Überspringen", 
    zh: "跳过", ja: "スキップ", pt: "Pular", ru: "Пропустить", it: "Salta", ar: "تخطي" 
  },
  journalPlaceholder: { 
    en: "Type your thoughts here...", hi: "अपने विचार यहाँ लिखें...", es: "Escribe tus pensamientos...", fr: "Écrivez vos pensées ici...", de: "Schreibe deine Gedanken hier...", 
    zh: "在这里输入你的想法...", ja: "ここに考えを入力...", pt: "Digite seus pensamentos...", ru: "Напишите свои мысли...", it: "Scrivi qui i tuoi pensieri...", ar: "اكتب أفكارك هنا..." 
  },
  taskInputPlaceholder: { 
    en: "Type your answer here...", hi: "अपना उत्तर यहाँ लिखें...", es: "Escribe tu respuesta...", fr: "Écrivez votre réponse...", de: "Schreibe deine Antwort...", 
    zh: "在这里输入你的答案...", ja: "ここに回答を入力...", pt: "Digite sua resposta...", ru: "Напишите свой ответ...", it: "Scrivi la tua risposta...", ar: "اكتب إجابتك هنا..." 
  },
  progress: { 
    en: "XP", hi: "XP", es: "XP", fr: "XP", de: "XP", 
    zh: "XP", ja: "XP", pt: "XP", ru: "XP", it: "XP", ar: "XP" 
  },
  congrats: { 
    en: "You Won!", hi: "आप जीत गए!", es: "¡Ganaste!", fr: "Vous avez gagné !", de: "Gewonnen!", 
    zh: "你赢了！", ja: "勝利！", pt: "Você Venceu!", ru: "Вы выиграли!", it: "Hai Vinto!", ar: "لقد فزت!" 
  },
  moduleComplete: { 
    en: "Journey Complete!", hi: "यात्रा पूरी हुई!", es: "¡Viaje Completado!", fr: "Voyage Terminé !", de: "Reise Beendet!", 
    zh: "旅程完成！", ja: "旅が完了しました！", pt: "Jornada Concluída!", ru: "Путешествие завершено!", it: "Viaggio Completato!", ar: "اكتملت الرحلة!" 
  },
  reset: { 
    en: "Restart", hi: "फिर से शुरू करें", es: "Reiniciar", fr: "Redémarrer", de: "Neustart", 
    zh: "重新开始", ja: "再起動", pt: "Reiniciar", ru: "Перезапуск", it: "Ricomincia", ar: "إعادة التشغيل" 
  },
  reviewJourney: { 
    en: "Look Back", hi: "पीछे देखें", es: "Mirar Atrás", fr: "Rétrospective", de: "Rückblick", 
    zh: "回顾", ja: "振り返る", pt: "Olhar para Trás", ru: "Оглянуться назад", it: "Guarda Indietro", ar: "نظرة إلى الوراء" 
  },
  myJournal: { 
    en: "My Diary", hi: "मेरी डायरी", es: "Mi Diario", fr: "Mon Journal", de: "Mein Tagebuch", 
    zh: "我的日记", ja: "私の日記", pt: "Meu Diário", ru: "Мой дневник", it: "Il Mio Diario", ar: "مذكراتي" 
  },
  stepReading: { 
    en: "Read", hi: "पढें", es: "Leer", fr: "Lire", de: "Lesen", 
    zh: "阅读", ja: "読む", pt: "Ler", ru: "Читать", it: "Leggi", ar: "اقرأ" 
  },
  stepTask: { 
    en: "Do", hi: "करें", es: "Hacer", fr: "Faire", de: "Tun", 
    zh: "做", ja: "行う", pt: "Fazer", ru: "Делать", it: "Fai", ar: "افعل" 
  },
  stepReflection: { 
    en: "Think", hi: "सोचें", es: "Pensar", fr: "Penser", de: "Denken", 
    zh: "思考", ja: "考える", pt: "Pensar", ru: "Думать", it: "Pensa", ar: "فكر" 
  },
  goToTask: { 
    en: "Go to Mission", hi: "मिशन पर जाएं", es: "Ir a la Misión", fr: "Aller à la Mission", de: "Zur Mission", 
    zh: "去任务", ja: "ミッションへ", pt: "Ir para Missão", ru: "К миссии", it: "Vai alla Missione", ar: "اذهب للمهمة" 
  },
  goToReflection: { 
    en: "Go to Thinking", hi: "सोचने पर जाएं", es: "Ir a Pensar", fr: "Aller à la Réflexion", de: "Zum Nachdenken", 
    zh: "去思考", ja: "思考へ", pt: "Ir para Reflexão", ru: "К размышлению", it: "Vai alla Riflessione", ar: "اذهب للتفكير" 
  },
  activityCalendar: { 
    en: "Activity Map", hi: "गतिविधि नक्शा", es: "Mapa de Actividad", fr: "Carte d'Activité", de: "Aktivitätskarte", 
    zh: "活动地图", ja: "活動マップ", pt: "Mapa de Atividade", ru: "Карта активности", it: "Mappa Attività", ar: "خريطة النشاط" 
  },
  share: { 
    en: "Share", hi: "शेयर करें", es: "Compartir", fr: "Partager", de: "Teilen", 
    zh: "分享", ja: "共有", pt: "Compartilhar", ru: "Поделиться", it: "Condividi", ar: "شارك" 
  },
  shareAchievement: { 
    en: "Share Win", hi: "जीत शेयर करें", es: "Compartir Logro", fr: "Partager Victoire", de: "Sieg teilen", 
    zh: "分享胜利", ja: "勝利を共有", pt: "Compartilhar Vitória", ru: "Поделиться победой", it: "Condividi Vittoria", ar: "شارك الفوز" 
  },
  shareProgress: { 
    en: "Share XP", hi: "XP शेयर करें", es: "Compartir XP", fr: "Partager XP", de: "XP teilen", 
    zh: "分享 XP", ja: "XPを共有", pt: "Compartilhar XP", ru: "Поделиться XP", it: "Condividi XP", ar: "شارك XP" 
  },
  copied: { 
    en: "Copied!", hi: "कॉपी किया गया!", es: "¡Copiado!", fr: "Copié !", de: "Kopiert!", 
    zh: "已复制！", ja: "コピーしました！", pt: "Copiado!", ru: "Скопировано!", it: "Copiato!", ar: "تم النسخ!" 
  },
  settings: { 
    en: "Settings", hi: "सेटिंग्स", es: "Ajustes", fr: "Paramètres", de: "Einstellungen", 
    zh: "设置", ja: "設定", pt: "Configurações", ru: "Настройки", it: "Impostazioni", ar: "الإعدادات" 
  },
  dangerZone: { 
    en: "Danger Zone", hi: "खतरा क्षेत्र", es: "Zona de Peligro", fr: "Zone de Danger", de: "Gefahrenzone", 
    zh: "危险区域", ja: "危険地帯", pt: "Zona de Perigo", ru: "Опасная зона", it: "Zona Pericolosa", ar: "منطقة الخطر" 
  },
  resetAll: { 
    en: "Reset Progress", hi: "प्रगति रीसेट करें", es: "Restablecer Progreso", fr: "Réinitialiser", de: "Fortschritt zurücksetzen", 
    zh: "重置进度", ja: "進捗をリセット", pt: "Reiniciar Progresso", ru: "Сброс прогресса", it: "Resetta Progresso", ar: "إعادة ضبط التقدم" 
  },
  entries: { 
    en: "Pages", hi: "पन्ने", es: "Páginas", fr: "Pages", de: "Seiten", 
    zh: "页数", ja: "ページ", pt: "Páginas", ru: "Страницы", it: "Pagine", ar: "صفحات" 
  },
  daysDone: { 
    en: "Levels Done", hi: "लेवल पूरे", es: "Niveles Listos", fr: "Niveaux Finis", de: "Level Fertig", 
    zh: "完成等级", ja: "完了レベル", pt: "Níveis Feitos", ru: "Завершено уровней", it: "Livelli Fatti", ar: "مستويات مكتملة" 
  },
  streak: { 
    en: "Streak", hi: "सिलसिला", es: "Racha", fr: "Série", de: "Serie", 
    zh: "连胜", ja: "ストリーク", pt: "Sequência", ru: "Серия", it: "Serie", ar: "سلسلة" 
  },
  viewDay: { 
    en: "View Level", hi: "लेवल देखें", es: "Ver Nivel", fr: "Voir Niveau", de: "Level ansehen", 
    zh: "查看等级", ja: "レベルを見る", pt: "Ver Nível", ru: "Просмотр уровня", it: "Vedi Livello", ar: "عرض المستوى" 
  },
  noEntries: { 
    en: "Empty diary.", hi: "खाली डायरी।", es: "Diario vacío.", fr: "Journal vide.", de: "Leeres Tagebuch.", 
    zh: "空日记。", ja: "日記は空です。", pt: "Diário vazio.", ru: "Пустой дневник.", it: "Diario vuoto.", ar: "مذكرات فارغة." 
  },
  profile: { 
    en: "My Player", hi: "मेरा खिलाड़ी", es: "Mi Jugador", fr: "Mon Joueur", de: "Mein Spieler", 
    zh: "我的玩家", ja: "マイプレイヤー", pt: "Meu Jogador", ru: "Мой игрок", it: "Il Mio Giocatore", ar: "لاعبي" 
  }, 
  language: { 
    en: "Language", hi: "भाषा", es: "Idioma", fr: "Langue", de: "Sprache", 
    zh: "语言", ja: "言語", pt: "Idioma", ru: "Язык", it: "Lingua", ar: "اللغة" 
  },
  theme: { 
    en: "Look", hi: "दिखावट", es: "Apariencia", fr: "Apparence", de: "Aussehen", 
    zh: "外观", ja: "外観", pt: "Aparência", ru: "Вид", it: "Aspetto", ar: "المظهر" 
  },
  light: { 
    en: "Light", hi: "लाइट", es: "Claro", fr: "Clair", de: "Hell", 
    zh: "浅色", ja: "ライト", pt: "Claro", ru: "Светлый", it: "Chiaro", ar: "فاتح" 
  },
  dark: { 
    en: "Dark", hi: "डार्क", es: "Oscuro", fr: "Sombre", de: "Dunkel", 
    zh: "深色", ja: "ダーク", pt: "Escuro", ru: "Темный", it: "Scuro", ar: "داكن" 
  },
  system: { 
    en: "Auto", hi: "ऑटो", es: "Auto", fr: "Auto", de: "Auto", 
    zh: "自动", ja: "自動", pt: "Auto", ru: "Авто", it: "Auto", ar: "تلقائي" 
  },
  reminder: { 
    en: "Daily Alarm", hi: "दैनिक अलार्म", es: "Alarma Diaria", fr: "Alarme Quotidienne", de: "Täglicher Alarm", 
    zh: "每日闹钟", ja: "デイリーアラーム", pt: "Alarme Diário", ru: "Ежедневный будильник", it: "Sveglia Quotidiana", ar: "منبه يومي" 
  },
  enableNotifications: { 
    en: "Turn On Alerts", hi: "अलर्ट चालू करें", es: "Activar Alertas", fr: "Activer Alertes", de: "Benachrichtigungen an", 
    zh: "开启提醒", ja: "通知をオン", pt: "Ativar Alertas", ru: "Включить уведомления", it: "Attiva Avvisi", ar: "تفعيل التنبيهات" 
  },
  reminderTime: { 
    en: "Time", hi: "समय", es: "Hora", fr: "Heure", de: "Zeit", 
    zh: "时间", ja: "時間", pt: "Hora", ru: "Время", it: "Ora", ar: "الوقت" 
  },
  permissionDenied: { 
    en: "Please allow notifications in settings.", hi: "कृपया सेटिंग्स में सूचनाओं की अनुमति दें।", es: "Permite notificaciones en ajustes.", fr: "Autorisez les notifications dans les paramètres.", de: "Bitte Benachrichtigungen in Einstellungen erlauben.", 
    zh: "请在设置中允许通知。", ja: "設定で通知を許可してください。", pt: "Permita notificações nas configurações.", ru: "Разрешите уведомления в настройках.", it: "Consenti le notifiche nelle impostazioni.", ar: "يرجى السماح بالإشعارات في الإعدادات." 
  },
  reminderTitle: { 
    en: "Level Up Time!", hi: "लेवल बढ़ाने का समय!", es: "¡Hora de Subir de Nivel!", fr: "L'heure de monter de niveau !", de: "Zeit für Level Up!", 
    zh: "升级时间！", ja: "レベルアップの時間！", pt: "Hora de Subir de Nível!", ru: "Время повысить уровень!", it: "Tempo di Level Up!", ar: "وقت الارتقاء!" 
  },
  reminderBody: { 
    en: "Time to build your mindset today.", hi: "आज अपना माइंडसेट बनाने का समय।", es: "Hora de construir tu mentalidad hoy.", fr: "Il est temps de forger votre mental.", de: "Zeit, heute dein Mindset zu stärken.", 
    zh: "今天建立思维模式的时间到了。", ja: "今日マインドセットを構築する時間です。", pt: "Hora de construir sua mentalidade hoje.", ru: "Время строить свое мышление сегодня.", it: "Tempo di costruire la tua mentalità oggi.", ar: "حان وقت بناء عقليتك اليوم." 
  },
  installApp: { 
    en: "Install Lapaas Mindset", hi: "Lapaas Mindset इंस्टॉल करें", es: "Instalar Lapaas Mindset", fr: "Installer Lapaas Mindset", de: "Lapaas Mindset installieren", 
    zh: "安装 Lapaas Mindset", ja: "Lapaas Mindsetをインストール", pt: "Instalar Lapaas Mindset", ru: "Установить Lapaas Mindset", it: "Installa Lapaas Mindset", ar: "تثبيت Lapaas Mindset" 
  },
  installDescription: { 
    en: "Add to your home screen for quick access and daily reminders. Works offline too!", hi: "त्वरित एक्सेस और दैनिक रिमाइंडर के लिए होम स्क्रीन पर जोड़ें। ऑफ़लाइन भी काम करता है!", es: "Añadir a inicio para acceso rápido y recordatorios. ¡Funciona offline!", fr: "Ajouter à l'accueil pour un accès rapide. Fonctionne hors ligne !", de: "Zum Startbildschirm hinzufügen für schnellen Zugriff. Funktioniert auch offline!", 
    zh: "添加到主屏幕以便快速访问。支持离线使用！", ja: "ホーム画面に追加して素早くアクセス。オフラインでも動作！", pt: "Adicione à tela inicial para acesso rápido. Funciona offline!", ru: "Добавьте на главный экран для быстрого доступа. Работает офлайн!", it: "Aggiungi alla home per accesso rapido. Funziona offline!", ar: "أضف إلى الشاشة الرئيسية للوصول السريع. يعمل بدون إنترنت!" 
  },
  installButton: { 
    en: "Install", hi: "इंस्टॉल", es: "Instalar", fr: "Installer", de: "Installieren", 
    zh: "安装", ja: "インストール", pt: "Instalar", ru: "Установить", it: "Installa", ar: "تثبيت" 
  },
  dismissButton: { 
    en: "Maybe Later", hi: "बाद में", es: "Quizás Luego", fr: "Plus Tard", de: "Vielleicht später", 
    zh: "以后再说", ja: "後で", pt: "Talvez Depois", ru: "Позже", it: "Forse Dopo", ar: "ربما لاحقاً" 
  },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: {
      en: "What feels hardest for you right now?",
      hi: "अभी आपके लिए सबसे मुश्किल क्या है?",
      es: "¿Qué es lo más difícil para ti ahora?",
      fr: "Qu'est-ce qui est le plus difficile pour vous en ce moment ?",
      de: "Was fällt dir im Moment am schwersten?",
      zh: "你现在觉得最困难的是什么？",
      ja: "今、何が一番辛いですか？",
      pt: "O que é mais difícil para você agora?",
      ru: "Что для вас сейчас сложнее всего?",
      it: "Cosa ti sembra più difficile in questo momento?",
      ar: "ما هو الأصعب بالنسبة لك الآن؟"
    },
    options: [
      {
        id: "money",
        text: { 
          en: "Understanding Money", hi: "पैसे को समझना", es: "Entender el Dinero", fr: "Comprendre l'Argent", de: "Geld verstehen", 
          zh: "理解金钱", ja: "お金を理解する", pt: "Entender Dinheiro", ru: "Понимание денег", it: "Capire i Soldi", ar: "فهم المال" 
        },
        relatedCategories: ["financial", "career", "goals"]
      },
      {
        id: "focus",
        text: { 
          en: "Staying Focused", hi: "ध्यान केंद्रित रखना", es: "Mantener el Enfoque", fr: "Rester Concentré", de: "Fokussiert bleiben", 
          zh: "保持专注", ja: "集中力を保つ", pt: "Manter o Foco", ru: "Сохранять фокус", it: "Rimanere Concentrati", ar: "البقاء مركزاً" 
        },
        relatedCategories: ["productivity", "discipline", "goals"]
      },
      {
        id: "confidence",
        text: { 
          en: "Feeling Brave", hi: "बहादुर महसूस करना", es: "Sentirse Valiente", fr: "Se sentir Courageux", de: "Mutig fühlen", 
          zh: "感到勇敢", ja: "勇気を持つ", pt: "Sentir-se Corajoso", ru: "Чувствовать смелость", it: "Sentirsi Coraggiosi", ar: "الشعور بالشجاعة" 
        },
        relatedCategories: ["confidence", "resilience", "growth"]
      },
      {
        id: "health",
        text: { 
          en: "Feeling Healthy", hi: "स्वस्थ महसूस करना", es: "Sentirse Saludable", fr: "Se sentir en Bonne Santé", de: "Gesund fühlen", 
          zh: "感觉健康", ja: "健康を感じる", pt: "Sentir-se Saudável", ru: "Чувствовать здоровье", it: "Sentirsi in Salute", ar: "الشعور بالصحة" 
        },
        relatedCategories: ["health", "mindful_eating", "mindfulness"]
      }
    ]
  },
  {
    id: 2,
    question: {
      en: "What do you want to win at?",
      hi: "आप किसमें जीतना चाहते हैं?",
      es: "¿En qué quieres ganar?",
      fr: "Dans quoi voulez-vous gagner ?",
      de: "Worin möchtest du gewinnen?",
      zh: "你想在什么方面获胜？",
      ja: "何で勝ちたいですか？",
      pt: "Em que você quer vencer?",
      ru: "В чем вы хотите победить?",
      it: "In cosa vuoi vincere?",
      ar: "في ماذا تريد أن تفوز؟"
    },
    options: [
      {
        id: "relationships",
        text: { 
          en: "Making Friends", hi: "दोस्त बनाना", es: "Hacer Amigos", fr: "Se faire des Amis", de: "Freunde finden", 
          zh: "交朋友", ja: "友達を作る", pt: "Fazer Amigos", ru: "Заводить друзей", it: "Fare Amicizia", ar: "تكوين صداقات" 
        },
        relatedCategories: ["relationships", "communication", "networking"]
      },
      {
        id: "inner_peace",
        text: { 
          en: "Being Calm", hi: "शांत रहना", es: "Estar Calmado", fr: "Être Calme", de: "Ruhig sein", 
          zh: "保持冷静", ja: "穏やかでいる", pt: "Estar Calmo", ru: "Быть спокойным", it: "Essere Calmi", ar: "الهدوء" 
        },
        relatedCategories: ["mindfulness", "stoicism"]
      },
      {
        id: "leadership",
        text: { 
          en: "Leading Others", hi: "दूसरों का नेतृत्व करना", es: "Liderar a Otros", fr: "Diriger les Autres", de: "Andere führen", 
          zh: "领导他人", ja: "他人を導く", pt: "Liderar Outros", ru: "Руководить другими", it: "Guidare gli Altri", ar: "قيادة الآخرين" 
        },
        relatedCategories: ["leadership", "confidence"]
      },
      {
        id: "creativity",
        text: { 
          en: "Creating Things", hi: "नई चीजें बनाना", es: "Crear Cosas", fr: "Créer des Choses", de: "Dinge erschaffen", 
          zh: "创造事物", ja: "物を創る", pt: "Criar Coisas", ru: "Создавать вещи", it: "Creare Cose", ar: "ابتكار أشياء" 
        },
        relatedCategories: ["creativity", "growth"]
      }
    ]
  },
  {
    id: 3,
    question: {
      en: "What bad habit do you want to break?",
      hi: "आप कौन सी बुरी आदत छोड़ना चाहते हैं?",
      es: "¿Qué mal hábito quieres romper?",
      fr: "Quelle mauvaise habitude voulez-vous arrêter ?",
      de: "Welche schlechte Angewohnheit möchtest du ablegen?",
      zh: "你想改掉什么坏习惯？",
      ja: "やめたい悪い習慣は何ですか？",
      pt: "Qual mau hábito você quer quebrar?",
      ru: "Какую вредную привычку вы хотите бросить?",
      it: "Quale cattiva abitudine vuoi rompere?",
      ar: "ما هي العادة السيئة التي تريد التخلص منها؟"
    },
    options: [
      {
        id: "procrastination",
        text: { 
          en: "I delay things", hi: "मैं काम टालता हूँ", es: "Posponer cosas", fr: "Je remets à plus tard", de: "Ich schiebe Dinge auf", 
          zh: "我拖延事情", ja: "物事を先延ばしにする", pt: "Eu adio as coisas", ru: "Я откладываю дела", it: "Rimando le cose", ar: "أؤجل الأمور" 
        },
        relatedCategories: ["productivity", "discipline", "goals"]
      },
      {
        id: "phone",
        text: { 
          en: "Too much phone", hi: "फोन का ज्यादा इस्तेमाल", es: "Demasiado teléfono", fr: "Trop de téléphone", de: "Zu viel Handy", 
          zh: "玩手机太多", ja: "携帯の見すぎ", pt: "Muito celular", ru: "Слишком много телефона", it: "Troppo telefono", ar: "استخدام الهاتف كثيراً" 
        },
        relatedCategories: ["digital_detox", "focus"]
      },
      {
        id: "anger",
        text: { 
          en: "Getting angry fast", hi: "जल्दी गुस्सा आना", es: "Enojarse rápido", fr: "Se fâcher vite", de: "Schnell wütend werden", 
          zh: "容易生气", ja: "すぐに怒る", pt: "Irritar-se rápido", ru: "Быстро злюсь", it: "Arrabbiarsi velocemente", ar: "الغضب بسرعة" 
        },
        relatedCategories: ["anger_management", "mindfulness"]
      },
      {
        id: "tired",
        text: { 
          en: "Always tired", hi: "हमेशा थकान", es: "Siempre cansado", fr: "Toujours fatigué", de: "Immer müde", 
          zh: "总是很累", ja: "いつも疲れている", pt: "Sempre cansado", ru: "Всегда уставший", it: "Sempre stanco", ar: "متعب دائماً" 
        },
        relatedCategories: ["burnout", "health"]
      }
    ]
  },
  {
    id: 4,
    question: {
      en: "Pick a skill you wish you had:",
      hi: "एक कौशल चुनें जो आप चाहते हैं:",
      es: "Elige una habilidad que desearías tener:",
      fr: "Choisissez une compétence que vous aimeriez avoir :",
      de: "Wähle eine Fähigkeit, die du gerne hättest:",
      zh: "选择一项你希望拥有的技能：",
      ja: "欲しいスキルを選んでください：",
      pt: "Escolha uma habilidade que você gostaria de ter:",
      ru: "Выберите навык, который вы хотели бы иметь:",
      it: "Scegli un'abilità che vorresti avere:",
      ar: "اختر مهارة تتمنى لو كنت تمتلكها:"
    },
    options: [
      {
        id: "speaking",
        text: { 
          en: "Speaking on stage", hi: "मंच पर बोलना", es: "Hablar en público", fr: "Parler sur scène", de: "Auf der Bühne sprechen", 
          zh: "舞台演讲", ja: "ステージで話す", pt: "Falar em público", ru: "Выступать на сцене", it: "Parlare sul palco", ar: "التحدث على المسرح" 
        },
        relatedCategories: ["public_speaking", "confidence", "communication"]
      },
      {
        id: "learning",
        text: { 
          en: "Learning super fast", hi: "बहुत तेजी से सीखना", es: "Aprender súper rápido", fr: "Apprendre très vite", de: "Super schnell lernen", 
          zh: "超快速学习", ja: "超高速学習", pt: "Aprender super rápido", ru: "Учиться очень быстро", it: "Imparare super velocemente", ar: "التعلم بسرعة فائقة" 
        },
        relatedCategories: ["learning", "growth", "productivity"]
      },
      {
        id: "people",
        text: { 
          en: "Reading people's minds", hi: "लोगों का दिमाग पढ़ना", es: "Leer la mente", fr: "Lire dans les pensées", de: "Gedanken lesen", 
          zh: "读懂人心", ja: "人の心を読む", pt: "Ler a mente das pessoas", ru: "Читать мысли людей", it: "Leggere la mente", ar: "قراءة أفكار الناس" 
        },
        relatedCategories: ["body_language", "emotional_intelligence", "sales"]
      },
      {
        id: "decisions",
        text: { 
          en: "Making hard choices", hi: "मुश्किल फैसले लेना", es: "Tomar decisiones difíciles", fr: "Faire des choix difficiles", de: "Schwere Entscheidungen treffen", 
          zh: "做出艰难的选择", ja: "難しい決断をする", pt: "Fazer escolhas difíceis", ru: "Принимать трудные решения", it: "Fare scelte difficili", ar: "اتخاذ قرارات صعبة" 
        },
        relatedCategories: ["decision_making", "leadership", "critical_thinking"]
      }
    ]
  },
  {
    id: 5,
    question: {
      en: "What does your dream life look like?",
      hi: "आपका सपनों का जीवन कैसा दिखता है?",
      es: "¿Cómo es tu vida soñada?",
      fr: "À quoi ressemble votre vie de rêve ?",
      de: "Wie sieht dein Traumleben aus?",
      zh: "你的梦想生活是什么样的？",
      ja: "あなたの夢の生活はどのようなものですか？",
      pt: "Como é a sua vida dos sonhos?",
      ru: "Как выглядит жизнь вашей мечты?",
      it: "Come appare la tua vita da sogno?",
      ar: "كيف تبدو حياتك التي تحلم بها؟"
    },
    options: [
      {
        id: "simple",
        text: { 
          en: "Simple & Free", hi: "सरल और मुक्त", es: "Simple y Libre", fr: "Simple et Libre", de: "Einfach & Frei", 
          zh: "简单自由", ja: "シンプルで自由", pt: "Simples e Livre", ru: "Простая и свободная", it: "Semplice e Libera", ar: "بسيطة وحرة" 
        },
        relatedCategories: ["minimalism", "happiness", "mindfulness"]
      },
      {
        id: "business",
        text: { 
          en: "Running a big business", hi: "बड़ा व्यापार चलाना", es: "Dirigir un gran negocio", fr: "Gérer une grande entreprise", de: "Großes Unternehmen führen", 
          zh: "经营大生意", ja: "大きなビジネスを経営", pt: "Gerir um grande negócio", ru: "Управлять большим бизнесом", it: "Gestire una grande azienda", ar: "إدارة عمل كبير" 
        },
        relatedCategories: ["entrepreneurship", "leadership", "financial"]
      },
      {
        id: "family",
        text: { 
          en: "Happy Family", hi: "खुशहाल परिवार", es: "Familia Feliz", fr: "Famille Heureuse", de: "Glückliche Familie", 
          zh: "幸福家庭", ja: "幸せな家族", pt: "Família Feliz", ru: "Счастливая семья", it: "Famiglia Felice", ar: "عائلة سعيدة" 
        },
        relatedCategories: ["parenting", "relationships", "happiness"]
      },
      {
        id: "wise",
        text: { 
          en: "Wise & Spiritual", hi: "समझदार और आध्यात्मिक", es: "Sabio y Espiritual", fr: "Sage et Spirituel", de: "Weise & Spirituell", 
          zh: "智慧与灵性", ja: "賢明で精神的", pt: "Sábio e Espiritual", ru: "Мудрый и духовный", it: "Saggio e Spirituale", ar: "حكيم وروحي" 
        },
        relatedCategories: ["spirituality", "stoicism", "mindfulness"]
      }
    ]
  },
  {
    id: 6,
    question: {
      en: "How do you usually handle stress?",
      hi: "आप आमतौर पर तनाव को कैसे संभालते हैं?",
      es: "¿Cómo sueles manejar el estrés?",
      fr: "Comment gérez-vous habituellement le stress ?",
      de: "Wie gehst du normalerweise mit Stress um?",
      zh: "你通常如何应对压力？",
      ja: "普段どのようにストレスに対処しますか？",
      pt: "Como você costuma lidar com o estresse?",
      ru: "Как вы обычно справляетесь со стрессом?",
      it: "Come gestisci di solito lo stress?",
      ar: "كيف تتعامل عادة مع التوتر؟"
    },
    options: [
      {
        id: "overthinking",
        text: { 
          en: "I overthink everything", hi: "मैं हर चीज पर बहुत सोचता हूँ", es: "Pienso demasiado en todo", fr: "Je réfléchis trop à tout", de: "Ich zerdenke alles", 
          zh: "我过度思考一切", ja: "すべてを考えすぎる", pt: "Eu penso demais em tudo", ru: "Я слишком много думаю", it: "Penso troppo a tutto", ar: "أفرط في التفكير في كل شيء" 
        },
        relatedCategories: ["mindfulness", "stoicism"]
      },
      {
        id: "anger",
        text: { 
          en: "I get frustrated easily", hi: "मुझे जल्दी निराशा होती है", es: "Me frustro fácilmente", fr: "Je suis vite frustré", de: "Ich werde leicht frustriert", 
          zh: "我很容易沮丧", ja: "すぐにイライラする", pt: "Eu me frustro facilmente", ru: "Я легко расстраиваюсь", it: "Mi sento frustrato facilmente", ar: "أحبط بسهولة" 
        },
        relatedCategories: ["anger_management", "mindfulness"]
      },
      {
        id: "shutdown",
        text: { 
          en: "I just shut down", hi: "मैं चुप हो जाता हूँ", es: "Me apago", fr: "Je me renferme", de: "Ich schalte ab", 
          zh: "我直接崩溃", ja: "ふさぎ込む", pt: "Eu me fecho", ru: "Я просто замыкаюсь", it: "Mi chiudo in me stesso", ar: "أنعزل تماماً" 
        },
        relatedCategories: ["resilience", "confidence"]
      },
      {
        id: "distraction",
        text: { 
          en: "I scroll on my phone", hi: "मैं फोन चलाता हूँ", es: "Miro mi teléfono", fr: "Je scrolle sur mon téléphone", de: "Ich scrolle am Handy", 
          zh: "我刷手机", ja: "スマホを見る", pt: "Eu rolo o celular", ru: "Листаю телефон", it: "Guardo il telefono", ar: "أتصفح هاتفي" 
        },
        relatedCategories: ["digital_detox", "dopamine"]
      }
    ]
  },
  {
    id: 7,
    question: {
      en: "What holds you back the most?",
      hi: "आपको सबसे ज्यादा क्या रोकता है?",
      es: "¿Qué es lo que más te detiene?",
      fr: "Qu'est-ce qui vous retient le plus ?",
      de: "Was hält dich am meisten zurück?",
      zh: "什么最阻碍你？",
      ja: "何があなたを最も妨げていますか？",
      pt: "O que mais te impede?",
      ru: "Что вас больше всего сдерживает?",
      it: "Cosa ti trattiene di più?",
      ar: "ما الذي يعيقك أكثر؟"
    },
    options: [
      {
        id: "fear_judgment",
        text: { 
          en: "Fear of what others think", hi: "लोग क्या सोचेंगे का डर", es: "Miedo al qué dirán", fr: "Peur du regard des autres", de: "Angst vor der Meinung anderer", 
          zh: "害怕别人的看法", ja: "他人の目を気にする", pt: "Medo do que os outros pensam", ru: "Страх чужого мнения", it: "Paura di cosa pensano gli altri", ar: "الخوف من رأي الآخرين" 
        },
        relatedCategories: ["confidence", "public_speaking", "personal_branding"]
      },
      {
        id: "discipline",
        text: { 
          en: "Lack of consistency", hi: "निरंतरता की कमी", es: "Falta de constancia", fr: "Manque de constance", de: "Mangelnde Beständigkeit", 
          zh: "缺乏连贯性", ja: "一貫性がない", pt: "Falta de consistência", ru: "Отсутствие постоянства", it: "Mancanza di costanza", ar: "قلة الاستمرارية" 
        },
        relatedCategories: ["discipline", "productivity", "dopamine"]
      },
      {
        id: "knowledge",
        text: { 
          en: "Don't know where to start", hi: "पता नहीं कहाँ से शुरू करूँ", es: "No sé por dónde empezar", fr: "Je ne sais pas par où commencer", de: "Weiß nicht, wo anfangen", 
          zh: "不知道从哪里开始", ja: "どこから始めればいいかわからない", pt: "Não sei por onde começar", ru: "Не знаю с чего начать", it: "Non so da dove iniziare", ar: "لا أعرف من أين أبدأ" 
        },
        relatedCategories: ["learning", "growth", "critical_thinking"]
      },
      {
        id: "negativity",
        text: { 
          en: "Negative thoughts", hi: "नकारात्मक विचार", es: "Pensamientos negativos", fr: "Pensées négatives", de: "Negative Gedanken", 
          zh: "消极的想法", ja: "ネガティブな思考", pt: "Pensamentos negativos", ru: "Негативные мысли", it: "Pensieri negativi", ar: "أفكار سلبية" 
        },
        relatedCategories: ["mindfulness", "gratitude", "happiness"]
      }
    ]
  },
  {
    id: 8,
    question: {
      en: "Which word attracts you the most?",
      hi: "कौन सा शब्द आपको सबसे ज्यादा आकर्षित करता है?",
      es: "¿Qué palabra te atrae más?",
      fr: "Quel mot vous attire le plus ?",
      de: "Welches Wort zieht dich am meisten an?",
      zh: "哪个词最吸引你？",
      ja: "どの言葉に一番惹かれますか？",
      pt: "Qual palavra mais te atrai?",
      ru: "Какое слово вас больше всего привлекает?",
      it: "Quale parola ti attrae di più?",
      ar: "أي كلمة تجذبك أكثر؟"
    },
    options: [
      {
        id: "freedom",
        text: { 
          en: "Freedom", hi: "आज़ादी", es: "Libertad", fr: "Liberté", de: "Freiheit", 
          zh: "自由", ja: "自由", pt: "Liberdade", ru: "Свобода", it: "Libertà", ar: "حرية" 
        },
        relatedCategories: ["financial", "minimalism", "entrepreneurship"]
      },
      {
        id: "power",
        text: { 
          en: "Power & Influence", hi: "शक्ति और प्रभाव", es: "Poder e Influencia", fr: "Pouvoir et Influence", de: "Macht & Einfluss", 
          zh: "权力与影响力", ja: "力と影響力", pt: "Poder e Influência", ru: "Власть и влияние", it: "Potere e Influenza", ar: "قوة ونفوذ" 
        },
        relatedCategories: ["leadership", "negotiation", "sales"]
      },
      {
        id: "peace",
        text: { 
          en: "Peace", hi: "शांति", es: "Paz", fr: "Paix", de: "Frieden", 
          zh: "和平", ja: "平和", pt: "Paz", ru: "Мир", it: "Pace", ar: "سلام" 
        },
        relatedCategories: ["mindfulness", "spirituality", "happiness"]
      },
      {
        id: "love",
        text: { 
          en: "Deep Connection", hi: "गहरा जुड़ाव", es: "Conexión Profunda", fr: "Connexion Profonde", de: "Tiefe Verbindung", 
          zh: "深层连接", ja: "深い繋がり", pt: "Conexão Profunda", ru: "Глубокая связь", it: "Connessione Profonda", ar: "تواصل عميق" 
        },
        relatedCategories: ["relationships", "parenting", "networking"]
      }
    ]
  },
  {
    id: 9,
    question: {
      en: "How is your sleep usually?",
      hi: "आपकी नींद आमतौर पर कैसी होती है?",
      es: "¿Cómo sueles dormir?",
      fr: "Comment dormez-vous habituellement ?",
      de: "Wie ist dein Schlaf normalerweise?",
      zh: "你的睡眠通常怎么样？",
      ja: "普段の睡眠はどうですか？",
      pt: "Como é o seu sono geralmente?",
      ru: "Как вы обычно спите?",
      it: "Come dormi di solito?",
      ar: "كيف هو نومك عادة؟"
    },
    options: [
      {
        id: "great",
        text: { 
          en: "I sleep like a baby", hi: "मैं बच्चे की तरह सोता हूँ", es: "Duermo como un bebé", fr: "Je dors comme un bébé", de: "Ich schlafe wie ein Baby", 
          zh: "像婴儿一样睡", ja: "ぐっすり眠れる", pt: "Durmo como um bebê", ru: "Сплю как младенец", it: "Dormo come un bambino", ar: "أنام كالطفل" 
        },
        relatedCategories: ["health", "burnout"]
      },
      {
        id: "bad",
        text: { 
          en: "I struggle to sleep", hi: "मुझे सोने में दिक्कत होती है", es: "Me cuesta dormir", fr: "J'ai du mal à dormir", de: "Ich schlafe schlecht", 
          zh: "我很难入睡", ja: "眠るのに苦労する", pt: "Tenho dificuldade para dormir", ru: "Трудно уснуть", it: "Faccio fatica a dormire", ar: "أجد صعوبة في النوم" 
        },
        relatedCategories: ["digital_detox", "mindfulness", "health", "discipline", "productivity"]
      }
    ]
  },
  {
    id: 10,
    question: {
      en: "If you could change one thing today...",
      hi: "अगर आप आज एक चीज बदल सकें...",
      es: "Si pudieras cambiar una cosa hoy...",
      fr: "Si vous pouviez changer une chose aujourd'hui...",
      de: "Wenn du heute eine Sache ändern könntest...",
      zh: "如果你今天能改变一件事...",
      ja: "もし今日一つだけ変えられるなら...",
      pt: "Se você pudesse mudar uma coisa hoje...",
      ru: "Если бы вы могли изменить одну вещь сегодня...",
      it: "Se potessi cambiare una cosa oggi...",
      ar: "لو استطعت تغيير شيء واحد اليوم..."
    },
    options: [
      {
        id: "bank_balance",
        text: { 
          en: "My Bank Balance", hi: "मेरा बैंक बैलेंस", es: "Mi saldo bancario", fr: "Mon solde bancaire", de: "Mein Kontostand", 
          zh: "我的银行存款", ja: "銀行残高", pt: "Meu saldo bancário", ru: "Мой банковский баланс", it: "Il mio saldo bancario", ar: "رصيدي البنكي" 
        },
        relatedCategories: ["financial", "career", "entrepreneurship"]
      },
      {
        id: "physique",
        text: { 
          en: "My Body/Health", hi: "मेरा शरीर/स्वास्थ्य", es: "Mi cuerpo/salud", fr: "Mon corps/santé", de: "Mein Körper/Gesundheit", 
          zh: "我的身体/健康", ja: "体・健康", pt: "Meu corpo/saúde", ru: "Мое тело/здоровье", it: "Il mio corpo/salute", ar: "جسمي/صحتي" 
        },
        relatedCategories: ["health", "mindful_eating", "confidence"]
      },
      {
        id: "mindset",
        text: { 
          en: "My Anxiety/Stress", hi: "मेरी चिंता/तनाव", es: "Mi ansiedad/estrés", fr: "Mon anxiété/stress", de: "Meine Angst/Stress", 
          zh: "我的焦虑/压力", ja: "不安・ストレス", pt: "Minha ansiedade/estresse", ru: "Моя тревога/стресс", it: "La mia ansia/stress", ar: "قلقي/توتري" 
        },
        relatedCategories: ["mindfulness", "stoicism", "resilience"]
      },
      {
        id: "social",
        text: { 
          en: "My Social Circle", hi: "मेरा सामाजिक दायरा", es: "Mi círculo social", fr: "Mon cercle social", de: "Mein sozialer Kreis", 
          zh: "我的社交圈", ja: "社会的なつながり", pt: "Meu círculo social", ru: "Мой круг общения", it: "La mia cerchia sociale", ar: "دائرتي الاجتماعية" 
        },
        relatedCategories: ["networking", "relationships", "communication"]
      }
    ]
  }
];

export const ADDITIONAL_REFLECTION_PROMPTS: LocalizedString[] = [
  {
    en: "What is one tiny thing you can do tomorrow?",
    hi: "कल आप कौन सा एक छोटा सा काम कर सकते हैं?",
    es: "¿Qué pequeña cosa puedes hacer mañana?",
    fr: "Quelle petite chose pouvez-vous faire demain ?",
    de: "Was ist eine kleine Sache, die du morgen tun kannst?",
    zh: "明天你可以做哪一件小事？",
    ja: "明日できる小さなことは何ですか？",
    pt: "Qual pequena coisa você pode fazer amanhã?",
    ru: "Какую одну маленькую вещь вы можете сделать завтра?",
    it: "Qual è una piccola cosa che puoi fare domani?",
    ar: "ما هو الشيء الصغير الذي يمكنك القيام به غدًا؟"
  },
  {
    en: "Why was this hard for you before?",
    hi: "यह आपके लिए पहले मुश्किल क्यों था?",
    es: "¿Por qué esto fue difícil para ti antes?",
    fr: "Pourquoi cela était-il difficile pour vous avant ?",
    de: "Warum war das früher schwer für dich?",
    zh: "为什么这对你以前很难？",
    ja: "なぜ以前はそれが難しかったのですか？",
    pt: "Por que isso foi difícil para você antes?",
    ru: "Почему раньше это было для вас трудно?",
    it: "Perché prima era difficile per te?",
    ar: "لماذا كان هذا صعبًا عليك من قبل؟"
  },
  {
    en: "Imagine yourself 5 years from now being great at this. How does it look?",
    hi: "कल्पना करें कि 5 साल बाद आप इसमें बहुत अच्छे हैं। यह कैसा दिखता है?",
    es: "Imagínate en 5 años siendo genial en esto. ¿Cómo se ve?",
    fr: "Imaginez-vous dans 5 ans excellent dans ce domaine. À quoi cela ressemble-t-il ?",
    de: "Stell dir vor, du bist in 5 Jahren großartig darin. Wie sieht das aus?",
    zh: "想象一下5年后你在这方面很棒。那是什么样子的？",
    ja: "5年後、これが得意になっている自分を想像してください。どう見えますか？",
    pt: "Imagine-se daqui a 5 anos sendo ótimo nisso. Como é?",
    ru: "Представьте, что через 5 лет вы в этом преуспели. Как это выглядит?",
    it: "Immaginati tra 5 anni bravissimo in questo. Come appare?",
    ar: "تخيل نفسك بعد 5 سنوات وأنت رائع في هذا. كيف يبدو ذلك؟"
  },
  {
    en: "Who do you know who is good at this?",
    hi: "आप किसे जानते हैं जो इसमें अच्छा है?",
    es: "¿A quién conoces que sea bueno en esto?",
    fr: "Qui connaissez-vous qui est bon à cela ?",
    de: "Wen kennst du, der gut darin ist?",
    zh: "你认识谁擅长这个？",
    ja: "これが得意な知り合いは誰ですか？",
    pt: "Quem você conhece que é bom nisso?",
    ru: "Кого вы знаете, кто хорош в этом?",
    it: "Chi conosci che è bravo in questo?",
    ar: "من تعرفه جيد في هذا؟"
  },
  {
    en: "What happens if you don't change?",
    hi: "अगर आप नहीं बदलते तो क्या होगा?",
    es: "¿Qué pasa si no cambias?",
    fr: "Que se passe-t-il si vous ne changez pas ?",
    de: "Was passiert, wenn du dich nicht änderst?",
    zh: "如果你不改变会发生什么？",
    ja: "もし変わらなかったらどうなりますか？",
    pt: "O que acontece se você não mudar?",
    ru: "Что произойдет, если вы не изменитесь?",
    it: "Cosa succede se non cambi?",
    ar: "ماذا يحدث إذا لم تتغير؟"
  }
];

export const MODULES: Module[] = Object.keys(CURRICULUMS).map(key => {
    const curr = CURRICULUMS[key];
    
    // Helper to expand module title/description to full LocalizedString
    const expandModuleString = (t: { en: string, hi: string }): LocalizedString => expandTopicToLocalizedString(t);
    
    // Constructing the full map with default fallbacks
    const getMeta = (k: string): any => {
         const defaultTitle = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
         const defaults = {
             title: expandModuleString({ en: defaultTitle, hi: k }),
             description: expandModuleString({ en: "Master this skill.", hi: "इस कौशल में महारत हासिल करें।" }),
             iconName: "Star",
             bannerImage: "/images/modules/generic.jpg",
             category: k
         };

         switch(k) {
            case 'financial': return { ...defaults, title: expandModuleString({ en: "Financial Freedom", hi: "आर्थिक आज़ादी" }), iconName: "Wallet", category: 'finance', bannerImage: "/images/modules/financial.jpg" };
            case 'health': return { ...defaults, title: expandModuleString({ en: "Health & Vitality", hi: "स्वास्थ्य और ऊर्जा" }), iconName: "Heart", category: 'health', bannerImage: "/images/modules/health.jpg" };
            case 'mindful_eating': return { ...defaults, title: expandModuleString({ en: "Mindful Eating", hi: "ध्यानपूर्वक भोजन" }), iconName: "Utensils", category: 'health', bannerImage: "/images/modules/mindful_eating.jpg" };
            case 'relationships': return { ...defaults, title: expandModuleString({ en: "Better Relationships", hi: "बेहतर रिश्ते" }), iconName: "Users", category: 'relationships', bannerImage: "/images/modules/relationships.jpg" };
            case 'productivity': return { ...defaults, title: expandModuleString({ en: "Peak Productivity", hi: "उच्च उत्पादकता" }), iconName: "Zap", category: 'productivity', bannerImage: "/images/modules/productivity.jpg" };
            case 'confidence': return { ...defaults, title: expandModuleString({ en: "Unstoppable Confidence", hi: "अटूट आत्मविश्वास" }), iconName: "Trophy", category: 'confidence', bannerImage: "/images/modules/confidence.jpg" };
            case 'public_speaking': return { ...defaults, title: expandModuleString({ en: "Public Speaking", hi: "मंच पर बोलना" }), iconName: "Mic", category: 'public_speaking', bannerImage: "/images/modules/public_speaking.jpg" };
            case 'negotiation': return { ...defaults, title: expandModuleString({ en: "Art of Negotiation", hi: "मोलभाव की कला" }), iconName: "Handshake", category: 'negotiation', bannerImage: "/images/modules/negotiation.jpg" };
            case 'critical_thinking': return { ...defaults, title: expandModuleString({ en: "Critical Thinking", hi: "गहन सोच" }), iconName: "Brain", category: 'critical_thinking', bannerImage: "/images/modules/critical_thinking.jpg" };
            case 'emotional_intelligence': return { ...defaults, title: expandModuleString({ en: "Emotional Intelligence", hi: "भावनात्मक बुद्धिमत्ता" }), iconName: "HeartHandshake", category: 'emotional_intelligence', bannerImage: "/images/modules/emotional_intelligence.jpg" };
            case 'digital_detox': return { ...defaults, title: expandModuleString({ en: "Digital Detox", hi: "डिजिटल डिटॉक्स" }), iconName: "SmartphoneOff", category: 'digital_detox', bannerImage: "/images/modules/digital_detox.jpg" };
            case 'stoicism': return { ...defaults, title: expandModuleString({ en: "Stoicism", hi: "स्टोइसिज्म" }), iconName: "Scale", category: 'stoicism', bannerImage: "/images/modules/stoicism.jpg" };
            case 'minimalism': return { ...defaults, title: expandModuleString({ en: "Minimalism", hi: "न्यूनतमवाद" }), iconName: "Minimize2", category: 'minimalism', bannerImage: "/images/modules/minimalism.jpg" };
            case 'learning': return { ...defaults, title: expandModuleString({ en: "Super Learning", hi: "सुपर लर्निंग" }), iconName: "BookOpen", category: 'learning', bannerImage: "/images/modules/learning.jpg" };
            case 'networking': return { ...defaults, title: expandModuleString({ en: "Networking Mastery", hi: "नेटवर्किंग में महारत" }), iconName: "Share2", category: 'networking', bannerImage: "/images/modules/networking.jpg" };
            case 'entrepreneurship': return { ...defaults, title: expandModuleString({ en: "Entrepreneurship", hi: "उद्यमिता" }), iconName: "Rocket", category: 'entrepreneurship', bannerImage: "/images/modules/entrepreneurship.jpg" };
            case 'happiness': return { ...defaults, title: expandModuleString({ en: "Science of Happiness", hi: "खुशी का विज्ञान" }), iconName: "Smile", category: 'happiness', bannerImage: "/images/modules/happiness.jpg" };
            case 'anger_management': return { ...defaults, title: expandModuleString({ en: "Anger Management", hi: "गुस्सा नियंत्रण" }), iconName: "ThermometerSnowflake", category: 'anger_management', bannerImage: "/images/modules/anger_management.jpg" };
            case 'decision_making': return { ...defaults, title: expandModuleString({ en: "Decision Making", hi: "निर्णय लेना" }), iconName: "GitFork", category: 'decision_making', bannerImage: "/images/modules/decision_making.jpg" };
            case 'sales': return { ...defaults, title: expandModuleString({ en: "Sales Mastery", hi: "बिक्री में महारत" }), iconName: "TrendingUp", category: 'sales', bannerImage: "/images/modules/sales.jpg" };
            case 'body_language': return { ...defaults, title: expandModuleString({ en: "Body Language", hi: "शारीरिक भाषा" }), iconName: "Eye", category: 'body_language', bannerImage: "/images/modules/body_language.jpg" };
            case 'burnout': return { ...defaults, title: expandModuleString({ en: "Beating Burnout", hi: "बर्नआउट को हराना" }), iconName: "BatteryCharging", category: 'burnout', bannerImage: "/images/modules/burnout.jpg" };
            case 'parenting': return { ...defaults, title: expandModuleString({ en: "Conscious Parenting", hi: "जागरूक पेरेंटिंग" }), iconName: "Users", category: 'parenting', bannerImage: "/images/modules/parenting.jpg" };
            case 'spirituality': return { ...defaults, title: expandModuleString({ en: "Modern Spirituality", hi: "आधुनिक आध्यात्मिकता" }), iconName: "Sun", category: 'spirituality', bannerImage: "/images/modules/spirituality.jpg" };
            case 'dopamine': return { ...defaults, title: expandModuleString({ en: "Dopamine Control", hi: "डोपामाइन नियंत्रण" }), iconName: "BrainCircuit", category: 'dopamine', bannerImage: "/images/modules/dopamine.jpg" };
            case 'personal_branding': return { ...defaults, title: expandModuleString({ en: "Personal Branding", hi: "पर्सनल ब्रांडिंग" }), iconName: "Fingerprint", category: 'personal_branding', bannerImage: "/images/modules/personal_branding.jpg" };
            default: return defaults;
         }
    };

    const meta = getMeta(key);

    return {
        id: key,
        ...meta,
        days: curr.topics.map((t, i) => generateDayContent(i + 1, expandTopicToLocalizedString(t), curr.books[i % curr.books.length], meta.category))
    };
});
