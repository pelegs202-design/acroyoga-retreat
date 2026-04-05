"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";

const VISIT_COUNT_KEY = "pwa_visit_count";
const DISMISSED_KEY = "pwa_install_dismissed";
const FUNNEL_PATHS = ["/quiz/challenge"];

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Hide on entire quiz funnel (landing, quiz, results, checkout, success)
  const isInFunnel = FUNNEL_PATHS.some((p) => pathname.startsWith(p));
  if (isInFunnel) return null;

  useEffect(() => {
    // Increment visit count on every page load
    const current = parseInt(
      localStorage.getItem(VISIT_COUNT_KEY) ?? "0",
      10
    );
    const visits = current + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(visits));

    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    if (dismissed) return;

    // Hide for ad traffic — users from IG/FB don't want PWA install
    if (window.location.search.includes("utm_") || window.location.search.includes("fbclid")) return;

    const handler = (e: Event) => {
      // Prevent the browser's default mini-infobar from appearing
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Only surface the prompt starting on the 2nd visit
      if (visits >= 2) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "0.75rem 1rem",
        backgroundColor: "rgba(10, 10, 10, 0.95)",
        borderTop: "1px solid rgba(245, 245, 245, 0.2)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
      }}
      role="banner"
      aria-label="Install app"
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#f5f5f5",
            letterSpacing: "0.02em",
          }}
        >
          Install AcroHavura
        </p>
        <p
          style={{
            margin: "0.125rem 0 0",
            fontSize: "0.75rem",
            color: "rgba(245, 245, 245, 0.55)",
          }}
        >
          Add to your home screen for the best experience
        </p>
      </div>

      <button
        onClick={handleInstall}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#F472B6",
          color: "#0a0a0a",
          border: "none",
          fontFamily: "inherit",
          fontSize: "0.8125rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Install
      </button>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        style={{
          background: "none",
          border: "none",
          color: "rgba(245, 245, 245, 0.5)",
          cursor: "pointer",
          padding: "0.25rem",
          fontSize: "1.25rem",
          lineHeight: 1,
          fontFamily: "inherit",
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
