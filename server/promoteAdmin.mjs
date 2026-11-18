import mongoose from "mongoose";
import User from "../models/User.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email || !email.includes("@")) {
  console.error("יש לספק כתובת אימייל של משתמש קיים");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: "admin" } },
    { new: true },
  ).select("email role");

  if (!user) {
    throw new Error("לא נמצא משתמש עם כתובת האימייל הזו");
  }

  console.log(`Admin updated: ${user.email}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
