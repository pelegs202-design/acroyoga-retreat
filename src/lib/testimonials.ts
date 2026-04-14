export type Testimonial = {
  he: string;
  en: string;
  author: { he: string; en: string };
  source?: "google" | "internal";
  rating?: 1 | 2 | 3 | 4 | 5;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    he: "הגעתי בלי שום ניסיון, חשבתי שלא אצליח. אחרי השיעור הראשון עם שי הבנתי שזה בדיוק בשבילי. היום אני יכולה לעוף.",
    en: "I came with zero experience, thought I'd never manage. After my first class with Shai I knew this was for me. Today I can fly.",
    author: { he: "מיטל, תל אביב", en: "Mital, Tel Aviv" },
    source: "google",
    rating: 5,
  },
  {
    he: "חיפשתי ספורט שהוא גם חברתי. מצאתי קהילה שלמה. שי יצר מרחב שבו כולם מרגישים שייכים.",
    en: "I was looking for a sport that's also social. Found a whole community. Shai created a space where everyone feels they belong.",
    author: { he: "דניאל, כפר סבא", en: "Daniel, Kfar Saba" },
    source: "google",
    rating: 5,
  },
  {
    he: "תוך חודש ראיתי שינוי בכוח וביציבה שלי. לא ידעתי שיש ספורט כזה — מאתגר, כייפי, וחברתי.",
    en: "Within a month I saw changes in my strength and posture. Didn't know a sport like this existed — challenging, fun, and social.",
    author: { he: "אלה, תל אביב", en: "Ella, Tel Aviv" },
    source: "google",
    rating: 5,
  },
  {
    he: "תרגלתי יוגה שנים, אבל אקרויוגה פתח לי עולם חדש של אמון ושיתוף פעולה. שי מלמד בסבלנות ובדיוק.",
    en: "I practiced yoga for years, but acroyoga opened a new world of trust and collaboration. Shai teaches with patience and precision.",
    author: { he: "יואב, תל אביב", en: "Yoav, Tel Aviv" },
    source: "google",
    rating: 5,
  },
];
