"use client";

export type MessageData = {
  id: string;
  senderId: string;
  text: string;
  sentAt: string | Date;
};

type Props = {
  message: MessageData;
  isMine: boolean;
  isPending?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
};

function formatTime(sentAt: string | Date): string {
  const date = typeof sentAt === "string" ? new Date(sentAt) : sentAt;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({
  message,
  isMine,
  isPending,
  hasError,
  onRetry,
}: Props) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`
            px-4 py-2 text-sm leading-relaxed
            ${isMine
              ? "rounded-2xl rounded-br-sm bg-pink-600 text-white"
              : "rounded-2xl rounded-bl-sm bg-neutral-800 text-neutral-100"
            }
            ${isPending ? "opacity-60" : ""}
            ${hasError ? "bg-red-900/50 text-red-200" : ""}
          `}
        >
          {message.text}
        </div>
        <div className="mt-0.5 flex items-center gap-1">
          <span className="text-[11px] text-neutral-500">
            {formatTime(message.sentAt)}
          </span>
          {isPending && (
            <span className="text-[11px] text-neutral-500 italic">sending…</span>
          )}
          {hasError && onRetry && (
            <button
              onClick={onRetry}
              className="text-[11px] text-red-400 underline hover:text-red-300"
            >
              retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
