import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const users = await User.find().select("-passwordHash").sort({ createdAt: 1 });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role === "admin" ? "admin" : "member",
  });

  return NextResponse.json({ id: user._id, name: user.name, email: user.email, role: user.role }, { status: 201 });
}
