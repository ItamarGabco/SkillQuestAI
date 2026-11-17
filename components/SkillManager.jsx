"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createRestSkillAction,
  updateRestSkillAction,
  deleteRestSkillAction,
} from "@/actions/skillRest";

export default function SkillManager({ skills }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("כללי");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function perform(action, successMessage, onSuccess) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await action();

      if (result.error) {
        setError(result.error);
        return;
      }

      onSuccess?.();
      setMessage(successMessage);
      router.refresh();
    } catch (err) {
      console.error("Skill operation failed:", err);
      setError("הפעולה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  function beginEdit(skill) {
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditCategory(skill.category);
    setError("");
  }

  function handleDelete(skill) {
    if (!window.confirm(`למחוק את ${skill.name}?`)) {
      return;
    }

    void perform(() => deleteRestSkillAction(skill.id), "הסקיל נמחק");
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();

          void perform(
            () => createRestSkillAction({ name, category }),
            "הסקיל נוסף בהצלחה",
            () => {
              setName("");
              setCategory("כללי");
            },
          );
        }}
        className="rounded-2xl border border-white/10 bg-zinc-900 p-5"
      >
        <h2 className="text-xl font-bold">הוספת מיומנות</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="שם המיומנות"
            aria-label="שם המיומנות"
            maxLength={80}
            required
            className="rounded-xl border border-white/10 bg-zinc-950 p-3"
          />

          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="קטגוריה"
            aria-label="קטגוריה"
            maxLength={50}
            required
            className="rounded-xl border border-white/10 bg-zinc-950 p-3"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-4 min-h-12 rounded-xl bg-orange-500 px-6 font-bold text-black disabled:opacity-50"
        >
          הוסף סקיל
        </button>
      </form>

      {error && (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="text-green-400">
          {message}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-bold">המיומנויות שלי ({skills.length})</h2>

        {skills.length === 0 && (
          <p className="rounded-xl bg-zinc-900 p-5 text-zinc-400">
            עדיין אין מיומנויות ברשימה.
          </p>
        )}

        {skills.map((skill) => (
          <div
            key={skill.id}
            className="rounded-2xl border border-white/10 bg-zinc-900 p-5"
          >
            {editingId === skill.id ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  void perform(
                    () =>
                      updateRestSkillAction({
                        id: skill.id,
                        name: editName,
                        category: editCategory,
                      }),
                    "הסקיל עודכן",
                    () => setEditingId(null),
                  );
                }}
                className="space-y-3"
              >
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  aria-label="עריכת שם מיומנות"
                  maxLength={80}
                  required
                  className="w-full rounded-xl bg-zinc-800 p-3"
                />

                <input
                  value={editCategory}
                  onChange={(event) => setEditCategory(event.target.value)}
                  aria-label="עריכת קטגוריה"
                  maxLength={50}
                  required
                  className="w-full rounded-xl bg-zinc-800 p-3"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-xl bg-orange-500 px-4 py-3 font-bold text-black disabled:opacity-50"
                  >
                    שמור
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-xl bg-zinc-800 px-4 py-3"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{skill.name}</h3>
                  <p className="text-sm text-zinc-400">
                    {skill.category} · {skill.xp} XP
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => beginEdit(skill)}
                    className="rounded-xl bg-zinc-800 px-4 py-3"
                  >
                    עריכה
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(skill)}
                    className="rounded-xl border border-red-500/30 px-4 py-3 text-red-400"
                  >
                    מחיקה
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      <p className="text-sm text-zinc-400">
        כדי להגן על היסטוריית הלמידה, השרת לא מאפשר כרגע למחוק סקיל שתורגל או
        לשנות את שמו. אפשר עדיין לערוך את הקטגוריה שלו.
      </p>
    </div>
  );
}
