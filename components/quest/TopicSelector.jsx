"use client";

export default function TopicSelector({
  showCategories, allCategories, selectedCategory, onSelectCategory,
  customTopicName, setCustomTopicName, handleAddCustomTopic,
  savingTopic, topicError,
}) {
  return (
    <>
      {showCategories && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allCategories.map((category) => {
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`rounded-2xl border p-5 text-right transition ${
                  isSelected
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-white/10 bg-zinc-900 hover:border-white/20"
                }`}
              >
                <div className="text-3xl">{category.icon}</div>

                <h3 className="mt-4 text-xl font-bold">{category.name}</h3>

                <p className="mt-2 text-sm text-zinc-400">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {showCategories && (
        <form onSubmit={handleAddCustomTopic} className="mt-5 rounded-2xl border border-dashed border-orange-500/35 bg-orange-500/5 p-5">
          <label htmlFor="custom-topic" className="block text-lg font-bold">
            לא מצאת את התחום שלך? הוסף נושא אישי
          </label>
          <p className="mt-1 text-sm text-zinc-400">
            הנושא יישמר בחשבון שלך ויופיע כאן בכל כניסה.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              id="custom-topic"
              type="text"
              value={customTopicName}
              onChange={(event) => setCustomTopicName(event.target.value)}
              maxLength={60}
              placeholder="למשל: צילום, גינון או אסטרונומיה"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
              required
            />
            <button
              type="submit"
              disabled={savingTopic}
              className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
            >
              {savingTopic ? "שומר..." : "הוסף לנושאים שלי"}
            </button>
          </div>
          {topicError && <p role="alert" className="mt-3 text-sm text-red-400">{topicError}</p>}
        </form>
      )}

      {selectedCategory && (
        <p className="mt-5 text-sm text-orange-400">
          התחום נבחר. בשלב הבא ה־AI יציע לך סקילס מתאימים.
        </p>
      )}
    </>
  );
}
