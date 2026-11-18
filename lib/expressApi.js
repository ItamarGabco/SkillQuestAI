import { cookies } from "next/headers";
import { getSessionUserId } from "@/lib/session";

export async function expressApi(path, options = {}) {
  const userId = await getSessionUserId();

  if (!userId) {
    return { error: "יש להתחבר למערכת" };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("skillquest_session")?.value;

  if (!token) {
    return { error: "לא נמצאה התחברות תקינה" };
  }

  const baseUrl = process.env.EXPRESS_API_URL || "http://127.0.0.1:4001";

  const { method = "GET", body } = options;

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(
        process.env.NODE_ENV === "production" ? 90000 : 10000,
      ),
    });

    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: data.error || `שגיאת שרת ${response.status}`,
        status: response.status,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Express API request failed:", error);

    return {
      error: "לא ניתן להתחבר לשרת ה־API",
    };
  }
}
