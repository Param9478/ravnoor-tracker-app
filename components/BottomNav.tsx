"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Today", icon: "🍼" },
  { href: "/dashboard/vaccines", label: "Vaccines", icon: "💉" },
  { href: "/dashboard/medicines", label: "Medicine", icon: "💊" },
  { href: "/dashboard/appointments", label: "Appts", icon: "🗓️" },
  { href: "/dashboard/growth", label: "Growth", icon: "📈" },
];

export default function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? [...tabs, { href: "/dashboard/admin", label: "Admin", icon: "⚙️" }] : tabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-stretch z-40 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
      {items.map((item) => {
        const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-0.5 text-[11px] font-semibold transition-all ${
              active ? "text-teal-600 font-bold scale-105" : "text-teal-900/50 hover:text-teal-900/80"
            }`}
          >
            {/* ਆਈਕਨ ਵੱਡਾ ਕੀਤਾ (text-2xl) ਅਤੇ ਹੇਠਾਂ ਮਾਰਜਿਨ ਦੇ ਕੇ ਉੱਪਰ ਚੁੱਕਿਆ */}
            <span className="text-2xl leading-none mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}