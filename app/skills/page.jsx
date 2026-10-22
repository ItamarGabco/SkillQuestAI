import { redirect } from "next/navigation";
import Link from "next/link";
import SkillCategoryGrid from "@/components/SkillCategoryGrid";
import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import Skill from "@/models/Skill";
import LogoutButton from "@/components/LogoutButton";
import QuestAttempt from "@/models/QuestAttempt";
import { getSkillProgress } from "@/lib/skillProgress";
import MainNavigation from "@/components/MainNavigation";

export default async function SkillsPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const skills = await Skill.find({ userId }).sort({ createdAt: -1 }).lean();
  const attempts = await QuestAttempt.find({
    userId,
    status: "completed",
  })
    .select("skillName difficulty status correctAnswers totalAnswers")
    .lean();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <MainNavigation />
      <div className="mb-6 flex justify-end">
        <LogoutButton />
      </div>

      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="font-semibold text-orange-500">SKILLQUEST AI</p>

          <h1 className="mt-2 text-4xl font-bold">הסקילס שלי</h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            בנה את ארגז הכלים שלך, תרגל כל סקיל, העלה את הרמה שלו והכן אותו
            להצגה בקורות החיים.
          </p>
        </header>

        <Link
          href="/play"
          className="inline-flex cursor-pointer items-center rounded-xl bg-orange-500 px-5 py-3 font-bold text-black transition hover:bg-orange-400"
        >
          ⚔️ שחק ולמד סקיל חדש
        </Link>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">הסקילס שצברתי</h2>
              <p className="text-sm text-zinc-400">
                {skills.length} סקילס ברשימה
              </p>
            </div>
          </div>

          {skills.length === 0 ? (
            <div>
              <div className="mb-8 rounded-2xl border border-dashed border-orange-500/30 bg-orange-500/5 p-8 text-center">
                <p className="text-2xl font-bold">🚀 המסע שלך מתחיל כאן!</p>

                <p className="mt-3 text-zinc-400">
                  עדיין אין לך סקילס. בחר תחום שמעניין אותך והתחל לצבור ידע
                  וניסיון.
                </p>
              </div>

              <h3 className="mb-5 text-xl font-bold">במה תרצה להתפתח?</h3>

              <SkillCategoryGrid />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {skills.map((skill) => {
                const skillAttempts = attempts.filter(
                  (attempt) => attempt.skillName === skill.name,
                );

                const progress = getSkillProgress(skill, skillAttempts);
                const level = progress.level;

                const bestScores = Object.values(progress.difficulties)
                  .map((difficulty) => difficulty.best)
                  .filter((score) => score !== null);

                const bestScore =
                  bestScores.length > 0 ? Math.max(...bestScores) : null;

                let nextDifficulty = null;

                if (!progress.difficulties.intermediate.unlocked) {
                  nextDifficulty = {
                    name: "בינוניים",
                    current: progress.difficulties.beginner,
                  };
                } else if (!progress.difficulties.advanced.unlocked) {
                  nextDifficulty = {
                    name: "מתקדמים",
                    current: progress.difficulties.intermediate,
                  };
                }

                return (
                  <Link
                    key={skill._id.toString()}
                    href={`/skills/${skill._id.toString()}`}
                    className="block rounded-2xl border border-white/10 bg-zinc-900 p-5 transition hover:border-orange-500/50 hover:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-orange-500">
                          {skill.category}
                        </p>

                        <h3 className="mt-1 text-2xl font-bold">
                          {skill.name}
                        </h3>
                      </div>

                      <div className="rounded-xl bg-orange-500/10 px-3 py-2 text-sm font-bold text-orange-400">
                        רמה {level}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-zinc-800 p-3">
                        <p className="text-sm text-zinc-400">XP</p>
                        <p className="mt-1 text-xl font-bold">{progress.xp}</p>
                      </div>

                      <div className="rounded-xl bg-zinc-800 p-3">
                        <p className="text-sm text-zinc-400">תשובות נכונות</p>
                        <p className="mt-1 text-xl font-bold">
                          {progress.correctAnswers}
                        </p>
                      </div>

                      <div className="rounded-xl bg-zinc-800 p-3">
                        <p className="text-sm text-zinc-400">תוצאת שיא</p>
                        <p className="mt-1 text-xl font-bold">
                          {bestScore === null
                            ? "אין עדיין שיא"
                            : `${bestScore}/10`}
                        </p>
                      </div>
                    </div>
                    {nextDifficulty ? (
                      <div className="mt-4 rounded-xl border border-white/10 p-4">
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="font-semibold">
                            לפתיחת רמת {nextDifficulty.name}
                          </span>

                          <span className="text-zinc-400">
                            {Math.min(nextDifficulty.current.completed, 5)}/5
                            שאלונים
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{
                              width: `${Math.min(nextDifficulty.current.completed, 5) * 20}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-zinc-400">
                          {nextDifficulty.current.best === 10
                            ? "✓ הושג מבחן מושלם של 10/10"
                            : "נדרש גם מבחן אחד עם תוצאה של 10/10"}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm font-semibold text-green-400">
                        🏆 פתחת את כל רמות הקושי!
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
