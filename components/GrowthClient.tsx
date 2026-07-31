"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Growth = {
  _id?: string;
  date: string;
  weightKg?: number;
  heightCm?: number;
  headCm?: number;
  notes?: string;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
const empty = (): Growth => ({ date: todayStr() });

export default function GrowthClient() {
  const [items, setItems] = useState<Growth[]>([]);
  const [form, setForm] = useState<Growth>(empty());
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/growth");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/growth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setItems((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      setForm(empty());
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete karna hai?")) return;
    await fetch(`/api/growth/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  const chartData = items
    .filter((i) => i.weightKg || i.heightCm)
    .map((i) => ({ date: i.date.slice(5), weight: i.weightKg, height: i.heightCm }));

  return (
    <div className="px-4 pt-3 pb-4 space-y-4">
      <h1 className="text-lg font-extrabold text-teal-900">Growth</h1>

      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl border border-border-soft p-3">
          <div className="text-xs font-bold text-teal-800 mb-2">Weight (kg) over time</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dfe9e8" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={30} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#2c7a7b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border-soft p-3 space-y-2">
        <div className="text-xs font-bold text-teal-800">Add measurement</div>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            step="0.01"
            placeholder="Weight kg"
            value={form.weightKg ?? ""}
            onChange={(e) => setForm({ ...form, weightKg: e.target.value ? Number(e.target.value) : undefined })}
            className="rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Height cm"
            value={form.heightCm ?? ""}
            onChange={(e) => setForm({ ...form, heightCm: e.target.value ? Number(e.target.value) : undefined })}
            className="rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Head cm"
            value={form.headCm ?? ""}
            onChange={(e) => setForm({ ...form, headCm: e.target.value ? Number(e.target.value) : undefined })}
            className="rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
        </div>
        <textarea
          placeholder="Notes"
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
          rows={2}
        />
        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg py-2.5 text-sm">
          Add measurement
        </button>
      </form>

      <div className="space-y-2">
        {loading && <p className="text-sm text-teal-700/60">Loading...</p>}
        {!loading && items.length === 0 && <p className="text-sm text-teal-700/60">No measurements added yet.</p>}
        {[...items].reverse().map((g) => (
          <div key={g._id} className="bg-white rounded-xl border border-border-soft p-3 flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-bold text-teal-900">{g.date}</div>
              <div className="text-xs text-teal-700/70">
                {g.weightKg ? `${g.weightKg}kg ` : ""}
                {g.heightCm ? `· ${g.heightCm}cm ` : ""}
                {g.headCm ? `· head ${g.headCm}cm` : ""}
              </div>
              {g.notes && <div className="text-xs text-teal-900/60">{g.notes}</div>}
            </div>
            <button onClick={() => remove(g._id!)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 shrink-0">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
