import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DailyLog from "@/models/DailyLog";
import { requireSession } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  await connectDB();
  const query = date ? { date } : {};
  const logs = await DailyLog.find(query).sort({ date: -1, time: -1 }).limit(500);
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();
  const log = await DailyLog.create({ ...body, loggedBy: session.user?.name });
  return NextResponse.json(log, { status: 201 });
}
