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

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const emptyForm = (): LogEntry => ({
  date: todayStr(),
  time: nowTime(),
  feedingType: "breast_direct",
  diaperWet: false,
  diaperDirty: false,
});

const FEEDING_OPTIONS = [
  { value: "breast_direct", label: "Direct breastfeed", unit: "min" },
  { value: "bottle_breastmilk", label: "Bottle - breast milk (pumped)", unit: "ml" },
  { value: "bottle_formula", label: "Bottle - formula", unit: "ml" },
  { value: "solid", label: "Solid food", unit: "none" },
  { value: "none", label: "No feed", unit: "none" },
];

function feedingLabel(type: string) {
  return FEEDING_OPTIONS.find((f) => f.value === type)?.label ?? type;
}
function feedingUnit(type: string) {
  return FEEDING_OPTIONS.find((f) => f.value === type)?.unit ?? "none";
}

export default function DailyLogClient() {
  const [date, setDate] = useState(todayStr());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [form, setForm] = useState<LogEntry>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<LogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadLogs(d: string) {
    setLoading(true);
    const res = await fetch(`/api/logs?date=${d}`);
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  }

  useEffect(() => {
    loadLogs(date);
  }, [date]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date }),
    });
    if (res.ok) {
      const created = await res.json();
      setLogs((prev) => [created, ...prev]);
      setForm({ ...emptyForm(), date, time: nowTime() });
    }
    setSaving(false);
  }

  function startEdit(log: LogEntry) {
    setEditingId(log._id!);
    setEditForm({ ...log });
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    const res = await fetch(`/api/logs/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setLogs((prev) => prev.map((l) => (l._id === editingId ? updated : l)));
    }
    setEditingId(null);
    setEditForm(null);
  }

  async function deleteLog(id: string) {
    if (!confirm("Eh entry delete karni hai?")) return;
    await fetch(`/api/logs/${id}`, { method: "DELETE" });
    setLogs((prev) => prev.filter((l) => l._id !== id));
  }

  const totals = logs.reduce(
    (acc, l) => {
      if ((l.feedingType === "bottle_breastmilk" || l.feedingType === "bottle_formula") && l.amountMl)
        acc.bottleMl += l.amountMl;
      if (l.feedingType === "breast_direct" && l.durationMin) acc.nursingMin += l.durationMin;
      if (l.diaperWet) acc.wet += 1;
      if (l.diaperDirty) acc.dirty += 1;
      return acc;
    },
    { bottleMl: 0, nursingMin: 0, wet: 0, dirty: 0 }
  );

  return (
    <div className="px-4 pt-3 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-teal-900">Today's Log</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-border-soft px-2 py-1.5 text-sm"
        />
      </div>

      <a
        href="/dashboard/logs"
        className="block text-center text-xs font-semibold text-teal-700 bg-teal-100 rounded-xl py-2"
      >
        📋 View all past logs (day-by-day)
      </a>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-teal-100 rounded-xl py-2">
          <div className="text-sm font-bold text-teal-800">{totals.bottleMl}ml</div>
          <div className="text-[10px] text-teal-700/70">Bottle</div>
        </div>
        <div className="bg-teal-100 rounded-xl py-2">
          <div className="text-sm font-bold text-teal-800">{totals.nursingMin}m</div>
          <div className="text-[10px] text-teal-700/70">Nursing</div>
        </div>
        <div className="bg-teal-100 rounded-xl py-2">
          <div className="text-sm font-bold text-teal-800">{totals.wet}</div>
          <div className="text-[10px] text-teal-700/70">Wet</div>
        </div>
        <div className="bg-teal-100 rounded-xl py-2">
          <div className="text-sm font-bold text-teal-800">{totals.dirty}</div>
          <div className="text-[10px] text-teal-700/70">Dirty</div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border-soft p-3 space-y-2">
        <div className="text-xs font-bold text-teal-800">Add entry</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
          <select
            value={form.feedingType}
            onChange={(e) => setForm({ ...form, feedingType: e.target.value, amountMl: undefined, durationMin: undefined })}
            className="rounded-lg border border-border-soft px-2 py-2 text-sm"
          >
            {FEEDING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {feedingUnit(form.feedingType) === "ml" && (
          <input
            type="number"
            placeholder="Amount (ml)"
            value={form.amountMl ?? ""}
            onChange={(e) => setForm({ ...form, amountMl: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
        )}
        {feedingUnit(form.feedingType) === "min" && (
          <input
            type="number"
            placeholder="Duration (mins)"
            value={form.durationMin ?? ""}
            onChange={(e) => setForm({ ...form, durationMin: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
        )}

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={form.diaperWet}
              onChange={(e) => setForm({ ...form, diaperWet: e.target.checked })}
            />
            Wet
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={form.diaperDirty}
              onChange={(e) => setForm({ ...form, diaperDirty: e.target.checked })}
            />
            Dirty
          </label>
        </div>

        <input
          type="text"
          placeholder="Mood (e.g. fussy, happy, sleepy)"
          value={form.mood ?? ""}
          onChange={(e) => setForm({ ...form, mood: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
        />
        <textarea
          placeholder="Notes"
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
          rows={2}
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save entry"}
        </button>
      </form>

      <div className="space-y-2">
        <div className="text-xs font-bold text-teal-800">Entries</div>
        {loading && <p className="text-sm text-teal-700/60">Loading...</p>}
        {!loading && logs.length === 0 && <p className="text-sm text-teal-700/60">No entries yet.</p>}
        {logs.map((log) => (
          <div key={log._id} className="bg-white rounded-xl border border-border-soft p-3">
            {editingId === log._id && editForm ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                  />
                  <select
                    value={editForm.feedingType}
                    onChange={(e) => setEditForm({ ...editForm, feedingType: e.target.value })}
                    className="rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                  >
                    {FEEDING_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                {feedingUnit(editForm.feedingType) !== "none" && (
                  <input
                    type="number"
                    placeholder={feedingUnit(editForm.feedingType) === "ml" ? "Amount (ml)" : "Duration (mins)"}
                    value={(feedingUnit(editForm.feedingType) === "ml" ? editForm.amountMl : editForm.durationMin) ?? ""}
                    onChange={(e) =>
                      setEditForm(
                        feedingUnit(editForm.feedingType) === "ml"
                          ? { ...editForm, amountMl: Number(e.target.value) }
                          : { ...editForm, durationMin: Number(e.target.value) }
                      )
                    }
                    className="w-full rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                  />
                )}
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={editForm.diaperWet}
                      onChange={(e) => setEditForm({ ...editForm, diaperWet: e.target.checked })}
                    />
                    Wet
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={editForm.diaperDirty}
                      onChange={(e) => setEditForm({ ...editForm, diaperDirty: e.target.checked })}
                    />
                    Dirty
                  </label>
                </div>
                <textarea
                  value={editForm.notes ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 bg-teal-600 text-white rounded-lg py-1.5 text-sm font-semibold">
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 bg-gray-100 text-teal-900 rounded-lg py-1.5 text-sm font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
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
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(log)} className="text-xs px-2 py-1 rounded-lg bg-teal-100 text-teal-800">
                    Edit
                  </button>
                  <button onClick={() => deleteLog(log._id!)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
