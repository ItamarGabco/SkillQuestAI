import { redirect } from "next/navigation";

import AppShell from "@/components/AppShell";
import { getSessionUserId } from "@/lib/session";

export default async function DashboardLayout({ children }) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
