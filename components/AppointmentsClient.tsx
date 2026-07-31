"use client";

import { useEffect, useState } from "react";

type Appointment = {
  _id?: string;
  title: string;
  date: string;
  time?: string;
  doctor?: string;
  location?: string;
  notes?: string;
  done: boolean;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
const empty = (): Appointment => ({ title: "", date: todayStr(), done: false });

export default function AppointmentsClient() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [form, setForm] = useState<Appointment>(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/appointments");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      setForm(empty());
    }
  }

  async function toggleDone(a: Appointment) {
    const res = await fetch(`/api/appointments/${a._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !a.done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i._id === a._id ? updated : i)));
    }
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    const res = await fetch(`/api/appointments/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i._id === editingId ? updated : i)));
    }
    setEditingId(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete karna hai?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  const sorted = [...items].sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));

  return (
    <div className="px-4 pt-3 pb-4 space-y-4">
      <h1 className="text-lg font-extrabold text-teal-900">Appointments</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border-soft p-3 space-y-2">
        <div className="text-xs font-bold text-teal-800">Add appointment</div>
        <input
          placeholder="Title (e.g. 2-month checkup)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
          <input
            type="time"
            value={form.time ?? ""}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
        </div>
        <input
          placeholder="Doctor"
          value={form.doctor ?? ""}
          onChange={(e) => setForm({ ...form, doctor: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
        />
        <input
          placeholder="Location"
          value={form.location ?? ""}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
        />
        <textarea
          placeholder="Notes"
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
          rows={2}
        />
        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg py-2.5 text-sm">
          Add appointment
        </button>
      </form>

      <div className="space-y-2">
        {loading && <p className="text-sm text-teal-700/60">Loading...</p>}
        {!loading && sorted.length === 0 && <p className="text-sm text-teal-700/60">No appointments added yet.</p>}
        {sorted.map((a) => (
          <div key={a._id} className={`bg-white rounded-xl border p-3 ${a.done ? "border-teal-200 opacity-60" : "border-border-soft"}`}>
            {editingId === a._id && editForm ? (
              <div className="space-y-2">
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                  />
                  <input
                    type="time"
                    value={editForm.time ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                  />
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
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-100 text-teal-900 rounded-lg py-1.5 text-sm font-semibold">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-teal-900">
                    {a.done ? "✅ " : "🗓️ "}
                    {a.title}
                  </div>
                  <div className="text-xs text-teal-700/70">
                    {a.date} {a.time && `· ${a.time}`}
                  </div>
                  {a.doctor && <div className="text-xs text-teal-900/60">{a.doctor}</div>}
                  {a.location && <div className="text-xs text-teal-900/60">{a.location}</div>}
                  {a.notes && <div className="text-xs text-teal-900/60">{a.notes}</div>}
                </div>
                <div className="flex flex-col gap-1 shrink-0 items-end">
                  <button onClick={() => toggleDone(a)} className="text-xs px-2 py-1 rounded-lg bg-teal-100 text-teal-800">
                    {a.done ? "Mark pending" : "Mark done"}
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(a._id!);
                        setEditForm({ ...a });
                      }}
                      className="text-xs px-2 py-1 rounded-lg bg-teal-100 text-teal-800"
                    >
                      Edit
                    </button>
                    <button onClick={() => remove(a._id!)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
