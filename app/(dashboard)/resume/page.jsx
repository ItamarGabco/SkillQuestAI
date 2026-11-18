import Link from "next/link";
import { redirect } from "next/navigation";

import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import Skill from "@/models/Skill";
import QuestAttempt from "@/models/QuestAttempt";
import ResumeSkillExporter from "@/components/ResumeSkillExporter";
import { getResumeKnowledgeLevel } from "@/lib/resumeExport";
import { ResumeSelectionProvider } from "@/components/ResumeSelectionContext";

export default async function ResumePage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const [skills, attempts] = await Promise.all([
    Skill.find({ userId })
      .sort({ category: 1, name: 1 })
      .select("name category")
      .lean(),

    QuestAttempt.find({ userId })
      .select("skillName difficulty status correctAnswers totalAnswers")
      .lean(),
  ]);

  const resumeSkills = skills.map((skill) => {
    const skillAttempts = attempts.filter(
      (attempt) => attempt.skillName === skill.name,
    );

    return {
      id: skill._id.toString(),
      name: skill.name,
      category: skill.category || "כללי",
      knowledgeLevel: getResumeKnowledgeLevel(skillAttempts),
    };
  });

  const completedCounts = new Map();

  for (const attempt of attempts) {
    const current = completedCounts.get(attempt.skillName) ?? 0;
    completedCounts.set(attempt.skillName, current + 1);
  }

  return (
    <>
      <header className="mb-8">
        <p className="font-bold text-orange-400">📄 בניית קורות חיים</p>

        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          בונים את קורות החיים שלך
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          בחר מיומנויות שתרצה להציג, בחר סגנון והעתק את התוצאה לקורות החיים שלך.
        </p>
      </header>

      {resumeSkills.length === 0 ? (
        <div className="rounded-2xl bg-zinc-900 p-8">
          <p>עדיין אין מיומנויות להצגה.</p>

          <Link
            href="/play"
            className="mt-4 inline-block font-bold text-orange-400"
          >
            ⚔️ התחל ללמוד מיומנות ראשונה
          </Link>
        </div>
      ) : (
        <ResumeSelectionProvider skills={resumeSkills}>
          <ResumeSkillExporter skills={resumeSkills} />
        </ResumeSelectionProvider>
      )}
    </>
  );
}
