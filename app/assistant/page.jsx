import { redirect } from "next/navigation";

import { getSessionUserId } from "@/lib/session";

import MiniChat from "@/components/MiniChat";

import AppNavigation from "@/components/AppNavigation";

export default async function AssistantPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AppNavigation />
      <main className="mx-auto max-w-3xl px-6 py-12">

      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
        <p className="font-bold text-orange-400">🤖 SKILLQUEST AI</p>

        <h1 className="mt-2 text-3xl font-bold">מאמן AI</h1>

        <p className="mt-2 text-zinc-400">
          שאל שאלות וקבל הסברים תוך שמירה על הקשר השיחה.
        </p>

        <MiniChat skillName="SkillQuest Learning" concept="General learning" />
      </div>
      </main>
    </div>
  );
}
