/**
 * Challenge quiz question definitions.
 *
 * These types are intentionally declared here so this file can be used
 * independently from QuizEngine.tsx (plans 05-01 and 05-02 execute in
 * parallel). The shapes are identical to those in QuizEngine — once that
 * plan lands, the UI can import from either file or re-export from here.
 */

export type QuestionOption = {
  id: string;
  label: { en: string; he: string };
  icon?: string;
  image?: string;
  /** When set, overrides the parent question's defaultNextId for this option. */
  nextQuestionId?: string;
};

export type Question = {
  id: string;
  text: { en: string; he: string };
  subtitle?: { en: string; he: string };
  type: 'single-choice' | 'city-select' | 'contact' | 'text-inputs';
  options?: QuestionOption[];
  /** Default next question when no option-level override is present. */
  defaultNextId?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Challenge quiz — 13 entries (11 logical steps, Q3 has 3 branching variants)
// ─────────────────────────────────────────────────────────────────────────────

export const challengeQuestions: Question[] = [
  // ── Q1: City Selection ───────────────────────────────────────────────────
  {
    id: 'city',
    type: 'city-select',
    text: {
      en: 'Where would you like to practice?',
      he: '?איפה היית רוצה להתאמן',
    },
    options: [
      {
        id: 'tel-aviv',
        label: { en: 'Tel Aviv', he: 'תל אביב' },
        icon: '🌊',
      },
      {
        id: 'kfar-saba',
        label: { en: 'Kfar Saba', he: 'כפר סבא' },
        icon: '🌳',
      },
    ],
    defaultNextId: 'experience',
  },

  // ── Q2: Experience Level (branches to 3 different Q3 variants) ────────────
  {
    id: 'experience',
    type: 'single-choice',
    text: {
      en: "What's your experience with acroyoga?",
      he: '?מה הניסיון שלך באקרויוגה',
    },
    options: [
      {
        id: 'never',
        label: { en: 'Never tried', he: 'מעולם לא ניסיתי' },
        icon: '🌱',
        nextQuestionId: 'beginner-barrier',
      },
      {
        id: 'few-times',
        label: { en: 'Tried a few times', he: 'ניסיתי כמה פעמים' },
        icon: '🌿',
        nextQuestionId: 'intermediate-goal',
      },
      {
        id: 'regular',
        label: { en: 'Regular practitioner', he: 'מתרגל/ת באופן קבוע' },
        icon: '🌳',
        nextQuestionId: 'advanced-goal',
      },
    ],
    defaultNextId: 'beginner-barrier',
  },

  // ── Q3a: Beginner Barrier (for experience=never) ─────────────────────────
  {
    id: 'beginner-barrier',
    type: 'single-choice',
    text: {
      en: 'What holds you back from trying?',
      he: '?מה מעכב אותך מלנסות',
    },
    options: [
      {
        id: 'fear-heights',
        label: { en: 'Fear of heights/falling', he: 'פחד מגובה/נפילה' },
        icon: '😰',
      },
      {
        id: 'not-flexible',
        label: { en: 'Not flexible enough', he: 'לא מספיק גמיש/ה' },
        icon: '🤸',
      },
      {
        id: 'need-partner',
        label: { en: 'Need a partner', he: 'צריך/ה פרטנר' },
        icon: '👥',
      },
      {
        id: 'no-time',
        label: { en: 'Not enough time', he: 'אין מספיק זמן' },
        icon: '⏰',
      },
    ],
    defaultNextId: 'fitness',
  },

  // ── Q3b: Intermediate Goal (for experience=few-times) ────────────────────
  {
    id: 'intermediate-goal',
    type: 'single-choice',
    text: {
      en: 'What do you want to develop most?',
      he: '?מה הכי חשוב לך לפתח',
    },
    options: [
      {
        id: 'flying',
        label: { en: 'Flying technique', he: 'טכניקת פלייר' },
        icon: '🦅',
      },
      {
        id: 'basing',
        label: { en: 'Basing strength', he: 'כוח בייסינג' },
        icon: '💪',
      },
      {
        id: 'trust',
        label: { en: 'Trust skills', he: 'מיומנויות אמון' },
        icon: '🤝',
      },
      {
        id: 'balance',
        label: { en: 'Balance & transitions', he: 'איזון ומעברים' },
        icon: '⚖️',
      },
    ],
    defaultNextId: 'fitness',
  },

  // ── Q3c: Advanced Goal (for experience=regular) ──────────────────────────
  {
    id: 'advanced-goal',
    type: 'single-choice',
    text: {
      en: "What's your main goal?",
      he: '?מה המטרה העיקרית שלך',
    },
    options: [
      {
        id: 'level-up',
        label: { en: 'Level up skills', he: 'לשדרג רמה' },
        icon: '🚀',
      },
      {
        id: 'find-partners',
        label: { en: 'Find regular partners', he: 'למצוא פרטנרים קבועים' },
        icon: '👥',
      },
      {
        id: 'community',
        label: { en: 'Join a community', he: 'להצטרף לקהילה' },
        icon: '❤️',
      },
      {
        id: 'teach',
        label: { en: 'Learn to teach', he: 'ללמוד ללמד' },
        icon: '🎓',
      },
    ],
    defaultNextId: 'fitness',
  },

  // ── Q4: Fitness Background ────────────────────────────────────────────────
  {
    id: 'fitness',
    type: 'single-choice',
    text: {
      en: "What's your fitness background?",
      he: '?מה הרקע הספורטיבי שלך',
    },
    options: [
      {
        id: 'gym',
        label: { en: 'Gym regular', he: 'חדר כושר קבוע' },
        icon: '🏋️',
      },
      {
        id: 'yoga',
        label: { en: 'Yoga practitioner', he: 'מתרגל/ת יוגה' },
        icon: '🧘',
      },
      {
        id: 'none',
        label: { en: 'No regular exercise', he: 'בלי פעילות קבועה' },
        icon: '🛋️',
      },
      {
        id: 'team-sports',
        label: { en: 'Team sports', he: 'ספורט קבוצתי' },
        icon: '⚽',
      },
    ],
    defaultNextId: 'motivation',
  },

  // ── Q5: Motivation ────────────────────────────────────────────────────────
  {
    id: 'motivation',
    type: 'single-choice',
    text: {
      en: 'What motivates you most?',
      he: '?מה הכי מניע אותך',
    },
    options: [
      {
        id: 'physical',
        label: { en: 'Physical fitness', he: 'כושר גופני' },
        icon: '💪',
      },
      {
        id: 'social',
        label: { en: 'Social connection', he: 'חיבור חברתי' },
        icon: '🤗',
      },
      {
        id: 'learning',
        label: { en: 'Learning something new', he: 'ללמוד משהו חדש' },
        icon: '🧠',
      },
      {
        id: 'stress-relief',
        label: { en: 'Stress relief', he: 'הפגת מתח' },
        icon: '🌊',
      },
    ],
    defaultNextId: 'training-time',
  },

  // ── Q6: Training Time ─────────────────────────────────────────────────────
  {
    id: 'training-time',
    type: 'single-choice',
    text: {
      en: 'When do you prefer to train?',
      he: '?מתי את/ה מעדיף/ה להתאמן',
    },
    options: [
      {
        id: 'morning',
        label: { en: 'Morning', he: 'בוקר' },
        icon: '🌅',
      },
      {
        id: 'evening',
        label: { en: 'Evening weekday', he: 'ערב באמצע השבוע' },
        icon: '🌙',
      },
      {
        id: 'weekend',
        label: { en: 'Weekend', he: 'סוף שבוע' },
        icon: '☀️',
      },
    ],
    defaultNextId: 'partner',
  },

  // ── Q7: Partner ───────────────────────────────────────────────────────────
  {
    id: 'partner',
    type: 'single-choice',
    text: {
      en: 'Do you have a training partner?',
      he: '?יש לך פרטנר/ית לתרגול',
    },
    options: [
      {
        id: 'yes',
        label: { en: 'Yes', he: 'כן' },
        icon: '👫',
      },
      {
        id: 'no',
        label: { en: "No, I'll come alone", he: 'לא, אגיע לבד' },
        icon: '🙋',
      },
    ],
    defaultNextId: 'body-mind',
  },

  // ── Q8: Body-Mind Focus ───────────────────────────────────────────────────
  {
    id: 'body-mind',
    type: 'single-choice',
    text: {
      en: "What's your body-mind focus?",
      he: '?מה המיקוד שלך',
    },
    options: [
      {
        id: 'physical',
        label: { en: 'Mostly physical', he: 'בעיקר פיזי' },
        icon: '💪',
      },
      {
        id: 'mental',
        label: { en: 'Mostly mental/social', he: 'בעיקר מנטלי/חברתי' },
        icon: '🧠',
      },
      {
        id: 'balanced',
        label: { en: 'Equal balance', he: 'איזון שווה' },
        icon: '☯️',
      },
    ],
    defaultNextId: 'challenge-style',
  },

  // ── Q9: Challenge Style ───────────────────────────────────────────────────
  {
    id: 'challenge-style',
    type: 'single-choice',
    text: {
      en: 'How do you handle challenges?',
      he: '?איך את/ה מתמודד/ת עם אתגרים',
    },
    options: [
      {
        id: 'push-through',
        label: { en: 'Push through alone', he: 'דוחף/ת לבד' },
        icon: '🔥',
      },
      {
        id: 'encouragement',
        label: { en: 'Need encouragement', he: 'צריך/ה עידוד' },
        icon: '📣',
      },
      {
        id: 'group-energy',
        label: { en: 'Prefer group energy', he: 'מעדיף/ה אנרגיה קבוצתית' },
        icon: '👥',
      },
      {
        id: 'slow',
        label: { en: 'Take it slow', he: 'לוקח/ת את זה לאט' },
        icon: '🐢',
      },
    ],
    defaultNextId: 'desired-result',
  },

  // ── Q10: Desired Result ───────────────────────────────────────────────────
  {
    id: 'desired-result',
    type: 'single-choice',
    text: {
      en: 'What result matters most after 30 days?',
      he: '?מה התוצאה הכי חשובה אחרי 30 יום',
    },
    options: [
      {
        id: 'strength',
        label: { en: 'Visible strength gain', he: 'עלייה בכוח' },
        icon: '💪',
      },
      {
        id: 'skill',
        label: { en: 'Acro skill milestone', he: 'אבן דרך באקרו' },
        icon: '🏆',
      },
      {
        id: 'friends',
        label: { en: 'New friendships', he: 'חברויות חדשות' },
        icon: '❤️',
      },
      {
        id: 'wellbeing',
        label: { en: 'Overall wellbeing', he: 'רווחה כללית' },
        icon: '✨',
      },
    ],
    defaultNextId: 'contact',
  },

  // ── Q11: Contact Info (final step) ───────────────────────────────────────
  {
    id: 'contact',
    type: 'contact',
    text: {
      en: 'Almost there! Enter your details to see your results',
      he: '!כמעט שם! הכניסו פרטים כדי לראות את התוצאות',
    },
    // No options — rendered by QuizContactStep component
    // No defaultNextId — this is the terminal step
  },
];
