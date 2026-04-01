"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Member = {
  id: string;
  name: string;
  image: string | null;
};

type Props = {
  prefillUserId?: string;
  onClose?: () => void;
};

export default function NewMessagePicker({ prefillUserId, onClose }: Props) {
  const t = useTranslations("messages");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-load prefill user
  useEffect(() => {
    if (!prefillUserId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/profile?id=${prefillUserId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setSelectedMember(data.user);
          }
        }
      } catch {
        // Silently fail — user will search manually
      }
    };

    fetchUser();
  }, [prefillUserId]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/user/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.users ?? []);
        }
      } catch {
        // Silently fail
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [query]);

  async function handleSend() {
    if (!selectedMember || !text.trim()) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: selectedMember.id, text: text.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Failed to send");
        setSending(false);
        return;
      }

      const data = (await res.json()) as { conversationId: string };
      router.push(`/messages/${data.conversationId}`);
    } catch {
      setError("Failed to send");
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-100">{t("newMessage")}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {!selectedMember ? (
        <>
          {/* Member search */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchMembers")}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-pink-500 focus:outline-none"
            autoFocus
          />

          {searching && (
            <p className="mt-2 text-sm text-neutral-500">Searching…</p>
          )}

          {results.length > 0 && (
            <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-800">
              {results.map((member) => (
                <li key={member.id}>
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setQuery("");
                      setResults([]);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-neutral-700 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700 text-sm font-bold text-neutral-300 overflow-hidden flex-shrink-0">
                      {member.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.image}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm text-neutral-100">{member.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {query.length >= 2 && !searching && results.length === 0 && (
            <p className="mt-2 text-sm text-neutral-500">No members found</p>
          )}
        </>
      ) : (
        <>
          {/* Compose area — member selected */}
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-700 text-xs font-bold text-neutral-300 overflow-hidden flex-shrink-0">
              {selectedMember.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                selectedMember.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="flex-1 text-sm text-neutral-100">{selectedMember.name}</span>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Change
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("typeMessage")}
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-pink-500 focus:outline-none"
              disabled={sending}
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? t("sending") : t("send")}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
