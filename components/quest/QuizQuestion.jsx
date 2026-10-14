"use client";

import MiniChat from "@/components/MiniChat";

export default function QuizQuestion({
  currentQuestion, questFinished, questionNumber, totalQuestions,
  earnedXp, selectedAnswer, hasAnswered, setSelectedAnswer,
  handleCheckAnswer, selectedSkill, handleNextQuestion, quizLoading,
}) {
  return (
    <>
          {currentQuestion && !questFinished && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="w-full">
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-orange-400">
                        ⚔️ שאלה {questionNumber}/{totalQuestions}
                      </span>

                      <span className="font-bold text-yellow-400">
                        ⚡ {earnedXp} XP
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all"
                        style={{
                          width: `${(questionNumber / totalQuestions) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs font-bold text-orange-400">
                    🎯 {currentQuestion.concept}
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    {currentQuestion.question}
                  </h3>
                </div>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;

                  const isCorrect = index === currentQuestion.correctIndex;

                  let answerStyle = "border-white/10 bg-white/5";

                  if (!hasAnswered && isSelected) {
                    answerStyle = "border-orange-500 bg-orange-500/10";
                  }

                  if (hasAnswered && isCorrect) {
                    answerStyle = "border-green-500 bg-green-500/10";
                  }

                  if (hasAnswered && isSelected && !isCorrect) {
                    answerStyle = "border-red-500 bg-red-500/10";
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => setSelectedAnswer(index)}
                      className={`rounded-xl border p-4 text-right transition ${answerStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {!hasAnswered && (
                <button
                  type="button"
                  disabled={selectedAnswer === null}
                  onClick={() => handleCheckAnswer()}
                  className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  בדוק תשובה
                </button>
              )}

              {hasAnswered && (
                <div className="mt-5">
                  <div
                    className={`rounded-xl p-4 ${
                      selectedAnswer === currentQuestion.correctIndex
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    <p className="text-lg font-bold">
                      {selectedAnswer === currentQuestion.correctIndex
                        ? "✅ נכון!"
                        : "❌ לא הפעם"}
                    </p>

                    <p className="mt-2 text-sm text-zinc-300">
                      {currentQuestion.explanation}
                    </p>

                    <MiniChat
                      skillName={selectedSkill.name}
                      concept={currentQuestion.concept}
                    />

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={quizLoading}
                      className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-black transition hover:bg-orange-400 disabled:opacity-50"
                    >
                      {quizLoading
                        ? "⚡ מכין את האתגר הבא..."
                        : questionNumber === totalQuestions
                          ? "🏆 סיים משימה"
                          : "שאלה הבאה ←"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
    </>
  );
}
