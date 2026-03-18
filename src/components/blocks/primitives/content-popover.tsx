"use client";

import { useState, useEffect, useRef } from "react";

interface ContentPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function ContentPopover({ trigger, children, side = "bottom", className }: ContentPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const positionClasses: Record<string, string> = {
    top: "bottom-full mb-2 left-0",
    bottom: "top-full mt-2 left-0",
    left: "right-full mr-2 top-0",
    right: "left-full ml-2 top-0",
  };

  return (
    <div ref={ref} className={`relative inline-flex ${className ?? ""}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        onMouseEnter={() => {
          if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) setOpen(true);
        }}
        onMouseLeave={() => {
          if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) setOpen(false);
        }}
        className="cursor-pointer"
      >
        {trigger}
      </button>
      {open && (
        <div className={`absolute z-50 w-[280px] bg-white border border-[#E5E7EB] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 fade-in ${positionClasses[side]}`}>
          {children}
        </div>
      )}
    </div>
  );
}
