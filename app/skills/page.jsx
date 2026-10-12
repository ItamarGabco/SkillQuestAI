import { redirect } from "next/navigation";

import SkillCategoryPicker from "@/components/SkillCategoryPicker";
import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import Skill from "@/models/Skill";
import LogoutButton from "@/components/LogoutButton";

function calculateProficiency(skill) {
  if (skill.totalAnswers === 0) {
    return 0;
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
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
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

        <SkillCategoryPicker />

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
                  <article
                    key={skill._id.toString()}
                    className="rounded-2xl border border-white/10 bg-zinc-900 p-5"
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

                    <div className="mt-6">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-zinc-400">שליטה</span>

                        <span className="font-bold">
                          {proficiency}% · {getProficiencyLabel(proficiency)}
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${proficiencyColor}`}
                          style={{
                            width: `${proficiency}%`,
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
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
