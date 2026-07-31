import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/apiAuth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Only allow updating role and name through this endpoint
  const update: Record<string, string> = {};
  if (body.role === "admin" || body.role === "member") update.role = body.role;
  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();

  await connectDB();
  const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-passwordHash");
  return NextResponse.json(user);
}
