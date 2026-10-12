"use server";

import { run } from "@openai/agents";

import { getSessionUserId } from "@/lib/session";
import {
  clearAssistantSession,
  getAssistantSession,
} from "@/lib/assistantSessions";

import { studyAssistantAgent } from "@/lib/studyAssistantAgent";

export async function askStudyAssistantAction({
  message,
  skillName,
  concept = "",
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      error: "יש להתחבר כדי להשתמש בעוזר",
    };
  }

  const cleanMessage = String(message || "").trim();

  const cleanSkillName = String(skillName || "").trim();

  const cleanConcept = String(concept || "").trim();

  if (!cleanMessage) {
    return {
      error: "יש לכתוב הודעה",
    };
  }

  if (cleanMessage.length > 1000) {
    return {
      error: "ההודעה ארוכה מדי. ניתן לשלוח עד 1000 תווים",
    };
  }

  if (!cleanSkillName) {
    return {
      error: "לא נמצא תחום לימוד",
    };
  }

  const session = getAssistantSession(userId, cleanSkillName);

  try {
    const result = await run(
      studyAssistantAgent,
      `
Current Skill:
${cleanSkillName}

Current Concept:
${cleanConcept || "General discussion about the skill"}

User message:
${cleanMessage}
      `,
      {
        session,
      },
    );

    if (!result.finalOutput) {
      return {
        error: "לא התקבלה תשובה מהעוזר",
      };
    }

    return {
      answer: String(result.finalOutput),
    };
  } catch (error) {
    console.error("Study assistant failed:", error);

    return {
      error: "לא הצלחנו לקבל תשובה כרגע",
    };
  }
}

export async function resetStudyAssistantAction({ skillName }) {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      error: "יש להתחבר",
    };
  }

  await clearAssistantSession(userId, skillName);

  return {
    success: true,
  };
}
