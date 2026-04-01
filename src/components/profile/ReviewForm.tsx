'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  revieweeId: string;
};

export function ReviewForm({ revieweeId }: Props) {
  const t = useTranslations('review');
  const [thumbsUp, setThumbsUp] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error' | 'duplicate'>('idle');

  async function handleSubmit() {
    if (thumbsUp === null) return;
    setStatus('submitting');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revieweeId,
          thumbsUp,
          comment: comment.trim() || null,
        }),
      });

      if (res.status === 409) {
        setStatus('duplicate');
        return;
      }

      if (!res.ok) {
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <p className="text-sm text-green-400">{t('success')}</p>;
  }

  if (status === 'duplicate') {
    return <p className="text-sm text-neutral-400">{t('alreadyReviewed')}</p>;
  }

  return (
    <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <h3 className="text-lg font-semibold text-neutral-100">{t('submit')}</h3>

      {/* Thumbs up/down buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setThumbsUp(true)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            thumbsUp === true
              ? 'border border-green-500 bg-green-500/20 text-green-400'
              : 'border border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500'
          }`}
        >
          👍 {t('thumbsUp')}
        </button>
        <button
          type="button"
          onClick={() => setThumbsUp(false)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            thumbsUp === false
              ? 'border border-red-500 bg-red-500/20 text-red-400'
              : 'border border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500'
          }`}
        >
          👎 {t('thumbsDown')}
        </button>
      </div>

      {/* Optional comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('commentPlaceholder')}
        maxLength={200}
        rows={2}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-brand focus:outline-none"
      />

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={thumbsUp === null || status === 'submitting'}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'submitting' ? '...' : t('submit')}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
