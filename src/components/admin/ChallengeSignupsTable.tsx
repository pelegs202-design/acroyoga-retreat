'use client';

import { useTranslations } from 'next-intl';
import type { ChallengeSignup } from './AdminPanel';

type Props = {
  signups: ChallengeSignup[];
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ChallengeSignupsTable({ signups }: Props) {
  const t = useTranslations('admin.challenge');

  if (signups.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-500">{t('noSignups')}</div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-neutral-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-800">
            <tr>
              {[
                t('name'),
                t('email'),
                t('phone'),
                t('amount'),
                t('status'),
                t('archetype'),
                t('cohortStart'),
                t('paidAt'),
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {signups.map((signup) => (
              <tr
                key={signup.id}
                className="border-b border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800/50"
              >
                <td className="px-4 py-3 font-medium text-neutral-100">{signup.name}</td>
                <td className="px-4 py-3 text-neutral-400">{signup.email}</td>
                <td className="px-4 py-3">{signup.phone ?? '—'}</td>
                <td className="px-4 py-3">NIS {signup.amount}</td>
                <td className="px-4 py-3">
                  {signup.status === 'confirmed' ? (
                    <span className="rounded bg-green-900/60 px-1.5 py-0.5 text-xs font-medium text-green-300">
                      Confirmed
                    </span>
                  ) : (
                    <span className="rounded bg-red-900/60 px-1.5 py-0.5 text-xs font-medium text-red-300">
                      Refunded
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{signup.archetype ?? '—'}</td>
                <td className="px-4 py-3">{formatDate(signup.cohortStart)}</td>
                <td className="px-4 py-3">{formatDate(signup.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
