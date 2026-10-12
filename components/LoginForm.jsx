"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

const initialState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          אימייל
        </label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-orange-500"
        />
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
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
      >
        {pending ? "מתחבר..." : "התחברות"}
      </button>
    </form>
  );
}
