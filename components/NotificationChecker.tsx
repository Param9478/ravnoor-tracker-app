"use client";

import { useEffect, useState } from "react";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function NotificationChecker() {
  const [banner, setBanner] = useState<string[]>([]);

  useEffect(() => {
    async function run() {
      try {
        const [vaccinesRes, apptsRes, medsRes] = await Promise.all([
          fetch("/api/vaccines"),
          fetch("/api/appointments"),
          fetch("/api/medicines"),
        ]);
        const [vaccines, appts, meds] = await Promise.all([vaccinesRes.json(), apptsRes.json(), medsRes.json()]);

        const today = todayStr();
        const soon = inDays(3);
        const messages: string[] = [];

        (vaccines || []).forEach((v: any) => {
          if (v.status === "upcoming" && v.dueDate >= today && v.dueDate <= soon) {
            messages.push(`💉 Vaccine due: ${v.name} on ${v.dueDate}`);
          }
        });

        (appts || []).forEach((a: any) => {
          if (!a.done && a.date === today) {
            messages.push(`🗓️ Appointment today: ${a.title}${a.time ? " at " + a.time : ""}`);
          }
        });

        (meds || []).forEach((m: any) => {
          if (m.active && (!m.endDate || m.endDate >= today)) {
            messages.push(`💊 Ongoing medicine: ${m.name}${m.time ? " at " + m.time : ""}`);
          }
        });

        setBanner(messages);

        if (messages.length > 0 && "Notification" in window) {
          if (Notification.permission === "default") {
            await Notification.requestPermission();
          }
          const lastShown = localStorage.getItem("bt_notif_date");
          if (Notification.permission === "granted" && lastShown !== today) {
            new Notification("Ravnoor's Tracker reminder", {
              body: messages.slice(0, 3).join("\n"),
              icon: "/icon-192.png",
            });
            localStorage.setItem("bt_notif_date", today);
          }
        }
      } catch {
        // silent fail — notifications are a nice-to-have
      }
    }
    run();
  }, []);

  if (banner.length === 0) return null;

  return (
    <div className="mx-4 mt-3 rounded-xl bg-peach-100 border border-peach-500/30 px-3 py-2 text-xs text-teal-900 space-y-0.5">
      {banner.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </div>
  );
}
