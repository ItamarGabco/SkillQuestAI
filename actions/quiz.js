"use server";

import { run } from "@openai/agents";

import { getSessionUserId } from "@/lib/session";
import { quizAgent } from "@/lib/quizAgent";

const ALLOWED_DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export async function generateQuizBatchAction(
  skillName,
  difficulty,
  count = 4,
  previousResults = [],
  existingQuestions = [],
) {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      error: "יש להתחבר כדי להתחיל Quest",
      questions: [],
    };
  }

  const cleanSkillName = String(skillName || "").trim();

  if (!cleanSkillName) {
    return {
      error: "לא נבחר סקיל לתרגול",
      questions: [],
    };
  }

  if (cleanSkillName.length > 80) {
    return {
      error: "שם הסקיל אינו תקין",
      questions: [],
    };
  }

  const cleanDifficulty = ALLOWED_DIFFICULTIES.includes(difficulty)
    ? difficulty
    : "beginner";

  const requestedCount = Number(count);

  const cleanCount =
    Number.isInteger(requestedCount) &&
    requestedCount >= 1 &&
    requestedCount <= 4
      ? requestedCount
      : 4;

  const safePreviousResults = Array.isArray(previousResults)
    ? previousResults
        .slice(-10)
        .map((result) => ({
          concept: String(result?.concept || "").slice(0, 100),

          question: String(result?.question || "").slice(0, 300),

          correct: result?.correct === true,
        }))
        .filter((result) => result.concept)
    : [];

  const safeExistingQuestions = Array.isArray(existingQuestions)
    ? existingQuestions
        .slice(-10)
        .map((question) => ({
          concept: String(question?.concept || "").slice(0, 100),

          question: String(question?.question || "").slice(0, 300),
        }))
        .filter((item) => item.question)
    : [];

  try {
    const result = await run(
      quizAgent,
      `
Skill:
${cleanSkillName}

Required difficulty:
${cleanDifficulty}

Number of questions to generate:
${cleanCount}

Previous Quest results:
${
  safePreviousResults.length > 0
    ? JSON.stringify(safePreviousResults, null, 2)
    : "No previous answers yet."
}

Questions that have ALREADY been generated in this Quest:
${
  safeExistingQuestions.length > 0
    ? JSON.stringify(safeExistingQuestions, null, 2)
    : "None"
}

IMPORTANT:
- Do NOT repeat any already-generated question.
- Do NOT create a question that is essentially the same question
  with slightly different wording.
- If a concept was answered correctly, prefer a different concept.
- Repeat a concept mainly when it was answered incorrectly and needs reinforcement.
- Even when reinforcing a concept, ask it from a meaningfully different angle.

Generate exactly ${cleanCount} NEW questions.

Use previous results to adapt the questions when available.
Do not repeat an identical previous question.
      `,
    );

    if (!result.finalOutput) {
      return {
        error: "לא התקבלו שאלות מה-AI",
        questions: [],
      };
    }

    const questions = result.finalOutput.questions.slice(0, cleanCount);

    if (questions.length !== cleanCount) {
      return {
        error: "ה-AI לא החזיר מספיק שאלות",
        questions: [],
      };
    }

    return {
      questions,
    };
  } catch (error) {
    console.error("Quiz batch generation failed:", error);

    return {
      error: "לא הצלחנו ליצור את השאלות כרגע",
      questions: [],
    };
  }
}
