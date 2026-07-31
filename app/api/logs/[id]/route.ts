import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DailyLog from "@/models/DailyLog";
import { requireSession } from "@/lib/apiAuth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await connectDB();
  const log = await DailyLog.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(log);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  await DailyLog.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
