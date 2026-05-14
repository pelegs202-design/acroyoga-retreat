"use client";

import { useCallback, useEffect, useState } from "react";

interface Booking {
  id: string;
  slotId: string;
  slotDate: string;
  slotLabelHe: string;
  slotLabelEn: string;
  slotLocation: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  status: string;
  classesUsed: number;
  firstAttendedAt: string | null;
  lpVariant: string | null;
  lpPath: string | null;
  amountPaid: number | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}

const STATUS_FILTERS = ["all", "pending", "paid", "completed", "refunded", "cancelled"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setBookings(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!res.ok) throw new Error(res.status === 401 || res.status === 404 ? "Not authorized" : `status ${res.status}`);
      const data = (await res.json()) as { bookings: Booking[] };
      setBookings(data.bookings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "load failed");
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function markAttended(bookingId: string) {
    if (!confirm("Mark this booking as attended (anchor the 48-h guarantee window)?")) return;
    setBusyId(bookingId);
    try {
      const res = await fetch("/api/admin/bookings/mark-attended", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Failed: ${body.error ?? res.status}`);
      } else {
        await load();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function issueRefund(bookingId: string, force = false) {
    const msg = force
      ? "FORCE refund (override policy)? This bypasses the attended + 48h checks. Audited."
      : "Issue a refund for this booking? Remember: still issue the actual money refund manually in Green Invoice.";
    if (!confirm(msg)) return;
    setBusyId(bookingId);
    try {
      const res = await fetch("/api/admin/refunds/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, force }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.violations && !force) {
          const proceed = confirm(`Policy violation:\n  - ${body.violations.join("\n  - ")}\n\nForce override?`);
          if (proceed) return issueRefund(bookingId, true);
        } else {
          alert(`Failed: ${body.error ?? res.status}`);
        }
      } else {
        await load();
      }
    } finally {
      setBusyId(null);
    }
  }

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" }) : "—";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-black">Intro-Pack Bookings</h1>
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={
                s === statusFilter
                  ? "px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-brand text-black"
                  : "px-3 py-1.5 text-xs font-bold uppercase tracking-widest border border-neutral-700 text-gray-400 hover:border-brand hover:text-brand"
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400">Error: {error}</p>}
      {!error && !bookings && <p className="text-neutral-400">Loading…</p>}
      {bookings?.length === 0 && <p className="text-neutral-500">No bookings match that filter.</p>}

      {bookings && bookings.length > 0 && (
        <div className="overflow-x-auto border-2 border-neutral-700">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-gray-400 uppercase text-xs tracking-widest">
              <tr>
                <th className="px-3 py-2 text-left">Slot</th>
                <th className="px-3 py-2 text-left">Lead</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Variant</th>
                <th className="px-3 py-2 text-left">Used</th>
                <th className="px-3 py-2 text-left">Attended 1st</th>
                <th className="px-3 py-2 text-left">Paid</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const statusColor =
                  b.status === "paid" ? "text-emerald-400"
                  : b.status === "completed" ? "text-blue-400"
                  : b.status === "refunded" ? "text-orange-400"
                  : b.status === "cancelled" ? "text-neutral-600"
                  : "text-yellow-400";

                const refundable = (b.status === "paid" || b.status === "completed") && b.refundedAt === null;
                const canAttend = (b.status === "paid" || b.status === "completed") && b.classesUsed < 3;

                return (
                  <tr key={b.id} className="border-t border-neutral-800 hover:bg-neutral-900/50">
                    <td className="px-3 py-2">
                      <div className="font-bold">{b.slotLabelHe}</div>
                      <div className="text-xs text-gray-500">{fmt(b.slotDate)}</div>
                      <div className="text-xs text-gray-600">{b.slotLocation}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-bold">{b.leadName}</div>
                      <div className="text-xs text-gray-500">{b.leadPhone}</div>
                    </td>
                    <td className={`px-3 py-2 font-bold uppercase text-xs ${statusColor}`}>{b.status}</td>
                    <td className="px-3 py-2 text-xs">
                      {b.lpVariant ?? "—"}{" "}
                      <span className="text-gray-600">{b.lpPath ? `(${b.lpPath})` : ""}</span>
                    </td>
                    <td className="px-3 py-2">{b.classesUsed}/3</td>
                    <td className="px-3 py-2 text-xs">{fmt(b.firstAttendedAt)}</td>
                    <td className="px-3 py-2 text-xs">
                      {fmt(b.paidAt)}{" "}
                      {b.amountPaid !== null && <span className="text-gray-600">₪{b.amountPaid}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!canAttend || busyId === b.id}
                          onClick={() => markAttended(b.id)}
                          className="px-2 py-1 text-xs font-bold border border-emerald-600 text-emerald-400 hover:bg-emerald-900/30 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Mark Attended
                        </button>
                        <button
                          type="button"
                          disabled={!refundable || busyId === b.id}
                          onClick={() => issueRefund(b.id, false)}
                          className="px-2 py-1 text-xs font-bold border border-orange-600 text-orange-400 hover:bg-orange-900/30 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Reminder: refunding here only marks the booking. Issue the actual money refund in Green Invoice.
      </p>
    </div>
  );
}
