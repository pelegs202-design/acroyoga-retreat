'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WorkshopBooking } from './AdminPanel';

type Props = {
  bookings: WorkshopBooking[];
  onUpdate: () => void;
};

type ContactStatus = 'new' | 'contacted' | 'confirmed' | 'cancelled';

const statusColors: Record<ContactStatus, string> = {
  new: 'bg-blue-900/60 text-blue-300',
  contacted: 'bg-yellow-900/60 text-yellow-300',
  confirmed: 'bg-green-900/60 text-green-300',
  cancelled: 'bg-red-900/60 text-red-300',
};

function parseAnswers(raw: string | null): {
  groupType: string;
  groupSize: string;
  preferredDates: string;
} {
  try {
    if (!raw) return { groupType: '—', groupSize: '—', preferredDates: '—' };
    const answers = JSON.parse(raw) as Record<string, string | string[]>;
    return {
      groupType: (answers['groupType'] as string) ?? '—',
      groupSize: (answers['groupSize'] as string) ?? '—',
      preferredDates: Array.isArray(answers['preferredDates'])
        ? (answers['preferredDates'] as string[]).join(', ')
        : ((answers['preferredDates'] as string) ?? '—'),
    };
  } catch {
    return { groupType: '—', groupSize: '—', preferredDates: '—' };
  }
}

export function WorkshopBookingsTable({ bookings, onUpdate }: Props) {
  const t = useTranslations('admin.workshop');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const patchBooking = async (
    id: string,
    leadId: string,
    data: { contactStatus?: string; adminNotes?: string },
  ) => {
    setSavingId(id);
    try {
      await fetch(`/api/admin/workshop-bookings/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      onUpdate();
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = (booking: WorkshopBooking, newStatus: string) => {
    patchBooking(booking.id, booking.leadId, { contactStatus: newStatus });
  };

  const startEditNotes = (booking: WorkshopBooking) => {
    setEditingNotesId(booking.id);
    setNotesDraft(booking.adminNotes ?? '');
  };

  const saveNotes = (booking: WorkshopBooking) => {
    setEditingNotesId(null);
    patchBooking(booking.id, booking.leadId, { adminNotes: notesDraft });
  };

  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-500">{t('noBookings')}</div>
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
                t('city'),
                t('groupType'),
                t('groupSize'),
                t('preferredDates'),
                t('status'),
                t('notes'),
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
            {bookings.map((booking) => {
              const parsed = parseAnswers(booking.answers);
              const status = (booking.contactStatus ?? 'new') as ContactStatus;
              const isSaving = savingId === booking.id;

              return (
                <tr
                  key={booking.id}
                  className="border-b border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800/50"
                >
                  <td className="px-4 py-3 font-medium text-neutral-100">{booking.name}</td>
                  <td className="px-4 py-3 text-neutral-400">{booking.email}</td>
                  <td className="px-4 py-3">{booking.phone ?? '—'}</td>
                  <td className="px-4 py-3">{booking.city ?? '—'}</td>
                  <td className="px-4 py-3">{parsed.groupType}</td>
                  <td className="px-4 py-3">{parsed.groupSize}</td>
                  <td className="px-4 py-3 max-w-32 truncate" title={parsed.preferredDates}>
                    {parsed.preferredDates}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={status}
                      disabled={isSaving}
                      onChange={(e) => handleStatusChange(booking, e.target.value)}
                      className={`rounded px-2 py-1 text-xs font-medium disabled:opacity-50 ${statusColors[status] ?? ''} border-0 bg-transparent cursor-pointer`}
                    >
                      <option value="new">{t('statusNew')}</option>
                      <option value="contacted">{t('statusContacted')}</option>
                      <option value="confirmed">{t('statusConfirmed')}</option>
                      <option value="cancelled">{t('statusCancelled')}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 max-w-40">
                    {editingNotesId === booking.id ? (
                      <input
                        autoFocus
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        onBlur={() => saveNotes(booking)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveNotes(booking);
                          if (e.key === 'Escape') setEditingNotesId(null);
                        }}
                        className="w-full rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-neutral-100 focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEditNotes(booking)}
                        className="text-left text-xs text-neutral-400 hover:text-neutral-200"
                      >
                        {booking.adminNotes ?? (
                          <span className="italic text-neutral-600">Click to add notes</span>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
