import { type Question } from './challenge-questions';

/**
 * Find a question by its ID.
 */
export function getQuestionById(
  questions: Question[],
  id: string,
): Question | undefined {
  return questions.find((q) => q.id === id);
}

/**
 * Determine the ID of the next question to display.
 *
 * Resolution order:
 *   1. The selected option's nextQuestionId (option-level override)
 *   2. The current question's defaultNextId
 *   3. null — quiz is complete (no further step)
 */
export function getNextQuestion(
  questions: Question[],
  currentId: string,
  selectedOptionId: string,
): string | null {
  const current = getQuestionById(questions, currentId);
  if (!current) return null;

  const selectedOption = current.options?.find(
    (opt) => opt.id === selectedOptionId,
  );

  if (selectedOption?.nextQuestionId) {
    return selectedOption.nextQuestionId;
  }

  return current.defaultNextId ?? null;
}

/**
 * Walk the question graph from the first question, following branching paths
 * for questions that already have answers and defaultNextId for future ones.
 * Returns the total number of steps in the resolved path.
 *
 * For the challenge quiz all paths traverse exactly 11 unique steps — this
 * function is used to drive the progress bar so the denominator stays stable.
 */
export function getTotalSteps(
  questions: Question[],
  answers: Record<string, string>,
): number {
  if (questions.length === 0) return 0;

  const startId = questions[0].id;
  const visited = new Set<string>();
  let currentId: string | null = startId;
  let steps = 0;

  while (currentId !== null) {
    if (visited.has(currentId)) break; // guard against cycles
    visited.add(currentId);
    steps += 1;

    const current = getQuestionById(questions, currentId);
    if (!current) break;

    // Terminal step — no further questions
    if (!current.defaultNextId && (!current.options || current.options.length === 0)) {
      break;
    }

    const answeredOption = answers[currentId];
    if (answeredOption) {
      // Follow the branching path the user has taken
      currentId = getNextQuestion(questions, currentId, answeredOption);
    } else {
      // For unanswered future questions, follow defaultNextId
      currentId = current.defaultNextId ?? null;
    }
  }

  return steps;
}
