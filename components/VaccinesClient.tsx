"use client";

import { useEffect, useState } from "react";

type Vaccine = {
  _id?: string;
  name: string;
  dueDate: string;
  doneDate?: string;
  doctor?: string;
  notes?: string;
  status: "upcoming" | "done" | "missed";
};

const empty = (): Vaccine => ({ name: "", dueDate: "", status: "upcoming" });

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function VaccinesClient() {
  const [items, setItems] = useState<Vaccine[]>([]);
  const [form, setForm] = useState<Vaccine>(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Vaccine | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/vaccines");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.dueDate) return;
    const res = await fetch("/api/vaccines", {
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

  async function markDone(v: Vaccine) {
    const res = await fetch(`/api/vaccines/${v._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done", doneDate: todayStr() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i._id === v._id ? updated : i)));
    }
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    const res = await fetch(`/api/vaccines/${editingId}`, {
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
    await fetch(`/api/vaccines/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  const today = todayStr();
  const sorted = [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="px-4 pt-3 pb-4 space-y-4">
      <h1 className="text-lg font-extrabold text-teal-900">Vaccine Schedule</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border-soft p-3 space-y-2">
        <div className="text-xs font-bold text-teal-800">Add vaccine</div>
        <input
          placeholder="Vaccine name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
        />
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
        />
        <input
          placeholder="Doctor / clinic (optional)"
          value={form.doctor ?? ""}
          onChange={(e) => setForm({ ...form, doctor: e.target.value })}
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
          Add to schedule
        </button>
      </form>

      <div className="space-y-2">
        {loading && <p className="text-sm text-teal-700/60">Loading...</p>}
        {!loading && sorted.length === 0 && <p className="text-sm text-teal-700/60">No vaccines added yet.</p>}
        {sorted.map((v) => (
          <div
            key={v._id}
            className={`bg-white rounded-xl border p-3 ${v.status === "done" ? "border-teal-200" : v.dueDate < today ? "border-red-300" : "border-border-soft"
              }`}
          >
            {editingId === v._id && editForm ? (
              <div className="space-y-2">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                />
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                />
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
                    {v.status === "done" ? "✅ " : v.dueDate < today ? "⚠️ " : "💉 "}
                    {v.name}
                  </div>
                  <div className="text-xs text-teal-700/70">
                    Due: {v.dueDate}
                    {v.doneDate ? ` · Done: ${v.doneDate}` : ""}
                  </div>
                  {v.doctor && <div className="text-xs text-teal-900/60">{v.doctor}</div>}
                  {v.notes && <div className="text-xs text-teal-900/60">{v.notes}</div>}
                </div>
                <div className="flex flex-col gap-1 shrink-0 items-end">
                  {v.status !== "done" && (
                    <button onClick={() => markDone(v)} className="text-xs px-2 py-1 rounded-lg bg-teal-600 text-white">
                      Mark done
                    </button>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(v._id!);
                        setEditForm({ ...v });
                      }}
                      className="text-xs px-2 py-1 rounded-lg bg-teal-100 text-teal-800"
                    >
                      Edit
                    </button>
                    <button onClick={() => remove(v._id!)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600">
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
