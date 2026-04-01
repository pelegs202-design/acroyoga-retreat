'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { SkillsChecklist } from '@/components/profile/SkillsChecklist';

type Props = {
  name: string;
  imageUrl: string | null;
  city: string;
  role: string;
  level: string;
  bio: string;
  skills: string[];
  locale: string;
};

const VALID_ROLES = ['base', 'flyer', 'both'] as const;
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export function ProfileEditForm({
  name,
  imageUrl,
  city: initialCity,
  role: initialRole,
  level: initialLevel,
  bio: initialBio,
  skills: initialSkills,
}: Props) {
  const t = useTranslations('profile');

  const [city, setCity] = useState(initialCity);
  const [role, setRole] = useState(initialRole);
  const [level, setLevel] = useState(initialLevel);
  const [bio, setBio] = useState(initialBio);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(
    new Set(initialSkills)
  );
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function toggleSkill(move: string) {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(move)) {
        next.delete(move);
      } else {
        next.add(move);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          role: role || undefined,
          level: level || undefined,
          bio,
          skills: Array.from(selectedSkills),
        }),
      });

      if (res.ok) {
        setStatusMsg({ ok: true, text: t('saveSuccess') });
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusMsg({ ok: false, text: data.error ?? t('saveError') });
      }
    } catch {
      setStatusMsg({ ok: false, text: t('saveError') });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-100">{t('editButton')}</h1>
        <p className="mt-1 text-sm text-neutral-400">{name}</p>
      </div>

      {/* Photo */}
      <AvatarUpload
        currentImageUrl={imageUrl}
        onUploadComplete={() => {
          setStatusMsg({ ok: true, text: t('photoSuccess') });
        }}
      />

      {/* Bio */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-300">
          {t('bio')}
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder={t('bioPlaceholder')}
          className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-brand focus:outline-none"
        />
        <p className="text-end text-xs text-neutral-500">{bio.length}/500</p>
      </div>

      {/* City */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-300">
          {t('city')}
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-brand focus:outline-none"
        />
      </div>

      {/* Role */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-300">
          {t('role')}
        </label>
        <div className="flex flex-wrap gap-2">
          {VALID_ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                role === r
                  ? 'border border-brand bg-brand text-brand-foreground'
                  : 'border border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-300">
          {t('level')}
        </label>
        <div className="flex flex-wrap gap-2">
          {VALID_LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                level === l
                  ? 'border border-brand bg-brand text-brand-foreground'
                  : 'border border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <SkillsChecklist selected={selectedSkills} onToggle={toggleSkill} />

      {/* Status message */}
      {statusMsg && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            statusMsg.ok
              ? 'bg-green-950 text-green-400'
              : 'bg-red-950 text-red-400'
          }`}
        >
          {statusMsg.text}
        </p>
      )}

      {/* Save */}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? '...' : t('save')}
      </button>
    </form>
  );
}
