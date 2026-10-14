import Link from "next/link";
import { redirect } from "next/navigation";
import AppNavigation from "@/components/AppNavigation";
import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import Skill from "@/models/Skill";
import QuestAttempt from "@/models/QuestAttempt";

export default async function ProgressPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  await connectDB();
  const [skills, attempts, completedCount] = await Promise.all([
    Skill.find({ userId }).lean(),
    QuestAttempt.find({ userId, status: "completed" })
      .sort({ completedAt: -1 }).limit(12).lean(),
    QuestAttempt.countDocuments({ userId, status: "completed" }),
  ]);

  const totalXp = skills.reduce((sum, skill) => sum + (skill.xp || 0), 0);
  const answered = skills.reduce((sum, skill) => sum + (skill.totalAnswers || 0), 0);
  const correct = skills.reduce((sum, skill) => sum + (skill.correctAnswers || 0), 0);
  const accuracy = answered ? Math.round((correct / answered) * 100) : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AppNavigation />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="font-bold text-orange-400">📈 מסלול ההתקדמות</p>
        <h1 className="mt-2 text-4xl font-extrabold">ההתקדמות שלי</h1>
        <p className="mt-3 text-zinc-400">ההישגים שלך והמשחקים שכבר סיימת.</p>

        <section aria-label="נתוני למידה" className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { title: "ניסיון שצברת", value: totalXp.toLocaleString("he-IL"), suffix: "XP" },
            { title: "משחקים שהושלמו", value: String(completedCount), suffix: "" },
            { title: "תשובות נכונות", value: accuracy === null ? "—" : accuracy + "%", suffix: "" },
          ].map((stat) => (
            <div key={stat.title} className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">{stat.title}</p>
              <p className="mt-3 text-3xl font-black text-orange-400">
                {stat.value} <span className="text-base">{stat.suffix}</span>
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-bold">המשחקים האחרונים שלי</h2>
          {attempts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
              <p className="font-semibold">עדיין אין משחקים שהושלמו</p>
              <p className="mt-2 text-zinc-400">המשחק הראשון שלך יחכה כאן בסיום המסע.</p>
              <Link href="/play" className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">
                התחל לשחק
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {attempts.map((attempt) => (
                <article key={attempt._id.toString()} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <div>
                    <p className="font-bold">{attempt.skillName}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString("he-IL") : "תאריך לא ידוע"}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-orange-400">{attempt.scorePercent ?? 0}% הצלחה</p>
                    <p className="text-sm text-zinc-400">+{attempt.xpEarned ?? 0} XP</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
