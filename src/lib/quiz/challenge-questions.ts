/**
 * Challenge quiz question definitions — Redesigned for conversion.
 *
 * Psychological arc:
 * 1. Positive/Identity (Q1-Q2): Fun warm-up, yes-ladder
 * 2. Neutral/Behavioral (Q3-Q6): Experience, location, commitment + fear capture
 * 3. Negative/Problem-Aware (Q7-Q8): Fear ownership, body type
 * 4. Pressure-Release (Q9-Q11): Desired outcome, fitness, schedule → solution
 *
 * No emojis — classy text-only cards.
 * Disqualifying options marked in comments.
 */

export type QuestionOption = {
  id: string;
  label: { en: string; he: string };
  icon?: string;
  image?: string;
  nextQuestionId?: string;
};

export type Question = {
  id: string;
  text: { en: string; he: string };
  subtitle?: { en: string; he: string };
  type: 'single-choice' | 'city-select' | 'contact' | 'text-inputs';
  options?: QuestionOption[];
  defaultNextId?: string;
};

export const challengeQuestions: Question[] = [
  // ── Q1: Superpower (Identity warm-up — instant engagement) ──────────────
  {
    id: 'superpower',
    type: 'single-choice',
    text: {
      en: 'If you could have one superpower — what would it be?',
      he: 'אם היית יכול/ה לבחור כוח-על אחד — מה זה היה?',
    },
    subtitle: {
      en: "No wrong answers — we just want to get to know you",
      he: 'אין תשובה לא נכונה — רוצים להכיר אתכם',
    },
    options: [
      { id: 'fly', label: { en: 'Flying', he: 'לעוף' } },
      { id: 'strength', label: { en: 'Super strength', he: 'כוח-על' } },
      { id: 'balance', label: { en: 'Perfect balance', he: 'איזון מושלם' } },
      { id: 'read-people', label: { en: 'Reading people', he: 'לקרוא אנשים' } },
    ],
    defaultNextId: 'movie-role',
  },

  // ── Q2: Movie Role (Scenario — continues playful vibe) ──────────────────
  {
    id: 'movie-role',
    type: 'single-choice',
    text: {
      en: 'In an action movie — you are...',
      he: 'בסרט פעולה — את/ה...',
    },
    subtitle: {
      en: 'In acroyoga there are roles too — let\'s find yours',
      he: 'גם באקרויוגה יש תפקידים — בואו נגלה את שלכם',
    },
    options: [
      { id: 'action', label: { en: 'First to jump into action', he: 'קופצים ראשונים לפעולה' } },
      { id: 'planner', label: { en: 'Calm everyone down and plan', he: 'מרגיעים את כולם ומתכננים' } },
      { id: 'stunts', label: { en: 'Doing the stunts', he: 'עושים את הפעלולים' } },
      { id: 'caretaker', label: { en: 'Making sure everyone is OK', he: 'דואגים שכולם בסדר' } },
    ],
    defaultNextId: 'experience',
  },

  // ── Q3: Experience (Segmentation + DQ for instructors) ──────────────────
  {
    id: 'experience',
    type: 'single-choice',
    text: {
      en: "What's your acroyoga experience?",
      he: 'מה הניסיון שלכם באקרויוגה?',
    },
    subtitle: {
      en: "Most of our participants start from zero — you're in good company",
      he: 'רוב המשתתפים שלנו מתחילים מאפס — אתם בחברה טובה',
    },
    options: [
      {
        id: 'never',
        label: { en: 'Zero, starting from scratch', he: 'אפס, מתחילים מאפס' },
      },
      { id: 'few-times', label: { en: 'Tried once or twice', he: 'ניסיתי פעם-פעמיים' } },
      { id: 'sometimes', label: { en: 'Practice here and there', he: 'מתרגל/ת פה ושם' } },
      // DISQUALIFY: instructors are over-qualified
      {
        id: 'instructor',
        label: { en: 'Certified instructor', he: 'מדריך/ה מוסמך/ת' },
        nextQuestionId: 'contact', // skip to contact for lead capture, DQ on results
      },
    ],
    defaultNextId: 'city',
  },

  // ── Q5: City (Geographic qualifier) ─────────────────────────────────────
  {
    id: 'city',
    type: 'single-choice',
    text: {
      en: 'Where are you located?',
      he: 'איפה אתם נמצאים?',
    },
    subtitle: {
      en: 'We operate in Tel Aviv and Kfar Saba — more cities coming soon',
      he: 'אנחנו פעילים בתל אביב וכפר סבא — עוד ערים בקרוב',
    },
    options: [
      { id: 'tel-aviv', label: { en: 'Tel Aviv area', he: 'אזור תל אביב' } },
      { id: 'kfar-saba', label: { en: 'Kfar Saba area', he: 'אזור כפר סבא' } },
      // SOFT DQ: outside service area
      { id: 'other', label: { en: 'Somewhere else', he: 'מקום אחר' } },
    ],
    defaultNextId: 'commitment',
  },

  // ── Q6: Commitment (Key qualifier) ──────────────────────────────────────
  {
    id: 'commitment',
    type: 'single-choice',
    text: {
      en: 'How many times per week are you willing to invest?',
      he: 'כמה פעמים בשבוע אתם מוכנים להשקיע?',
    },
    subtitle: {
      en: 'The challenge includes 2-3 weekly sessions + 15 daily minutes at home',
      he: 'האתגר כולל 2-3 מפגשים שבועיים + 15 דקות יומיות בבית',
    },
    options: [
      { id: '3-plus', label: { en: '3+ times, I\'m all in', he: '3+ פעמים, אני אולאין' } },
      { id: '2', label: { en: '2 times, realistic', he: '2 פעמים, ריאלי' } },
      // SOFT DQ: undercommitted
      { id: '1', label: { en: 'Once a week, more is hard', he: 'פעם בשבוע, יותר קשה לי' } },
      // SOFT DQ: just browsing
      { id: 'just-browsing', label: { en: 'Just exploring for now', he: 'אני רק מתעניין/ת כרגע' } },
    ],
    defaultNextId: 'availability',
  },

  // ── Q6b: Availability (Hard DQ — must be available most of the challenge month) ──
  {
    id: 'availability',
    type: 'single-choice',
    text: {
      en: 'The challenge starts next week and runs for 30 days. Are you available?',
      he: 'האתגר מתחיל בשבוע הבא ונמשך 30 יום. אתם זמינים?',
    },
    subtitle: {
      en: "It's okay to miss a few days — but we need you for most of the month",
      he: 'אפשר לפספס כמה ימים — אבל צריך להיות פנויים לרוב החודש',
    },
    options: [
      { id: 'yes-full', label: { en: "Yes, I'm available the whole month", he: 'כן, אני פנוי/ה כל החודש' } },
      { id: 'yes-mostly', label: { en: "Mostly — might miss a few days", he: 'ברוב הזמן — אפספס כמה ימים' } },
      { id: 'half', label: { en: "Only about half the month", he: 'רק כחצי מהחודש' } },
      // HARD DQ: not available
      { id: 'no', label: { en: "No, I'll be away most of the month", he: 'לא, אני לא פנוי/ה ברוב החודש' } },
    ],
    defaultNextId: 'dream-outcome',
  },

  // ── Q7: Dream Outcome (Aspirational — pressure release begins) ──────────
  {
    id: 'dream-outcome',
    type: 'single-choice',
    text: {
      en: 'What would you most want to happen after 30 days?',
      he: 'מה הייתם הכי רוצים שיקרה אחרי 30 יום?',
    },
    subtitle: {
      en: "We'll measure this together",
      he: 'אנחנו נמדוד את זה ביחד',
    },
    options: [
      { id: 'skill', label: { en: 'Nail Bird and Throne poses', he: 'לעשות Bird ו-Throne בקלות' } },
      { id: 'strong', label: { en: 'Feel strong and confident', he: 'להרגיש חזק/ה ובטוח/ה בגוף' } },
      { id: 'friends', label: { en: 'Find regular practice partners', he: "למצוא חבר׳ה קבועים לתרגול" } },
      // WARNING: low intent signal (not DQ, but reduces fit score)
      { id: 'no-expectations', label: { en: 'No specific expectations', he: 'אין לי ציפיות ספציפיות' } },
    ],
    defaultNextId: 'biggest-fear',
  },

  // ── Q8: Biggest Fear (Captures hesitations — softened framing) ──────────
  {
    id: 'biggest-fear',
    type: 'single-choice',
    text: {
      en: "Is anything holding you back?",
      he: 'יש משהו שמהסס אתכם?',
    },
    subtitle: {
      en: 'Most people feel this way at first — and we have an answer for each one',
      he: 'רוב האנשים מרגישים ככה בהתחלה — ויש לנו תשובה לכל אחד מהם',
    },
    options: [
      { id: 'ready', label: { en: "Nothing — let's go!", he: 'כלום — אני מוכן/ה, יאללה' } },
      { id: 'not-good-enough', label: { en: "I won't be good enough", he: 'שלא אהיה מספיק טוב/ה' } },
      { id: 'socially-awkward', label: { en: "It'll be socially awkward", he: 'שיהיה לי מביך עם אנשים זרים' } },
      { id: 'wont-commit', label: { en: "I won't stick with it", he: 'שלא אתמיד' } },
      { id: 'not-flexible', label: { en: "I'm not flexible/strong enough", he: 'אני לא מספיק גמיש/ה או חזק/ה' } },
      { id: 'need-partner', label: { en: "I don't know anyone there", he: 'אני לא מכיר/ה אף אחד שם' } },
      { id: 'injury', label: { en: "I'll get hurt", he: 'שאפגע' } },
    ],
    defaultNextId: 'body-type',
  },

  // ── Q9: Body Type (Safety/suitability qualification) ────────────────────
  {
    id: 'body-type',
    type: 'single-choice',
    text: {
      en: 'How would you describe your build?',
      he: 'איך היית מתאר/ת את המבנה הגופני שלך?',
    },
    subtitle: {
      en: 'No wrong answer — just helps us customize your plan',
      he: 'אין תשובה לא נכונה — רק רוצים להתאים את התכנית',
    },
    options: [
      { id: 'slim-avg', label: { en: 'Slim / average', he: 'רזה / ממוצע' } },
      { id: 'athletic', label: { en: 'Athletic / muscular', he: 'ספורטיבי / שרירי' } },
      { id: 'slightly-over', label: { en: 'A bit above average', he: 'קצת מעל המשקל' } },
      // SOFT DQ: safety concern
      { id: 'significantly-over', label: { en: 'Significantly overweight', he: 'משקל עודף משמעותי' } },
    ],
    defaultNextId: 'fitness',
  },

  // ── Q10: Fitness Background (Archetype scoring) ─────────────────────────
  {
    id: 'fitness',
    type: 'single-choice',
    text: {
      en: "What's your fitness background?",
      he: 'מה הרקע הספורטיבי שלכם?',
    },
    subtitle: {
      en: 'Every background works — we adapt the intensity',
      he: 'כל רקע מתאים — אנחנו מתאימים את העוצמה',
    },
    options: [
      { id: 'gym', label: { en: 'Gym / CrossFit', he: 'חדר כושר / קרוספיט' } },
      { id: 'yoga', label: { en: 'Yoga / Pilates', he: 'יוגה / פילאטיס' } },
      { id: 'cardio', label: { en: 'Running / swimming / cycling', he: 'ריצה / שחייה / אופניים' } },
      { id: 'team-sports', label: { en: 'Team sports', he: 'ספורט קבוצתי' } },
      { id: 'none', label: { en: 'Nothing regular', he: 'בלי שום דבר קבוע' } },
    ],
    defaultNextId: 'schedule',
  },

  // ── Q11: Schedule (Easy closer — ends on positive note) ─────────────────
  {
    id: 'schedule',
    type: 'single-choice',
    text: {
      en: "When's best for you?",
      he: 'מתי הכי נוח לכם?',
    },
    subtitle: {
      en: "We have groups at all times — we'll find your perfect fit",
      he: 'יש לנו קבוצות בכל הזמנים — נמצא לכם את המושלמת',
    },
    options: [
      { id: 'morning', label: { en: 'Morning', he: 'בוקר' } },
      { id: 'evening', label: { en: 'Weekday evening', he: 'ערב אמצע שבוע' } },
      { id: 'weekend', label: { en: 'Weekend', he: 'סוף שבוע' } },
      { id: 'flexible', label: { en: 'Flexible', he: 'גמיש/ה' } },
    ],
    defaultNextId: 'contact',
  },

  // ── Q12: Contact Info (Pre-result gate) ─────────────────────────────────
  {
    id: 'contact',
    type: 'contact',
    text: {
      en: 'Your acro profile is ready — just one more second',
      he: 'הפרופיל האקרו שלכם מוכן — רק עוד שנייה',
    },
    subtitle: {
      en: "Enter your details to discover your type. We won't spam you.",
      he: 'השאירו פרטים כדי לגלות את הסוג שלכם. לא נשלח ספאם.',
    },
  },
];
