import type {
  AggregatedStat,
  AppProgress,
  ReviewRecommendation,
  ReviewTask,
  StepProgress,
  TaskProgress,
  Tutorial,
  TutorialProgress,
  TutorialStep
} from "@/lib/types";

export const STORAGE_KEY = "cermat-tutorial-progress";

export function createSessionId(): string {
  return `session-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyAppProgress(): AppProgress {
  return {
    sessionId: createSessionId(),
    updatedAt: new Date().toISOString(),
    tutorials: {}
  };
}

export function ensureTutorialProgress(
  progress: AppProgress,
  tutorial: Tutorial
): TutorialProgress {
  const existing = progress.tutorials[tutorial.id];
  if (existing) {
    return existing;
  }

  const created: TutorialProgress = {
    tutorialId: tutorial.id,
    completed: false,
    startedAt: new Date().toISOString(),
    currentTaskNumber: tutorial.tasks.find((task) => task.available)?.taskNumber,
    tasks: {}
  };
  progress.tutorials[tutorial.id] = created;
  return created;
}

export function ensureTaskProgress(
  tutorialProgress: TutorialProgress,
  taskId: string
): TaskProgress {
  const existing = tutorialProgress.tasks[taskId];
  if (existing) {
    return existing;
  }

  const created: TaskProgress = {
    completed: false,
    startedAt: new Date().toISOString(),
    totalTimeMs: 0,
    stepStates: {}
  };
  tutorialProgress.tasks[taskId] = created;
  return created;
}

export function ensureStepProgress(
  taskProgress: TaskProgress,
  step: TutorialStep
): StepProgress {
  const existing = taskProgress.stepStates[step.id];
  if (existing) {
    return existing;
  }

  const created: StepProgress = {
    attempts: [],
    attemptsCount: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    completed: false,
    hintsUsed: 0,
    translationUsage: 0,
    timeSpentMs: 0,
    errorTags: [...step.errorTags],
    skillTags: [...step.skillTags]
  };
  taskProgress.stepStates[step.id] = created;
  return created;
}

export function mergeStorageProgress(raw: string | null): AppProgress {
  if (!raw) {
    return createEmptyAppProgress();
  }

  try {
    const parsed = JSON.parse(raw) as AppProgress;
    return {
      sessionId: parsed.sessionId || createSessionId(),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      tutorials: parsed.tutorials || {}
    };
  } catch {
    return createEmptyAppProgress();
  }
}

export function computeAggregatedStats(
  tutorialProgress?: TutorialProgress
): {
  skills: AggregatedStat[];
  errors: AggregatedStat[];
} {
  if (!tutorialProgress) {
    return { skills: [], errors: [] };
  }

  const skillMap = new Map<string, AggregatedStat>();
  const errorMap = new Map<string, AggregatedStat>();

  for (const taskProgress of Object.values(tutorialProgress.tasks)) {
    for (const stepState of Object.values(taskProgress.stepStates)) {
      for (const skill of stepState.skillTags) {
        const current =
          skillMap.get(skill) ||
          {
            id: skill,
            attempts: 0,
            incorrect: 0,
            correct: 0,
            hintUsage: 0,
            translationUsage: 0,
            timeSpentMs: 0
          };
        current.attempts += stepState.attemptsCount;
        current.correct += stepState.correctAttempts;
        current.incorrect += stepState.incorrectAttempts;
        current.hintUsage += stepState.hintsUsed;
        current.translationUsage += stepState.translationUsage;
        current.timeSpentMs += stepState.timeSpentMs;
        skillMap.set(skill, current);
      }

      for (const errorTag of stepState.errorTags) {
        const current =
          errorMap.get(errorTag) ||
          {
            id: errorTag,
            attempts: 0,
            incorrect: 0,
            correct: 0,
            hintUsage: 0,
            translationUsage: 0,
            timeSpentMs: 0
          };
        current.attempts += stepState.attemptsCount;
        current.correct += stepState.correctAttempts;
        current.incorrect += stepState.incorrectAttempts;
        current.hintUsage += stepState.hintsUsed;
        current.translationUsage += stepState.translationUsage;
        current.timeSpentMs += stepState.timeSpentMs;
        errorMap.set(errorTag, current);
      }
    }
  }

  return {
    skills: Array.from(skillMap.values()).sort(
      (a, b) => b.incorrect - a.incorrect || b.attempts - a.attempts
    ),
    errors: Array.from(errorMap.values()).sort(
      (a, b) => b.incorrect - a.incorrect || b.attempts - a.attempts
    )
  };
}

export function pickReviewTasks(
  reviewPool: ReviewTask[],
  tutorial: Tutorial,
  tutorialProgress?: TutorialProgress,
  count = 6
): ReviewRecommendation[] {
  if (!tutorialProgress) {
    return [];
  }

  const { skills, errors } = computeAggregatedStats(tutorialProgress);
  const skillMap = new Map(skills.map((stat) => [stat.id, stat]));
  const errorMap = new Map(errors.map((stat) => [stat.id, stat]));
  const taskNumberScoreMap = new Map<number, number>();

  for (const task of tutorial.tasks) {
    const taskProgress = tutorialProgress.tasks[task.id];
    if (!taskProgress) {
      continue;
    }

    let score = 0;
    for (const stepState of Object.values(taskProgress.stepStates)) {
      score += stepState.incorrectAttempts * 3;
      score += stepState.hintsUsed;
      score += Math.min(stepState.translationUsage, 3);
    }

    if (score > 0) {
      taskNumberScoreMap.set(task.taskNumber, score);
    }
  }

  const prioritized = reviewPool
    .map((task) => {
      let score = 0;
      const matchedSkills: string[] = [];
      const matchedErrors: string[] = [];
      const matchedTaskNumbers: number[] = [];

      const matchedSkillStat = skillMap.get(task.reviewSkill);
      if (matchedSkillStat && (matchedSkillStat.incorrect > 0 || matchedSkillStat.hintUsage > 0)) {
        score += matchedSkillStat.incorrect * 5 + matchedSkillStat.hintUsage + 2;
        matchedSkills.push(task.reviewSkill);
      }

      for (const tag of task.errorTags) {
        const stat = errorMap.get(tag);
        if (!stat || (stat.incorrect === 0 && stat.hintUsage === 0)) {
          continue;
        }
        score += stat.incorrect * 4 + stat.hintUsage + 1;
        matchedErrors.push(tag);
      }

      for (const taskNumber of task.sourceRelatedTaskNumbers) {
        const taskScore = taskNumberScoreMap.get(taskNumber);
        if (!taskScore) {
          continue;
        }
        score += taskScore;
        matchedTaskNumbers.push(taskNumber);
      }

      if (score === 0) {
        score = Math.max(1, task.difficulty);
      }

      return {
        task,
        score,
        matchedSkills,
        matchedErrors,
        matchedTaskNumbers
      };
    })
    .sort((a, b) => b.score - a.score || a.task.difficulty - b.task.difficulty);

  const selected: ReviewRecommendation[] = [];
  const coveredSkills = new Set<string>();
  const coveredTasks = new Set<number>();

  for (const candidate of prioritized) {
    const introducesNewSkill = candidate.matchedSkills.some((skill) => !coveredSkills.has(skill));
    const introducesNewTask = candidate.matchedTaskNumbers.some(
      (taskNumber) => !coveredTasks.has(taskNumber)
    );

    if (selected.length < count && (introducesNewSkill || introducesNewTask || selected.length < 3)) {
      selected.push(candidate);
      candidate.matchedSkills.forEach((skill) => coveredSkills.add(skill));
      candidate.matchedTaskNumbers.forEach((taskNumber) => coveredTasks.add(taskNumber));
    }
  }

  for (const candidate of prioritized) {
    if (selected.length >= count) {
      break;
    }
    if (selected.some((entry) => entry.task.id === candidate.task.id)) {
      continue;
    }
    selected.push(candidate);
  }

  return selected.slice(0, count);
}
