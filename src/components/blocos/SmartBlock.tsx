"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Volume2, Check, X, Copy } from "lucide-react";

// ── Types ────────────────────────────────────────────────

export interface SmartBlockBadge {
  label: string;
  color: "emerald" | "blue" | "amber" | "violet" | "pink" | "neutral";
}

export interface SmartBlockExample {
  pt: string;
  en: string;
}

export interface SmartBlockRule {
  rule: string;
  rulePt?: string;
  examples: SmartBlockExample[];
  tip?: string;
  exception?: string;
}

export interface SmartBlockRelated {
  label: string;
  count: number;
  items?: ReactNode;
}

export interface SmartBlockCrossLink {
  label: string;
  href: string;
}

export interface SmartBlockComparisonLayout {
  correct: { label: string; value: string };
  incorrect: { label: string; value: string };
}

export interface SmartBlockDoAvoidLayout {
  doItems: string[];
  avoidItems: string[];
}

export interface SmartBlockProgressBar {
  value: number;
  label?: string;
}

export interface SmartBlockProps {
  variant?: "default" | "stat";
  title?: string;
  subtitle?: string;
  pronunciation?: string;
  pronunciationText?: string;
  pronunciationButton?: boolean;
  badges?: SmartBlockBadge[];
  description?: string;
  example?: SmartBlockExample;
  examplePronunciation?: boolean;
  numberedRules?: SmartBlockRule[];
  relatedItems?: SmartBlockRelated[];
  tipContent?: string;
  copyText?: string;
  crossLinks?: SmartBlockCrossLink[];
  meta?: string;
  progress?: SmartBlockProgressBar;
  expandable?: boolean;
  isExpanded?: boolean;
  expandedContent?: ReactNode;
  conjugationTable?: ReactNode;
  comparisonLayout?: SmartBlockComparisonLayout;
  doAvoidLayout?: SmartBlockDoAvoidLayout;
  defaultExpanded?: boolean;
  statValue?: string;
  statLabel?: string;
  statTrend?: { direction: "up" | "down" | "flat"; label: string };
  interactive?: boolean;
  href?: string;
  highlightId?: string;
  onExpand?: () => void;
  onCollapse?: () => void;
  className?: string;
}

// ── Badge colors ────────────────────────────────────────

const badgeColorMap: Record<SmartBlockBadge["color"], string> = {
  emerald: "text-emerald-700 bg-emerald-50",
  blue: "text-blue-700 bg-blue-50",
  amber: "text-amber-700 bg-amber-50",
  violet: "text-violet-700 bg-violet-50",
  pink: "text-pink-700 bg-pink-50",
  neutral: "text-[#6B7280] bg-[#F3F4F6]",
};

// ── TTS helper ──────────────────────────────────────────

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-PT";
  u.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find((v) => v.lang === "pt-PT") ?? voices.find((v) => v.lang.startsWith("pt"));
  if (ptVoice) u.voice = ptVoice;
  window.speechSynthesis.speak(u);
}

// ── Sub-components ──────────────────────────────────────

