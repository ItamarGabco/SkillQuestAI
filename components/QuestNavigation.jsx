"use client";

const buttonClass =
  "cursor-pointer rounded-xl border border-white/15 bg-zinc-800 px-4 py-3 text-sm font-semibold transition hover:border-orange-500/50 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40";

export default function QuestNavigation({
  onDifficulty,
  onSkill,
  onCategory,
  canChooseDifficulty,
  disabled,
}) {
  return (
    <nav
      aria-label="ניווט במסלול הלמידה"
      className="mt-6 grid gap-3 sm:grid-cols-3"
    >
      <button
        type="button"
        onClick={onDifficulty}
        disabled={disabled || !canChooseDifficulty}
        className={buttonClass}
      >
        🎚️ בחירת רמת קושי
      </button>

      <button
        type="button"
        onClick={onSkill}
        disabled={disabled}
        className={buttonClass}
      >
        🎯 בחירת סקיל אחר
      </button>

      <button
        type="button"
        onClick={onCategory}
        disabled={disabled}
        className={buttonClass}
      >
        🧭 בחירת תחום אחר
      </button>
    </nav>
  );
}
