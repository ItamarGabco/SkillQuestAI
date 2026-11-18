"use client";

import { useState } from "react";
import { createResumeDraftAction } from "@/actions/resume";
import { useResumeSelection } from "@/components/ResumeSelectionContext";

export default function ResumeAiDraft() {
  const { selectedIds } = useResumeSelection();
  const [targetRole, setTargetRole] = useState("");
  const [summary, setSummary] = useState("");
  const [bullets, setBullets] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (loading || selectedIds.length === 0) return;

    setLoading(true);
    setError("");
    setMessage("");
    setSummary("");
    setBullets("");

    try {
      const result = await createResumeDraftAction({
        skillIds: selectedIds,
        targetRole,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSummary(result.summary);
      setBullets(result.bullets.join("\n"));

      if (result.excludedCount > 0) {
        setMessage(
          `${result.excludedCount} מיומנויות ללא שאלון שהושלם לא נכללו בניסוח.`,
        );
      }
    } catch (error) {
      console.error("Resume draft failed:", error);
      setError("אירעה תקלה ביצירת הניסוח");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    const lines = bullets
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const text = [
      "מיומנויות וידע",
      "",
      summary.trim(),
      "",
      ...lines.map((line) => `• ${line}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setMessage("הניסוח הועתק בהצלחה!");
    } catch {
      setError("ההעתקה נכשלה. אפשר להעתיק ידנית.");
    }
  }

  return (
    <section className="rounded-2xl border border-orange-500/25 bg-zinc-900 p-5 sm:p-7">
      <p className="font-bold text-orange-400">✨ AI RESUME WRITER</p>

      <h2 className="mt-2 text-2xl font-bold">תן ל־AI לנסח את החוזקות שלך</h2>

      <p className="mt-2 text-sm text-zinc-400">
        ניצור ניסוח מקצועי לפי המיומנויות שבחרת וההישגים שנשמרו בפרופיל שלך.
      </p>

      <label className="mt-6 block">
        <span className="font-semibold">לאיזו משרה אתה מכוון?</span>

        <input
          value={targetRole}
          onChange={(event) => setTargetRole(event.target.value)}
          maxLength={80}
          placeholder="לדוגמה: מפתח Frontend"
          className="mt-3 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
        />
      </label>

      <p className="mt-2 text-xs text-zinc-500">
        לא חובה למלא. המידע שנבחר יישלח לשירות ה־AI לצורך ניסוח.
      </p>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || selectedIds.length === 0}
        className="mt-5 min-h-14 w-full cursor-pointer rounded-xl bg-orange-500 px-5 py-3 font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "✨ מנסח את קורות החיים..." : "✨ צור ניסוח מקצועי"}
      </button>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {summary && (
        <div className="mt-6 rounded-xl bg-white p-5 text-slate-900">
          <h3 className="mb-4 border-b border-slate-200 pb-3 text-xl font-bold">
            מיומנויות וידע
          </h3>

          <label className="block text-sm font-semibold">
            פסקת פתיחה
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={4}
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 p-3 font-normal outline-none focus:border-orange-500"
            />
          </label>

          <label className="mt-4 block text-sm font-semibold">
            נקודות מקצועיות — שורה לכל נקודה
            <textarea
              value={bullets}
              onChange={(event) => setBullets(event.target.value)}
              rows={6}
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 p-3 font-normal outline-none focus:border-orange-500"
            />
          </label>
        </div>
      )}

      {summary && (
        <button
          type="button"
          onClick={handleCopy}
          className="mt-5 min-h-12 w-full cursor-pointer rounded-xl border border-orange-500/40 px-4 py-3 font-bold text-orange-400 hover:bg-orange-500/10"
        >
          📋 העתק את הניסוח הערוך
        </button>
      )}

      <p aria-live="polite" className="mt-3 text-sm text-orange-400">
        {message}
      </p>
    </section>
  );
}
