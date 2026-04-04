import { useEffect, useState } from "react";
import type { AppProgress, Tutorial } from "@/lib/types";
import {
  STORAGE_KEY,
  computeAggregatedStats,
  mergeStorageProgress
} from "@/lib/progress";

type Props = {
  tutorial: Tutorial;
};

export default function SummaryPanel({ tutorial }: Props) {
  const [progress, setProgress] = useState<AppProgress>(() =>
    mergeStorageProgress(
      typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY)
    )
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setProgress(mergeStorageProgress(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  const tutorialProgress = progress.tutorials[tutorial.id];
  const { skills, errors } = computeAggregatedStats(tutorialProgress);
  const completedAvailableCount = tutorial.tasks.filter(
    (task) => task.available && tutorialProgress?.tasks[task.id]?.completed
  ).length;
  const totalAttempts = Object.values(tutorialProgress?.tasks || {}).reduce(
    (sum, taskProgress) =>
      sum +
      Object.values(taskProgress.stepStates).reduce(
        (stepSum, stepState) => stepSum + stepState.attemptsCount,
        0
      ),
    0
  );

  return (
    <div className="split">
      <section className="panel summary-card">
        <h2>Підсумок tutorial</h2>
        <p>
          Seed content currently covers {tutorial.seedTaskCount} tasks out of {tutorial.taskCount}.
        </p>
        <div className="status-box">
          Завершено задач: {completedAvailableCount} / {tutorial.seedTaskCount}
          <br />
          Усього спроб кроків: {totalAttempts}
        </div>
        <div className="action-row" style={{ marginTop: "1rem" }}>
          <a className="button" href="/review">
            Відкрити Mistake Review
          </a>
          <a className="button secondary" href="/tutorials">
            До вибору tutorial
          </a>
        </div>
      </section>

      <section className="panel summary-card">
        <h3>Слабкі навички</h3>
        {skills.length === 0 ? (
          <p>Ще немає достатньо даних. Пройди хоча б одну seed-задачу.</p>
        ) : (
          <ul>
            {skills.slice(0, 6).map((skill) => (
              <li key={skill.id}>
                {skill.id}: {skill.incorrect} помилок, {skill.hintUsage} підказок
              </li>
            ))}
          </ul>
        )}

        <h3>Типові помилки</h3>
        {errors.length === 0 ? (
          <p>Помилки ще не зібрані.</p>
        ) : (
          <ul>
            {errors.slice(0, 6).map((error) => (
              <li key={error.id}>
                {error.id}: {error.incorrect} хибних виборів
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
