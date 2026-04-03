'use client';

import { useTranslations } from 'next-intl';
import type { AuditLogEntry } from './AdminPanel';

type Props = {
  auditLog: AuditLogEntry[];
};

const ACTION_LABELS: Record<string, string> = {
  approve_member: 'Approved member',
  suspend_member: 'Suspended member',
  delete_member: 'Deleted member',
  grant_host: 'Granted host',
  revoke_host: 'Revoked host',
  update_workshop_status: 'Updated workshop status',
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseMetadata(raw: string | null): string {
  if (!raw) return '—';
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(', ');
  } catch {
    return raw;
  }
}

export function AuditLogTable({ auditLog }: Props) {
  const t = useTranslations('admin.audit');

  if (auditLog.length === 0) {
    return (
      <div className="py-12 text-center text-neutral-500">{t('noActions')}</div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-neutral-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-800">
            <tr>
              {[
                t('date'),
                t('admin'),
                t('action'),
                t('targetType'),
                t('targetId'),
                t('details'),
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
            {auditLog.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800/50"
              >
                <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">
                  {formatDateTime(entry.performedAt)}
                </td>
                <td className="px-4 py-3 text-neutral-400">{entry.adminEmail}</td>
                <td className="px-4 py-3 font-medium text-neutral-100">
                  {ACTION_LABELS[entry.action] ?? entry.action}
                </td>
                <td className="px-4 py-3">{entry.targetType}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                  {entry.targetId}
                </td>
                <td className="px-4 py-3 max-w-48 truncate text-xs text-neutral-500" title={parseMetadata(entry.metadata)}>
                  {parseMetadata(entry.metadata)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
