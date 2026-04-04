"use client";

import { useReducer, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuizProgressBar from "./QuizProgressBar";
import QuizCard from "./QuizCard";
import QuizContactStep from "./QuizContactStep";
import { trackQuizStart, trackQuizStep, trackQuizAbandoned } from "@/lib/quiz/quiz-analytics";

// ─── Exported types (consumed by Plan 05-02 and 05-03) ───

export type QuestionOption = {
  id: string;
  label: { en: string; he: string };
  icon?: string;
  image?: string;
  nextQuestionId?: string; // branching override
};

export type Question = {
  id: string;
  text: { en: string; he: string };
  subtitle?: { en: string; he: string };
  type: "single-choice" | "city-select" | "contact" | "text-inputs";
  options?: QuestionOption[];
  defaultNextId?: string;
};

export type QuizState = {
  currentQuestionId: string;
  answers: Record<string, string>;
  direction: 1 | -1;
  sessionId: string;
  history: string[]; // stack of visited question IDs for back navigation
  contactInfo: { name: string; email: string; phone: string } | null;
};

// ─── Reducer ───

type Action =
  | { type: "ANSWER"; questionId: string; answerId: string; nextQuestionId: string }
  | { type: "BACK" }
  | { type: "SET_CONTACT"; contactInfo: { name: string; email: string; phone: string } }
  | { type: "RESTORE"; state: QuizState }
  | { type: "RESET"; initialQuestionId: string; sessionId: string };

function quizReducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case "ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answerId },
        history: [...state.history, state.currentQuestionId],
        currentQuestionId: action.nextQuestionId,
        direction: 1,
      };
    case "BACK": {
      const prev = state.history[state.history.length - 1];
      if (!prev) return state;
      return {
        ...state,
        currentQuestionId: prev,
        history: state.history.slice(0, -1),
        direction: -1,
      };
    }
    case "SET_CONTACT":
      return { ...state, contactInfo: action.contactInfo };
    case "RESTORE":
      return action.state;
    case "RESET":
      return {
        currentQuestionId: action.initialQuestionId,
        answers: {},
        direction: 1,
        sessionId: action.sessionId,
        history: [],
        contactInfo: null,
      };
    default:
      return state;
  }
}

// ─── Slide variants ───

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

// ─── TextInputsStep (for workshop-details step) ───

interface TextInputsStepProps {
  question: Question;
  locale: string;
  onSubmit: (values: Record<string, string>) => void;
}

