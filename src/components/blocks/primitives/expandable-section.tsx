"use client";

import { useState } from "react";

interface ExpandableSectionProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
}

export function ExpandableSection({ trigger, children, defaultOpen = false, onToggle, className }: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
  };

  return (
    <div className={className}>
      <button type="button" onClick={toggle} className="w-full text-left cursor-pointer flex items-center justify-between">
        <div className="flex-1">{trigger}</div>
        <svg
          className={`w-4 h-4 text-[#9B9DA3] transition-transform duration-200 shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`expandable-content ${open ? "is-open" : ""}`}>
        <div className="expandable-inner">{children}</div>
      </div>
    </div>
  );
}

/** Controlled expandable — parent manages open state */
export function ControlledExpandable({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div className={`expandable-content ${open ? "is-open" : ""}`}>
      <div className="expandable-inner">{children}</div>
    </div>
  );
}
