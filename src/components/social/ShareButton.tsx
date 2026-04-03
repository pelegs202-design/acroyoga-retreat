"use client";

import { useState } from "react";
import { ShareBottomSheet } from "./ShareBottomSheet";

interface ShareButtonProps {
  url: string;
  title: string;
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

/**
 * Floating share trigger button — fixed bottom-end (RTL-aware).
 * Opens the ShareBottomSheet with WhatsApp, native share, copy link, and Facebook.
 */
export function ShareButton({ url, title }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share this page"
        className="fixed bottom-20 end-4 z-30 flex h-12 w-12 items-center justify-center rounded-none border-2 border-neutral-800 bg-brand text-neutral-900 shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
      >
        <ShareIcon />
      </button>

      <ShareBottomSheet
        url={url}
        title={title}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
