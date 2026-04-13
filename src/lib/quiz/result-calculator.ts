/**
 * Quiz result calculator — redesigned for new gamified quiz flow.
 *
 * Maps quiz answers to:
 * 1. One of 4 archetypes (explorer/athlete/connector/artist)
 * 2. A fit score (0-100) for qualification/disqualification
 * 3. Personalized fear disarms based on captured fears
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
      he: 'הסקרנות היא הכוח-על שלך',
    },
    description: {
      en: "You approach acroyoga with fresh eyes and an open mind. Your willingness to try new things is your greatest asset — and in acroyoga, that's everything. You'll progress faster than you think.",
      he: 'את/ה ניגש/ת לאקרויוגה עם עיניים פקוחות ומוח פתוח. הנכונות שלך לנסות דברים חדשים היא הנכס הגדול שלך — ובאקרויוגה, זה הכל. תתקדמו מהר יותר ממה שאתם חושבים.',
    },
    radarData: buildRadar(
      [25, 30, 20, 35, 20],
      [70, 80, 85, 75, 70],
    ),
    fears: [
      {
        en: "You don't need any experience — 80% of participants start as complete beginners",
        he: 'לא צריך שום ניסיון — 80% מהמשתתפים מתחילים מאפס מוחלט',
      },
    ],
    strengths: [
      { en: 'Curiosity and openness', he: 'סקרנות ופתיחות' },
      { en: 'Fresh perspective', he: 'נקודת מבט טרייה' },
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
      en: "Your physical foundation gives you a head start in acroyoga. You'll discover completely new ways to use your strength — and your competitive edge will shine in ways you never expected.",
      he: 'הבסיס הגופני שלך נותן לך יתרון מוקדם באקרויוגה. תגלו דרכים חדשות לגמרי להשתמש בכוח שלכם — והיתרון התחרותי שלכם יזרח בדרכים שלא ציפיתם.',
    },
    radarData: buildRadar(
      [65, 40, 25, 30, 45],
      [90, 75, 70, 65, 85],
    ),
    fears: [
      {
        en: 'Acroyoga builds functional strength no gym can match',
        he: 'אקרויוגה בונה כוח פונקציונלי שאף חדר כושר לא יכול להתחרות בו',
      },
    ],
    strengths: [
      { en: 'Physical foundation', he: 'בסיס גופני' },
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
      en: "Your natural ability to build trust and connection is your greatest asset in acroyoga. You'll find your tribe faster than anyone — and become the person everyone wants to practice with.",
      he: 'היכולת הטבעית שלך לבנות אמון וחיבור היא הנכס הגדול שלך באקרויוגה. תמצאו את השבט שלכם מהר יותר מכולם — ותהפכו לאנשים שכולם רוצים להתאמן איתם.',
    },
    radarData: buildRadar(
      [30, 35, 55, 40, 30],
      [65, 70, 90, 70, 75],
    ),
    fears: [
      {
        en: "Our community is the warmest — no ego, no judgment",
        he: 'הקהילה שלנו היא החמה ביותר — בלי אגו, בלי שיפוטיות',
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
        en: 'Your movement background gives you a massive head start',
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
// Archetype Scoring (adapted for new gamified question IDs)
// ─────────────────────────────────────────────────────────────────────────────

type ArchetypeId = ResultArchetype['id'];

function score(answers: Record<string, string>): Record<ArchetypeId, number> {
  const s: Record<ArchetypeId, number> = {
    explorer: 0,
    athlete: 0,
    connector: 0,
    artist: 0,
  };

  // ── Q1: Superpower ──
  if (answers['superpower'] === 'fly') s.explorer += 3;
  if (answers['superpower'] === 'strength') s.athlete += 3;
  if (answers['superpower'] === 'balance') s.artist += 3;
  if (answers['superpower'] === 'read-people') s.connector += 3;

  // ── Q2: Movie Role ──
  if (answers['movie-role'] === 'action') s.athlete += 2;
  if (answers['movie-role'] === 'planner') s.explorer += 2;
  if (answers['movie-role'] === 'stunts') s.artist += 2;
  if (answers['movie-role'] === 'caretaker') s.connector += 2;

  // ── Q3: Experience ──
  if (answers['experience'] === 'never') s.explorer += 2;
  if (answers['experience'] === 'sometimes') s.artist += 1;

  // ── Q10: Fitness ──
  if (answers['fitness'] === 'gym') s.athlete += 2;
  if (answers['fitness'] === 'yoga') s.artist += 2;
  if (answers['fitness'] === 'team-sports') s.connector += 1;
  if (answers['fitness'] === 'none') s.explorer += 1;
  if (answers['fitness'] === 'cardio') s.athlete += 1;

  // ── Q7: Dream Outcome ──
  if (answers['dream-outcome'] === 'skill') s.artist += 1;
  if (answers['dream-outcome'] === 'strong') s.athlete += 1;
  if (answers['dream-outcome'] === 'friends') s.connector += 2;
  if (answers['dream-outcome'] === 'no-expectations') s.explorer += 1;

  // ── Q8: Biggest Fear (confidence boost) ──
  if (answers['biggest-fear'] === 'ready') s.athlete += 1;

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
// Fit Score (qualification/disqualification)
// ─────────────────────────────────────────────────────────────────────────────

export function calculateFitScore(answers: Record<string, string>): number {
  let fit = 0;

  // Commitment (most important signal)
  if (answers['commitment'] === '3-plus') fit += 40;
  else if (answers['commitment'] === '2') fit += 30;
  else if (answers['commitment'] === '1') fit += 10;
  else if (answers['commitment'] === 'just-browsing') fit += 0;

  // Geographic (must be in service area)
  if (answers['city'] === 'tel-aviv' || answers['city'] === 'kfar-saba') fit += 30;

  // Experience (all levels welcome, but instructors = hard DQ handled elsewhere)
  if (answers['experience'] && answers['experience'] !== 'instructor') fit += 15;

  // Dream outcome (clear goal = higher intent)
  if (answers['dream-outcome'] && answers['dream-outcome'] !== 'no-expectations') fit += 15;
  else if (answers['dream-outcome'] === 'no-expectations') fit -= 10;

  // Fear engagement (answering = invested)
  if (answers['biggest-fear'] === 'ready') fit += 10;
  else if (answers['biggest-fear']) fit += 5;

  // Body type (question removed — default to neutral +7 if not answered)
  if (answers['body-type'] === 'slim-avg' || answers['body-type'] === 'athletic') fit += 10;
  else if (answers['body-type'] === 'slightly-over') fit += 5;
  else if (!answers['body-type']) fit += 7; // no body-type question = assume average

  // Availability (hard DQ if unavailable most of the month)
  if (answers['availability'] === 'no') fit -= 100;
  else if (answers['availability'] === 'half') fit -= 40;
  else if (answers['availability'] === 'yes-mostly') fit += 5;
  else if (answers['availability'] === 'yes-full') fit += 10;

  return Math.max(0, Math.min(100, fit));
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function calculateResult(answers: Record<string, string>): ResultArchetype {
  const scores = score(answers);
  const winnerId = pickWinner(scores);
  return ARCHETYPES[winnerId];
}

/**
 * Personalized fear disarms based on captured fears from Q4 and Q8.
 * Each disarm includes concrete numbers and proof.
 */
