"use server";

import { revalidatePath } from "next/cache";
import { expressApi } from "@/lib/expressApi";

function refreshSkills() {
  revalidatePath("/skills");
  revalidatePath("/skills/manage");
  revalidatePath("/");
}

export async function createRestSkillAction({ name, category }) {
  const result = await expressApi("/api/skills", {
    method: "POST",
    body: { name, category },
  });

  if (result.error) return { error: result.error };

  refreshSkills();
  return { success: true };
}

export async function updateRestSkillAction({ id, name, category }) {
  const result = await expressApi(`/api/skills/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { name, category },
  });

  if (result.error) return { error: result.error };

  refreshSkills();
  return { success: true };
}

export async function deleteRestSkillAction(id) {
  const result = await expressApi(`/api/skills/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (result.error) return { error: result.error };

  refreshSkills();
  return { success: true };
}
