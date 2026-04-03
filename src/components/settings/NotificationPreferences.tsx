'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Preferences {
  pushEnabled: boolean;
  emailMarketing: boolean;
  whatsappEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
}

const DEFAULTS: Preferences = {
  pushEnabled: true,
  emailMarketing: true,
  whatsappEnabled: true,
  quietHoursStart: 22,
  quietHoursEnd: 8,
};

interface ToggleProps {
  checked: boolean;
  loading: boolean;
  onChange: (value: boolean) => void;
  id: string;
}

function Toggle({ checked, loading, onChange, id }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={loading}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50',
        checked ? 'bg-pink-500' : 'bg-neutral-600',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}

export function NotificationPreferences() {
  const t = useTranslations('settings.notifications');

  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json() as Promise<Preferences>;
      })
      .then((data) => setPrefs(data))
      .catch(() => setFetchError(true));
  }, []);

  async function updatePref<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setStatus('idle');

    const optimistic = { ...prefs, [key]: value };
    setPrefs(optimistic);

    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) throw new Error('Save failed');
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      // Revert on error
      setPrefs(prefs);
      setStatus('error');
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  if (fetchError) {
    return (
      <p className="text-sm text-red-400">Failed to load notification preferences.</p>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-neutral-100">{t('title')}</h2>

      {/* Push Notifications */}
      <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex-1">
          <label
            htmlFor="pref-push"
            className="block text-sm font-semibold text-neutral-100"
          >
            {t('push.label')}
          </label>
          <p className="mt-0.5 text-xs text-neutral-400">{t('push.description')}</p>
        </div>
        <Toggle
          id="pref-push"
          checked={prefs.pushEnabled}
          loading={!!loading.pushEnabled}
          onChange={(v) => updatePref('pushEnabled', v)}
        />
      </div>

      {/* Quiet Hours — visible only when push is enabled */}
      {prefs.pushEnabled && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="mb-3 text-sm font-semibold text-neutral-100">
            {t('quietHours.label')}
          </p>
          <p className="mb-4 text-xs text-neutral-400">{t('quietHours.description')}</p>
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="quiet-start" className="text-xs text-neutral-400">
                {t('quietHours.start')}
              </label>
              <select
                id="quiet-start"
                value={prefs.quietHoursStart}
                onChange={(e) => updatePref('quietHoursStart', Number(e.target.value))}
                disabled={!!loading.quietHoursStart}
                className="w-20 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="quiet-end" className="text-xs text-neutral-400">
                {t('quietHours.end')}
              </label>
              <select
                id="quiet-end"
                value={prefs.quietHoursEnd}
                onChange={(e) => updatePref('quietHoursEnd', Number(e.target.value))}
                disabled={!!loading.quietHoursEnd}
                className="w-20 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Emails */}
      <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex-1">
          <label
            htmlFor="pref-email"
            className="block text-sm font-semibold text-neutral-100"
          >
            {t('email.label')}
          </label>
          <p className="mt-0.5 text-xs text-neutral-400">{t('email.description')}</p>
        </div>
        <Toggle
          id="pref-email"
          checked={prefs.emailMarketing}
          loading={!!loading.emailMarketing}
          onChange={(v) => updatePref('emailMarketing', v)}
        />
      </div>

      {/* WhatsApp Messages */}
      <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex-1">
          <label
            htmlFor="pref-whatsapp"
            className="block text-sm font-semibold text-neutral-100"
          >
            {t('whatsapp.label')}
          </label>
          <p className="mt-0.5 text-xs text-neutral-400">{t('whatsapp.description')}</p>
        </div>
        <Toggle
          id="pref-whatsapp"
          checked={prefs.whatsappEnabled}
          loading={!!loading.whatsappEnabled}
          onChange={(v) => updatePref('whatsappEnabled', v)}
        />
      </div>

      {/* Status feedback */}
      {status === 'saved' && (
        <p className="text-sm text-green-400">{t('saved')}</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-400">Failed to save. Please try again.</p>
      )}
    </section>
  );
}
