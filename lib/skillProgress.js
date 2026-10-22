export const QUIZZES_TO_UNLOCK = 5;
const QUESTIONS_PER_QUIZ = 10;

export function getSkillProgress(skill, attempts) {
  const stats = {
    beginner: { completed: 0, best: null },
    intermediate: { completed: 0, best: null },
    advanced: { completed: 0, best: null },
  };

  for (const attempt of attempts) {
    if (
      attempt.status !== "completed" ||
      attempt.totalAnswers !== QUESTIONS_PER_QUIZ
    ) {
      continue;
    }

    const difficulty = stats[attempt.difficulty];

    if (!difficulty) {
      continue;
    }

    difficulty.completed += 1;

    if (difficulty.best === null || attempt.correctAnswers > difficulty.best) {
      difficulty.best = attempt.correctAnswers;
    }
  }

  function canUnlock(difficultyName) {
    const difficulty = stats[difficultyName];

    return (
      difficulty.completed >= QUIZZES_TO_UNLOCK &&
      difficulty.best === QUESTIONS_PER_QUIZ
    );
  }

  const xp = skill.xp ?? 0;

  return {
    xp,
    level: Math.floor(xp / 100) + 1,
    correctAnswers: skill.correctAnswers ?? 0,

    difficulties: {
      beginner: {
        ...stats.beginner,
        unlocked: true,
      },
      intermediate: {
        ...stats.intermediate,
        unlocked: canUnlock("beginner"),
      },
      advanced: {
        ...stats.advanced,
        unlocked: canUnlock("intermediate"),
      },
    },
  };
}
