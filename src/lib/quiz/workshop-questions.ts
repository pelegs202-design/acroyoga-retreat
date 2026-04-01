import { type Question } from './challenge-questions';

// Re-export the Question type so consumers of this module don't need a
// separate import from challenge-questions.
export type { Question };

/**
 * Workshop inquiry quiz — 4 steps covering group type, size, event details,
 * and contact information.
 *
 * Same Question schema as the challenge quiz so both flows can share the
 * same QuizEngine renderer component.
 */
export const workshopQuestions: Question[] = [
  // ── Step 1: Group Type ────────────────────────────────────────────────────
  {
    id: 'group-type',
    type: 'single-choice',
    text: {
      en: 'What kind of event are you planning?',
      he: '?איזה סוג אירוע את/ה מתכנן/ת',
    },
    options: [
      {
        id: 'couples',
        label: { en: 'Couples workshop', he: 'סדנת זוגות' },
        icon: '💑',
      },
      {
        id: 'friends',
        label: { en: 'Friends / Group', he: 'חברים / קבוצה' },
        icon: '👯',
      },
      {
        id: 'corporate',
        label: { en: 'Corporate event', he: 'אירוע חברה' },
        icon: '🏢',
      },
      {
        id: 'party',
        label: { en: 'Bachelorette / Birthday', he: 'מסיבת רווקות / יום הולדת' },
        icon: '🎉',
      },
    ],
    defaultNextId: 'group-details',
  },

  // ── Step 2: Group Size ────────────────────────────────────────────────────
  {
    id: 'group-details',
    type: 'single-choice',
    text: {
      en: 'How many people?',
      he: '?כמה אנשים',
    },
    options: [
      {
        id: 'small',
        label: { en: '2-6 people', he: '2-6 אנשים' },
        icon: '👥',
      },
      {
        id: 'medium',
        label: { en: '7-15 people', he: '7-15 אנשים' },
        icon: '👥',
      },
      {
        id: 'large',
        label: { en: '16-30 people', he: '16-30 אנשים' },
        icon: '👥',
      },
      {
        id: 'xlarge',
        label: { en: '30+ people', he: '30+ אנשים' },
        icon: '🏟️',
      },
    ],
    defaultNextId: 'workshop-details',
  },

  // ── Step 3: Event Details (dates + special requests) ─────────────────────
  {
    id: 'workshop-details',
    type: 'text-inputs',
    text: {
      en: 'When and any special requests?',
      he: '?מתי ויש בקשות מיוחדות',
    },
    // Fields are rendered by a dedicated text-inputs component; the Question
    // schema carries metadata about them via a fields sub-array convention that
    // the UI layer will interpret. Declared here for completeness.
    options: [
      {
        id: 'preferredDates',
        label: {
          en: 'Preferred dates (e.g., May weekends)',
          he: 'תאריכים מועדפים (לדוגמה: סופי שבוע במאי)',
        },
      },
      {
        id: 'specialRequests',
        label: {
          en: 'Special requirements (optional)',
          he: 'דרישות מיוחדות (רשות)',
        },
      },
    ],
    defaultNextId: 'workshop-contact',
  },

  // ── Step 4: Contact Info ──────────────────────────────────────────────────
  {
    id: 'workshop-contact',
    type: 'contact',
    text: {
      en: "Tell us about your event and we'll send a personalized quote",
      he: 'ספרו לנו על האירוע ונשלח הצעת מחיר מותאמת אישית',
    },
    // No options — rendered by QuizContactStep component
    // No defaultNextId — terminal step
  },
];
