import bcrypt from "bcrypt";

import connectDB from "./db";
import User from "@/models/User";

export const AFTER_AUTH_REDIRECT = "/";

const SALT_ROUNDS = 12;

export async function createUserWithPassword({ name, email, password }) {
  await connectDB();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already taken");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  return user;
}

export async function authenticateUser({ email, password }) {
  await connectDB();

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return user;
}
