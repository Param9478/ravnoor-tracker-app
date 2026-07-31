import { auth } from "@/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session;
}
