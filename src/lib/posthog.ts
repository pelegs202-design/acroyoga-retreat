import posthog from "posthog-js";

export const POSTHOG_KEY = "phc_Cfs2bpmqvdoBXqCwz2NkPC8J4AGuTcohj9yCMYuwzxRo";
export const POSTHOG_HOST = "https://us.i.posthog.com";

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (posthog.__loaded) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // manual capture in PostHogProvider for SPA routing
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      maskAllInputs: false,
      maskInputFn: (text, element) => {
        // Mask password fields only
        if (element?.getAttribute("type") === "password") return "*".repeat(text.length);
        return text;
      },
    },
    enable_heatmaps: true,
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });
}

export { posthog };
