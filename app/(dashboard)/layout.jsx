import { redirect } from "next/navigation";

import AppShell from "@/components/AppShell";
import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import User from "@/models/User";

export default async function DashboardLayout({ children }) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(userId).select("role").lean();

  if (!user) {
    redirect("/login");
  }

  return <AppShell isAdmin={user.role === "admin"}>{children}</AppShell>;
}
