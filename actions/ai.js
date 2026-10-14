"use server";

import { run } from "@openai/agents";

import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { skillRecommendationAgent } from "@/lib/skillRecommendationAgent";
import Skill from "@/models/Skill";

function calculateProficiency(skill) {
  if (skill.totalAnswers === 0) {
    return null;
  }

  return Math.round((skill.correctAnswers / skill.totalAnswers) * 100);
}

function calculateLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

function normalizeSkillName(name) {
  return name.trim().toLowerCase();
}

export async function getSkillRecommendationsAction(topic) {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      error: "יש להתחבר כדי לקבל המלצות",
      skills: [],
    };
  }

  const cleanTopic = String(topic || "").trim();

  if (!cleanTopic) {
    return {
      error: "יש לבחור או להזין תחום",
      skills: [],
    };
  }

  if (cleanTopic.length > 80) {
    return {
      error: "שם התחום ארוך מדי",
      skills: [],
    };
  }

  await connectDB();

  const existingSkills = await Skill.find({ userId })
    .select("name displayName xp correctAnswers totalAnswers -_id")
    .lean();

  const userSkillContext = existingSkills.map((skill) => ({
    name: skill.name,
    displayName: skill.displayName || skill.name,

    proficiency: calculateProficiency(skill),

    level: calculateLevel(skill.xp),

    totalAnswers: skill.totalAnswers,
  }));

  try {
    const result = await run(
      skillRecommendationAgent,
      `
Selected topic:
${cleanTopic}

User's current skills:
${JSON.stringify(userSkillContext, null, 2)}
      `,
    );

    if (!result.finalOutput) {
      return {
        error: "לא התקבלו המלצות מה-AI",
        skills: [],
      };
    }

    const existingSkillsMap = new Map(
      userSkillContext.map((skill) => [normalizeSkillName(skill.name), skill]),
    );

    const recommendations = result.finalOutput.skills.map((recommendation) => {
      const existingSkill = existingSkillsMap.get(
        normalizeSkillName(recommendation.name),
      );

      return {
        ...recommendation,

        isExisting: Boolean(existingSkill),

        proficiency: existingSkill?.proficiency ?? null,

        level: existingSkill?.level ?? null,
      };
    });

    return {
      skills: recommendations,
    };
  } catch (error) {
    console.error("Skill recommendation failed:", error);

    return {
      error: "לא הצלחנו לטעון המלצות כרגע",
      skills: [],
    };
  }
}
