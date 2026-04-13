export interface DripStep {
  templateName: string;
  subject?: string; // for email sequences
}

export interface DripSequence {
  steps: number;
  channel: "whatsapp" | "email";
  /**
   * Day offsets from enrollment for each step.
   * Index 0 = first message (sent at enrollment time or shortly after).
   */
  spacingDays: number[];
  templates: DripStep[];
}

export const DRIP_SEQUENCES: Record<string, DripSequence> = {
  /**
   * WhatsApp drip for free trial leads (4 steps).
   * Welcome → class reminder → day-of nudge → post-class follow-up.
   */
  wa_free_trial: {
    steps: 4,
    channel: "whatsapp",
    spacingDays: [0, 3, 6, 8],
    templates: [
      { templateName: "free_trial_welcome_he" },
      { templateName: "free_trial_reminder_he" },
      { templateName: "free_trial_day_of_he" },
      { templateName: "free_trial_followup_he" },
    ],
  },

  /**
   * WhatsApp drip for challenge leads who have NOT yet paid (7 steps).
   * Spacing tightens from every 2 days to daily after day 6.
   * @deprecated Kept for existing enrollments — new leads use wa_free_trial.
   */
  wa_challenge_prepay: {
    steps: 7,
    channel: "whatsapp",
    spacingDays: [0, 2, 4, 6, 7, 8, 9],
    templates: [
      { templateName: "challenge_welcome_he" },
      { templateName: "challenge_tip1_he" },
      { templateName: "challenge_tip2_he" },
      { templateName: "challenge_social_proof_he" },
      { templateName: "challenge_urgency1_he" },
      { templateName: "challenge_urgency2_he" },
      { templateName: "challenge_last_chance_he" },
    ],
  },

  /**
   * WhatsApp drip for challenge leads who have paid (5 steps, daily onboarding).
   */
  wa_challenge_postpay: {
    steps: 5,
    channel: "whatsapp",
    spacingDays: [0, 1, 2, 3, 4],
    templates: [
      { templateName: "challenge_confirmed_he" },
      { templateName: "challenge_prep_day1_he" },
      { templateName: "challenge_prep_day2_he" },
      { templateName: "challenge_prep_day3_he" },
      { templateName: "challenge_kickoff_he" },
    ],
  },

  /**
   * WhatsApp drip for workshop leads (3 steps, nurture over ~5 days).
   */
  wa_workshop: {
    steps: 3,
    channel: "whatsapp",
    spacingDays: [0, 2, 5],
    templates: [
      { templateName: "workshop_inquiry_confirmed_he" },
      { templateName: "workshop_followup_he" },
      { templateName: "workshop_last_nudge_he" },
    ],
  },

  /**
   * Email nurture sequence — 12 steps, weekly for first 5, bi-weekly after.
   * After step 12, nextFireAt wraps back to step 6 position (rotating evergreen).
   *
   * spacingDays[i] = cumulative days since enrollment for step i.
   */
  email_nurture: {
    steps: 12,
    channel: "email",
    // Steps 0-4: every 7 days. Steps 5-11: every 14 days.
    spacingDays: [0, 7, 14, 21, 28, 42, 56, 70, 84, 98, 112, 126],
    templates: [
      {
        templateName: "email_nurture_01",
        subject: "ברוך הבא לעולם האקרויוגה",
      },
      {
        templateName: "email_nurture_02",
        subject: "3 תרגילים להתחלה הנכונה",
      },
      {
        templateName: "email_nurture_03",
        subject: "הסיפור של הקהילה שלנו",
      },
      {
        templateName: "email_nurture_04",
        subject: "שאלות נפוצות על האקרויוגה",
      },
      {
        templateName: "email_nurture_05",
        subject: "מה אנחנו מכינים לך הבא",
      },
      {
        templateName: "email_nurture_06",
        subject: "טיפ שבועי: בסיס יציב",
      },
      {
        templateName: "email_nurture_07",
        subject: "טיפ שבועי: תקשורת בזמן תרגול",
      },
      {
        templateName: "email_nurture_08",
        subject: "פגוש את המאמנים שלנו",
      },
      {
        templateName: "email_nurture_09",
        subject: "סיפורי הצלחה מהקהילה",
      },
      {
        templateName: "email_nurture_10",
        subject: "האתגר הבא מתחיל בקרוב",
      },
      {
        templateName: "email_nurture_11",
        subject: "זמן לחגוג — כמה הגעת רחוק",
      },
      {
        templateName: "email_nurture_12",
        subject: "מה חדש ב-AcroHavura",
      },
    ],
  },

  /**
   * Email reminders tied to a challenge cohort schedule.
   * Steps and spacing are computed dynamically from cohortStartDate metadata.
   * This entry provides defaults; real fire times override nextFireAt at enrollment.
   */
  email_challenge_reminders: {
    steps: 4,
    channel: "email",
    spacingDays: [-7, -3, 0, 7], // relative to cohortStartDate
    templates: [
      {
        templateName: "email_challenge_reminder_week_before",
        subject: "האתגר מתחיל בעוד שבוע — מוכן?",
      },
      {
        templateName: "email_challenge_reminder_3days",
        subject: "עוד 3 ימים לתחילת האתגר",
      },
      {
        templateName: "email_challenge_reminder_start",
        subject: "היום זה קורה — האתגר מתחיל!",
      },
      {
        templateName: "email_challenge_reminder_week_after",
        subject: "שבוע ראשון — איך הולך?",
      },
    ],
  },
};
