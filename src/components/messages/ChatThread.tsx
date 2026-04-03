"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import MessageBubble, { type MessageData } from "./MessageBubble";
import { usePushPermission } from "@/hooks/usePushPermission";

type ApiMessage = {
  id: string;
  senderId: string;
  text: string;
  sentAt: string;
};

type LocalMessage = MessageData & {
  isPending?: boolean;
  hasError?: boolean;
  localId?: string;
};

type Props = {
  conversationId: string;
};

export default function ChatThread({ conversationId }: Props) {
  const t = useTranslations("messages");
  const router = useRouter();
  const { data: session } = useSession();
  const { promptForPush, permissionState } = usePushPermission();

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [otherUserName, setOtherUserName] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const latestMessageIdRef = useRef<string | null>(null);
  const isInitialLoad = useRef(true);

  const scrollToBottom = useCallback((smooth = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${conversationId}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = (await res.json()) as { messages: ApiMessage[]; hasMore: boolean };
        setMessages(data.messages);
        setHasMore(data.hasMore);
        if (data.messages.length > 0) {
          latestMessageIdRef.current = data.messages[data.messages.length - 1].id;
        }

        // Fetch conversation info to get the other user's name
        const listRes = await fetch("/api/messages");
        if (listRes.ok) {
          const listData = (await listRes.json()) as {
            conversations: Array<{
              id: string;
              otherUser: { name: string };
            }>;
          };
          const conv = listData.conversations.find((c) => c.id === conversationId);
          if (conv) {
            setOtherUserName(conv.otherUser.name);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Scroll to bottom on initial load once messages rendered
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom(false);
    }
  }, [loading, scrollToBottom]);

  // 3-second polling for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages/${conversationId}`);
        if (!res.ok) return;
        const data = (await res.json()) as { messages: ApiMessage[]; hasMore: boolean };
        const incoming = data.messages;

        if (incoming.length === 0) return;

        const latestIncoming = incoming[incoming.length - 1];

        // Only update if there are genuinely new messages
        if (latestIncoming.id !== latestMessageIdRef.current) {
          latestMessageIdRef.current = latestIncoming.id;

          setMessages((prev) => {
            // Keep pending/error local messages, merge with server messages
            const pendingLocal = prev.filter((m) => m.isPending || m.hasError);
            const pendingLocalIds = new Set(pendingLocal.map((m) => m.localId).filter(Boolean));

            // Remove pending messages that have been confirmed by the server
            // (they'll now appear in the server response)
            const serverIds = new Set(incoming.map((m) => m.id));
            const stillPending = pendingLocal.filter(
              (m) => m.localId && !serverIds.has(m.localId)
            );
            void pendingLocalIds; // suppress unused warning

            return [...incoming, ...stillPending];
          });

          // Scroll to bottom only if we're near the bottom already
          const container = scrollContainerRef.current;
          if (container) {
            const isNearBottom =
              container.scrollHeight - container.scrollTop - container.clientHeight < 120;
            if (isNearBottom) {
              scrollToBottom(true);
            }
          }
        }
      } catch {
        // Silently fail — polling is non-critical
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, scrollToBottom]);

  // Load older messages on scroll to top
  async function loadOlderMessages() {
    if (!hasMore || loadingMore || messages.length === 0) return;

    const oldest = messages[0];
    setLoadingMore(true);

    try {
      const res = await fetch(
        `/api/messages/${conversationId}?before=${encodeURIComponent(oldest.sentAt as string)}&limit=50`
      );
      if (!res.ok) return;
      const data = (await res.json()) as { messages: ApiMessage[]; hasMore: boolean };

      // Maintain scroll position after prepending
      const container = scrollContainerRef.current;
      const prevScrollHeight = container?.scrollHeight ?? 0;

      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);

      // Restore scroll position so the user stays at the same visible message
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch {
      // Silently fail
    } finally {
      setLoadingMore(false);
    }
  }

  function handleScroll() {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollTop < 60) {
      loadOlderMessages();
    }
  }

  async function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed || sending || !session) return;

    setSending(true);
    setInputText("");

    const localId = `local-${Date.now()}`;
    const optimisticMsg: LocalMessage = {
      id: localId,
      localId,
      senderId: session.user.id,
      text: trimmed,
      sentAt: new Date().toISOString(),
      isPending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom(true);

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.localId === localId ? { ...m, isPending: false, hasError: true } : m
          )
        );
        setSending(false);
        return;
      }

      const confirmed = (await res.json()) as ApiMessage;
      // Replace optimistic with confirmed
      setMessages((prev) =>
        prev.map((m) =>
          m.localId === localId
            ? { id: confirmed.id, senderId: confirmed.senderId, text: confirmed.text, sentAt: confirmed.sentAt }
            : m
        )
      );
      latestMessageIdRef.current = confirmed.id;

      // Prompt for push permission after first successful message send (fire-and-forget)
      if (permissionState === "default") {
        void promptForPush();
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.localId === localId ? { ...m, isPending: false, hasError: true } : m
        )
      );
    } finally {
      setSending(false);
    }
  }

  function handleRetry(localId: string, text: string) {
    // Remove the error message, re-add as pending, and re-send
    setMessages((prev) => prev.filter((m) => m.localId !== localId));
    setInputText(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const myId = session?.user.id;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
        <button
          onClick={() => router.push("/messages")}
          className="text-neutral-400 hover:text-neutral-100 transition-colors text-lg leading-none"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="flex-1 text-center text-base font-semibold text-neutral-100">
          {otherUserName || t("chatTitle")}
        </h1>
        {/* Spacer to balance the back button */}
        <div className="w-6" />
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {loading && (
          <p className="text-center text-sm text-neutral-500">{t("loadingMessages")}</p>
        )}

        {loadingMore && (
          <p className="mb-2 text-center text-xs text-neutral-500">Loading older messages…</p>
        )}

        {!loading && messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-500">{t("noMessages")}</p>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.localId ?? msg.id}
            message={msg}
            isMine={msg.senderId === myId}
            isPending={msg.isPending}
            hasError={msg.hasError}
            onRetry={
              msg.hasError
                ? () => handleRetry(msg.localId!, msg.text)
                : undefined
            }
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("typeMessage")}
            disabled={sending}
            className="flex-1 rounded-full border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-pink-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 text-white transition-colors hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label={t("send")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
