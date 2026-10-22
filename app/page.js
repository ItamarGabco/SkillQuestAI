import Link from "next/link";
import { redirect } from "next/navigation";

import MainNavigation from "@/components/MainNavigation";
import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import Skill from "@/models/Skill";

export default async function HomePage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const [totalSkills, recentSkill] = await Promise.all([
    Skill.countDocuments({ userId }),
    Skill.findOne({ userId })
      .sort({ lastPracticedAt: -1, createdAt: -1 })
      .select("name category xp")
      .lean(),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white sm:px-6">
      <MainNavigation />

      <div className="mx-auto max-w-5xl">
        <header className="rounded-3xl border border-orange-500/20 bg-gradient-to-bl from-orange-500/20 via-zinc-900 to-zinc-950 p-7 sm:p-10">
          <p className="font-bold tracking-wider text-orange-400">
            SKILLQUEST AI
          </p>

          <h1 className="mt-4 text-3xl font-bold sm:text-5xl">
            המסע שלך מתחיל כאן ⚡
          </h1>

          <p className="mt-4 max-w-xl text-lg text-zinc-300">
            גלה יכולות חדשות, התמודד עם אתגרים וצבור ניסיון בכל פעם שאתה משחק.
          </p>

          <Link
            href="/play"
            className="mt-7 inline-flex min-h-14 cursor-pointer items-center justify-center rounded-xl bg-orange-500 px-7 py-4 text-lg font-bold text-black transition hover:bg-orange-400"
          >
            ⚔️ התחל לשחק
          </Link>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/play"
            className="flex min-h-44 cursor-pointer flex-col justify-between rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:border-orange-500/50 hover:bg-zinc-800"
          >
            <span className="text-4xl">🎮</span>

            <div>
              <h2 className="text-2xl font-bold">שחק ולמד</h2>
              <p className="mt-2 text-zinc-400">בחר תחום וצא לאתגר חדש</p>
            </div>
          </Link>

          <Link
            href="/skills"
            className="flex min-h-44 cursor-pointer flex-col justify-between rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:border-orange-500/50 hover:bg-zinc-800"
          >
            <span className="text-4xl">🏆</span>

            <div>
              <h2 className="text-2xl font-bold">הסקילס שלי</h2>
              <p className="mt-2 text-zinc-400">{totalSkills} סקילס במסע שלך</p>
            </div>
          </Link>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-2xl font-bold">🔥 ממשיכים מהנקודה האחרונה</h2>

          {recentSkill ? (
            <Link
              href={`/skills/${recentSkill._id.toString()}`}
              className="mt-5 flex min-h-24 cursor-pointer items-center justify-between gap-4 rounded-xl bg-zinc-800 p-5 transition hover:bg-zinc-700"
            >
              <div>
                <p className="text-sm text-orange-400">
                  {recentSkill.category}
                </p>

                <h3 className="mt-2 text-xl font-bold">{recentSkill.name}</h3>

                <p className="mt-1 text-sm text-zinc-400">
                  ⚡ {recentSkill.xp ?? 0} XP
                </p>
              </div>

              <span className="font-bold text-orange-400">המשך ←</span>
            </Link>
          ) : (
            <div className="mt-5">
              <p className="text-zinc-400">
                עדיין לא התחלת ללמוד סקיל. האתגר הראשון מחכה לך!
              </p>

              <Link
                href="/play"
                className="mt-4 inline-block font-bold text-orange-400"
              >
                בחר את התחום הראשון שלך ←
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
