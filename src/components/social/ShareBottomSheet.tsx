"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WhatsappShareButton, FacebookShareButton } from "react-share";

interface ShareBottomSheetProps {
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

interface ShareOptionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function ShareOption({ icon, label, onClick }: ShareOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-none border-2 border-neutral-700 bg-neutral-800 px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-200 transition-colors duration-150 hover:border-brand hover:text-brand active:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// WhatsApp icon (simple SVG)
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#25D366]">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Facebook icon
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#1877F2]">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// Copy link icon
function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

// Native share icon
function NativeShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export function ShareBottomSheet({ url, title, open, onClose }: ShareBottomSheetProps) {
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  // Detect native share support on mount (client only)
  useEffect(() => {
    setHasNativeShare(
      typeof navigator !== "undefined" && !!navigator.share
    );
  }, []);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — silently fail
    }
  }

  async function handleNativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, url });
    } catch {
      // User cancelled or error — not an error
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-none border-t-4 border-brand bg-neutral-900 pb-safe"
            role="dialog"
            aria-modal="true"
            aria-label="Share options"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-neutral-600" />
            </div>

            <div className="px-6 pb-8 pt-3">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                Share
              </p>

              {/* Share options */}
              <div className="flex flex-wrap gap-3 justify-around">
                {/* WhatsApp — first/primary for Israel */}
                <WhatsappShareButton
                  url={url}
                  title={title}
                  className="flex flex-col items-center gap-2 rounded-none border-2 border-neutral-700 bg-neutral-800 px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-200 transition-colors duration-150 hover:border-brand hover:text-brand active:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <WhatsAppIcon />
                  <span>WhatsApp</span>
                </WhatsappShareButton>

                {/* Native share (mobile only) */}
                {hasNativeShare && (
                  <ShareOption
                    icon={<NativeShareIcon />}
                    label="Share"
                    onClick={handleNativeShare}
                  />
                )}

                {/* Copy link */}
                <ShareOption
                  icon={<CopyIcon />}
                  label={copied ? "Copied!" : "Copy link"}
                  onClick={handleCopyLink}
                />

                {/* Facebook */}
                <FacebookShareButton
                  url={url}
                  className="flex flex-col items-center gap-2 rounded-none border-2 border-neutral-700 bg-neutral-800 px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-200 transition-colors duration-150 hover:border-brand hover:text-brand active:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <FacebookIcon />
                  <span>Facebook</span>
                </FacebookShareButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
