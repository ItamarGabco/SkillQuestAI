import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";

import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getSkillProgress } from "@/lib/skillProgress";
import Skill from "@/models/Skill";
import QuestAttempt from "@/models/QuestAttempt";
import MainNavigation from "@/components/MainNavigation";

const difficulties = [
  { key: "beginner", name: "מתחילים" },
  { key: "intermediate", name: "בינוניים" },
  { key: "advanced", name: "מתקדמים" },
];

export default async function SkillDetailsPage({ params }) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  if (!isValidObjectId(id)) {
    notFound();
  }

  await connectDB();

  const skill = await Skill.findOne({
    _id: id,
    userId,
  }).lean();

  if (!skill) {
    notFound();
  }

  const attempts = await QuestAttempt.find({
    userId,
    skillName: skill.name,
    status: "completed",
  })
    .select("difficulty status correctAnswers totalAnswers")
    .lean();

  const progress = getSkillProgress(skill, attempts);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <MainNavigation />
      <div className="mx-auto max-w-4xl">
        <Link href="/skills" className="text-orange-400">
          → חזרה לסקילס
        </Link>

        <header className="mt-8">
          <p className="text-orange-400">{skill.category}</p>
          <h1 className="mt-2 text-4xl font-bold">{skill.name}</h1>
          <p className="mt-2 text-zinc-400">רמה {progress.level}</p>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-900 p-5">
            <p className="text-zinc-400">XP שנצבר</p>
            <p className="text-3xl font-bold">{progress.xp}</p>
          </div>

          <div className="rounded-xl bg-zinc-900 p-5">
            <p className="text-zinc-400">תשובות נכונות</p>
            <p className="text-3xl font-bold">{progress.correctAnswers}</p>
          </div>
        </section>

        <h2 className="mt-10 text-2xl font-bold">רמות הקושי שלך</h2>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          {difficulties.map((difficulty) => {
            const data = progress.difficulties[difficulty.key];

            return (
              <article
                key={difficulty.key}
                className="rounded-xl border border-white/10 bg-zinc-900 p-5"
              >
                <h3 className="text-xl font-bold">{difficulty.name}</h3>

                <p className="mt-2 text-zinc-400">
                  {data.unlocked ? "🔓 פתוחה" : "🔒 נעולה"}
                </p>

                <p className="mt-4">שאלונים שהושלמו: {data.completed}</p>

                <p className="mt-2">
                  תוצאת שיא:{" "}
                  {data.best === null ? "עדיין אין" : `${data.best}/10`}
                </p>

                {!data.unlocked && (
                  <p className="mt-4 text-sm text-orange-400">
                    דרושים 5 שאלונים ושיא של 10/10 ברמה הקודמת
                  </p>
                )}

                {data.unlocked && (
                  <Link
                    href={`/play?skillId=${id}&difficulty=${difficulty.key}`}
                    className="mt-5 block rounded-xl bg-orange-500 px-4 py-3 text-center font-bold text-black transition hover:bg-orange-400"
                  >
                    ⚔️ שחק ברמת {difficulty.name}
                  </Link>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
