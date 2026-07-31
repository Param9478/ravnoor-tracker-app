"use client";

import { useEffect, useState } from "react";

type LogEntry = {
  _id?: string;
  date: string;
  time: string;
  feedingType: string;
  amountMl?: number;
  durationMin?: number;
  diaperWet: boolean;
  diaperDirty: boolean;
  mood?: string;
  notes?: string;
  loggedBy?: string;
};

const FEEDING_OPTIONS = [
  { value: "breast_direct", label: "Direct breastfeed" },
  { value: "bottle_breastmilk", label: "Bottle - breast milk (pumped)" },
  { value: "bottle_formula", label: "Bottle - formula" },
  { value: "solid", label: "Solid food" },
  { value: "none", label: "No feed" },
];
function feedingLabel(type: string) {
  return FEEDING_OPTIONS.find((f) => f.value === type)?.label ?? type;
}

function formatDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function AllLogsClient() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDates, setOpenDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/logs");
      const data: LogEntry[] = await res.json();
      setLogs(data);
      // auto-open the most recent date
      if (data.length > 0) setOpenDates(new Set([data[0].date]));
      setLoading(false);
    })();
  }, []);

  async function deleteLog(id: string) {
    if (!confirm("Eh entry delete karni hai?")) return;
    await fetch(`/api/logs/${id}`, { method: "DELETE" });
    setLogs((prev) => prev.filter((l) => l._id !== id));
  }

  function toggleDate(date: string) {
    setOpenDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  // group logs by date, preserving the already-sorted (date desc, time desc) order
  const grouped: { date: string; entries: LogEntry[] }[] = [];
  for (const log of logs) {
    const last = grouped[grouped.length - 1];
    if (last && last.date === log.date) last.entries.push(log);
    else grouped.push({ date: log.date, entries: [log] });
  }

  return (
    <div className="px-4 pt-3 pb-4 space-y-3">
      <div className="flex items-center gap-2">
        <a href="/dashboard" className="text-teal-700 text-sm font-semibold">
          ← Back
        </a>
      </div>
      <h1 className="text-lg font-extrabold text-teal-900">All Logs</h1>
      <p className="text-xs text-teal-700/60 -mt-2">Click on a date to expand or collapse entries.</p>

      {loading && <p className="text-sm text-teal-700/60">Loading...</p>}
      {!loading && grouped.length === 0 && <p className="text-sm text-teal-700/60">No entries yet.</p>}

      <div className="space-y-2">
        {grouped.map((g) => {
          const isOpen = openDates.has(g.date);
          const wetCount = g.entries.filter((e) => e.diaperWet).length;
          const dirtyCount = g.entries.filter((e) => e.diaperDirty).length;

          return (
            <div key={g.date} className="bg-white rounded-xl border border-border-soft overflow-hidden">
              <button
                onClick={() => toggleDate(g.date)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left"
              >
                <div>
                  <div className="text-sm font-bold text-teal-900">{formatDate(g.date)}</div>
                  <div className="text-[11px] text-teal-700/60">
                    {g.entries.length} entries · 💧{wetCount} · 💩{dirtyCount}
                  </div>
                </div>
                <span className="text-teal-600 text-lg">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-border-soft divide-y divide-border-soft">
                  {g.entries.map((log) => (
                    <div key={log._id} className="px-3 py-2.5 flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-teal-900">
                          {log.time} · {feedingLabel(log.feedingType)}
                          {log.amountMl ? ` · ${log.amountMl}ml` : ""}
                          {log.durationMin ? ` · ${log.durationMin}min` : ""}
                        </div>
                        <div className="text-xs text-teal-700/70">
                          {log.diaperWet && "💧 Wet "} {log.diaperDirty && "💩 Dirty"}
                          {log.mood ? ` · ${log.mood}` : ""}
                        </div>
                        {log.notes && <div className="text-xs text-teal-900/70 mt-0.5">{log.notes}</div>}
                        {log.loggedBy && <div className="text-[10px] text-teal-700/40 mt-0.5">by {log.loggedBy}</div>}
                      </div>
                      <button
                        onClick={() => deleteLog(log._id!)}
                        className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
