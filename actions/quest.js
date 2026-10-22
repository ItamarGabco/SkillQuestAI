"use server";

import mongoose from "mongoose";

import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import QuestAttempt from "@/models/QuestAttempt";
import Skill from "@/models/Skill";
import { revalidatePath } from "next/cache";

const ALLOWED_DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export async function startQuestAttemptAction({
  skillName,
  difficulty,
  category = "כללי",
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      error: "יש להתחבר כדי להתחיל Quest",
    };
  }

  const cleanSkillName = String(skillName || "").trim();

  const cleanCategory = String(category || "כללי").trim();

  if (!cleanSkillName) {
    return {
      error: "לא נבחר Skill",
    };
  }

  const cleanDifficulty = ALLOWED_DIFFICULTIES.includes(difficulty)
    ? difficulty
    : "beginner";

  await connectDB();

  const skill = await Skill.findOneAndUpdate(
    {
      userId,
      name: cleanSkillName,
    },
    {
      $setOnInsert: {
        userId,
        name: cleanSkillName,
        category: cleanCategory,
        firstPracticedAt: new Date(),
      },

      $inc: {
        totalQuests: 1,
      },

      $set: {
        lastPracticedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  const attempt = await QuestAttempt.create({
    userId,
    skillName: cleanSkillName,
    difficulty: cleanDifficulty,
    status: "in_progress",
  });

  return {
    attemptId: attempt._id.toString(),
    skillId: skill._id.toString(),
  };
}

export async function recordQuestAnswerAction({
  attemptId,
  question,
  concept,
  correct,
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      error: "יש להתחבר",
    };
  }

  if (!mongoose.isValidObjectId(attemptId)) {
    return {
      error: "Quest לא תקין",
    };
  }

  const cleanQuestion = String(question || "").trim();

  const cleanConcept = String(concept || "").trim();

  if (!cleanQuestion || !cleanConcept) {
    return {
      error: "נתוני השאלה אינם תקינים",
    };
  }

  await connectDB();

  const attempt = await QuestAttempt.findOne({
    _id: attemptId,
    userId,
  });

  if (!attempt) {
    return {
      error: "Quest לא נמצא",
    };
  }

  if (attempt.status !== "in_progress") {
    return {
      error: "ה-Quest כבר הסתיים",
    };
  }

  const isCorrect = correct === true;

  const answerXp = isCorrect ? 10 : 2;

  attempt.answers.push({
    question: cleanQuestion,
    concept: cleanConcept,
    correct: isCorrect,
  });

  attempt.totalAnswers += 1;

  if (isCorrect) {
    attempt.correctAnswers += 1;
  }

  attempt.xpEarned += answerXp;

  await attempt.save();

  await Skill.updateOne(
    {
      userId,
      name: attempt.skillName,
    },
    {
      $inc: {
        xp: answerXp,
        totalAnswers: 1,
        correctAnswers: isCorrect ? 1 : 0,
      },

      $set: {
        lastPracticedAt: new Date(),
      },
    },
  );

  return {
    success: true,
    xpEarned: answerXp,
  };
}

export async function completeQuestAttemptAction(attemptId) {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      error: "יש להתחבר",
    };
  }

  if (!mongoose.isValidObjectId(attemptId)) {
    return {
      error: "Quest לא תקין",
    };
  }

  await connectDB();

  const attempt = await QuestAttempt.findOne({
    _id: attemptId,
    userId,
  });

  if (!attempt) {
    return {
      error: "Quest לא נמצא",
    };
  }

  if (attempt.status === "completed") {
    return {
      success: true,
      scorePercent: attempt.scorePercent,
      xpEarned: attempt.xpEarned,
    };
  }

  if (attempt.totalAnswers === 0) {
    return {
      error: "אין תשובות לשמירה",
    };
  }

  const scorePercent = Math.round(
    (attempt.correctAnswers / attempt.totalAnswers) * 100,
  );

  const completionBonus = 10;

  attempt.status = "completed";
  attempt.scorePercent = scorePercent;
  attempt.completedAt = new Date();
  attempt.xpEarned += completionBonus;

  await attempt.save();

  await Skill.updateOne(
    {
      userId,
      name: attempt.skillName,
    },
    {
      $inc: {
        xp: completionBonus,
        completeQuests: 1,
      },

      $set: {
        lastPracticedAt: new Date(),
      },
    },
  );
  revalidatePath("skills");

  return {
    success: true,
    scorePercent,
    xpEarned: attempt.xpEarned,
  };
}
