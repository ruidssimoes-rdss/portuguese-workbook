"use client";

import React from "react";
import { patterns } from "@/lib/design-tokens";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className={`${patterns.card.base} max-w-[480px] mx-auto my-12 text-center`}>
          <p className="text-[16px] font-semibold text-[#111827]">
            Something went wrong
          </p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className={`${patterns.button.primary} h-9 px-5 mt-4`}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
