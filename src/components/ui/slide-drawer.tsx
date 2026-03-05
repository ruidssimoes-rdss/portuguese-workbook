"use client";

import { type ReactNode } from "react";

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Optional content to show in header next to close (e.g. "Saved" label) */
  headerExtra?: ReactNode;
  /** Accessibility label for the dialog */
  ariaLabel?: string;
}

export function SlideDrawer({
  isOpen,
  onClose,
  title,
  children,
  headerExtra,
  ariaLabel = "Drawer",
}: SlideDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-lg bg-white shadow-xl flex flex-col max-h-full animate-slide-in-right"
        role="dialog"
        aria-label={ariaLabel}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center gap-2">
            {headerExtra}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>
  );
}
