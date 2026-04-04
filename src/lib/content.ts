import tutorialA from "@/content/tutorials/tutorial-a.json";
import tutorialB from "@/content/tutorials/tutorial-b.json";
import reviewTasks from "@/content/tutorials/review-tasks.json";
import type { ReviewTask, Tutorial, TutorialTask } from "@/lib/types";

const tutorials = [tutorialA, tutorialB] as Tutorial[];
const reviewPool = reviewTasks as ReviewTask[];

export function getTutorials(): Tutorial[] {
  return tutorials;
}

export function getTutorialById(tutorialId: string): Tutorial | undefined {
  return tutorials.find((tutorial) => tutorial.id === tutorialId);
}

export function getTutorialTask(
  tutorialId: string,
  taskNumber: number
): TutorialTask | undefined {
  return getTutorialById(tutorialId)?.tasks.find(
    (task) => task.taskNumber === taskNumber
  );
}

export function getReviewPool(): ReviewTask[] {
  return reviewPool;
}
