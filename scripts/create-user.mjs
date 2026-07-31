// Usage: node scripts/create-user.mjs "Full Name" email@example.com password123 admin
// role is optional, defaults to "member". Requires MONGODB_URI env var set.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [, , name, email, password, role = "member"] = process.argv;

if (!name || !email || !password) {
  console.log('Usage: node scripts/create-user.mjs "Full Name" email@example.com password123 admin');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("Set MONGODB_URI env var first, e.g.:");
  console.log('MONGODB_URI="mongodb+srv://..." node scripts/create-user.mjs "Name" you@mail.com pass123 admin');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(uri);
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.name = name;
    existing.role = role;
    await existing.save();
    console.log(`Updated existing user: ${email} (role: ${role})`);
  } else {
    await User.create({ name, email: email.toLowerCase(), passwordHash, role });
    console.log(`Created user: ${email} (role: ${role})`);
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
