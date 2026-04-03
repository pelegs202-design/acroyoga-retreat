'use client';

import { useState } from 'react';
import type { AdminMember } from './AdminPanel';

type Props = {
  member: AdminMember;
  onUpdate: () => void;
};

export function MemberActionButtons({ member, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);

  const patch = async (action: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: 'DELETE',
      });
      if (res.ok) onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => patch('approve');

  const handleSuspend = () => {
    if (window.confirm(`Are you sure you want to suspend ${member.name}?`)) {
      patch('suspend');
    }
  };

  const handleGrantHost = () => patch('grant-host');

  const handleRevokeHost = () => {
    if (window.confirm('Revoking host will cancel all their future jams. Continue?')) {
      patch('revoke-host');
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `This will permanently delete ${member.name}'s account. This cannot be undone.`,
      )
    ) {
      deleteMember();
    }
  };

  const btnBase = 'text-xs px-2 py-1 rounded transition-opacity disabled:opacity-40';

  return (
    <div className="flex flex-wrap gap-1">
      {member.status === 'suspended' ? (
        <button
          onClick={handleApprove}
          disabled={loading}
          className={`${btnBase} text-green-400 hover:text-green-300`}
        >
          {loading ? '...' : 'Approve'}
        </button>
      ) : (
        <button
          onClick={handleSuspend}
          disabled={loading}
          className={`${btnBase} text-yellow-400 hover:text-yellow-300`}
        >
          {loading ? '...' : 'Suspend'}
        </button>
      )}

      {member.isJamHost ? (
        <button
          onClick={handleRevokeHost}
          disabled={loading}
          className={`${btnBase} text-red-400 hover:text-red-300`}
        >
          {loading ? '...' : 'Revoke Host'}
        </button>
      ) : (
        <button
          onClick={handleGrantHost}
          disabled={loading}
          className={`${btnBase} text-blue-400 hover:text-blue-300`}
        >
          {loading ? '...' : 'Grant Host'}
        </button>
      )}

      <a
        href={`/members/${member.id}`}
        target="_blank"
        rel="noreferrer"
        className={`${btnBase} text-neutral-400 hover:text-neutral-200`}
      >
        View
      </a>

      <button
        onClick={handleDelete}
        disabled={loading}
        className={`${btnBase} text-red-500 hover:text-red-400`}
      >
        {loading ? '...' : 'Delete'}
      </button>
    </div>
  );
}
