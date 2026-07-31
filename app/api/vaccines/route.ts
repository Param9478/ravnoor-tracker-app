import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Vaccine from "@/models/Vaccine";
import { requireSession } from "@/lib/apiAuth";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const items = await Vaccine.find().sort({ date: 1 });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();
  const item = await Vaccine.create(body);
  return NextResponse.json(item, { status: 201 });
}
