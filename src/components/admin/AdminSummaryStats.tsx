'use client';

import { useTranslations } from 'next-intl';
import type { AdminMember, ChallengeSignup, WorkshopBooking } from './AdminPanel';

type Props = {
  members: AdminMember[];
  signups: ChallengeSignup[];
  bookings: WorkshopBooking[];
};

export function AdminSummaryStats({ members, signups, bookings }: Props) {
  const t = useTranslations('admin.stats');

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const totalMembers = members.length;
  const newThisWeek = members.filter(
    (m) => new Date(m.createdAt).getTime() > sevenDaysAgo,
  ).length;
  const activeChallenges = signups.filter((s) => s.status === 'confirmed').length;
  const pendingWorkshops = bookings.filter(
    (b) => !b.contactStatus || b.contactStatus === 'new',
  ).length;

  const stats = [
    { label: t('totalMembers'), value: totalMembers },
    { label: t('newThisWeek'), value: newThisWeek },
    { label: t('activeChallenges'), value: activeChallenges },
    { label: t('pendingWorkshops'), value: pendingWorkshops },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4">
      {stats.map(({ label, value }) => (
        <div key={label} className="rounded-lg bg-neutral-900 p-4">
          <p className="text-sm text-neutral-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-neutral-100">{value}</p>
        </div>
      ))}
    </div>
  );
}
