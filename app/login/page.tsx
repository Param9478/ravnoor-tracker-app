"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ya password galat hai. Dobara try karo.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 bg-teal-950">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-1">👶</div>
          <h1 className="text-xl font-extrabold text-teal-900">Ravnoor's Tracker</h1>
          <p className="text-sm text-teal-700/70">Sign in to log today's entries</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-teal-800">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-soft px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-teal-800">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border-soft px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-center text-teal-700/60 mt-5">
          Account creation is managed by the admin. Self-signup is disabled.
        </p>
      </div>
    </div>
  );
}