export function getPersonalizedFears(
  answers: Record<string, string>,
): Array<{ en: string; he: string }> {
  const extras: Array<{ en: string; he: string }> = [];

  // ── From biggest-fear (captures all hesitations) ──
  if (answers['biggest-fear'] === 'not-good-enough') {
    extras.push({
      en: "Think you're not good enough? 80% of our participants couldn't touch their toes on day 1. By day 7 they did Bird. By day 30 — Throne. This journey was designed exactly for you.",
      he: 'חושבים שאתם לא מספיק טובים? 80% מהמשתתפים שלנו לא יכלו לגעת באצבעות הרגליים ביום 1. ביום 7 הם עשו Bird. ביום 30 — Throne. המסע הזה תוכנן בדיוק בשבילכם.',
    });
  }

  if (answers['biggest-fear'] === 'socially-awkward') {
    extras.push({
      en: "Worried about awkwardness? In every session you rotate partners — there's never a moment standing alone on the side. By day 1 you'll know the whole group. 60% come solo.",
      he: 'מביך עם זרים? בכל מפגש מסתובבים ועובדים עם כולם — אין רגע שאתם עומדים לבד בצד. ביום 1 כבר תכירו את כל הקבוצה. 60% מגיעים לבד.',
    });
  }

  if (answers['biggest-fear'] === 'wont-commit') {
    extras.push({
      en: "Afraid you won't stick with it? That's exactly what the group is for. 96% finish because the group won't let you quit. Miss a day? Make it up another week. Zero pressure.",
      he: 'פחד לא להתמיד? בדיוק בשביל זה יש קבוצה. 96% מסיימים כי הקבוצה לא נותנת לך לוותר. ואם מפספסים יום — משלימים בשבוע אחר. אפס לחץ.',
    });
  }

  if (answers['biggest-fear'] === 'not-flexible') {
    extras.push({
      en: "80% of our participants couldn't touch their toes on day 1. By day 30 — full Bird pose. Flexibility comes from practice, not the other way around.",
      he: '80% מהמשתתפים שלנו לא יכלו לגעת באצבעות הרגליים ביום 1. ביום 30 — Bird מלא. גמישות באה מתרגול, לא הפוך.',
    });
  }

  if (answers['biggest-fear'] === 'need-partner') {
    extras.push({
      en: "60% come alone. In every session you rotate and work with everyone. You'll find partners on day 1 — and leave with 15 new friends on day 30.",
      he: '60% מגיעים לבד. בכל מפגש מסתובבים ועובדים עם כולם. תמצאו פרטנרים ביום הראשון — ותצאו עם 15 חברים חדשים ביום 30.',
    });
  }

  if (answers['biggest-fear'] === 'injury') {
    extras.push({
      en: "Zero injuries in 527 graduates. We start 10cm off the ground. Professional spotters at every exercise. You go higher only when YOU feel ready.",
      he: '0 פציעות ב-527 בוגרים. מתחילים 10 ס״מ מהרצפה. ספוטרים מקצועיים בכל תרגיל. עולים רק כשאתם מרגישים מוכנים.',
    });
  }

  // ── General extras based on other answers ──
  if (answers['city'] === 'kfar-saba') {
    extras.push({
      en: 'Yes, we have classes in Kfar Saba too!',
      he: 'כן, יש לנו שיעורים גם בכפר סבא!',
    });
  }

  // body-type question removed — no personalized fear for it

  return extras;
}