function TextInputsStep({ question, locale, onSubmit }: TextInputsStepProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const submitLabel = locale === "he" ? "המשך →" : "Continue →";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {question.options?.map((field) => {
        const label = locale === "he" ? field.label.he : field.label.en;
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-sm text-neutral-300 font-medium">{label}</label>
            <textarea
              rows={3}
              value={values[field.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 text-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-neutral-500"
              placeholder={label}
            />
          </div>
        );
      })}
      <button
        type="submit"
        className="mt-2 w-full bg-pink-500 hover:bg-pink-400 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  );
}

// ─── Props ───

interface QuizEngineProps {
  questions: Question[];
  quizType: "challenge" | "workshop";
  onComplete: (state: QuizState) => void;
  storageKey?: string;
  locale?: string;
  /** Optional callback fired on each step answer — sessionId, questionId, answerId */
  onStepAnswer?: (sessionId: string, questionId: string, answerId: string) => void;
}

const BACK_LABEL = { en: "Back", he: "חזור" };

export default function QuizEngine({
  questions,
  quizType,
  onComplete,
  storageKey,
  locale = "en",
  onStepAnswer,
}: QuizEngineProps) {
  const firstQuestion = questions[0];
  const isRestored = useRef(false);

  const initialState: QuizState = {
    currentQuestionId: firstQuestion?.id ?? "",
    answers: {},
    direction: 1,
    sessionId: "",
    history: [],
    contactInfo: null,
  };

  const [state, dispatch] = useReducer(quizReducer, initialState);

  // Mount: restore from localStorage or generate fresh sessionId + fire trackQuizStart
  useEffect(() => {
    if (isRestored.current) return;
    isRestored.current = true;

    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed: QuizState = JSON.parse(saved);
          dispatch({ type: "RESTORE", state: parsed });
          return;
        }
      } catch {
        // Ignore parse errors — start fresh
      }
    }

    const sessionId = crypto.randomUUID();
    dispatch({ type: "RESET", initialQuestionId: firstQuestion?.id ?? "", sessionId });
    trackQuizStart(quizType, sessionId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    if (!storageKey || !state.sessionId) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Quota exceeded — ignore
    }
  }, [state, storageKey]);

  // Track quiz abandonment on page unload (ref avoids listener churn per question)
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const handleUnload = () => {
      const { sessionId, currentQuestionId } = stateRef.current;
      if (sessionId && currentQuestionId !== "contact") {
        trackQuizAbandoned(quizType, currentQuestionId, sessionId);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [quizType]);

  const currentQuestion = questions.find((q) => q.id === state.currentQuestionId);

  if (!currentQuestion) return null;

  // RTL direction detection
  const isRtl =
    typeof document !== "undefined"
      ? document.documentElement.dir === "rtl"
      : locale === "he";
  const rtlDir = (isRtl ? -state.direction : state.direction) as 1 | -1;

  const totalSteps = questions.length;
  const currentStep = Math.min(
    questions.findIndex((q) => q.id === state.currentQuestionId) + 1,
    totalSteps,
  );

  const handleAnswer = (option: QuestionOption) => {
    const nextId =
      option.nextQuestionId ?? currentQuestion.defaultNextId ?? "";
    dispatch({
      type: "ANSWER",
      questionId: currentQuestion.id,
      answerId: option.id,
      nextQuestionId: nextId,
    });
    trackQuizStep(currentQuestion.id, currentQuestion.id, option.id);
    onStepAnswer?.(state.sessionId, currentQuestion.id, option.id);

    // If no next question, the quiz is done
    if (!nextId || !questions.find((q) => q.id === nextId)) {
      const finalState: QuizState = {
        ...state,
        answers: { ...state.answers, [currentQuestion.id]: option.id },
      };
      onComplete(finalState);
    }
  };

  const handleContact = (info: { name: string; email: string; phone: string }) => {
    dispatch({ type: "SET_CONTACT", contactInfo: info });
    onComplete({ ...state, contactInfo: info });
  };

  const backLabel = locale === "he" ? BACK_LABEL.he : BACK_LABEL.en;
  const questionText =
    locale === "he"
      ? currentQuestion.text.he
      : currentQuestion.text.en;
  const questionSubtitle =
    currentQuestion.subtitle
      ? locale === "he"
        ? currentQuestion.subtitle.he
        : currentQuestion.subtitle.en
      : null;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
      <QuizProgressBar current={currentStep} total={totalSteps} />

      <div className="relative overflow-hidden min-h-[340px]">
        <AnimatePresence custom={rtlDir} mode="wait">
          <motion.div
            key={state.currentQuestionId}
            custom={rtlDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {/* Question header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white leading-snug">{questionText}</h2>
              {questionSubtitle && (
                <p className="mt-1.5 text-sm text-neutral-400">{questionSubtitle}</p>
              )}
            </div>

            {/* Question body */}
            {currentQuestion.type === "contact" ? (
              <QuizContactStep onSubmit={handleContact} locale={locale} />
            ) : currentQuestion.type === "text-inputs" ? (
              <TextInputsStep
                question={currentQuestion}
                locale={locale}
                onSubmit={(values) => {
                  // Each field's value stored individually, then advance
                  const nextId = currentQuestion.defaultNextId ?? "";
                  // Store all field values under their option IDs
                  let updatedState = state;
                  for (const [key, val] of Object.entries(values)) {
                    updatedState = quizReducer(updatedState, {
                      type: "ANSWER",
                      questionId: key,
                      answerId: val,
                      nextQuestionId: nextId,
                    });
                  }
                  // We need to dispatch all at once — dispatch a synthetic action
                  dispatch({
                    type: "ANSWER",
                    questionId: currentQuestion.id,
                    answerId: JSON.stringify(values),
                    nextQuestionId: nextId,
                  });
                  if (!nextId || !questions.find((q) => q.id === nextId)) {
                    onComplete({ ...state, answers: { ...state.answers, [currentQuestion.id]: JSON.stringify(values) } });
                  }
                }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options?.map((option) => (
                  <QuizCard
                    key={option.id}
                    option={option}
                    onSelect={() => handleAnswer(option)}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back button */}
      {state.history.length > 0 && (
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          className="mt-2 text-sm text-neutral-400 hover:text-white transition-colors self-start"
        >
          ← {backLabel}
        </button>
      )}
    </div>
  );
}
