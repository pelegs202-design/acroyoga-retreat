"use client";

import { useEffect, useState } from "react";

interface VariantStats {
  created: number;
  paid: number;
  completed: number;
  refunded: number;
  attended: number;
  revenue: number;
  purchaseRate: number;
  refundRate: number;
  attendanceRate: number;
}

interface PathSplit {
  direct: { created: number; paid: number };
  quiz: { created: number; paid: number };
}

interface FunnelData {
  variants: Record<string, VariantStats>;
  byPath: Record<string, PathSplit>;
  ops: {
    attendanceDebt: number;
    refundEligibleNow: number;
  };
}

const VARIANTS = ["shape", "flex", "reset"] as const;

export default function LpFunnelPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Manual ad-spend per variant (₪) — persisted in localStorage for convenience
  const [spend, setSpend] = useState<Record<string, number>>({ shape: 0, flex: 0, reset: 0 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lp_funnel_spend");
      if (stored) setSpend(JSON.parse(stored));
    } catch { /* ignore */ }
    fetch("/api/admin/funnel/lp")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status === 401 || r.status === 404 ? "Not authorized" : `status ${r.status}`))))
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "load failed"));
  }, []);

  function updateSpend(variant: string, value: number) {
    const next = { ...spend, [variant]: value };
    setSpend(next);
    try { localStorage.setItem("lp_funnel_spend", JSON.stringify(next)); } catch { /* ignore */ }
  }

  const cpa = (variant: string): number | null => {
    if (!data) return null;
    const v = data.variants[variant];
    const s = spend[variant];
    if (!v || s <= 0 || v.paid <= 0) return null;
    return Math.round(s / v.paid);
  };

  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-400">Error: {error}</p></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center"><p className="text-neutral-400">Loading…</p></div>;

  // Find best CPA for early-cut highlighting
  const allCpa = VARIANTS.map((v) => cpa(v)).filter((c): c is number => c !== null);
  const bestCpa = allCpa.length > 0 ? Math.min(...allCpa) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <header>
        <h1 className="text-3xl font-black">LP Split Test — A/B/C Readout</h1>
        <p className="text-sm text-gray-500 mt-1">
          Per-LP metrics for the ₪149 intro-pack test. Enter ad spend below to compute CPA.
        </p>
      </header>

      {/* ── Ops alerts ──────────────────────────────────────────── */}
      {(data.ops.attendanceDebt > 0 || data.ops.refundEligibleNow > 0) && (
        <div className="border-2 border-yellow-700 bg-yellow-950/30 p-4 space-y-2">
          {data.ops.attendanceDebt > 0 && (
            <p className="text-yellow-300 text-sm">
              <span className="font-black">⚠ Attendance debt:</span> {data.ops.attendanceDebt} paid bookings have not been marked attended (older than 24h).
              {" "}<a href="../bookings?status=paid" className="underline">Mark them</a>.
            </p>
          )}
          {data.ops.refundEligibleNow > 0 && (
            <p className="text-yellow-300 text-sm">
              <span className="font-black">ℹ Refund-eligible:</span> {data.ops.refundEligibleNow} customers are within their 48-hour refund window right now.
            </p>
          )}
        </div>
      )}

      {/* ── Per-LP table ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-black mb-4">Per-LP Performance</h2>
        <div className="overflow-x-auto border-2 border-neutral-700">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-gray-400 uppercase text-xs tracking-widest">
              <tr>
                <th className="px-3 py-2 text-left">Variant</th>
                <th className="px-3 py-2 text-right">Started</th>
                <th className="px-3 py-2 text-right">Paid</th>
                <th className="px-3 py-2 text-right">Purchase %</th>
                <th className="px-3 py-2 text-right">Attended</th>
                <th className="px-3 py-2 text-right">Attend %</th>
                <th className="px-3 py-2 text-right">Refunded</th>
                <th className="px-3 py-2 text-right">Refund %</th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-right">Spend (₪)</th>
                <th className="px-3 py-2 text-right">CPA</th>
              </tr>
            </thead>
            <tbody>
              {VARIANTS.map((v) => {
                const stats = data.variants[v];
                const c = cpa(v);
                const isBest = bestCpa !== null && c === bestCpa;
                return (
                  <tr key={v} className="border-t border-neutral-800">
                    <td className="px-3 py-2 font-black uppercase text-brand">{v}</td>
                    <td className="px-3 py-2 text-right">{stats.created}</td>
                    <td className="px-3 py-2 text-right text-emerald-400 font-bold">{stats.paid}</td>
                    <td className="px-3 py-2 text-right">{stats.purchaseRate}%</td>
                    <td className="px-3 py-2 text-right">{stats.attended}</td>
                    <td className="px-3 py-2 text-right">{stats.attendanceRate}%</td>
                    <td className="px-3 py-2 text-right text-orange-400">{stats.refunded}</td>
                    <td className="px-3 py-2 text-right">{stats.refundRate}%</td>
                    <td className="px-3 py-2 text-right">₪{stats.revenue}</td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        value={spend[v]}
                        onChange={(e) => updateSpend(v, Number(e.target.value))}
                        className="w-20 bg-neutral-900 border border-neutral-700 px-2 py-1 text-right text-sm focus:border-brand focus:outline-none"
                      />
                    </td>
                    <td className={`px-3 py-2 text-right font-black ${isBest ? "text-emerald-400" : c !== null ? "text-white" : "text-gray-600"}`}>
                      {c !== null ? `₪${c}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Decision rule: cut a variant when its CPA &gt; 2× the best variant&apos;s CPA after ≥ ₪400 spend each.
          Target CPA ≤ ₪55–65 per spec §13.3.
        </p>
      </section>

      {/* ── Direct vs Quiz path ─────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-black mb-4">Direct vs Quiz Path</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VARIANTS.map((v) => {
            const p = data.byPath[v];
            const directRate = p.direct.created > 0 ? Math.round((p.direct.paid / p.direct.created) * 100) : 0;
            const quizRate = p.quiz.created > 0 ? Math.round((p.quiz.paid / p.quiz.created) * 100) : 0;
            return (
              <div key={v} className="border-2 border-neutral-700 bg-neutral-900 p-4">
                <h3 className="font-black text-brand uppercase mb-3">{v}</h3>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-gray-400">Direct</span>
                  <span>{p.direct.paid}/{p.direct.created} <span className="text-gray-500">({directRate}%)</span></span>
                </div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-gray-400">Quiz path</span>
                  <span>{p.quiz.paid}/{p.quiz.created} <span className="text-gray-500">({quizRate}%)</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
