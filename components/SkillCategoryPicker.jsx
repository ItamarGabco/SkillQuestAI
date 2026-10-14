"use client";

import QuestResults from "@/components/quest/QuestResults";
import QuizQuestion from "@/components/quest/QuizQuestion";
import SkillRecommendations from "@/components/quest/SkillRecommendations";
import TopicSelector from "@/components/quest/TopicSelector";
import { getSkillRecommendationsAction } from "@/actions/ai";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { generateQuizBatchAction } from "@/actions/quiz";
import {
  startQuestAttemptAction,
  recordQuestAnswerAction,
  completeQuestAttemptAction,
} from "@/actions/quest";
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

      setQuizError("לא הצלחנו להתחיל את המשימה כרגע");
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

        setQuizError("לא הצלחנו לשמור את סיום המשימה");
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

      <TopicSelector
        showCategories={showCategories}
        allCategories={allCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        customTopicName={customTopicName}
        setCustomTopicName={setCustomTopicName}
        handleAddCustomTopic={handleAddCustomTopic}
        savingTopic={savingTopic}
        topicError={topicError}
      />

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
          <button
            type="button"
            onClick={handleBackToTopics}
            className="mt-4 rounded-xl border border-white/20 px-4 py-2 font-semibold text-white hover:border-orange-500"
          >
            חזרה לבחירת נושא
          </button>
        </div>
      )}

      <SkillRecommendations
        loading={loading}
        recommendations={recommendations}
        selectedSkill={selectedSkill}
        selectedCategory={selectedCategory}
        showCategories={showCategories}
        onSelectSkill={setSelectedSkill}
        handleBackToTopics={handleBackToTopics}
      />

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

          <QuizQuestion
            currentQuestion={currentQuestion}
            questFinished={questFinished}
            questionNumber={questionNumber}
            totalQuestions={TOTAL_QUESTIONS}
            earnedXp={earnedXp}
            selectedAnswer={selectedAnswer}
            hasAnswered={hasAnswered}
            setSelectedAnswer={setSelectedAnswer}
            handleCheckAnswer={handleCheckAnswer}
            selectedSkill={selectedSkill}
            handleNextQuestion={handleNextQuestion}
            quizLoading={quizLoading}
          />

          <QuestResults
            questFinished={questFinished}
            selectedSkill={selectedSkill}
            correctCount={correctCount}
            totalQuestions={TOTAL_QUESTIONS}
            earnedXp={earnedXp}
          />

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
