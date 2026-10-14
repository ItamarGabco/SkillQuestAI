"use client";

export default function QuestResults({
  questFinished, selectedSkill, correctCount, totalQuestions, earnedXp,
}) {
  return (
    <>
          {questFinished && (
            <div className="mt-6 rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6 text-center">
              <p className="text-4xl">🏆</p>

              <p className="mt-3 font-bold text-orange-400">המסע הושלם</p>

              <h3 className="mt-2 text-2xl font-bold">{selectedSkill.displayName || selectedSkill.name}</h3>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-2xl font-bold">
                    {correctCount}/{totalQuestions}
                  </p>

                  <p className="mt-1 text-sm text-zinc-400">תשובות נכונות</p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-2xl font-bold text-yellow-400">
                    +{earnedXp}
                  </p>

                  <p className="mt-1 text-sm text-zinc-400">XP</p>
                </div>
              </div>
            </div>
          )}
    </>
  );
}
