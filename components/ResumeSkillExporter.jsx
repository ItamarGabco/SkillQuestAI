"use client";

import { useState } from "react";
import {
  groupResumeSkills,
  buildResumeExport,
  getResumeAchievement,
} from "@/lib/resumeExport";
import ResumeAiDraft from "@/components/ResumeAiDraft";
import { useResumeSelection } from "@/components/ResumeSelectionContext";

export default function ResumeSkillExporter({ skills }) {
  const { selectedIds, toggleSkill, selectAll, clearSelection } =
    useResumeSelection();

  const [format, setFormat] = useState("compact");
  const [message, setMessage] = useState("");

  const selectedSkills = skills.filter((skill) =>
    selectedIds.includes(skill.id),
  );

  const groups = groupResumeSkills(selectedSkills);
  const exportContent = buildResumeExport(groups, format);

  async function handleCopy() {
    if (selectedSkills.length === 0) return;

    setMessage("");

    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        try {
          const clipboardItem = new ClipboardItem({
            "text/html": new Blob([exportContent.html], {
              type: "text/html",
            }),
            "text/plain": new Blob([exportContent.text], {
              type: "text/plain",
            }),
          });

          await navigator.clipboard.write([clipboardItem]);
          setMessage("הועתק בהצלחה עם עיצוב!");
          return;
        } catch {
          // Try copying plain text instead.
        }
      }

      await navigator.clipboard.writeText(exportContent.text);
      setMessage("הטקסט הועתק בהצלחה!");
    } catch {
      setMessage("ההעתקה נכשלה. אפשר לסמן ולהעתיק מהתצוגה.");
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="text-xl font-bold">🎯 בחר מיומנויות</h2>

          <p className="mt-2 text-sm text-zinc-400">
            מיומנויות שהושלם בהן שאלון מסומנות מראש. אפשר לשנות את הבחירה.{" "}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                selectAll();
                setMessage("");
              }}
              className="cursor-pointer rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
            >
              בחר הכול
            </button>

            <button
              type="button"
              onClick={() => {
                clearSelection();
                setMessage("");
              }}
              className="cursor-pointer rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
            >
              נקה בחירה
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {skills.map((skill) => (
              <label
                key={skill.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 p-4"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(skill.id)}
                  onChange={() => {
                    toggleSkill(skill.id);
                    setMessage("");
                  }}
                  className="h-5 w-5 accent-orange-500"
                />

                <span className="flex-1">
                  <span className="block font-semibold">{skill.name}</span>

                  <span className="mt-1 block text-xs text-zinc-400">
                    {skill.category} · {getResumeAchievement(skill)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="text-xl font-bold">📄 תצוגה מקדימה</h2>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { id: "compact", label: "תמציתי" },
              { id: "detailed", label: "מפורט" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={format === option.id}
                onClick={() => {
                  setFormat(option.id);
                  setMessage("");
                }}
                className={`cursor-pointer rounded-xl px-4 py-3 font-semibold ${
                  format === option.id
                    ? "bg-orange-500 text-black"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div
            dir="rtl"
            className="mt-5 min-h-64 select-text rounded-xl bg-white p-6 text-slate-800"
          >
            <h3 className="border-b border-slate-200 pb-3 text-xl font-bold">
              מיומנויות וידע
            </h3>

            {groups.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">
                בחר לפחות מיומנות אחת כדי ליצור את התוכן.
              </p>
            ) : (
              <div className="mt-5 space-y-5">
                {groups.map((group) => (
                  <div key={group.category}>
                    <h4 className="font-bold">{group.category}</h4>

                    {format === "compact" ? (
                      <p className="mt-1 text-sm">
                        {group.skills
                          .map(
                            (skill) =>
                              `${skill.name} — ${getResumeAchievement(skill)}`,
                          )
                          .join(" • ")}{" "}
                      </p>
                    ) : (
                      <ul className="mt-2 list-disc space-y-2 pr-5 text-sm">
                        {group.skills.map((skill) => (
                          <li key={skill.id}>
                            <strong>{skill.name}</strong>
                            {" — "}
                            {getResumeAchievement(skill)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={selectedSkills.length === 0}
            onClick={handleCopy}
            className="mt-5 min-h-14 w-full cursor-pointer rounded-xl bg-orange-500 px-5 py-3 text-lg font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            📋 העתק לקורות החיים
          </button>

          <p aria-live="polite" className="mt-3 text-sm text-orange-400">
            {message}
          </p>
        </section>
      </div>
      <div className="mt-8">
        <ResumeAiDraft key={[...selectedIds].sort().join(",")} />
      </div>
    </>
  );
}
