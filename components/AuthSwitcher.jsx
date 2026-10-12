"use client";

import { useState } from "react";

import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

export default function AuthSwitcher({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);

  const isLogin = mode === "login";

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/5 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg px-4 py-3 font-semibold transition ${
            isLogin ? "bg-orange-500 text-black" : "text-zinc-400"
          }`}
        >
          התחברות
        </button>

        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-lg px-4 py-3 font-semibold transition ${
            !isLogin ? "bg-orange-500 text-black" : "text-zinc-400"
          }`}
        >
          הרשמה
        </button>
      </div>

      {isLogin ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
