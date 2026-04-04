import { useEffect, useRef, useState } from "react";
import type { AppProgress, Tutorial, TutorialTask } from "@/lib/types";
import {
  STORAGE_KEY,
  ensureStepProgress,
  ensureTaskProgress,
  ensureTutorialProgress,
  mergeStorageProgress
} from "@/lib/progress";

type Props = {
  tutorial: Tutorial;
  task: TutorialTask;
};

function getStoredProgress(): AppProgress {
  if (typeof window === "undefined") {
    return mergeStorageProgress(null);
  }
  return mergeStorageProgress(window.localStorage.getItem(STORAGE_KEY));
}

async function syncProgress(progress: AppProgress) {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return;
  }

  try {
    await fetch(`/api/progress/${progress.sessionId}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progress)
    });
  } catch {
    return;
  }
}

export default function TutorialPlayer({ tutorial, task }: Props) {
  const [progress, setProgress] = useState<AppProgress>(() => getStoredProgress());
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [revealedPromptTranslations, setRevealedPromptTranslations] = useState<string[]>([]);
  const [showFullTranslation, setShowFullTranslation] = useState(false);
  const [revealedOptionTranslations, setRevealedOptionTranslations] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [completedTask, setCompletedTask] = useState(false);
  const [startedAt] = useState(Date.now());
  const stepStartedAtRef = useRef(Date.now());
  const currentStep = task.steps[stepIndex];

  useEffect(() => {
    const nextProgress = getStoredProgress();
    const tutorialProgress = ensureTutorialProgress(nextProgress, tutorial);
    ensureTaskProgress(tutorialProgress, task.id);
    setProgress(nextProgress);
  }, [task.id, tutorial]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    void syncProgress(progress);
  }, [progress]);

  useEffect(() => {
    setSelectedOptionId(null);
    setHintLevel(0);
    setRevealedOptionTranslations([]);
    stepStartedAtRef.current = Date.now();
  }, [stepIndex, task.id]);

  const tutorialProgress = ensureTutorialProgress(progress, tutorial);
  const taskProgress = ensureTaskProgress(tutorialProgress, task.id);
  const stepProgress = ensureStepProgress(taskProgress, currentStep);
  const selectedOption = currentStep.options.find(
    (option) => option.id === selectedOptionId
  );

  function commitProgress(next: AppProgress) {
    next.updatedAt = new Date().toISOString();
    setProgress({ ...next });
  }

  function trackTranslation() {
    stepProgress.translationUsage += 1;
    taskProgress.totalTimeMs = Date.now() - startedAt;
    commitProgress(progress);
  }

  function revealPromptTranslation(segmentId: string) {
    if (revealedPromptTranslations.includes(segmentId)) {
      return;
    }
    setRevealedPromptTranslations((current) => [...current, segmentId]);
    trackTranslation();
  }

  function revealOptionTranslation(optionId: string) {
    if (revealedOptionTranslations.includes(optionId)) {
      return;
    }
    setRevealedOptionTranslations((current) => [...current, optionId]);
    trackTranslation();
  }

  function revealFullTranslation() {
    if (showFullTranslation) {
      return;
    }
    setShowFullTranslation(true);
    trackTranslation();
  }

  function useHint() {
    if (hintLevel >= currentStep.hintLevels.length) {
      return;
    }
    stepProgress.hintsUsed += 1;
    setHintLevel((current) => current + 1);
    commitProgress(progress);
  }

  function submitAnswer(optionId: string) {
    const option = currentStep.options.find((entry) => entry.id === optionId);
    if (!option) {
      return;
    }

    const correct = option.isCorrect;
    const now = new Date().toISOString();
    const timeSpentMs = Date.now() - stepStartedAtRef.current;

    stepProgress.attempts.push({
      selectedOptionId: optionId,
      correct,
      timestamp: now
    });
    stepProgress.attemptsCount += 1;
    stepProgress.timeSpentMs += timeSpentMs;
    taskProgress.totalTimeMs += timeSpentMs;

    if (correct) {
      stepProgress.correctAttempts += 1;
      stepProgress.completed = true;
    } else {
      stepProgress.incorrectAttempts += 1;
      if (option.errorTag && !stepProgress.errorTags.includes(option.errorTag)) {
        stepProgress.errorTags.push(option.errorTag);
      }
    }

    tutorialProgress.currentTaskNumber = task.taskNumber;
    setSelectedOptionId(optionId);
    commitProgress(progress);
  }

  function advance() {
    if (stepIndex < task.steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    taskProgress.completed = true;
    taskProgress.completedAt = new Date().toISOString();
    const nextAvailableTask = tutorial.tasks.find(
      (candidate) => candidate.available && candidate.taskNumber > task.taskNumber
    );
    tutorialProgress.currentTaskNumber = nextAvailableTask?.taskNumber ?? task.taskNumber;

    const availableTaskIds = tutorial.tasks.filter((entry) => entry.available).map((entry) => entry.id);
    const allAvailableDone = availableTaskIds.every(
      (taskId) => tutorialProgress.tasks[taskId]?.completed
    );
    if (allAvailableDone) {
      tutorialProgress.completed = true;
      tutorialProgress.completedAt = new Date().toISOString();
    }

    setCompletedTask(true);
    commitProgress(progress);
  }

  if (!task.available) {
    return (
      <div className="panel step-card">
        <h2>{task.titleCs}</h2>
        <p>{task.titleUk}</p>
        <div className="status-box">
          This task is still a placeholder in the current seed build.
        </div>
      </div>
    );
  }

  if (completedTask) {
    const nextAvailableTask = tutorial.tasks.find(
      (candidate) => candidate.available && candidate.taskNumber > task.taskNumber
    );

    return (
      <div className="panel summary-card">
        <h2>{task.titleUk}</h2>
        <div className="takeaway-box">{task.finalSummaryUk}</div>
        <div className="action-row" style={{ marginTop: "1rem" }}>
          {nextAvailableTask ? (
            <a
              className="button"
              href={`/tutorials/${tutorial.id}/tasks/${nextAvailableTask.taskNumber}`}
            >
              Далі: задача {nextAvailableTask.taskNumber}
            </a>
          ) : (
            <a className="button" href={`/tutorials/${tutorial.id}/summary`}>
              До підсумку tutorial
            </a>
          )}
          <a className="button secondary" href="/review">
            Mistake Review
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="task-shell">
      <section className="panel task-header">
        <div className="meta-row">
          <span className="pill">
            Tutorial {tutorial.title} · Úloha {task.taskNumber}
          </span>
          <span className="pill">Seed step task</span>
        </div>
        <h1>{task.titleCs}</h1>
        <p>{task.intro.typeLabelUk}</p>
        <p className="subtle">{task.intro.whyUk}</p>
        <div className="status-box">{task.intro.tipUk}</div>
        <div style={{ marginTop: "1rem" }}>
          {task.promptSegments.map((segment) => (
            <div className="prompt-segment" key={segment.id}>
              <div className="prompt-line">
                <div>{segment.cs}</div>
                <div className="micro-actions">
                  <button
                    className="inline-action"
                    onClick={() => revealPromptTranslation(segment.id)}
                    type="button"
                  >
                    UA
                  </button>
                </div>
              </div>
              {revealedPromptTranslations.includes(segment.id) ? (
                <div className="translation-box">{segment.uk}</div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="micro-actions" style={{ marginTop: "0.8rem" }}>
          <button className="inline-action" onClick={revealFullTranslation} type="button">
            Повний переклад
          </button>
        </div>
        {showFullTranslation ? (
          <div className="translation-box">{task.fullTranslationUk}</div>
        ) : null}
        {task.diagramSvg ? (
          <div
            className="diagram"
            dangerouslySetInnerHTML={{ __html: task.diagramSvg }}
            style={{ marginTop: "1rem" }}
          />
        ) : null}
      </section>

      <section className="panel step-card">
        <div className="meta-row">
          <span className="pill">
            Krok {stepIndex + 1} / {task.steps.length}
          </span>
          <span className="pill">4 варіанти</span>
        </div>
        <h2>{currentStep.prompt.cs}</h2>
        <p>{currentStep.prompt.uk}</p>
        <div className="option-list">
          {currentStep.options.map((option) => {
            let className = "option-button";
            if (selectedOptionId === option.id && option.isCorrect) {
              className += " correct";
            }
            if (selectedOptionId === option.id && !option.isCorrect) {
              className += " incorrect";
            }

            return (
              <div key={option.id}>
                <button
                  className={className}
                  disabled={stepProgress.completed}
                  onClick={() => submitAnswer(option.id)}
                  type="button"
                >
                  {option.cs}
                </button>
                <div className="micro-actions" style={{ marginTop: "0.35rem" }}>
                  <button
                    className="inline-action"
                    onClick={() => revealOptionTranslation(option.id)}
                    type="button"
                  >
                    UA
                  </button>
                </div>
                {revealedOptionTranslations.includes(option.id) ? (
                  <div className="translation-box">{option.uk}</div>
                ) : null}
              </div>
            );
          })}
        </div>

        {selectedOption ? (
          <div
            className={`feedback-box ${selectedOption.isCorrect ? "correct" : "incorrect"}`}
          >
            {selectedOption.feedbackUk}
          </div>
        ) : null}

        {currentStep.takeawayUk && stepProgress.completed ? (
          <div className="takeaway-box">{currentStep.takeawayUk}</div>
        ) : null}

        {hintLevel > 0 ? (
          <div className="hint-box">
            {currentStep.hintLevels
              .slice(0, hintLevel)
              .map((hint) => hint.uk)
              .join(" ")}
          </div>
        ) : null}

        <div className="action-row" style={{ marginTop: "1rem" }}>
          {!stepProgress.completed ? (
            <button className="secondary" onClick={useHint} type="button">
              Підказка {hintLevel + 1}
            </button>
          ) : null}
          {stepProgress.completed ? (
            <button onClick={advance} type="button">
              {stepIndex === task.steps.length - 1 ? "Завершити задачу" : "Далі"}
            </button>
          ) : null}
        </div>
        <p className="subtle" style={{ marginTop: "1rem" }}>
          Спроба: {stepProgress.attemptsCount} · Підказки: {stepProgress.hintsUsed} ·
          Переклади: {stepProgress.translationUsage}
        </p>
      </section>
    </div>
  );
}
