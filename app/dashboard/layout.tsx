import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BottomNav from "@/components/BottomNav";
import SignOutButton from "@/components/SignOutButton";
import NotificationChecker from "@/components/NotificationChecker";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = (session.user as any).role === "admin";

  return (
    <div className="flex-1 flex flex-col pb-16">
      <header className="bg-teal-900 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div>
          <div className="text-white font-extrabold text-sm leading-tight">👶 Ravnoor's Tracker</div>
          <div className="text-teal-200 text-[11px]">Hi, {session.user.name?.split(" ")[0]}</div>
        </div>
        <SignOutButton />
      </header>

      <NotificationChecker />

      <main className="flex-1">{children}</main>

      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
