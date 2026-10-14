"use client";

export default function SkillRecommendations({
  loading, recommendations, selectedSkill, selectedCategory,
  showCategories, onSelectSkill, handleBackToTopics,
}) {
  return (
    <>
      {!loading && recommendations.length > 0 && !selectedSkill && (
        <div className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-bold text-orange-400">⚔️ לוח המשימות</p>

              <h2 className="mt-1 text-2xl font-bold">מסלולים מומלצים עבורך</h2>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-400">
              {recommendations.length} משימות
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((skill) => {
              const difficultyLabel = {
                beginner: "מתחיל",
                intermediate: "בינוני",
                advanced: "מתקדם",
              }[skill.difficulty];

              return (
                <article
                  key={skill.name}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-5 transition hover:border-orange-500/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold">{skill.displayName || skill.name}</h3>

                        {skill.isExisting ? (
                          <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-400">
                            🔥 חיזוק
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-bold text-green-400">
                            ✨ חדש
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-zinc-400">
                        {skill.shortDescription}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300">
                      {difficultyLabel}
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl bg-white/5 p-4">
                    <p className="text-xs font-bold text-zinc-500">
                      למה זה מומלץ לך?
                    </p>

                    <p className="mt-1 text-sm text-zinc-300">{skill.reason}</p>
                  </div>

                  {skill.isExisting && (
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-zinc-400">שליטה נוכחית</span>

                        <span className="font-bold">
                          {skill.proficiency === null
                            ? "טרם נבדק"
                            : `${skill.proficiency}%`}
                        </span>
                      </div>

                      {skill.proficiency !== null && (
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-orange-500"
                            style={{
                              width: `${skill.proficiency}%`,
                            }}
                          />
                        </div>
                      )}

                      <p className="mt-2 text-xs text-zinc-500">
                        רמה {skill.level}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectSkill(skill)}
                    className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-black transition hover:bg-orange-400"
                  >
                    ⚔️ בחר משימה
                  </button>
                </article>
              );
            })}
          </div>
          {selectedCategory && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={handleBackToTopics}
                className="text-sm font-semibold text-zinc-500 transition hover:text-orange-400"
              >
                {showCategories
                  ? "סגור בחירת תחום"
                  : "＋ רוצה מסלול אחר? בחר תחום"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
