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

  // ── Q5: Commitment (Key qualifier — no effort reveal, all options positive) ──
  {
    id: 'commitment',
    type: 'single-choice',
    text: {
      en: 'How often would you like to train?',
      he: 'כמה פעמים בשבוע הייתם רוצים להתאמן?',
    },
    subtitle: {
      en: 'Most of our graduates trained 2-3 times per week',
      he: 'רוב הבוגרים שלנו התאמנו 2-3 פעמים בשבוע',
    },
    options: [
      { id: '3-plus', label: { en: '3+ times, all in', he: '3+ פעמים, אולאין' } },
      { id: '2', label: { en: '2 times a week', he: '2 פעמים בשבוע' } },
      // SOFT DQ: undercommitted (but still positive framing)
      { id: '1', label: { en: 'Once a week to start', he: 'פעם בשבוע בהתחלה' } },
      // SOFT DQ: low intent (reframed from "just browsing")
      { id: 'just-browsing', label: { en: "I'll decide after trying", he: 'אחליט אחרי שאנסה' } },
    ],
    defaultNextId: 'availability',
  },

  // ── Q6: Availability (with social norming) ──
  {
    id: 'availability',
    type: 'single-choice',
    text: {
      en: 'The next group starts soon — are you available?',
      he: 'הקבוצה הבאה מתחילה בקרוב — אתם פנויים?',
    },
    subtitle: {
      en: "Missing a few days is fine — 96% complete the challenge",
      he: 'אפשר לפספס כמה ימים — 96% מסיימים את האתגר',
    },
    options: [
      { id: 'yes-full', label: { en: "Yes, I'm available", he: 'כן, אני פנוי/ה' } },
      { id: 'yes-mostly', label: { en: "Mostly — might miss a few days", he: 'ברוב הזמן — אפספס כמה ימים' } },
      { id: 'half', label: { en: "Only about half the time", he: 'רק כחצי מהזמן' } },
      // HARD DQ: not available
      { id: 'no', label: { en: "Not available right now", he: 'לא פנוי/ה כרגע' } },
    ],
    defaultNextId: 'dream-outcome',
  },

  // ── Q6: Dream Outcome (Aspirational — cinematic vision, Hormozi) ────────
  {
    id: 'dream-outcome',
    type: 'single-choice',
    text: {
      en: 'What would make this worth it for you?',
      he: 'מה יגרום לכם להרגיש שזה היה שווה?',
    },
    subtitle: {
      en: "Pick the one that excites you most",
      he: 'בחרו את מה שהכי מרגש אתכם',
    },
    options: [
      { id: 'skill', label: { en: 'Balancing someone on my feet', he: 'לאזן מישהו על הרגליים שלי' } },
      { id: 'strong', label: { en: 'Feeling strong in a new way', he: 'להרגיש חזק/ה בצורה חדשה' } },
      { id: 'friends', label: { en: 'Having a crew to train with', he: "שיהיה לי צוות לתרגל איתו" } },
      { id: 'no-expectations', label: { en: 'Just want to try something new', he: 'סתם רוצה לנסות משהו חדש' } },
    ],
    defaultNextId: 'biggest-fear',
  },

  // ── Q7: Biggest Fear (Captures hesitations — softened framing) ──────────
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
    defaultNextId: 'fitness',
  },

  // ── Q8: Fitness Background (Archetype scoring — almost done!) ──────────
  {
    id: 'fitness',
    type: 'single-choice',
    text: {
      en: "What's your fitness background?",
      he: 'מה הרקע הספורטיבי שלכם?',
    },
    subtitle: {
      en: 'Almost done! Every background works — we adapt to you',
      he: 'כמעט סיימנו! כל רקע מתאים — אנחנו מתאימים אליכם',
    },
    options: [
      { id: 'gym', label: { en: 'Gym / CrossFit', he: 'חדר כושר / קרוספיט' } },
      { id: 'yoga', label: { en: 'Yoga / Pilates', he: 'יוגה / פילאטיס' } },
      { id: 'cardio', label: { en: 'Running / swimming / cycling', he: 'ריצה / שחייה / אופניים' } },
      { id: 'team-sports', label: { en: 'Team sports', he: 'ספורט קבוצתי' } },
      { id: 'none', label: { en: 'Nothing regular', he: 'בלי שום דבר קבוע' } },
    ],
    defaultNextId: 'contact',
  },

  // ── Q9: Contact Info (Pre-result gate — high anticipation) ──────────────
  {
    id: 'contact',
    type: 'contact',
    text: {
      en: "Your acro type is ready!",
      he: 'הטיפוס האקרו שלכם מוכן!',
    },
    subtitle: {
      en: "Leave your details to see your personalized result + free trial class.",
      he: 'השאירו פרטים כדי לראות את התוצאה האישית שלכם + שיעור ניסיון במתנה.',
    },
  },
];
