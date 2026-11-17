"use server";

import mongoose from "mongoose";
import { run } from "@openai/agents";

import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { resumeDraftAgent } from "@/lib/resumeDraftAgent";
import Skill from "@/models/Skill";
import QuestAttempt from "@/models/QuestAttempt";
import { getResumeKnowledgeLevel } from "@/lib/resumeExport";

export async function createResumeDraftAction({ skillIds, targetRole = "" }) {
  const userId = await getSessionUserId();

  if (!userId) {
    return { error: "יש להתחבר כדי ליצור ניסוח לקורות חיים" };
  }

  if (
    !Array.isArray(skillIds) ||
    skillIds.length === 0 ||
    skillIds.length > 20 ||
    skillIds.some(
      (id) => typeof id !== "string" || !mongoose.isValidObjectId(id),
    )
  ) {
    return { error: "יש לבחור בין 1 ל־20 מיומנויות תקינות" };
  }

  const uniqueIds = [...new Set(skillIds)];
  const cleanRole = String(targetRole || "").trim();

  if (cleanRole.length > 80) {
    return { error: "שם המשרה ארוך מדי" };
  }

  await connectDB();

  const skills = await Skill.find({
    userId,
    _id: { $in: uniqueIds },
  })
    .select("name category")
    .lean();

  if (skills.length !== uniqueIds.length) {
    return { error: "חלק מהמיומנויות שנבחרו אינן זמינות" };
  }

  const attempts = await QuestAttempt.find({
    userId,
    skillName: { $in: skills.map((skill) => skill.name) },
    status: "completed",
    totalAnswers: 10,
  })
    .select("skillName difficulty status totalAnswers correctAnswers")
    .lean();

  const verifiedSkills = skills
    .map((skill) => {
      const results = attempts.filter(
        (attempt) => attempt.skillName === skill.name,
      );

      const knowledgeLevel = getResumeKnowledgeLevel(results);

      if (!knowledgeLevel) return null;

      return {
        name: skill.name,
        category: skill.category,
        knowledgeLevel,
      };
    })
    .filter(Boolean);

  if (verifiedSkills.length === 0) {
    return {
      error: "כדי ליצור ניסוח מבוסס הישגים, יש להשלים לפחות שאלון אחד",
    };
  }

  try {
    const result = await run(
      resumeDraftAgent,
      JSON.stringify({
        targetRole: cleanRole || "לא צוינה משרה",
        verifiedSkills,
      }),
    );

    const output = result.finalOutput;

    if (!output || !String(output.summary || "").trim()) {
      return { error: "לא התקבל ניסוח תקין מה־AI" };
    }

    const summary = String(output.summary).trim().slice(0, 300);

    const bullets = (Array.isArray(output.bullets) ? output.bullets : [])
      .map((item) => String(item).trim().slice(0, 200))
      .filter(Boolean)
      .slice(0, 5);

    if (bullets.length === 0) {
      return { error: "לא התקבלו נקודות מקצועיות מה־AI" };
    }

    return {
      summary,
      bullets,
      excludedCount: skills.length - verifiedSkills.length,
    };
  } catch (error) {
    console.error("Resume AI generation failed:", error);

    return {
      error: "לא הצלחנו ליצור ניסוח כרגע. אפשר לנסות שוב.",
    };
  }
}
