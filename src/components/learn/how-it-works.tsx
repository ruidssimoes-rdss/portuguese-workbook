"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function HowItWorks() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#F7F7F5] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-5 py-3.5 hover:border-[rgba(0,0,0,0.12)] transition-colors cursor-pointer"
      >
        <div>
          <p className="text-[13px] font-medium text-[#111111] text-left">Como funcionam as lições</p>
          <p className="text-[11px] text-[#9B9DA3] text-left">How lessons work</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-[#9B9DA3] transition-transform duration-150 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 bg-[#F7F7F5] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-5 py-4 space-y-3 text-[13px] text-[#6C6B71] leading-relaxed">
          <p>Each lesson is generated for you based on what you need to learn next. No two lessons are the same.</p>
          <p>Every lesson includes:</p>
          <ul className="space-y-1.5 ml-1">
            <li className="flex gap-2"><span className="text-[#9B9DA3]">·</span> New vocabulary, verbs, and grammar to learn</li>
            <li className="flex gap-2"><span className="text-[#9B9DA3]">·</span> Practice exercises on what you just learned</li>
            <li className="flex gap-2"><span className="text-[#9B9DA3]">·</span> Review of things you&apos;ve seen before</li>
            <li className="flex gap-2"><span className="text-[#9B9DA3]">·</span> Spot-checks on content you&apos;ve already mastered</li>
          </ul>
          <p>
            You need <span className="font-medium text-[#111111]">80%</span> to pass each lesson.
            As you master more content, the next CEFR level unlocks at <span className="font-medium text-[#111111]">75%</span> readiness.
          </p>
          <p>
            Use <span className="font-medium text-[#111111]">Review</span> to revisit items you&apos;re struggling with — the system tracks what needs attention.
          </p>
        </div>
      )}
    </div>
  );
}
