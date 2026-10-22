import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";

import SkillCategoryPicker from "@/components/SkillCategoryPicker";
import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getSkillProgress } from "@/lib/skillProgress";
import Skill from "@/models/Skill";
import QuestAttempt from "@/models/QuestAttempt";
import MainNavigation from "@/components/MainNavigation";

export default async function PlayPage({ searchParams }) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();
  const { skillId, difficulty, category } = await searchParams;

  const initialCategoryId = typeof category === "string" ? category : null;
  let initialSkill = null;

  if (skillId) {
    if (!isValidObjectId(skillId)) {
      notFound();
    }

    const skill = await Skill.findOne({
      _id: skillId,
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

    if (!progress.difficulties[difficulty]?.unlocked) {
      notFound();
    }

    initialSkill = {
      id: skill._id.toString(),
      name: skill.name,
      category: skill.category,
      difficulty,
      level: progress.level,
      isExisting: true,
      shortDescription: "המשך את מסע הלמידה שלך",
    };
  }

  let recentSkills = [];

  if (!skillId) {
    const savedSkills = await Skill.find({ userId })
      .sort({ lastPracticedAt: -1, createdAt: -1 })
      .limit(4)
      .select("name category xp")
      .lean();

    recentSkills = savedSkills.map((skill) => ({
      id: skill._id.toString(),
      name: skill.name,
      category: skill.category,
      xp: skill.xp ?? 0,
    }));
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <MainNavigation />
      <div className="mx-auto max-w-5xl">
        <Link href="/skills" className="text-orange-400">
          → הסקילס שלי
        </Link>

        <header className="mt-8">
          <p className="font-semibold text-orange-500">SKILLQUEST AI</p>

          <h1 className="mt-2 text-4xl font-bold">⚔️ זירת המשחק</h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            {initialSkill
              ? `ממשיכים לתרגל את ${initialSkill.name}. מוכנים לאתגר הבא?`
              : "בחר תחום שמעניין אותך, גלה סקילס חדשים והתקדם באמצעות אתגרים מותאמים אישית."}
          </p>
        </header>

        <div className="mt-8">
          <SkillCategoryPicker
            key={initialSkill?.id ?? initialCategoryId ?? "all"}
            initialSkill={initialSkill}
            initialCategoryId={initialSkill ? null : initialCategoryId}
            recentSkills={recentSkills}
          />
        </div>
      </div>
    </main>
  );
}
