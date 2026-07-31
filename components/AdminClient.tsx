"use client";

import { useEffect, useState } from "react";

type User = { _id: string; name: string; email: string; role: string; createdAt: string };
type Log = { _id: string; date: string; time: string; feedingType: string; loggedBy?: string; notes?: string };

export default function AdminClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [uRes, lRes] = await Promise.all([fetch("/api/users"), fetch("/api/logs")]);
    setUsers(await uRes.json());
    setLogs(await lRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMsg(`✅ Account bann gaya: ${form.email}`);
      setForm({ name: "", email: "", password: "", role: "member" });
      load();
    } else {
      const data = await res.json();
      setMsg(`❌ ${data.error || "Kuch galat ho gaya"}`);
    }
  }

  async function changeRole(userId: string, role: string) {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
    }
    setEditingUserId(null);
  }

  return (
    <div className="px-4 pt-3 pb-4 space-y-4">
      <h1 className="text-lg font-extrabold text-teal-900">Admin</h1>

      <form onSubmit={handleAddUser} className="bg-white rounded-2xl border border-border-soft p-3 space-y-2">
        <div className="text-xs font-bold text-teal-800">Add family member / caregiver account</div>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Temporary password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full rounded-lg border border-border-soft px-2 py-2 text-sm"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg py-2.5 text-sm">
          Create account
        </button>
        {msg && <p className="text-xs text-teal-800">{msg}</p>}
      </form>

      <div>
        <div className="text-xs font-bold text-teal-800 mb-2">Users ({users.length})</div>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="bg-white rounded-xl border border-border-soft p-3 flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-teal-900">{u.name}</div>
                <div className="text-xs text-teal-700/70">{u.email}</div>
              </div>
              {editingUserId === u._id ? (
                <select
                  autoFocus
                  defaultValue={u.role}
                  onChange={(e) => changeRole(u._id, e.target.value)}
                  onBlur={() => setEditingUserId(null)}
                  className="text-xs rounded-lg border border-border-soft px-2 py-1"
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              ) : (
                <button
                  onClick={() => setEditingUserId(u._id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${u.role === "admin" ? "bg-peach-100 text-peach-500" : "bg-teal-100 text-teal-700"}`}
                >
                  {u.role} · edit
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-teal-800 mb-2">Recent activity (all users)</div>
        {loading && <p className="text-sm text-teal-700/60">Loading...</p>}
        <div className="space-y-1.5">
          {logs.slice(0, 30).map((l) => (
            <div key={l._id} className="bg-white rounded-lg border border-border-soft px-3 py-2 text-xs flex justify-between">
              <span>
                {l.date} {l.time} · {l.feedingType}
              </span>
              <span className="text-teal-700/60">{l.loggedBy}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
