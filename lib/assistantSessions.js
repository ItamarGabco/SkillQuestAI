import { MemorySession } from "@openai/agents";

const globalForSessions = globalThis;

if (!globalForSessions.skillQuestAssistantSessions) {
  globalForSessions.skillQuestAssistantSessions = new Map();
}

const sessions = globalForSessions.skillQuestAssistantSessions;

function createSessionKey(userId, skillName) {
  return `${userId}:${String(skillName || "general")
    .trim()
    .toLowerCase()}`;
}

export function getAssistantSession(userId, skillName) {
  const key = createSessionKey(userId, skillName);

  if (!sessions.has(key)) {
    sessions.set(
      key,
      new MemorySession({
        sessionId: key,
      }),
    );
  }

  return sessions.get(key);
}

export async function clearAssistantSession(userId, skillName) {
  const key = createSessionKey(userId, skillName);

  const session = sessions.get(key);

  if (session) {
    await session.clearSession();
    sessions.delete(key);
  }
}
