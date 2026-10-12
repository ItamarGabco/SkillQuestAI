"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";

const initialState = {
  errors: {},
  values: {},
};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.errors?.form && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {state.errors.form}
        </p>
      )}

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          שם מלא
        </label>

        <input
          id="name"
          name="name"
          type="text"
          placeholder="Itamar"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
        />

        {state?.errors?.name && (
          <p className="mt-2 text-sm text-red-400">{state.errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          אימייל
        </label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="itamar@example.com"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
        />

        {state?.errors?.email && (
          <p className="mt-2 text-sm text-red-400">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          סיסמה
        </label>

        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
        />

        {state?.errors?.password && (
          <p className="mt-2 text-sm text-red-400">{state.errors.password}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium"
        >
          אימות סיסמה
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
        />

        {state?.errors?.confirmPassword && (
          <p className="mt-2 text-sm text-red-400">
            {state.errors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "יוצר חשבון..." : "מתחילים"}
      </button>
    </form>
  );
}
