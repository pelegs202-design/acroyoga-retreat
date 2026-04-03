'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { AdminSummaryStats } from './AdminSummaryStats';
import { MemberTable } from './MemberTable';
import { ChallengeSignupsTable } from './ChallengeSignupsTable';
import { WorkshopBookingsTable } from './WorkshopBookingsTable';
import { AuditLogTable } from './AuditLogTable';

type Tab = 'members' | 'challengeSignups' | 'workshopBookings' | 'auditLog';

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  city: string | null;
  role: string | null;
  level: string | null;
  status: string;
  isJamHost: boolean;
  createdAt: string;
};

export type ChallengeSignup = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  amount: number;
  status: string;
  archetype: string | null;
  cohortStart: string | null;
  paidAt: string | null;
};

export type WorkshopBooking = {
  id: string;
  leadId: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  answers: string | null;
  contactStatus: string;
  adminNotes: string | null;
  createdAt: string;
};

export type AuditLogEntry = {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: string | null;
  performedAt: string;
};

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.18 },
};

export function AdminPanel() {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<Tab>('members');

  const [members, setMembers] = useState<AdminMember[]>([]);
  const [signups, setSignups] = useState<ChallengeSignup[]>([]);
  const [bookings, setBookings] = useState<WorkshopBooking[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  const [membersLoaded, setMembersLoaded] = useState(false);
  const [signupsLoaded, setSignupsLoaded] = useState(false);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [auditLoaded, setAuditLoaded] = useState(false);

  const fetchMembers = async () => {
    const res = await fetch('/api/admin/members');
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? data);
    }
    setMembersLoaded(true);
  };

  const fetchSignups = async () => {
    const res = await fetch('/api/admin/challenge-signups');
    if (res.ok) {
      const data = await res.json();
      setSignups(data.signups ?? data);
    }
    setSignupsLoaded(true);
  };

  const fetchBookings = async () => {
    const res = await fetch('/api/admin/workshop-bookings');
    if (res.ok) {
      const data = await res.json();
      setBookings(data.bookings ?? data);
    }
    setBookingsLoaded(true);
  };

  const fetchAudit = async () => {
    const res = await fetch('/api/admin/audit-log');
    if (res.ok) {
      const data = await res.json();
      setAuditLog(data.entries ?? data);
    }
    setAuditLoaded(true);
  };

  // Load members immediately on mount (needed for stats)
  useEffect(() => {
    fetchMembers();
    fetchSignups();
    fetchBookings();
  }, []);

  // Lazy-load audit log when that tab is first opened
  useEffect(() => {
    if (activeTab === 'auditLog' && !auditLoaded) {
      fetchAudit();
    }
  }, [activeTab, auditLoaded]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'members', label: t('tabs.members') },
    { key: 'challengeSignups', label: t('tabs.challengeSignups') },
    { key: 'workshopBookings', label: t('tabs.workshopBookings') },
    { key: 'auditLog', label: t('tabs.auditLog') },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-neutral-100">{t('title')}</h2>

      <AdminSummaryStats members={members} signups={signups} bookings={bookings} />

      {/* Tab bar */}
      <div className="mb-6 flex gap-2 border-b border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-brand text-brand'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...fadeUp}>
          {activeTab === 'members' && (
            <MemberTable members={members} onMemberUpdate={fetchMembers} />
          )}
          {activeTab === 'challengeSignups' && (
            <ChallengeSignupsTable signups={signups} />
          )}
          {activeTab === 'workshopBookings' && (
            <WorkshopBookingsTable bookings={bookings} onUpdate={fetchBookings} />
          )}
          {activeTab === 'auditLog' && (
            <AuditLogTable auditLog={auditLog} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
