"use client";

import { getSkillRecommendationsAction } from "@/actions/ai";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateQuizBatchAction } from "@/actions/quiz";
import {
  startQuestAttemptAction,
  recordQuestAnswerAction,
  completeQuestAttemptAction,
} from "@/actions/quest";
import MiniChat from "@/components/MiniChat";
import { addUserTopicAction } from "@/actions/topics";

const TOTAL_QUESTIONS = 10;

const categories = [
  {
    id: "programming",
    name: "תכנות",
    icon: "💻",
    description: "פיתוח אתרים, אפליקציות ותוכנה",
  },
  {
    id: "languages",
    name: "שפות",
    icon: "🌍",
    description: "אנגלית, ספרדית, צרפתית ועוד",
  },
  {
    id: "cooking",
    name: "בישול",
    icon: "🍳",
    description: "טכניקות בישול, אפייה ומטבחים",
  },
  {
    id: "sports",
    name: "ספורט",
    icon: "⚽",
    description: "כושר, ענפי ספורט ויכולות גופניות",
  },
  {
    id: "design",
    name: "עיצוב",
    icon: "🎨",
    description: "UI, גרפיקה, עיצוב מוצר ועוד",
  },
  {
    id: "finance",
    name: "פיננסים",
    icon: "📈",
    description: "השקעות, כלכלה וניהול כספים",
  },
];

