import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envText = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
const url = envText.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
if (!url) { console.error("DATABASE_URL not found"); process.exit(1); }

const sql = neon(url);

const section = async (title, q, ...args) => {
  console.log(`\n===== ${title} =====`);
  try {
    const rows = await sql.query(q, args);
    if (!rows.length) { console.log("(no rows)"); return; }
    console.log(JSON.stringify(rows, null, 2));
    console.log(`[${rows.length} row(s)]`);
  } catch (e) { console.log("ERR:", e.message); }
};

await section(
  "Quiz leads today",
  `SELECT id, session_id, quiz_type, name, email, phone, city, first_class_day,
          result_type, lead_status, created_at
   FROM quiz_leads
   WHERE created_at::date = CURRENT_DATE
   ORDER BY created_at DESC`
);

await section(
  "Quiz leads last 7 days",
  `SELECT created_at::date AS day, quiz_type, count(*)::int AS c
   FROM quiz_leads
   WHERE created_at >= now() - interval '7 days'
   GROUP BY day, quiz_type ORDER BY day DESC`
);

await section(
  "Challenge enrollments (PAID) today",
  `SELECT id, session_id, gi_document_number, amount_paid, currency,
          customer_name, customer_email, customer_phone, status,
          first_class_day, paid_at
   FROM challenge_enrollments
   WHERE paid_at::date = CURRENT_DATE
   ORDER BY paid_at DESC`
);

await section(
  "Challenge enrollments last 14 days",
  `SELECT paid_at::date AS day, count(*)::int AS c, sum(amount_paid)::int AS revenue_nis
   FROM challenge_enrollments
   WHERE paid_at >= now() - interval '14 days'
   GROUP BY day ORDER BY day DESC`
);

await section(
  "Newly registered users today (Better Auth)",
  `SELECT id, email, name, email_verified, created_at
   FROM "user"
   WHERE created_at::date = CURRENT_DATE
   ORDER BY created_at DESC`
);

await section(
  "Quiz events today — per session progress",
  `SELECT session_id, quiz_type,
          count(*) FILTER (WHERE event_type='answer')::int AS answered,
          count(*) FILTER (WHERE event_type='view')::int AS viewed,
          count(*) FILTER (WHERE event_type='abandon')::int AS abandoned,
          min(created_at) AS started, max(created_at) AS last_seen
   FROM quiz_events
   WHERE created_at::date = CURRENT_DATE
   GROUP BY session_id, quiz_type
   ORDER BY started DESC
   LIMIT 50`
);

await section(
  "Quiz events today — dropoff by questionId (how many reached each)",
  `SELECT question_id, count(DISTINCT session_id)::int AS sessions_reached
   FROM quiz_events
   WHERE created_at::date = CURRENT_DATE AND event_type='view'
   GROUP BY question_id ORDER BY sessions_reached DESC`
);
