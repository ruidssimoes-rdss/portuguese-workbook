"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  search,
  type SearchResult,
  type SearchOutput,
  type SmartResultCard,
} from "@/lib/search";
import { PronunciationButton } from "@/components/pronunciation-button";

const DEBOUNCE_MS = 150;
const MIN_QUERY_LENGTH = 2;
const PLACEHOLDER_INTERVAL_MS = 3000;

const placeholders = [
  "Search vocabulary, verbs, grammar...",
  "How do you say \"kitchen\" in Portuguese?",
  "What does \"saudade\" mean?",
  "Conjugate \"ir\" in past tense",
  "SER vs ESTAR",
  "Como se diz \"thank you\"?",
  "How to form questions in Portuguese",
  "What does \"fixe\" mean?",
];

const suggestions = [
  { label: "How do you say...?", fill: "how do you say " },
  { label: "What does ... mean?", fill: "what does " },
  { label: "Conjugate a verb", fill: "conjugate " },
  { label: "SER vs ESTAR", fill: "ser vs estar" },
  { label: "Past tense of...", fill: "past tense of " },
  { label: "Prepositions", fill: "prepositions" },
];

const GROUP_LABELS: Record<SearchResult["type"], string> = {
  vocabulary: "Vocabulário",
  verb: "Verbos",
  conjugation: "Conjugações",
  grammar: "Gramática",
  saying: "Cultura",
};

function groupResults(
  results: SearchResult[]
): Map<SearchResult["type"], SearchResult[]> {
  const map = new Map<SearchResult["type"], SearchResult[]>();
  for (const r of results) {
    const list = map.get(r.type) ?? [];
    list.push(r);
    map.set(r.type, list);
  }
  return map;
}

function typeToBadge(
  type: SearchResult["type"]
): { label: string; className: string } {
  switch (type) {
    case "vocabulary":
      return { label: "Vocabulário", className: "bg-indigo-100 text-indigo-800 border-indigo-200" };
    case "verb":
      return { label: "Verbos", className: "bg-purple-100 text-purple-800 border-purple-200" };
    case "conjugation":
      return { label: "Conjugações", className: "bg-violet-100 text-violet-800 border-violet-200" };
    case "grammar":
      return { label: "Gramática", className: "bg-slate-100 text-slate-800 border-slate-200" };
    case "saying":
      return { label: "Cultura", className: "bg-amber-100 text-amber-800 border-amber-200" };
  }
}

