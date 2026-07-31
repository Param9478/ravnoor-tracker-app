import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminClient from "@/components/AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin") redirect("/dashboard");
  return <AdminClient />;
}
