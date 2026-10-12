"use server";

import { redirect } from "next/navigation";

import {
  createUserWithPassword,
  AFTER_AUTH_REDIRECT,
  authenticateUser,
} from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";
import { validateRegistration } from "@/lib/validation";

export async function registerAction(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const values = {
    name,
    email,
  };

  const errors = validateRegistration({
    name,
    email,
    password,
    confirmPassword,
  });

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values,
    };
  }

  try {
    const user = await createUserWithPassword({
      name,
      email,
      password,
    });

    await createSession(user._id.toString());
  } catch (error) {
    console.error("Registration failed:", error);

    return {
      errors: {
        form: "Could not create account",
      },
      values,
    };
  }

  redirect(AFTER_AUTH_REDIRECT);
}

export async function loginAction(prevState, formData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return {
      error: "יש להזין אימייל וסיסמה",
    };
  }

  try {
    const user = await authenticateUser({
      email,
      password,
    });

    if (!user) {
      return {
        error: "האימייל או הסיסמה אינם נכונים",
      };
    }

    await createSession(user._id.toString());
  } catch (error) {
    console.error("Login failed:", error);

    return {
      error: "לא הצלחנו להתחבר כרגע",
    };
  }

  redirect(AFTER_AUTH_REDIRECT);
}

export async function logoutAction() {
  await destroySession();

  redirect("/login");
}
