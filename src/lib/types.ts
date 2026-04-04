export type TranslationSegment = {
  id: string;
  cs: string;
  uk: string;
};

export type IntroBlock = {
  typeLabelUk: string;
  whyUk: string;
  tipUk: string;
};

export type StepOption = {
  id: string;
  cs: string;
  uk: string;
  isCorrect: boolean;
  errorTag?: string | null;
  feedbackUk: string;
};

export type HintLevel = {
  level: number;
  uk: string;
};

export type TutorialStep = {
  id: string;
  prompt: {
    cs: string;
    uk: string;
  };
  options: StepOption[];
  hintLevels: HintLevel[];
  skillTags: string[];
  errorTags: string[];
  takeawayUk?: string;
};

export type TutorialTask = {
  id: string;
  taskNumber: number;
  titleCs: string;
  titleUk: string;
  examStyleGroup: string;
  difficulty: number;
  available: boolean;
  skills: string[];
  errorTags: string[];
  intro: IntroBlock;
  promptSegments: TranslationSegment[];
  fullTranslationUk: string;
  finalSummaryUk: string;
  steps: TutorialStep[];
  diagramSvg?: string;
};

export type Tutorial = {
  id: string;
  title: string;
  shortDescriptionUk: string;
  localeBase: "cs";
  supportLocale: "uk";
  taskCount: number;
  seedTaskCount: number;
  tasks: TutorialTask[];
};

export type ReviewTask = {
  id: string;
  reviewSkill: string;
  difficulty: number;
  sourceRelatedTaskNumbers: number[];
  errorTags: string[];
  prompt: {
    cs: string;
    uk: string;
  };
  introUk: string;
  finalSummaryUk: string;
  steps: TutorialStep[];
};

export type ReviewRecommendation = {
  task: ReviewTask;
  score: number;
  matchedSkills: string[];
  matchedErrors: string[];
  matchedTaskNumbers: number[];
};

export type StepAttempt = {
  selectedOptionId: string;
  correct: boolean;
  timestamp: string;
};

export type StepProgress = {
  attempts: StepAttempt[];
  attemptsCount: number;
  correctAttempts: number;
  incorrectAttempts: number;
  completed: boolean;
  hintsUsed: number;
  translationUsage: number;
  timeSpentMs: number;
  errorTags: string[];
  skillTags: string[];
};

export type TaskProgress = {
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
  totalTimeMs: number;
  stepStates: Record<string, StepProgress>;
};

export type TutorialProgress = {
  tutorialId: string;
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
  currentTaskNumber?: number;
  tasks: Record<string, TaskProgress>;
};

export type AggregatedStat = {
  id: string;
  attempts: number;
  incorrect: number;
  correct: number;
  hintUsage: number;
  translationUsage: number;
  timeSpentMs: number;
};

export type AppProgress = {
  sessionId: string;
  updatedAt: string;
  tutorials: Record<string, TutorialProgress>;
};
