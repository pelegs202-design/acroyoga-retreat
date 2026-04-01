"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import NewMessagePicker from "./NewMessagePicker";

type Conversation = {
  id: string;
  otherUser: {
    id: string;
    name: string;
    image: string | null;
  };
  lastMessage: {
    text: string;
    sentAt: string;
    senderId: string;
  } | null;
  hasUnread: boolean;
  lastMessageAt: string | null;
};

type Props = {
  withUserId?: string;
};

function formatPreviewTime(ts: string | null): string {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ConversationList({ withUserId }: Props) {
  const t = useTranslations("messages");
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(!!withUserId);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = (await res.json()) as { conversations: Conversation[] };
          setConversations(data.conversations ?? []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  function handleRowClick(conversationId: string) {
    router.push(`/messages/${conversationId}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-100">{t("title")}</h1>
        <button
          onClick={() => setShowNewMessage((v) => !v)}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-100"
        >
          {t("newMessage")}
        </button>
      </div>

      {/* New Message Picker */}
      {showNewMessage && (
        <div className="mb-4">
          <NewMessagePicker
            prefillUserId={withUserId}
            onClose={() => setShowNewMessage(false)}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <ul className="space-y-px">
          {[1, 2, 3].map((n) => (
            <li key={n} className="animate-pulse rounded-xl bg-neutral-800/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-neutral-700" />
                  <div className="h-3 w-2/3 rounded bg-neutral-700/60" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {!loading && conversations.length === 0 && !showNewMessage && (
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-neutral-300">{t("noConversations")}</p>
          <p className="mt-1 text-sm text-neutral-500">{t("noConversationsHint")}</p>
        </div>
      )}

      {/* Conversation list */}
      {!loading && conversations.length > 0 && (
        <ul className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 overflow-hidden">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <button
                onClick={() => handleRowClick(conv.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800/60 transition-colors"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-700 text-sm font-bold text-neutral-300 overflow-hidden">
                    {conv.otherUser.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={conv.otherUser.image}
                        alt={conv.otherUser.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      conv.otherUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {/* Unread dot */}
                  {conv.hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-pink-500 ring-2 ring-neutral-900" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`truncate text-sm ${
                        conv.hasUnread
                          ? "font-semibold text-neutral-100"
                          : "font-medium text-neutral-200"
                      }`}
                    >
                      {conv.otherUser.name}
                    </span>
                    <span className="ms-2 flex-shrink-0 text-[11px] text-neutral-500">
                      {formatPreviewTime(conv.lastMessage?.sentAt ?? conv.lastMessageAt)}
                    </span>
                  </div>
                  {conv.lastMessage && (
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        conv.hasUnread ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {conv.lastMessage.text}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
