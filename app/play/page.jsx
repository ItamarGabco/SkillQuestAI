import mongoose from "mongoose";
import { redirect } from "next/navigation";
import AppNavigation from "@/components/AppNavigation";
import SkillCategoryPicker from "@/components/SkillCategoryPicker";
import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import Skill from "@/models/Skill";
import UserTopic from "@/models/UserTopic";

export default async function PlayPage({ searchParams }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const params = await searchParams;
  const skillId = params?.skillId;

  await connectDB();
  const topics = await UserTopic.find({ userId }).sort({ createdAt: -1 }).lean();
  const initialTopics = topics.map((topic) => ({
    id: topic._id.toString(),
    name: topic.name,
  }));

  let initialSkill = null;
  if (typeof skillId === "string" && mongoose.isValidObjectId(skillId)) {
    const skill = await Skill.findOne({ _id: skillId, userId }).lean();
    if (skill) {
      const proficiency = skill.totalAnswers
        ? Math.round((skill.correctAnswers / skill.totalAnswers) * 100)
        : null;
      initialSkill = {
        name: skill.name,
        category: skill.category,
        shortDescription: "תרגול נוסף לחיזוק הידע וההתקדמות שלך.",
        difficulty: "beginner",
        isExisting: true,
        proficiency,
        level: Math.floor((skill.xp ?? 0) / 100) + 1,
      };
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AppNavigation />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="font-bold text-orange-400">⚔️ זמן לשחק</p>
          <h1 className="mt-2 text-4xl font-extrabold">בחר את המסע הבא שלך</h1>
          <p className="mt-3 text-zinc-400">
            בחר תחום, קבל שאלות מותאמות וצבור ניסיון בדרך למיומנות גבוהה יותר.
          </p>
        </div>
        <SkillCategoryPicker initialSkill={initialSkill} initialTopics={initialTopics} />
      </main>
    </div>
  );
}
