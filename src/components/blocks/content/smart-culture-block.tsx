"use client";

import { PronunciationButton, ControlledExpandable, CopyButton } from "../primitives";
import { patterns, cefrBadgeClasses } from "@/lib/design-tokens";

// ── Types ────────────────────────────────────────────────

type CultureCardType = "saying" | "false-friend" | "etiquette" | "regional";

export interface SmartCultureBlockData {
  id: string;
  cefr?: string;
  // Saying
  expression?: string;
  meaning?: string;
  literal?: string;
  usage?: string;
  theme?: string;
  example?: string;
  exampleTranslation?: string;
  // False Friend
  portuguese?: string;
  looksLike?: string;
  actualMeaning?: string;
  correctWord?: string;
  falseExample?: string;
  falseExampleTranslation?: string;
  falseTip?: string;
  // Etiquette
  title?: string;
  titlePt?: string;
  description?: string;
  category?: string;
  doThis?: string;
  avoidThis?: string;
  // Regional
  region?: string;
  pronunciation?: string;
  standardAlternative?: string;
  regionalExample?: string;
  regionalExampleTranslation?: string;
}

interface SmartCultureBlockProps {
  data: SmartCultureBlockData;
  type: CultureCardType;
  isExpanded?: boolean;
  onToggle?: () => void;
  isHighlighted?: boolean;
  className?: string;
}

// ── Badge color maps ────────────────────────────────────

const THEME_COLORS: Record<string, string> = {
  life: "text-emerald-700 bg-emerald-50",
  wisdom: "text-blue-700 bg-blue-50",
  patience: "text-amber-700 bg-amber-50",
  character: "text-violet-700 bg-violet-50",
  relationships: "text-pink-700 bg-pink-50",
  food: "text-orange-700 bg-orange-50",
  weather: "text-sky-700 bg-sky-50",
  money: "text-emerald-700 bg-emerald-50",
  work: "text-blue-700 bg-blue-50",
  humor: "text-rose-700 bg-rose-50",
};

const REGION_COLORS: Record<string, string> = {
  lisbon: "text-yellow-700 bg-yellow-50",
  porto: "text-blue-700 bg-blue-50",
  north: "text-emerald-700 bg-emerald-50",
  algarve: "text-orange-700 bg-orange-50",
  azores: "text-cyan-700 bg-cyan-50",
  madeira: "text-blue-700 bg-blue-50",
};

const ETIQUETTE_COLORS: Record<string, string> = {
  greetings: "text-violet-700 bg-violet-50",
  dining: "text-amber-700 bg-amber-50",
  social: "text-sky-700 bg-sky-50",
  shopping: "text-emerald-700 bg-emerald-50",
  daily: "text-rose-700 bg-rose-50",
};

