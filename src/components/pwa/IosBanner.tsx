"use client";

import { useEffect, useState } from "react";

const VISIT_COUNT_KEY = "pwa_visit_count";
const IOS_DISMISSED_KEY = "pwa_ios_banner_dismissed";

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  // Check display-mode: standalone via matchMedia
  const isStandalone = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;
  // Also check navigator.standalone for older iOS Safari
  const nav = navigator as Navigator & { standalone?: boolean };
  return isStandalone || nav.standalone === true;
}

export default function IosBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on iOS, not already installed, not dismissed, 2nd+ visit
    if (!isIosDevice()) return;
    if (isInStandaloneMode()) return;

    const dismissed = localStorage.getItem(IOS_DISMISSED_KEY) === "true";
    if (dismissed) return;

    const visits = parseInt(
      localStorage.getItem(VISIT_COUNT_KEY) ?? "0",
      10
    );
    if (visits < 2) return;

    setVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(IOS_DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        padding: "0.875rem 1rem",
        backgroundColor: "rgba(10, 10, 10, 0.95)",
        borderTop: "1px solid rgba(245, 245, 245, 0.2)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}
      role="banner"
      aria-label="Add to home screen instructions"
    >
      {/* Share icon */}
      <span
        aria-hidden="true"
        style={{
          fontSize: "1.5rem",
          lineHeight: 1,
          color: "#f5f5f5",
          flexShrink: 0,
          marginTop: "0.125rem",
        }}
      >
        ⬆
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: "0 0 0.25rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#f5f5f5",
            letterSpacing: "0.02em",
          }}
        >
          Add to Home Screen
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.75rem",
            color: "rgba(245, 245, 245, 0.65)",
            lineHeight: 1.5,
          }}
        >
          Tap{" "}
          <span
            aria-label="Share button"
            style={{ fontWeight: 700, color: "#f5f5f5" }}
          >
            Share ⬆
          </span>{" "}
          then{" "}
          <span style={{ fontWeight: 700, color: "#f5f5f5" }}>
            &lsquo;Add to Home Screen&rsquo;
          </span>
        </p>
      </div>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss add to home screen banner"
        style={{
          background: "none",
          border: "none",
          color: "rgba(245, 245, 245, 0.5)",
          cursor: "pointer",
          padding: "0.125rem",
          fontSize: "1.125rem",
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