export default function SkillCategoryPicker({ initialSkill = null, initialTopics = [] }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState(initialSkill?.category || null);
  const [customTopics, setCustomTopics] = useState(initialTopics);
  const [customTopicName, setCustomTopicName] = useState("");
  const [topicError, setTopicError] = useState("");
  const [savingTopic, setSavingTopic] = useState(false);

  const [recommendations, setRecommendations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [showCategories, setShowCategories] = useState(!initialSkill);

  const [selectedSkill, setSelectedSkill] = useState(initialSkill);

  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [quizLoading, setQuizLoading] = useState(false);

  const [quizError, setQuizError] = useState("");

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [hasAnswered, setHasAnswered] = useState(false);

  const [questionNumber, setQuestionNumber] = useState(1);

  const [questResults, setQuestResults] = useState([]);

  const [questFinished, setQuestFinished] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState([]);

  const prefetchBatchRef = useRef(null);

  const [questAttemptId, setQuestAttemptId] = useState(null);

  const pendingSavePromisesRef = useRef([]);

  const allCategories = [
    ...categories,
    ...customTopics.map((topic) => ({
      id: `custom:${topic.id}`,
      name: topic.name,
      icon: "✨",
      description: "נושא אישי ששמרת",
    })),
  ];

  async function handleAddCustomTopic(event) {
    event.preventDefault();
    setTopicError("");
    const name = customTopicName.trim().replace(/\s+/g, " ");
    if (!name) {
      setTopicError("כדאי להזין שם לנושא החדש");
      return;
    }
    setSavingTopic(true);
    try {
      const result = await addUserTopicAction(name);
      if (result.error) {
        setTopicError(result.error);
        return;
      }
      setCustomTopics((current) => [result.topic, ...current]);
      setCustomTopicName("");
    } catch (error) {
      console.error("Failed to create topic:", error);
      setTopicError("שמירת הנושא נכשלה. אפשר לנסות שוב.");
    } finally {
      setSavingTopic(false);
    }
  }

  const router = useRouter();

  function handleBackToQuestBoard() {
    setSelectedSkill(null);
    setCurrentQuestion(null);
    setQuizQuestions([]);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setQuestionNumber(1);
    setQuestResults([]);
    setQuestFinished(false);
    setQuizError("");
    setQuizLoading(false);
    setQuestAttemptId(null);
    if (recommendations.length === 0) {
      setShowCategories(true);
      setSelectedCategory(null);
      setSelectedCategoryName(null);
    }

    pendingSavePromisesRef.current = [];

    prefetchBatchRef.current = null;
  }

  async function handleCategorySelect(category) {
    setSelectedCategory(category.id);
    setSelectedCategoryName(category.name);
    setShowCategories(false);
    setLoading(true);
    setError("");
    setRecommendations([]);
    setSelectedSkill(null);

    try {
      const result = await getSkillRecommendationsAction(category.name);

      if (result.error) {
        setError(result.error);
        return;
      }

      setRecommendations(result.skills);
    } catch (error) {
      console.error("Recommendation request failed:", error);

      setError("לא הצלחנו לקבל המלצות מה-AI");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartQuest() {
    if (!selectedSkill) {
      return;
    }

    setQuizLoading(true);
    setQuizError("");
    setCurrentQuestion(null);
    setQuizQuestions([]);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setQuestionNumber(1);
    setQuestResults([]);
    setQuestFinished(false);
    setQuestAttemptId(null);

    prefetchBatchRef.current = null;
    pendingSavePromisesRef.current = [];

    try {
      const result = await generateQuizBatchAction(
        selectedSkill.name,
        selectedSkill.difficulty,
        4,
        [],
        [],
      );

      if (result.error) {
        setQuizError(result.error);
        return;
      }

      const categoryName = selectedCategoryName || selectedSkill.category || "כללי";

      const attemptResult = await startQuestAttemptAction({
        skillName: selectedSkill.name,
        displayName: selectedSkill.displayName || selectedSkill.name,

        difficulty: selectedSkill.difficulty,

        category: categoryName,
      });

      if (attemptResult.error) {
        setQuizError(attemptResult.error);
        return;
      }

      setQuestAttemptId(attemptResult.attemptId);

      setQuizQuestions(result.questions);

      setCurrentQuestion(result.questions[0]);
    } catch (error) {
      console.error("Failed to start quest:", error);

      setQuizError("לא הצלחנו להתחיל את ה-Quest כרגע");
    } finally {
      setQuizLoading(false);
    }
  }

  const correctCount = questResults.filter((result) => result.correct).length;

  const earnedXp =
    questResults.reduce(
      (total, result) => total + (result.correct ? 10 : 2),
      0,
    ) + (questFinished ? 10 : 0);

  function handleCheckAnswer() {
    if (selectedAnswer === null || !currentQuestion || hasAnswered) {
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;

    const currentResult = {
      concept: currentQuestion.concept,

      question: currentQuestion.question,

      correct: isCorrect,
    };

    const updatedResults = [...questResults, currentResult];

    setQuestResults(updatedResults);

    setHasAnswered(true);

    if (questAttemptId) {
      const savePromise = recordQuestAnswerAction({
        attemptId: questAttemptId,

        question: currentQuestion.question,

        concept: currentQuestion.concept,

        correct: isCorrect,
      })
        .then((result) => {
          if (result.error) {
            console.error("Answer save failed:", result.error);
          }

          return result;
        })
        .catch((error) => {
          console.error("Answer save failed:", error);
        });

      pendingSavePromisesRef.current.push(savePromise);
    }

    if (questionNumber === 2 || questionNumber === 5) {
      prefetchBatchRef.current = generateQuizBatchAction(
        selectedSkill.name,
        selectedSkill.difficulty,
        3,
        updatedResults,
        quizQuestions,
      ).catch((error) => {
        console.error("Background quiz prefetch failed:", error);

        return {
          error: "טעינת השאלות הבאות נכשלה",
          questions: [],
        };
      });
    }
  }

  async function handleNextQuestion() {
    if (!selectedSkill || !hasAnswered) {
      return;
    }

    if (questionNumber >= TOTAL_QUESTIONS) {
      setQuizLoading(true);
      setQuizError("");

      try {
        await Promise.allSettled(pendingSavePromisesRef.current);

        if (questAttemptId) {
          const result = await completeQuestAttemptAction(questAttemptId);

          if (result.error) {
            setQuizError(result.error);
            return;
          }
        }

        setQuestFinished(true);
        router.refresh();
      } catch (error) {
        console.error("Quest completion failed:", error);

        setQuizError("לא הצלחנו לשמור את סיום ה-Quest");
      } finally {
        setQuizLoading(false);
      }

      return;
    }

    const nextIndex = questionNumber;

    const alreadyLoadedQuestion = quizQuestions[nextIndex];

    if (alreadyLoadedQuestion) {
      setCurrentQuestion(alreadyLoadedQuestion);

      setSelectedAnswer(null);
      setHasAnswered(false);

      setQuestionNumber((current) => current + 1);

      return;
    }

    setQuizLoading(true);
    setQuizError("");

    try {
      let result;

      if (prefetchBatchRef.current) {
        const pendingBatch = prefetchBatchRef.current;

        prefetchBatchRef.current = null;

        result = await pendingBatch;
      } else {
        const remainingQuestions = TOTAL_QUESTIONS - quizQuestions.length;

        const batchSize = Math.min(3, remainingQuestions);

        result = await generateQuizBatchAction(
          selectedSkill.name,
          selectedSkill.difficulty,
          batchSize,
          questResults,
        );
      }

      if (result.error) {
        setQuizError(result.error);
        return;
      }

      const updatedQuestions = [...quizQuestions, ...result.questions];

      setQuizQuestions(updatedQuestions);

      const nextQuestion = updatedQuestions[nextIndex];

      if (!nextQuestion) {
        setQuizError("לא הצלחנו למצוא את השאלה הבאה");
        return;
      }

      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null);
      setHasAnswered(false);

      setQuestionNumber((current) => current + 1);
    } catch (error) {
      console.error("Failed to load next quiz batch:", error);

      setQuizError("לא הצלחנו לטעון את השאלות הבאות");
    } finally {
      setQuizLoading(false);
    }
  }

  function handleBackToTopics() {
    setSelectedCategory(null);
    setSelectedCategoryName(null);
    setShowCategories(true);
    setRecommendations([]);

    setSelectedSkill(null);
    setCurrentQuestion(null);
    setQuizQuestions([]);

    setSelectedAnswer(null);
    setHasAnswered(false);

    setQuestionNumber(1);
    setQuestResults([]);
    setQuestFinished(false);

    setQuizError("");
    setQuizLoading(false);

    setQuestAttemptId(null);

    prefetchBatchRef.current = null;
    pendingSavePromisesRef.current = [];
  }

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-2xl font-bold">במה תרצה להתפתח?</h2>

        <p className="mt-2 text-zinc-400">בחר תחום ונציע לך סקילס רלוונטיים.</p>
      </div>

      {showCategories && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allCategories.map((category) => {
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category)}
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

      {loading && (
        <div className="mt-8 rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6">
          <p className="font-bold text-orange-400">⚡ סייר ה־AI</p>

          <p className="mt-2 text-lg font-semibold">
            ממפה את המסלול הבא שלך...
          </p>

          <p className="mt-1 text-sm text-zinc-400">
            בודק את הסקילס שלך ומחפש את המשימות הכי מתאימות.
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-orange-500" />
          </div>
        </div>
      )}
      {error && (
        <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <p className="font-bold text-red-400">⚠️ המשימה נכשלה</p>

          <p className="mt-2 text-sm text-zinc-300">{error}</p>
        </div>
      )}

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
                    onClick={() => setSelectedSkill(skill)}
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

      {selectedSkill && (
        <div className="mt-10 rounded-3xl border border-orange-500/30 bg-zinc-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-bold text-orange-400">⚔️ המשימה מוכנה</p>

              <h2 className="mt-2 text-3xl font-bold">{selectedSkill.displayName || selectedSkill.name}</h2>

              <p className="mt-2 max-w-xl text-zinc-400">
                {selectedSkill.shortDescription}
              </p>
            </div>

            {selectedSkill.isExisting && (
              <div className="rounded-xl bg-white/5 px-4 py-3 text-center">
                <p className="text-xs text-zinc-500">הרמה שלך</p>

                <p className="mt-1 font-bold">רמה {selectedSkill.level}</p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 p-5">
            <p className="text-sm font-bold text-zinc-400">מה מחכה לך?</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-black/20 p-4">
                <p className="text-xl">🎯</p>
                <p className="mt-2 font-semibold">שאלות מותאמות</p>
              </div>

              <div className="rounded-xl bg-black/20 p-4">
                <p className="text-xl">⚡</p>
                <p className="mt-2 font-semibold">XP והתקדמות</p>
              </div>

              <div className="rounded-xl bg-black/20 p-4">
                <p className="text-xl">💬</p>
                <p className="mt-2 font-semibold">הסברים וצ׳אט AI</p>
              </div>
            </div>
          </div>

          {!currentQuestion && (
            <button
              type="button"
              onClick={handleStartQuest}
              disabled={quizLoading}
              className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-4 text-lg font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {quizLoading ? "⚡ יוצר את האתגר..." : "⚔️ התחל משימה"}
            </button>
          )}

          {currentQuestion && !questFinished && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="w-full">
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-orange-400">
                        ⚔️ שאלה {questionNumber}/{TOTAL_QUESTIONS}
                      </span>

                      <span className="font-bold text-yellow-400">
                        ⚡ {earnedXp} XP
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all"
                        style={{
                          width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%`,
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
                      skillName={selectedSkill.displayName || selectedSkill.name}
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
                        : questionNumber === TOTAL_QUESTIONS
                          ? "🏆 סיים משימה"
                          : "שאלה הבאה ←"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {questFinished && (
            <div className="mt-6 rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6 text-center">
              <p className="text-4xl">🏆</p>

              <p className="mt-3 font-bold text-orange-400">המסע הושלם</p>

              <h3 className="mt-2 text-2xl font-bold">{selectedSkill.displayName || selectedSkill.name}</h3>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-2xl font-bold">
                    {correctCount}/{TOTAL_QUESTIONS}
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

          {quizError && (
            <p className="mt-4 text-sm text-red-400">{quizError}</p>
          )}

          <button
            type="button"
            onClick={() => handleBackToQuestBoard()}
            className="mt-6 text-sm font-semibold text-zinc-500 transition hover:text-orange-400"
          >
            ← בחר משימה אחרת
          </button>
        </div>
      )}
    </section>
  );
}
