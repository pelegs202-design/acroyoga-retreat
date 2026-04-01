/**
 * Quiz result calculator.
 *
 * Maps a set of quiz answers to one of 4 acroyoga community archetypes and
 * returns the full result payload including radar chart data, personalized
 * fear-addressing, and strength highlights.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type RadarAxis = {
  axis: string;
  axisHe: string;
  current: number;
  potential: number;
};

export type ResultArchetype = {
  id: 'explorer' | 'athlete' | 'connector' | 'artist';
  name: { en: string; he: string };
  tagline: { en: string; he: string };
  description: { en: string; he: string };
  radarData: RadarAxis[];
  fears: Array<{ en: string; he: string }>;
  strengths: Array<{ en: string; he: string }>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Archetype definitions
// ─────────────────────────────────────────────────────────────────────────────

const AXES: Pick<RadarAxis, 'axis' | 'axisHe'>[] = [
  { axis: 'Strength', axisHe: 'כוח' },
  { axis: 'Balance', axisHe: 'איזון' },
  { axis: 'Trust', axisHe: 'אמון' },
  { axis: 'Flexibility', axisHe: 'גמישות' },
  { axis: 'Coordination', axisHe: 'קואורדינציה' },
];

function buildRadar(current: number[], potential: number[]): RadarAxis[] {
  return AXES.map((axis, i) => ({
    ...axis,
    current: current[i],
    potential: potential[i],
  }));
}

const ARCHETYPES: Record<ResultArchetype['id'], ResultArchetype> = {
  explorer: {
    id: 'explorer',
    name: { en: 'The Explorer', he: 'החוקר' },
    tagline: {
      en: 'Curiosity is your superpower',
      he: 'הסקרנות היא על-כוח שלך',
    },
    description: {
      en: "You approach acroyoga with fresh eyes and an open mind. Your willingness to try new things means you'll progress faster than you think — and inspire everyone around you.",
      he: 'את/ה ניגש/ת לאקרויוגה עם עיניים טריות ומוח פתוח. הנכונות שלך לנסות דברים חדשים אומרת שתתקדם/י מהר יותר ממה שאת/ה חושב/ת — ותהיה/י מקור השראה לכולם.',
    },
    radarData: buildRadar(
      [25, 30, 20, 35, 20],
      [70, 80, 85, 75, 70],
    ),
    fears: [
      {
        en: "You don't need any experience — 80% start as complete beginners",
        he: 'לא צריך ניסיון — 80% מתחילים כמתחילים מוחלטים',
      },
      {
        en: "We pair everyone up — no partner needed",
        he: 'אנחנו מזווגים את כולם — לא צריך פרטנר',
      },
    ],
    strengths: [
      { en: 'Curiosity and openness', he: 'סקרנות ופתיחות' },
      { en: 'Fresh perspective', he: 'פרספקטיבה רעננה' },
    ],
  },

  athlete: {
    id: 'athlete',
    name: { en: 'The Athlete', he: 'הספורטאי' },
    tagline: {
      en: 'Your body is ready — your mind will follow',
      he: 'הגוף שלך מוכן — המוח יבוא אחריו',
    },
    description: {
      en: "Your physical foundation gives you a head start that most people spend months building. Acroyoga will challenge your body in completely new ways — and your competitive edge will shine.",
      he: 'הבסיס הפיזי שלך נותן לך יתרון שרוב האנשים מבלים חודשים לבנות. אקרויוגה תאתגר את הגוף שלך בדרכים חדשות לחלוטין — והיתרון התחרותי שלך יזהיר.',
    },
    radarData: buildRadar(
      [65, 40, 25, 30, 45],
      [90, 75, 70, 65, 85],
    ),
    fears: [
      {
        en: "Acroyoga builds functional strength no gym can match",
        he: 'אקרויוגה בונה כוח פונקציונלי שאף חדר כושר לא יכול להתחרות בו',
      },
    ],
    strengths: [
      { en: 'Physical foundation', he: 'בסיס פיזי' },
      { en: 'Mental toughness', he: 'חוסן מנטלי' },
    ],
  },

  connector: {
    id: 'connector',
    name: { en: 'The Connector', he: 'המחבר' },
    tagline: {
      en: 'Where you go, community follows',
      he: 'לאן שאת/ה הולך/ת, קהילה עוקבת',
    },
    description: {
      en: "Acroyoga is fundamentally a partner practice — and your natural ability to build trust and connection is your greatest asset. You'll find your tribe faster than anyone.",
      he: 'אקרויוגה היא בסופו של דבר תרגול עם פרטנר — ויכולת הטבעית שלך לבנות אמון וחיבור היא הנכס הגדול ביותר שלך. תמצא/י את השבט שלך מהר יותר מכולם.',
    },
    radarData: buildRadar(
      [30, 35, 55, 40, 30],
      [65, 70, 90, 70, 75],
    ),
    fears: [
      {
        en: "Our community is the warmest — no ego, no judgment",
        he: 'הקהילה שלנו היא הכי חמה — בלי אגו, בלי שיפוטיות',
      },
    ],
    strengths: [
      { en: 'People skills', he: 'מיומנויות בין-אישיות' },
      { en: 'Trust capacity', he: 'יכולת אמון' },
    ],
  },

  artist: {
    id: 'artist',
    name: { en: 'The Artist', he: 'האמן' },
    tagline: {
      en: 'Movement is your language',
      he: 'תנועה היא השפה שלך',
    },
    description: {
      en: "Your body awareness and movement fluency are rare gifts. In acroyoga you'll find a practice that finally matches your inner sense of flow — and a community that celebrates it.",
      he: 'המודעות הגופנית ושליטה בתנועה שלך הן מתנות נדירות. באקרויוגה תמצא/י תרגול שסוף סוף מתאים לתחושת הזרימה הפנימית שלך — וקהילה שחוגגת אותה.',
    },
    radarData: buildRadar(
      [40, 55, 40, 60, 50],
      [75, 90, 75, 85, 80],
    ),
    fears: [
      {
        en: "Your movement background gives you a massive head start",
        he: 'הרקע התנועתי שלך נותן לך יתרון עצום',
      },
    ],
    strengths: [
      { en: 'Body awareness', he: 'מודעות גופנית' },
      { en: 'Movement fluency', he: 'שליטה בתנועה' },
      { en: 'Balance intuition', he: 'אינטואיציית איזון' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────────────────────────────────────

type ArchetypeId = ResultArchetype['id'];

function score(answers: Record<string, string>): Record<ArchetypeId, number> {
  const s: Record<ArchetypeId, number> = {
    explorer: 0,
    athlete: 0,
    connector: 0,
    artist: 0,
  };

  // ── Explorer (החוקר) ──────────────────────────────────────────────────────
  if (answers['experience'] === 'never') s.explorer += 3;
  if (answers['motivation'] === 'learning') s.explorer += 2;
  if (answers['challenge-style'] === 'slow') s.explorer += 1;
  if (answers['desired-result'] === 'wellbeing') s.explorer += 1;
  if (answers['body-mind'] === 'balanced') s.explorer += 1;

  // ── Athlete (הספורטאי) ────────────────────────────────────────────────────
  if (answers['fitness'] === 'gym' || answers['fitness'] === 'team-sports') s.athlete += 3;
  if (answers['motivation'] === 'physical') s.athlete += 2;
  if (answers['body-mind'] === 'physical') s.athlete += 1;
  if (answers['desired-result'] === 'strength') s.athlete += 1;
  if (answers['challenge-style'] === 'push-through') s.athlete += 1;

  // ── Connector (המחבר) ─────────────────────────────────────────────────────
  if (answers['motivation'] === 'social') s.connector += 3;
  if (answers['desired-result'] === 'friends') s.connector += 2;
  if (answers['challenge-style'] === 'group-energy') s.connector += 1;
  if (answers['advanced-goal'] === 'community') s.connector += 1;
  if (answers['partner'] === 'no') s.connector += 1;

  // ── Artist (האמן) ─────────────────────────────────────────────────────────
  if (answers['fitness'] === 'yoga') s.artist += 3;
  if (answers['experience'] === 'regular') s.artist += 2;
  if (answers['body-mind'] === 'mental') s.artist += 1;
  if (answers['intermediate-goal'] === 'balance') s.artist += 1;
  if (answers['desired-result'] === 'skill') s.artist += 1;

  return s;
}

/**
 * Tie-breaking priority: Explorer > Artist > Connector > Athlete.
 * (Favour beginner-friendly archetypes on ties.)
 */
