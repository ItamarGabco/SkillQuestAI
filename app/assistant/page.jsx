import { redirect } from "next/navigation";

import { getSessionUserId } from "@/lib/session";

import MiniChat from "@/components/MiniChat";

import LogoutButton from "@/components/LogoutButton";

export default async function AssistantPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <div className="mb-6 flex justify-end">
        <LogoutButton />
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6">
        <p className="font-bold text-orange-400">🤖 SKILLQUEST AI</p>

        <h1 className="mt-2 text-3xl font-bold">עוזר הלמידה</h1>

        <p className="mt-2 text-zinc-400">
          שאל שאלות וקבל הסברים תוך שמירה על הקשר השיחה.
        </p>

        <MiniChat skillName="SkillQuest Learning" concept="General learning" />
      </div>
    </main>
  );
}
