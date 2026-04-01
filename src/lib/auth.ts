import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Default from address — override via RESEND_FROM_EMAIL env var
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "AcroYoga Academy <noreply@acro.academy>";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: drizzleAdapter(db, { provider: "pg", schema }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      // void the await to prevent timing attacks — serverless-safe
      if (!resend) {
        console.warn("[auth] RESEND_API_KEY not set — skipping password reset email");
        return;
      }
      void resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Reset your AcroYoga Academy password",
        text: `Click the link below to reset your password. The link expires in 1 hour.\n\n${url}\n\nIf you did not request a password reset, you can ignore this email.`,
      });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh session daily
    // Cookie cache disabled — causes stale session reads after TOS/onboarding
    // updates, leading to redirect loops. Re-enable once onboarding flow is stable.
  },

  user: {
    additionalFields: {
      // Onboarding fields — collected in the post-signup wizard
      city: {
        type: "string",
        required: false,
        input: true,
      },
      // Role in acro practice: base / flyer / both
      // Validated at application layer (not Postgres enum — see research Pitfall 5)
      role: {
        type: "string",
        required: false,
        input: true,
      },
      // Skill level: beginner / intermediate / advanced
      // Validated at application layer
      level: {
        type: "string",
        required: false,
        input: true,
      },
      // Set by the app after login based on user's saved preference
      // input: false — never accepted from client directly
      preferredLocale: {
        type: "string",
        required: false,
        input: false,
      },
      // Set when user accepts TOS in the post-signup TOS acceptance step
      // input: false — only set via server action, never from client form
      tosAcceptedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },

  // nextCookies must be last — it wraps the response to set cookies in Next.js
  plugins: [nextCookies()],
});
