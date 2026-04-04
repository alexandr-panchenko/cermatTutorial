import { useEffect, useState } from "react";
import type { AppProgress, ReviewTask, Tutorial } from "@/lib/types";
import {
  STORAGE_KEY,
  mergeStorageProgress,
  pickReviewTasks
} from "@/lib/progress";

type Props = {
  tutorials: Tutorial[];
  reviewPool: ReviewTask[];
};

export default function ReviewPlayer({ tutorials, reviewPool }: Props) {
  const [progress, setProgress] = useState<AppProgress>(() =>
    mergeStorageProgress(
      typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY)
    )
  );
  const [taskIndex, setTaskIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setProgress(mergeStorageProgress(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  const completedTutorial = tutorials.find(
    (tutorial) => progress.tutorials[tutorial.id]?.completed
  );

  if (!completedTutorial) {
    return (
      <section className="panel summary-card">
        <h2>Mistake Review is locked</h2>
        <p>Спочатку заверши хоча б один доступний tutorial seed flow.</p>
        <a className="button" href="/tutorials">
          До tutorial
        </a>
      </section>
    );
  }

  const selection = pickReviewTasks(
    reviewPool,
    completedTutorial,
    progress.tutorials[completedTutorial.id],
    6
  );
  const currentRecommendation = selection[taskIndex];
  const currentTask = currentRecommendation?.task;

  if (!currentTask) {
    return (
      <section className="panel summary-card">
        <h2>Review pool is empty</h2>
      </section>
    );
  }

  const currentStep = currentTask.steps[stepIndex];
  const selectedOption = currentStep.options.find((option) => option.id === selectedOptionId);

  function chooseOption(optionId: string) {
    setSelectedOptionId(optionId);
  }

  function next() {
    if (!selectedOption?.isCorrect) {
      return;
    }
    if (stepIndex < currentTask.steps.length - 1) {
      setStepIndex((current) => current + 1);
      setSelectedOptionId(null);
      setHintLevel(0);
      return;
    }

    if (taskIndex < selection.length - 1) {
      setTaskIndex((current) => current + 1);
      setStepIndex(0);
      setSelectedOptionId(null);
      setHintLevel(0);
      return;
    }

    setTaskIndex(selection.length);
  }

  if (taskIndex >= selection.length) {
    return (
      <section className="panel summary-card">
        <h2>Review complete</h2>
        <div className="takeaway-box">
          Тепер у тебе є короткий набір вправ саме по слабких місцях.
        </div>
        <div className="action-row" style={{ marginTop: "1rem" }}>
          <a className="button" href="/tutorials">
            Знову до tutorial
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="panel step-card">
      <div className="meta-row">
        <span className="pill">
          Review {taskIndex + 1} / {selection.length}
        </span>
        <span className="pill">{currentTask.reviewSkill}</span>
      </div>
      {(currentRecommendation.matchedSkills.length > 0 ||
        currentRecommendation.matchedErrors.length > 0 ||
        currentRecommendation.matchedTaskNumbers.length > 0) ? (
        <div className="status-box">
          Підібрано через:
          {currentRecommendation.matchedSkills.length > 0
            ? ` навички ${currentRecommendation.matchedSkills.join(", ")}.`
            : ""}
          {currentRecommendation.matchedErrors.length > 0
            ? ` типові помилки ${currentRecommendation.matchedErrors.join(", ")}.`
            : ""}
          {currentRecommendation.matchedTaskNumbers.length > 0
            ? ` пов'язані задачі tutorial: ${currentRecommendation.matchedTaskNumbers.join(", ")}.`
            : ""}
        </div>
      ) : null}
      <h2>{currentTask.prompt.cs}</h2>
      <p>{currentTask.introUk}</p>
      <div className="status-box">{currentTask.prompt.uk}</div>
      <h3 style={{ marginTop: "1rem" }}>{currentStep.prompt.cs}</h3>
      <p>{currentStep.prompt.uk}</p>
      <div className="option-list">
        {currentStep.options.map((option) => (
          <button
            className={`option-button ${
              selectedOptionId === option.id
                ? option.isCorrect
                  ? "correct"
                  : "incorrect"
                : ""
            }`}
            key={option.id}
            onClick={() => chooseOption(option.id)}
            type="button"
          >
            {option.cs}
          </button>
        ))}
      </div>
      {selectedOption ? (
        <div className={`feedback-box ${selectedOption.isCorrect ? "correct" : "incorrect"}`}>
          {selectedOption.feedbackUk}
        </div>
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
        {!selectedOption?.isCorrect ? (
          <button
            className="secondary"
            onClick={() => setHintLevel((current) => Math.min(current + 1, currentStep.hintLevels.length))}
            type="button"
          >
            Підказка
          </button>
        ) : null}
        {selectedOption?.isCorrect ? (
          <button onClick={next} type="button">
            {stepIndex === currentTask.steps.length - 1 ? "Наступна review-задача" : "Далі"}
          </button>
        ) : null}
      </div>
      {selectedOption?.isCorrect && stepIndex === currentTask.steps.length - 1 ? (
        <div className="takeaway-box" style={{ marginTop: "1rem" }}>
          {currentTask.finalSummaryUk}
        </div>
      ) : null}
    </section>
  );
}
