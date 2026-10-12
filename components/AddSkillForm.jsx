"use client";

import { useActionState } from "react";

import { addSkillAction } from "@/actions/skills";

const initialState = {};

export default function AddSkillForm() {
  const [state, formAction, pending] = useActionState(
    addSkillAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-white/10 bg-zinc-900 p-5"
    >
      <h2 className="text-xl font-bold">הוספת סקיל חדש</h2>

      <p className="mt-1 text-sm text-zinc-400">
        הוסף משהו שאתה יודע או רוצה להשתפר בו.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            שם הסקיל
          </label>

          <input
            id="name"
            name="name"
            type="text"
            placeholder="לדוגמה: JavaScript"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium">
            תחום
          </label>

          <input
            id="category"
            name="category"
            type="text"
            placeholder="לדוגמה: פיתוח תוכנה"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {state?.error && (
        <p className="mt-3 text-sm text-red-400">{state.error}</p>
      )}

      {state?.success && (
        <p className="mt-3 text-sm text-green-400">הסקיל נוסף בהצלחה</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
      >
        {pending ? "מוסיף..." : "+ הוסף סקיל"}
      </button>
    </form>
  );
}