function getSmartCardHref(card: SmartResultCard): string {
  switch (card.type) {
    case "translation":
    case "definition":
      return card.primary.href;
    case "conjugation":
    case "tense":
      return card.href;
    case "conjugation_multi":
    case "tense_multi":
      return card.verbs[0]?.href ?? "#";
    case "comparison":
    case "grammar":
      return card.topic.href;
  }
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [output, setOutput] = useState<SearchOutput | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderFading, setPlaceholderFading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = output?.results ?? [];
  const smartCard = output?.smartCard ?? null;
  const flatItems = useMemo(() => {
    if (smartCard) {
      return [
        { href: getSmartCardHref(smartCard) },
        ...results.map((r) => ({ href: r.href })),
      ];
    }
    return results.map((r) => ({ href: r.href }));
  }, [smartCard, results]);
  const totalSelectable = flatItems.length;

  // Debounce query
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, open]);

  // Run search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setOutput(null);
      setHighlightedIndex(0);
      return;
    }
    const out = search(debouncedQuery);
    setOutput(out);
    setHighlightedIndex(0);
  }, [debouncedQuery]);

  // Rotating placeholder (only when input empty and modal open)
  useEffect(() => {
    if (!open || query.length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderFading(true);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % placeholders.length);
        setPlaceholderFading(false);
      }, 200);
    }, PLACEHOLDER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [open, query.length]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setOutput(null);
      setHighlightedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector(`[data-index="${highlightedIndex}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedIndex]);

  const grouped = groupResults(results);

  const handleSelectHref = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      onClose();
      router.push(result.href);
    },
    [onClose, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => (i + 1) % Math.max(1, totalSelectable));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => (i - 1 + totalSelectable) % Math.max(1, totalSelectable));
        return;
      }
      if (e.key === "Enter") {
        const item = flatItems[highlightedIndex];
        if (item) {
          e.preventDefault();
          handleSelectHref(item.href);
        }
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          setHighlightedIndex((i) => (i - 1 + totalSelectable) % Math.max(1, totalSelectable));
        } else {
          setHighlightedIndex((i) => (i + 1) % Math.max(1, totalSelectable));
        }
      }
    },
    [flatItems, totalSelectable, highlightedIndex, handleSelectHref]
  );

  const handleSuggestionClick = useCallback((fill: string) => {
    setQuery(fill);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(fill.length, fill.length);
    }, 0);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-0 md:items-center md:p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Search"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm hidden md:block"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="relative w-full h-full md:h-auto md:max-w-xl md:max-h-[85vh] md:rounded-lg md:shadow-2xl flex flex-col overflow-hidden animate-modal-in bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 shrink-0">
          <svg
            className="h-5 w-5 shrink-0 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[placeholderIndex]}
            className={`flex-1 min-w-0 py-2.5 text-lg bg-transparent border-none outline-none placeholder:text-gray-400 text-gray-900 transition-opacity duration-200 ${
              placeholderFading ? "placeholder:opacity-0" : "placeholder:opacity-100"
            }`}
            aria-label="Search"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline text-[11px] px-1.5 py-0.5 border border-gray-200 rounded text-gray-500 font-sans">
            Esc
          </kbd>
        </div>

        <div
          ref={listRef}
          className="overflow-y-auto max-h-[60vh] md:max-h-[calc(85vh-56px)] min-h-0"
        >
          {debouncedQuery.length > 0 && debouncedQuery.length < MIN_QUERY_LENGTH && (
            <p className="px-4 py-3 text-sm text-gray-500">Type at least 2 characters to search.</p>
          )}

          {debouncedQuery.length === 0 && query.length === 0 && (
            <div className="px-4 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Ask me anything
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => handleSuggestionClick(s.fill)}
                    className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-600 hover:bg-[#5B4FA0]/10 hover:text-[#5B4FA0] transition-colors cursor-pointer text-left"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {debouncedQuery.length >= MIN_QUERY_LENGTH && results.length === 0 && !smartCard && (
            <p className="px-4 py-3 text-sm text-gray-500">No results found.</p>
          )}

          {smartCard && (
            <div className="px-4 pt-3">
              <button
                type="button"
                data-index={0}
                onClick={() => handleSelectHref(getSmartCardHref(smartCard))}
                onMouseEnter={() => setHighlightedIndex(0)}
                className={`w-full text-left rounded-lg p-4 mb-4 border transition-all duration-200 bg-[#5B4FA0]/5 border-[#5B4FA0]/20 hover:border-[#5B4FA0]/40 ${
                  highlightedIndex === 0 ? "ring-2 ring-[#5B4FA0]/30" : ""
                }`}
              >
                <SmartCardContent card={smartCard} onSelectHref={handleSelectHref} />
              </button>
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="px-4 pt-2 pb-1 text-[12px] text-gray-500">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              <div className="pb-2">
                {Array.from(grouped.entries()).map(([type, list]) => (
                  <div key={type} className="mb-2">
                    <div className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <span>{GROUP_LABELS[type]}</span>
                      <span>({list.length})</span>
                    </div>
                    {list.map((r) => {
                      const idx = results.indexOf(r);
                      const globalIdx = smartCard ? idx + 1 : idx;
                      const isHighlighted = globalIdx === highlightedIndex;
                      return (
                        <button
                          key={`${r.type}-${r.href}-${r.title}`}
                          type="button"
                          data-index={globalIdx}
                          onClick={() => handleSelectResult(r)}
                          onMouseEnter={() => setHighlightedIndex(globalIdx)}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                            isHighlighted ? "bg-[#5B4FA0]/10" : "hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`shrink-0 inline-flex px-1.5 py-[2px] rounded border text-[10px] font-medium ${typeToBadge(r.type).className}`}
                          >
                            {typeToBadge(r.type).label}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900">{r.title}</span>
                            <span className="text-gray-500 text-[13px] ml-1.5">{r.subtitle}</span>
                          </span>
                                          {r.type === "vocabulary" && (
                            <span className="shrink-0" onClick={(e) => e.stopPropagation()}>
                              <PronunciationButton text={r.title} size="sm" />
                            </span>
                          )}
                          <svg
                            className="h-4 w-4 shrink-0 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SmartCardContent({
  card,
  onSelectHref,
}: {
  card: SmartResultCard;
  onSelectHref: (href: string) => void;
}) {
  const intentLabel = (() => {
    switch (card.type) {
      case "translation":
        return "Translation";
      case "definition":
        return "Definition";
      case "conjugation":
      case "conjugation_multi":
        return "Conjugation";
      case "tense":
      case "tense_multi":
        return card.type === "tense" ? (card.tenseLabel ?? "Tense") : card.tenseLabel;
      case "comparison":
      case "grammar":
        return "Grammar";
    }
  })();

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#5B4FA0]/60 mb-2">
        {intentLabel}
      </p>
      {card.type === "translation" && (
        <>
          <p className="text-sm text-gray-900">
            &quot;{card.query}&quot; → {card.primary.title}
          </p>
          {card.primary.pronunciation && (
            <p className="text-xs text-gray-500 mt-0.5">{card.primary.pronunciation}</p>
          )}
          {card.primary.meta?.categoryTitlePt && card.primary.meta?.categoryTitle && (
            <p className="text-xs text-gray-500 mt-0.5">
              {card.primary.meta.categoryTitlePt} · {card.primary.meta.categoryTitle}
            </p>
          )}
          <p className="text-xs text-[#5B4FA0]/70 mt-2">Click to see full entry</p>
        </>
      )}
      {card.type === "definition" && (
        <>
          <p className="text-sm text-gray-900">
            {card.primary.title} — {card.primary.subtitle}
          </p>
          {card.primary.pronunciation && (
            <p className="text-xs text-gray-500 mt-0.5">{card.primary.pronunciation}</p>
          )}
          {card.primary.meta?.categoryTitlePt && card.primary.meta?.categoryTitle && (
            <p className="text-xs text-gray-500 mt-0.5">
              {card.primary.meta.categoryTitlePt} · {card.primary.meta.categoryTitle}
            </p>
          )}
          {card.primary.meta?.example && (
            <p className="text-xs text-gray-500 mt-1">
              Example: {card.primary.meta.example} — {card.primary.meta.exampleTranslation}
            </p>
          )}
          <p className="text-xs text-[#5B4FA0]/70 mt-2">Click to see full entry</p>
        </>
      )}
      {card.type === "conjugation" && (
        <>
          <p className="text-sm font-semibold text-gray-900">
            {card.infinitive} — {card.english}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {card.group} · {card.cefr}
          </p>
          <p className="text-xs text-gray-600 mt-1">{card.presentPreview}</p>
          <p className="text-xs text-[#5B4FA0]/70 mt-2">View all conjugations</p>
        </>
      )}
      {card.type === "tense" && (
        <>
          <p className="text-sm font-semibold text-gray-900">
            {card.infinitive} — {card.tenseLabel}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {card.conjugations.join(" · ")}
          </p>
          <p className="text-xs text-[#5B4FA0]/70 mt-2">View full conjugation table</p>
        </>
      )}
      {card.type === "conjugation_multi" && (
        <>
          <p className="text-sm text-gray-900 mb-2">&quot;{card.query}&quot; — more than one verb:</p>
          <ul className="space-y-2">
            {card.verbs.map((v) => (
              <li key={v.infinitive}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHref(v.href);
                  }}
                  className="block w-full text-left rounded px-2 py-1.5 hover:bg-[#5B4FA0]/10 text-sm font-semibold text-gray-900"
                >
                  {v.infinitive} — {v.english}
                </button>
                <p className="text-xs text-gray-500 ml-2">{v.group} · {v.cefr}</p>
                <p className="text-xs text-gray-600 ml-2">{v.presentPreview}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#5B4FA0]/70 mt-2">Click a verb to view conjugations</p>
        </>
      )}
      {card.type === "tense_multi" && (
        <>
          <p className="text-sm text-gray-900 mb-2">&quot;{card.query}&quot; — {card.tenseLabel}:</p>
          <ul className="space-y-2">
            {card.verbs.map((v) => (
              <li key={v.infinitive}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHref(v.href);
                  }}
                  className="block w-full text-left rounded px-2 py-1.5 hover:bg-[#5B4FA0]/10 text-sm font-semibold text-gray-900"
                >
                  {v.infinitive}
                </button>
                <p className="text-xs text-gray-600 ml-2">{v.conjugations.join(" · ")}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[#5B4FA0]/70 mt-2">Click a verb to view full table</p>
        </>
      )}
      {(card.type === "comparison" || card.type === "grammar") && (
        <>
          <p className="text-sm font-semibold text-gray-900">{card.topic.title}</p>
          {card.topic.meta?.summary && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{card.topic.meta.summary}</p>
          )}
          <p className="text-xs text-[#5B4FA0]/70 mt-2">Read full explanation</p>
        </>
      )}
    </>
  );
}
