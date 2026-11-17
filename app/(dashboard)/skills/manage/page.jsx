import Link from "next/link";

import { expressApi } from "@/lib/expressApi";
import SkillManager from "@/components/SkillManager";

export default async function ManageSkillsPage() {
  const result = await expressApi("/api/skills");

  const skills = (result.data?.skills || []).map((skill) => ({
    id: skill._id,
    name: skill.name,
    category: skill.category,
    xp: skill.xp ?? 0,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/skills" className="text-orange-400">
        → חזרה לסקילס שלי
      </Link>

      <header className="mb-8 mt-6">
        <p className="font-bold text-orange-400">SKILL MANAGER</p>

        <h1 className="mt-2 text-3xl font-bold">ניהול מיומנויות</h1>

        <p className="mt-3 text-zinc-400">
          הוספה, עריכה ומחיקה באמצעות Express REST API.
        </p>
      </header>

      {result.error ? (
        <p role="alert" className="rounded-xl bg-red-500/10 p-5 text-red-400">
          {result.error}
        </p>
      ) : (
        <SkillManager skills={skills} />
      )}
    </div>
  );
}
