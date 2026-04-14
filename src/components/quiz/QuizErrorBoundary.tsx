"use client";

import { Component, type ReactNode } from "react";
import { trackQuizError } from "@/lib/quiz/quiz-analytics";

interface Props {
  locale?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class QuizErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    trackQuizError("boundary", error, {
      component_stack: info?.componentStack?.slice(0, 2000),
    });
  }

  handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isHe = this.props.locale === "he";
    return (
      <div className="w-full max-w-lg mx-auto p-6 text-center" dir={isHe ? "rtl" : "ltr"}>
        <h2 className="text-xl font-bold text-white mb-3">
          {isHe ? "משהו השתבש" : "Something went wrong"}
        </h2>
        <p className="text-neutral-400 text-sm mb-5">
          {isHe
            ? "נסו לטעון מחדש. אם זה ממשיך, כתבו לנו בוואטסאפ."
            : "Please try reloading. If it keeps happening, message us on WhatsApp."}
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="bg-brand text-black px-6 py-3 font-black uppercase tracking-widest"
        >
          {isHe ? "טען מחדש" : "Reload"}
        </button>
      </div>
    );
  }
}
