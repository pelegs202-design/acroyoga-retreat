"use client";

import { useState, useEffect } from "react";

interface FunnelStep {
  questionId: string;
  sessions: number;
  dropOff: number;
}

interface StepTiming {
  question_id: string;
  avg_seconds: number;
  median_seconds: number;
  max_seconds: number;
  sample_size: number;
}

interface AnswerDist {
  answer: string;
  count: number;
}

interface RecentLead {
  name: string;
  email: string;
  phone: string;
  answers: Record<string, string>;
  resultType: string;
  city: string;
  createdAt: string;
  sessionId: string;
}

interface AnalyticsData {
  overview: {
    sessionsStarted: number;
    leadsSubmitted: number;
    paymentsMade: number;
    revenue: number;
    quizCompletionRate: number;
    paymentConversionRate: number;
  };
  funnel: FunnelStep[];
  answersByQuestion: Record<string, AnswerDist[]>;
  stepTimings: StepTiming[];
  archetypes: Array<{ type: string; count: number }>;
  recentLeads: RecentLead[];
}

const Q_LABELS: Record<string, string> = {
  superpower: "Q1 Superpower",
  "movie-role": "Q2 Movie Role",
  experience: "Q3 Experience",
  "first-thought": "Q4 First Thought",
  city: "Q5 City",
  commitment: "Q6 Commitment",
  "dream-outcome": "Q7 Dream Outcome",
  "biggest-fear": "Q8 Biggest Fear",
  "body-type": "Q9 Body Type",
  fitness: "Q10 Fitness",
  schedule: "Q11 Schedule",
};

