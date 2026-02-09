"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { search, type SearchResult } from "@/lib/search";

const DEBOUNCE_MS = 150;
const MIN_QUERY_LENGTH = 2;

type BadgeLabel = "VOC" | "VERB" | "CONJ" | "GRAM";

function groupResults(results: SearchResult[]): Map<SearchResult["type"], SearchResult[]> {
  const map = new Map<SearchResult["type"], SearchResult[]>();
  for (const r of results) {
    const list = map.get(r.type) ?? [];
    list.push(r);
    map.set(r.type, list);
  }
  return map;
}

function typeToBadge(type: SearchResult["type"]): { label: BadgeLabel; className: string } {
  switch (type) {
    case "vocabulary":
      return { label: "VOC", className: "bg-indigo-100 text-indigo-800 border-indigo-200" };
    case "verb":
      return { label: "VERB", className: "bg-purple-100 text-purple-800 border-purple-200" };
    case "conjugation":
      return { label: "CONJ", className: "bg-violet-100 text-violet-800 border-violet-200" };
    case "grammar":
      return { label: "GRAM", className: "bg-slate-100 text-slate-800 border-slate-200" };
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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounce query
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, open]);

  // Run search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setHighlightedIndex(0);
      return;
    }
    const list = search(debouncedQuery);
    setResults(list);
    setHighlightedIndex(0);
  }, [debouncedQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
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

  const flatResults = results;
  const grouped = groupResults(results);

  const handleSelect = useCallback(
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
        setHighlightedIndex((i) => (i + 1) % Math.max(1, flatResults.length));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => (i - 1 + flatResults.length) % Math.max(1, flatResults.length));
        return;
      }
      if (e.key === "Enter") {
        const r = flatResults[highlightedIndex];
        if (r) {
          e.preventDefault();
          handleSelect(r);
        }
        return;
      }
      if (e.key === "Tab") {
        if (e.shiftKey) {
          e.preventDefault();
          setHighlightedIndex((i) => (i - 1 + flatResults.length) % Math.max(1, flatResults.length));
        } else {
          e.preventDefault();
          setHighlightedIndex((i) => (i + 1) % Math.max(1, flatResults.length));
        }
      }
    },
    [flatResults, highlightedIndex, onClose, handleSelect]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-0 md:items-center md:p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Search"
    >
      {/* Backdrop: on desktop only (on mobile modal is full-screen) */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm hidden md:block"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal panel: full-screen on mobile, centered on desktop */}
      <div
        className="relative w-full h-full md:h-auto md:max-w-xl md:max-h-[85vh] md:rounded-lg md:shadow-2xl flex flex-col overflow-hidden animate-modal-in bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border-l px-3 py-2 shrink-0">
          <svg
            className="h-5 w-5 shrink-0 text-text-3"
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
            placeholder="Type to search…"
            className="flex-1 min-w-0 py-2.5 text-lg bg-transparent border-none outline-none placeholder:text-text-3 text-text"
            aria-label="Search"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline text-[11px] px-1.5 py-0.5 border border-border rounded text-text-3 font-sans">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="overflow-y-auto max-h-[60vh] md:max-h-[calc(85vh-56px)] min-h-0"
        >
          {debouncedQuery.length > 0 && debouncedQuery.length < MIN_QUERY_LENGTH && (
            <p className="px-4 py-3 text-sm text-text-3">Type at least 2 characters to search.</p>
          )}
          {debouncedQuery.length >= MIN_QUERY_LENGTH && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-text-3">No results found.</p>
          )}
          {results.length > 0 && (
            <>
              <p className="px-4 pt-2 pb-1 text-[12px] text-text-3">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              <div className="pb-2">
                {Array.from(grouped.entries()).map(([type, list]) => {
                  const { label, className } = typeToBadge(type);
                  return (
                    <div key={type} className="mb-2">
                      <div
                        className={`px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-2 flex items-center gap-2`}
                      >
                        <span className={`inline-flex px-1.5 py-[2px] rounded border ${className}`}>
                          {label}
                        </span>
                        <span>({list.length})</span>
                      </div>
                      {list.map((r) => {
                        const idx = flatResults.indexOf(r);
                        const isHighlighted = idx === highlightedIndex;
                        return (
                          <button
                            key={`${r.type}-${r.href}-${r.title}`}
                            type="button"
                            data-index={idx}
                            onClick={() => handleSelect(r)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                              isHighlighted ? "bg-indigo-50" : "hover:bg-indigo-50"
                            }`}
                          >
                            <span className={`shrink-0 inline-flex px-1.5 py-[2px] rounded border text-[10px] font-medium ${typeToBadge(r.type).className}`}>
                              {typeToBadge(r.type).label}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="font-semibold text-text">{r.title}</span>
                              <span className="text-text-2 text-[13px] ml-1.5">{r.subtitle}</span>
                            </span>
                            <svg
                              className="h-4 w-4 shrink-0 text-text-3"
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
                  );
                })}
              </div>
            </>
          )}
          {debouncedQuery.length === 0 && query.length === 0 && (
            <p className="px-4 py-3 text-sm text-text-3">Type to search vocabulary, verbs, conjugations, and grammar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
