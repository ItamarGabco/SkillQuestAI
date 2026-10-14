import { redirect } from "next/navigation";
import Link from "next/link";
import AppNavigation from "@/components/AppNavigation";

import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import Skill from "@/models/Skill";

function calculateProficiency(skill) {
  if (skill.totalAnswers === 0) {
    return null;
  }

  return Math.round((skill.correctAnswers / skill.totalAnswers) * 100);
}

function getLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

function getProficiencyColor(proficiency) {
  if (proficiency === null) {
    return "bg-zinc-600";
  }

  if (proficiency >= 75) {
    return "bg-green-500";
  }

  if (proficiency >= 50) {
    return "bg-yellow-500";
  }

  if (proficiency >= 25) {
    return "bg-orange-500";
  }

  return "bg-red-500";
}

function getProficiencyLabel(proficiency) {
  if (proficiency === null) {
    return "טרם נבדק";
  }

  if (proficiency >= 75) {
    return "חזק";
  }

  if (proficiency >= 50) {
    return "בינוני";
  }

  if (proficiency >= 25) {
    return "מתחיל";
  }

  return "דורש חיזוק";
}

export default async function SkillsPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const skills = await Skill.find({ userId }).sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AppNavigation />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-10">
          <p className="font-semibold text-orange-500">SKILLQUEST AI</p>

          <h1 className="mt-2 text-4xl font-bold">הסקילס שלי</h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            בנה את ארגז הכלים שלך, תרגל כל סקיל, העלה את הרמה שלו והכן אותו
            להצגה בקורות החיים.
          </p>
        </header>

        <Link href="/play" className="inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-black hover:bg-orange-400">
          ⚔️ התחל משימה חדשה
        </Link>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">המסע שלך</h2>

              <p className="text-sm text-zinc-400">
                {skills.length} סקילס ברשימה
              </p>
            </div>
          </div>

          {skills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
              <p className="text-lg font-semibold">המסע עדיין ריק</p>

              <p className="mt-2 text-zinc-400">
                הוסף את הסקיל הראשון שלך למעלה.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {skills.map((skill) => {
                const proficiency = calculateProficiency(skill);
                const proficiencyColor = getProficiencyColor(proficiency);
                const proficiencyLabel = getProficiencyLabel(proficiency);
                const level = getLevel(skill.xp);

                return (
                  <Link
                    key={skill._id.toString()}
                    href={`/play?skillId=${skill._id.toString()}`}
                    aria-label={`המשך מסע בסקיל ${skill.displayName || skill.name} — שאלות נוספות לחיזוק הידע`}
                    className="group relative block rounded-2xl border border-white/10 bg-zinc-900 p-5 pb-16 transition hover:border-orange-500/60 hover:bg-zinc-800 focus-visible:border-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-orange-500">
                          {skill.category}
                        </p>

                        <h3 className="mt-1 text-2xl font-bold">
                          {skill.displayName || skill.name}
                        </h3>
                      </div>

                      <div className="rounded-xl bg-orange-500/10 px-3 py-2 text-sm font-bold text-orange-400">
                        רמה {level}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-zinc-400">שליטה</span>

                        <span className="font-bold">
                          {proficiency === null ? "טרם נבדק" : `${proficiency}% · ${proficiencyLabel}`}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${proficiencyColor}`}
                          style={{
                            width: `${proficiency ?? 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex gap-6 text-sm">
                      <div>
                        <p className="text-zinc-500">XP</p>
                        <p className="font-bold">{skill.xp}</p>
                      </div>

                      <div>
                        <p className="text-zinc-500">תשובות נכונות</p>
                        <p className="font-bold">
                          {skill.correctAnswers}/{skill.totalAnswers}
                        </p>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute inset-x-4 bottom-3 rounded-xl bg-orange-500 px-4 py-2 text-center text-sm font-bold text-black transition-all md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
                      ⚔️ המשך מסע — שפר את הידע שלך בשאלות נוספות
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
