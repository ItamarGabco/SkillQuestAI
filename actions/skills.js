"use server";

import { revalidatePath } from "next/cache";

import connectDB from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import Skill from "@/models/Skill";

export async function addSkillAction(prevState, formData) {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      error: "יש להתחבר כדי להוסיף סקיל",
    };
  }

  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "כללי").trim();

  if (!name) {
    return {
      error: "יש להזין שם של סקיל",
    };
  }

  if (name.length > 80) {
    return {
      error: "שם הסקיל ארוך מדי",
    };
  }

  await connectDB();

  const existingSkill = await Skill.findOne({
    userId,
    name,
  });

  if (existingSkill) {
    return {
      error: "הסקיל הזה כבר נמצא ברשימה שלך",
    };
  }

  await Skill.create({
    userId,
    name,
    category,
  });

  revalidatePath("/skills");

  return {
    success: true,
  };
}