function regionLabel(region: string): string {
  const map: Record<string, string> = { lisbon: "Lisboa", porto: "Porto", north: "North", algarve: "Algarve", azores: "Azores", madeira: "Madeira" };
  return map[region] ?? region;
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Saying Card ─────────────────────────────────────────

function SayingCard({ data, isExpanded, onToggle, isHighlighted }: SmartCultureBlockProps) {
  return (
    <div onClick={onToggle} className={`${patterns.card.interactive} cursor-pointer ${isHighlighted ? "url-highlight" : ""}`} role="button" tabIndex={0}>
      <article id={data.id}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] font-semibold italic text-[#111827] leading-snug">&quot;{data.expression}&quot;</p>
          <Chevron expanded={!!isExpanded} />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {data.expression && <PronunciationButton text={data.expression} size="sm" />}
          {data.cefr && <span className={`${patterns.badge} ${cefrBadgeClasses(data.cefr)}`}>{data.cefr}</span>}
          {data.theme && <span className={`${patterns.badge} ${THEME_COLORS[data.theme] ?? "text-[#6B7280] bg-[#F3F4F6]"}`}>{data.theme}</span>}
        </div>
        <p className="mt-3 text-sm text-[#6B7280]">{data.meaning}</p>

        <ControlledExpandable open={!!isExpanded}>
          <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-3">
            <div className="bg-[#FAFAFA] rounded-lg p-3 space-y-2">
              {data.literal && <div><p className="text-xs font-semibold text-[#6B7280]">Literal:</p><p className="text-sm text-[#6B7280]">{data.literal}</p></div>}
              {data.usage && <div><p className="text-xs font-semibold text-[#6B7280]">When to use:</p><p className="text-sm text-[#6B7280]">{data.usage}</p></div>}
              {data.example && (
                <div className="pt-2 border-t border-[#E5E7EB]">
                  <p className="text-sm text-[#111827] italic">{data.example}</p>
                  {data.exampleTranslation && <p className="text-sm text-[#6B7280] mt-1">{data.exampleTranslation}</p>}
                </div>
              )}
            </div>
            {data.expression && (
              <div className="flex justify-end"><CopyButton text={data.expression} /></div>
            )}
          </div>
        </ControlledExpandable>
      </article>
    </div>
  );
}

// ── False Friend Card ───────────────────────────────────

function FalseFriendCard({ data, isExpanded, onToggle, isHighlighted }: SmartCultureBlockProps) {
  return (
    <div onClick={onToggle} className={`${patterns.card.interactive} cursor-pointer ${isHighlighted ? "url-highlight" : ""}`} role="button" tabIndex={0}>
      <article id={data.id}>
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold text-[#111827] text-base">{data.portuguese}</p>
          <Chevron expanded={!!isExpanded} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          {data.portuguese && <PronunciationButton text={data.portuguese} size="sm" />}
          {data.cefr && <span className={`${patterns.badge} ${cefrBadgeClasses(data.cefr)}`}>{data.cefr}</span>}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-lg bg-emerald-50 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 mb-0.5">Actually means</p>
            <p className="text-sm font-medium text-emerald-800">{data.actualMeaning}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500 mb-0.5">Looks like</p>
            <p className="text-sm font-medium text-red-700 line-through">{data.looksLike}</p>
          </div>
        </div>
        <ControlledExpandable open={!!isExpanded}>
          <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-3">
            {data.correctWord && (
              <p className="text-sm text-[#6B7280]">Correct word for &quot;{data.looksLike}&quot;: <span className="font-medium text-[#374151]">{data.correctWord}</span></p>
            )}
            {data.falseExample && (
              <div className="bg-[#FAFAFA] rounded-lg p-3">
                <p className="text-sm text-[#111827] italic">{data.falseExample}</p>
                {data.falseExampleTranslation && <p className="text-sm text-[#6B7280] mt-1">{data.falseExampleTranslation}</p>}
              </div>
            )}
            {data.falseTip && (
              <div className="bg-[#FFFBEB] rounded-lg p-4 border border-[#FEF3C7]">
                <p className="text-[12px] font-medium text-[#B45309] uppercase tracking-wider mb-1">Tip</p>
                <p className="text-[14px] text-[#92400E] leading-relaxed">{data.falseTip}</p>
              </div>
            )}
          </div>
        </ControlledExpandable>
      </article>
    </div>
  );
}

// ── Etiquette Card ──────────────────────────────────────

function EtiquetteCard({ data, isExpanded, onToggle }: SmartCultureBlockProps) {
  return (
    <div onClick={onToggle} className={`${patterns.card.interactive} cursor-pointer`} role="button" tabIndex={0}>
      <article id={data.id}>
        <div className="flex items-start justify-between gap-3">
          {data.category && <span className={`${patterns.badge} ${ETIQUETTE_COLORS[data.category] ?? "text-[#6B7280] bg-[#F3F4F6]"}`}>{data.category}</span>}
          <Chevron expanded={!!isExpanded} />
        </div>
        <p className="font-bold text-[#111827] mt-2">{data.title}</p>
        {data.titlePt && <p className="text-sm text-[#6B7280] italic mt-0.5">{data.titlePt}</p>}
        <p className={`mt-3 text-sm text-[#6B7280] ${isExpanded ? "" : "line-clamp-2"}`}>{data.description}</p>
        <ControlledExpandable open={!!isExpanded}>
          <div className="mt-4 pt-4 border-t border-[#F3F4F6] grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.doThis && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-emerald-700 mb-1">Do:</p>
                <p className="text-sm text-emerald-800">{data.doThis}</p>
              </div>
            )}
            {data.avoidThis && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-500 mb-1">Avoid:</p>
                <p className="text-sm text-red-700">{data.avoidThis}</p>
              </div>
            )}
          </div>
        </ControlledExpandable>
      </article>
    </div>
  );
}

// ── Regional Card ───────────────────────────────────────

function RegionalCard({ data, isExpanded, onToggle, isHighlighted }: SmartCultureBlockProps) {
  return (
    <div onClick={onToggle} className={`${patterns.card.interactive} cursor-pointer bg-[#FAFBFC] ${isHighlighted ? "url-highlight" : ""}`} role="button" tabIndex={0}>
      <article id={data.id}>
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-[#111827] italic text-[15px]">{data.expression}</p>
          <Chevron expanded={!!isExpanded} />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {data.region && <span className={`${patterns.badge} ${REGION_COLORS[data.region] ?? "text-[#6B7280] bg-[#F3F4F6]"}`}>{regionLabel(data.region)}</span>}
          {data.cefr && <span className={`${patterns.badge} ${cefrBadgeClasses(data.cefr)}`}>{data.cefr}</span>}
          {data.expression && <PronunciationButton text={data.expression} size="sm" />}
        </div>
        <p className="mt-3 text-sm text-[#6B7280]">{data.meaning}</p>
        <ControlledExpandable open={!!isExpanded}>
          <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-3">
            {data.pronunciation && <p className="text-xs text-[#9CA3AF] font-mono">{data.pronunciation}</p>}
            {data.standardAlternative && (
              <p className="text-sm text-[#6B7280]">Standard Portuguese: <span className="font-medium text-[#374151]">{data.standardAlternative}</span></p>
            )}
            {data.regionalExample && (
              <div className="bg-[#FAFAFA] rounded-lg p-3">
                <p className="text-sm text-[#111827] italic">{data.regionalExample}</p>
                {data.regionalExampleTranslation && <p className="text-sm text-[#6B7280] mt-1">{data.regionalExampleTranslation}</p>}
              </div>
            )}
          </div>
        </ControlledExpandable>
      </article>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────

export function SmartCultureBlock(props: SmartCultureBlockProps) {
  switch (props.type) {
    case "saying": return <SayingCard {...props} />;
    case "false-friend": return <FalseFriendCard {...props} />;
    case "etiquette": return <EtiquetteCard {...props} />;
    case "regional": return <RegionalCard {...props} />;
  }
}