export default function FunnelAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/funnel-analytics")
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Not found" : "Not authorized");
        return res.json() as Promise<AnalyticsData>;
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  const maxSessions = Math.max(...data.funnel.map((f) => f.sessions), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <h1 className="text-3xl font-black">Funnel Analytics</h1>

      {/* ── OVERVIEW CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Sessions Started", value: data.overview.sessionsStarted },
          { label: "Leads Submitted", value: data.overview.leadsSubmitted },
          { label: "Payments", value: data.overview.paymentsMade },
          { label: "Revenue", value: `₪${data.overview.revenue}` },
          { label: "Quiz Completion", value: `${data.overview.quizCompletionRate}%` },
          { label: "Payment Conv.", value: `${data.overview.paymentConversionRate}%` },
        ].map((card) => (
          <div key={card.label} className="border-2 border-neutral-700 bg-neutral-900 p-4 text-center">
            <div className="text-2xl font-black text-brand">{card.value}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── FUNNEL DROP-OFF ─────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-black mb-6">Funnel Drop-off</h2>
        <div className="space-y-2">
          {data.funnel.map((step) => (
            <div key={step.questionId} className="flex items-center gap-4">
              <div className="w-36 text-sm text-gray-400 text-end shrink-0">
                {Q_LABELS[step.questionId] ?? step.questionId}
              </div>
              <div className="flex-1 relative h-8">
                <div
                  className="absolute inset-y-0 start-0 bg-brand/80"
                  style={{ width: `${(step.sessions / maxSessions) * 100}%` }}
                />
                <div className="absolute inset-y-0 start-0 flex items-center ps-2 text-xs font-bold text-black z-10">
                  {step.sessions}
                </div>
              </div>
              <div className="w-16 text-sm text-end shrink-0">
                {step.dropOff > 0 ? (
                  <span className="text-red-400">-{step.dropOff}%</span>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </div>
            </div>
          ))}
          {/* Lead submit row */}
          <div className="flex items-center gap-4 border-t border-neutral-800 pt-2">
            <div className="w-36 text-sm text-brand text-end shrink-0 font-bold">Contact Submit</div>
            <div className="flex-1 relative h-8">
              <div
                className="absolute inset-y-0 start-0 bg-green-600/80"
                style={{ width: `${(data.overview.leadsSubmitted / maxSessions) * 100}%` }}
              />
              <div className="absolute inset-y-0 start-0 flex items-center ps-2 text-xs font-bold text-black z-10">
                {data.overview.leadsSubmitted}
              </div>
            </div>
            <div className="w-16" />
          </div>
          {/* Payment row */}
          <div className="flex items-center gap-4">
            <div className="w-36 text-sm text-green-400 text-end shrink-0 font-bold">Paid</div>
            <div className="flex-1 relative h-8">
              <div
                className="absolute inset-y-0 start-0 bg-green-400/80"
                style={{ width: `${(data.overview.paymentsMade / maxSessions) * 100}%` }}
              />
              <div className="absolute inset-y-0 start-0 flex items-center ps-2 text-xs font-bold text-black z-10">
                {data.overview.paymentsMade}
              </div>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </section>

      {/* ── TIME PER STEP (HEATMAP) ────────────────────────────── */}
      <section>
        <h2 className="text-xl font-black mb-6">Time per Step (seconds)</h2>
        <div className="grid grid-cols-1 gap-1">
          {data.stepTimings.map((st) => {
            const avg = Number(st.avg_seconds) || 0;
            const median = Number(st.median_seconds) || 0;
            const max = Number(st.max_seconds) || 0;
            // Color: green < 5s, yellow 5-10s, orange 10-20s, red > 20s
            const heatColor =
              avg <= 5 ? "bg-green-600" : avg <= 10 ? "bg-yellow-600" : avg <= 20 ? "bg-orange-600" : "bg-red-600";

            return (
              <div key={st.question_id} className="flex items-center gap-4">
                <div className="w-36 text-sm text-gray-400 text-end shrink-0">
                  {Q_LABELS[st.question_id] ?? st.question_id}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className={`h-6 ${heatColor}`} style={{ width: `${Math.min(avg * 5, 100)}%` }} />
                  <span className="text-sm text-white font-bold">{avg}s</span>
                  <span className="text-xs text-gray-500">med:{median}s</span>
                  <span className="text-xs text-gray-600">max:{max}s</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Green: fast (&lt;5s) | Yellow: normal (5-10s) | Orange: hesitation (10-20s) | Red: friction (&gt;20s)
        </p>
      </section>

      {/* ── ANSWER DISTRIBUTION ────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-black mb-6">Answer Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(data.answersByQuestion).map(([qId, answers]) => {
            const total = answers.reduce((s, a) => s + a.count, 0);
            const sorted = [...answers].sort((a, b) => b.count - a.count);
            return (
              <div key={qId} className="border-2 border-neutral-700 bg-neutral-900 p-4">
                <h3 className="text-sm font-bold text-brand mb-3">
                  {Q_LABELS[qId] ?? qId}
                </h3>
                <div className="space-y-1.5">
                  {sorted.map((a) => {
                    const pct = total > 0 ? Math.round((a.count / total) * 100) : 0;
                    return (
                      <div key={a.answer} className="flex items-center gap-2">
                        <div className="flex-1 relative h-5 bg-neutral-800">
                          <div
                            className="absolute inset-y-0 start-0 bg-brand/50"
                            style={{ width: `${pct}%` }}
                          />
                          <span className="absolute inset-y-0 start-1 flex items-center text-[10px] text-white z-10">
                            {a.answer}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 w-12 text-end">{pct}% ({a.count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ARCHETYPE DISTRIBUTION ─────────────────────────────── */}
      <section>
        <h2 className="text-xl font-black mb-6">Archetype Distribution</h2>
        <div className="flex gap-4 flex-wrap">
          {data.archetypes.map((a) => (
            <div key={a.type} className="border-2 border-neutral-700 bg-neutral-900 px-6 py-4 text-center">
              <div className="text-3xl font-black text-brand">{a.count}</div>
              <div className="text-sm text-gray-400 capitalize">{a.type ?? "unknown"}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RECENT LEADS ───────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-black mb-6">Recent Leads</h2>
        <div className="space-y-2">
          {data.recentLeads.map((lead) => (
            <div key={lead.sessionId} className="border border-neutral-800 bg-neutral-900">
              <button
                className="w-full flex items-center justify-between p-4 text-start hover:bg-neutral-800 transition-colors"
                onClick={() => setExpandedLead(expandedLead === lead.sessionId ? null : lead.sessionId)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-brand font-bold text-xs uppercase tracking-widest px-2 py-0.5 border border-brand/40">
                    {lead.resultType}
                  </span>
                  <span className="font-bold text-white">{lead.name}</span>
                  <span className="text-gray-500 text-sm">{lead.email}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString("he-IL")} {new Date(lead.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-brand font-black">{expandedLead === lead.sessionId ? "−" : "+"}</span>
                </div>
              </button>
              {expandedLead === lead.sessionId && (
                <div className="p-4 border-t border-neutral-800 bg-neutral-950">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {Object.entries(lead.answers).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-gray-500">{Q_LABELS[key] ?? key}:</span>{" "}
                        <span className="text-white font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-800 flex gap-4 text-xs text-gray-500">
                    <span>Phone: {lead.phone}</span>
                    <span>City: {lead.city}</span>
                    <span>Session: {lead.sessionId.slice(0, 8)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