function SmartBlockRuleCard({ rule, index }: { rule: SmartBlockRule; index: number }) {
  const [showException, setShowException] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#003399] text-white text-[12px] font-medium shrink-0 mt-0.5">
          {index}
        </span>
        <div className="flex-1">
          <p className="text-[14px] text-[#111827]">{rule.rule}</p>
          {rule.rulePt && <p className="text-[14px] text-[#9CA3AF] italic mt-0.5">{rule.rulePt}</p>}
        </div>
      </div>

      {rule.examples.map((ex, i) => (
        <div key={i} className="ml-9 pl-3 border-l-2 border-[#F3F4F6]">
          <p className="text-[14px] text-[#111827]">{ex.pt}</p>
          <p className="text-[14px] text-[#9CA3AF] italic">{ex.en}</p>
        </div>
      ))}

      {rule.tip && (
        <div className="ml-9 bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg p-3">
          <p className="text-[13px] text-[#92400E]">{rule.tip}</p>
        </div>
      )}

      {rule.exception && (
        <div className="ml-9">
          <button
            onClick={() => setShowException(!showException)}
            className="text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-150 flex items-center gap-1 cursor-pointer"
          >
            Porquê?
            <ChevronDown size={14} className={`transition-transform duration-200 ${showException ? "rotate-180" : ""}`} />
          </button>
          <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${showException ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <p className="text-[13px] text-[#6B7280] mt-1">{rule.exception}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmartBlockProgress({ progress, className }: { progress: SmartBlockProgressBar; className?: string }) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#003399] rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
        />
      </div>
      {progress.label && <p className="text-[13px] text-[#9CA3AF] text-right">{progress.label}</p>}
    </div>
  );
}

function SmartBlockComparison({ layout }: { layout: SmartBlockComparisonLayout }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="bg-emerald-50 rounded-lg p-4">
        <p className="text-[12px] font-medium text-emerald-700 uppercase tracking-wider mb-1">{layout.correct.label}</p>
        <p className="text-[14px] text-[#111827]">{layout.correct.value}</p>
      </div>
      <div className="bg-red-50 rounded-lg p-4">
        <p className="text-[12px] font-medium text-red-700 uppercase tracking-wider mb-1">{layout.incorrect.label}</p>
        <p className="text-[14px] text-[#111827]">{layout.incorrect.value}</p>
      </div>
    </div>
  );
}

function SmartBlockDoAvoid({ layout }: { layout: SmartBlockDoAvoidLayout }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-2">
        <p className="text-[12px] font-medium text-emerald-700 uppercase tracking-wider">Do</p>
        {layout.doItems.map((item, i) => (
          <p key={i} className="text-[14px] text-[#6B7280] flex items-start gap-2">
            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />{item}
          </p>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-[12px] font-medium text-red-700 uppercase tracking-wider">Avoid</p>
        {layout.avoidItems.map((item, i) => (
          <p key={i} className="text-[14px] text-[#6B7280] flex items-start gap-2">
            <X size={14} className="text-red-500 mt-0.5 shrink-0" />{item}
          </p>
        ))}
      </div>
    </div>
  );
}

function SmartBlockCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-150 flex items-center gap-1 cursor-pointer"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Main SmartBlock ─────────────────────────────────────

export function SmartBlock(props: SmartBlockProps) {
  const {
    variant = "default",
    title, subtitle, pronunciation, pronunciationText, pronunciationButton, badges,
    description, example, numberedRules,
    relatedItems, tipContent, copyText, crossLinks, meta,
    progress,
    expandable, isExpanded: controlledExpanded, expandedContent, conjugationTable, comparisonLayout, doAvoidLayout, defaultExpanded,
    statValue, statLabel, statTrend,
    interactive, href, highlightId, onExpand, onCollapse,
    className,
  } = props;

  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded ?? false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  // URL highlight
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!highlightId) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("highlight") === highlightId) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      ref.current?.classList.add("url-highlight");
      const t = setTimeout(() => ref.current?.classList.remove("url-highlight"), 2000);
      return () => clearTimeout(t);
    }
  }, [highlightId]);

  const shell = `bg-white border border-[#F3F4F6] rounded-xl p-4 md:p-6 group relative ${
    interactive ? "hover:border-[#E5E7EB] hover:shadow-sm hover:-translate-y-[0.5px] transition-all duration-150 cursor-pointer" : ""
  } ${className ?? ""}`;

  // Stat variant
  if (variant === "stat") {
    return (
      <div ref={ref} className={shell}>
        <div className="flex flex-col items-center justify-center text-center py-2">
          {statValue && <p className="text-[28px] font-semibold text-[#111827]">{statValue}</p>}
          {statLabel && <p className="text-[14px] text-[#9CA3AF] mt-1">{statLabel}</p>}
          {statTrend && (
            <p className={`text-[13px] mt-1 ${
              statTrend.direction === "up" ? "text-emerald-600" : statTrend.direction === "down" ? "text-red-500" : "text-[#9CA3AF]"
            }`}>{statTrend.label}</p>
          )}
          {progress && <SmartBlockProgress progress={progress} className="mt-3 w-full" />}
        </div>
      </div>
    );
  }

  // Default variant
  const content = (
    <div ref={ref} className={shell}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && <h3 className="text-[16px] font-medium text-[#111827]">{title}</h3>}
          {subtitle && <p className="text-[14px] text-[#6B7280] mt-0.5">{subtitle}</p>}
          {pronunciation && <p className="text-[13px] font-mono text-[#9CA3AF] italic mt-0.5">{pronunciation}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pronunciationButton && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); speak(pronunciationText || title || ""); }}
              className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-150 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 cursor-pointer"
              aria-label="Play pronunciation"
            >
              <Volume2 size={18} />
            </button>
          )}
          {badges?.map((badge, i) => (
            <span key={i} className={`text-[12px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap ${badgeColorMap[badge.color]}`}>
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      {description && <p className="text-[14px] text-[#6B7280] leading-relaxed mt-4">{description}</p>}

      {example && (
        <div className="bg-[#F9FAFB] rounded-lg p-4 mt-4">
          <p className="text-[14px] text-[#111827]">&ldquo;{example.pt}&rdquo;</p>
          <p className="text-[14px] text-[#9CA3AF] italic mt-1">{example.en}</p>
        </div>
      )}

      {numberedRules && (
        <div className="mt-4 space-y-4">
          {numberedRules.map((rule, i) => (
            <SmartBlockRuleCard key={i} rule={rule} index={i + 1} />
          ))}
        </div>
      )}

      {/* Progress */}
      {progress && <SmartBlockProgress progress={progress} className="mt-4" />}

      {/* Footer */}
      {(relatedItems || tipContent || copyText || crossLinks || meta) && (
        <div className="flex flex-wrap items-center gap-3 mt-4 text-[13px] text-[#9CA3AF]">
          {relatedItems?.map((item, i) => (
            <span key={i} className="hover:text-[#6B7280] transition-colors duration-150">{item.label} ({item.count})</span>
          ))}
          {tipContent && <span className="hover:text-[#6B7280] transition-colors duration-150 cursor-default" title={tipContent}>Tip</span>}
          {copyText && <SmartBlockCopyButton text={copyText} />}
          {crossLinks?.map((link, i) => (
            <Link key={i} href={link.href} className="hover:text-[#6B7280] transition-colors duration-150">{link.label}</Link>
          ))}
          {meta && <span className="ml-auto">{meta}</span>}
        </div>
      )}

      {/* Expand trigger */}
      {expandable && !defaultExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const next = !isExpanded;
            if (controlledExpanded === undefined) setInternalExpanded(next);
            if (next) onExpand?.();
            else onCollapse?.();
          }}
          className="flex items-center justify-between w-full mt-4 pt-3 border-t border-[#F3F4F6] text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-150 cursor-pointer"
        >
          <span>{isExpanded ? "Collapse" : "Expand"}</span>
          <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Expanded content — animated with CSS grid-rows */}
      {(expandedContent || conjugationTable || comparisonLayout || doAvoidLayout) && (
        <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${(isExpanded || defaultExpanded) ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className={!defaultExpanded ? "border-t border-[#F3F4F6] pt-4 mt-4" : "mt-4"}>
              {expandedContent}
              {conjugationTable}
              {comparisonLayout && <SmartBlockComparison layout={comparisonLayout} />}
              {doAvoidLayout && <SmartBlockDoAvoid layout={doAvoidLayout} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}
