"use client";

import { useEffect, useState } from "react";

type Medicine = {
  _id?: string;
  name: string;
  dosage?: string;
  time?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  active: boolean;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
const empty = (): Medicine => ({ name: "", startDate: todayStr(), active: true });

export default function MedicinesClient() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [form, setForm] = useState<Medicine>(empty());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/medicines");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setItems((prev) => [created, ...prev]);
      setForm(empty());
    }
  }

  async function toggleActive(m: Medicine) {
    const res = await fetch(`/api/medicines/${m._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !m.active, endDate: !m.active ? m.endDate : todayStr() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i._id === m._id ? updated : i)));
    }
  }

  async function saveEdit() {
    if (!editingId || !editForm) return;
    const res = await fetch(`/api/medicines/${editingId}`, {
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
    await fetch(`/api/medicines/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  return (
    <div className="px-4 pt-3 pb-4 space-y-4">
      <h1 className="text-lg font-extrabold text-teal-900">Medicines</h1>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border-soft p-3 space-y-2">
        <div className="text-xs font-bold text-teal-800">Add medicine</div>
        <input
          placeholder="Medicine name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Dosage (e.g. 2.5ml)"
            value={form.dosage ?? ""}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            className="rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
          <input
            type="time"
            value={form.time ?? ""}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="rounded-lg border border-border-soft px-2 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-teal-700/70">Start date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-teal-700/70">End date (optional)</label>
            <input
              type="date"
              value={form.endDate ?? ""}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
            />
          </div>
        </div>
        <textarea
          placeholder="Notes (why prescribed, doctor, etc.)"
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
          rows={2}
        />
        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg py-2.5 text-sm">
          Add medicine
        </button>
      </form>

      <div className="space-y-2">
        {loading && <p className="text-sm text-teal-700/60">Loading...</p>}
        {!loading && items.length === 0 && <p className="text-sm text-teal-700/60">No medicines added yet.</p>}
        {items.map((m) => (
          <div key={m._id} className="bg-white rounded-xl border border-border-soft p-3">
            {editingId === m._id && editForm ? (
              <div className="space-y-2">
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                />
                <input
                  value={editForm.dosage ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                  className="w-full rounded-lg border border-border-soft px-2 py-1.5 text-sm"
                  placeholder="Dosage"
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
                    {m.active ? "🟢 " : "⚪ "}
                    {m.name} {m.dosage && `· ${m.dosage}`}
                  </div>
                  <div className="text-xs text-teal-700/70">
                    {m.startDate} {m.endDate ? `→ ${m.endDate}` : "→ ongoing"} {m.time ? `· ${m.time}` : ""}
                  </div>
                  {m.notes && <div className="text-xs text-teal-900/60">{m.notes}</div>}
                </div>
                <div className="flex flex-col gap-1 shrink-0 items-end">
                  <button
                    onClick={() => toggleActive(m)}
                    className="text-xs px-2 py-1 rounded-lg bg-teal-100 text-teal-800"
                  >
                    {m.active ? "Mark stopped" : "Mark active"}
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(m._id!);
                        setEditForm({ ...m });
                      }}
                      className="text-xs px-2 py-1 rounded-lg bg-teal-100 text-teal-800"
                    >
                      Edit
                    </button>
                    <button onClick={() => remove(m._id!)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600">
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
