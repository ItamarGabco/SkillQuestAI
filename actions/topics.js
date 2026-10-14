"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import UserTopic from "@/models/UserTopic";

const DEFAULT_TOPICS = new Set([
  "תכנות", "שפות", "בישול", "ספורט", "עיצוב", "פיננסים",
]);

export async function addUserTopicAction(rawName) {
  const userId = await getSessionUserId();
  if (!userId) {
    return { error: "יש להתחבר כדי לשמור נושא אישי" };
  }

  const name = String(rawName ?? "").trim().replace(/\\s+/g, " ");
  if (name.length < 2 || name.length > 60) {
    return { error: "שם הנושא חייב להכיל בין 2 ל־60 תווים" };
  }

  const normalizedName = name.toLocaleLowerCase("he");
  if (DEFAULT_TOPICS.has(normalizedName)) {
    return { error: "הנושא כבר מופיע ברשימת הנושאים הראשיים" };
  }

  try {
    await connectDB();
    const topic = await UserTopic.create({ userId, name, normalizedName });
    revalidatePath("/play");

    return { success: true, topic: { id: topic._id.toString(), name: topic.name } };
  } catch (error) {
    if (error.code === 11000) {
      return { error: "הנושא כבר שמור אצלך" };
    }

    console.error("Failed to save user topic:", error);
    return { error: "לא הצלחנו לשמור את הנושא. כדאי לנסות שוב." };
  }
}
