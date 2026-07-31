"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-xs font-semibold text-teal-100 bg-teal-800/60 hover:bg-teal-800 px-3 py-1.5 rounded-full"
    >
      Sign out
    </button>
  );
}