const TIE_PRIORITY: ArchetypeId[] = ['explorer', 'artist', 'connector', 'athlete'];

function pickWinner(scores: Record<ArchetypeId, number>): ArchetypeId {
  let best: ArchetypeId = 'explorer';
  let bestScore = -1;

  for (const id of TIE_PRIORITY) {
    if (scores[id] > bestScore) {
      bestScore = scores[id];
      best = id;
    }
  }

  return best;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate the result archetype for a given set of quiz answers.
 * Returns the full ResultArchetype object ready for the results page.
 */
export function calculateResult(answers: Record<string, string>): ResultArchetype {
  const scores = score(answers);
  const winnerId = pickWinner(scores);
  return ARCHETYPES[winnerId];
}

/**
 * Return additional fear-addressing messages personalised to specific answer
 * combinations — supplemental to the archetype's base fears array.
 */
export function getPersonalizedFears(
  answers: Record<string, string>,
): Array<{ en: string; he: string }> {
  const extras: Array<{ en: string; he: string }> = [];

  if (answers['partner'] === 'no') {
    extras.push({
      en: "No partner needed — we pair everyone up",
      he: 'לא צריך פרטנר — אנחנו מזווגים את כולם',
    });
  }

  if (answers['beginner-barrier'] === 'fear-heights') {
    extras.push({
      en: "We start low to the ground — you'll feel safe from the first moment",
      he: 'מתחילים נמוך — תרגישו בטוחים מהרגע הראשון',
    });
  }

  if (answers['beginner-barrier'] === 'not-flexible') {
    extras.push({
      en: "Flexibility comes with practice — our students gain it naturally",
      he: 'גמישות מגיעה עם תרגול — התלמידים שלנו מפתחים אותה בטבעיות',
    });
  }

  if (answers['city'] === 'kfar-saba') {
    extras.push({
      en: "Yes, we have classes in Kfar Saba too!",
      he: '!כן, יש לנו שיעורים גם בכפר סבא',
    });
  }

  return extras;
}
