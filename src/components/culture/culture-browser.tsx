"use client";

import { useState, useMemo } from "react";
import {
  TabBar,
  SegmentedFilter,
  SearchInput,
  CardShell,
  BadgePill,
  CountLabel,
  AudioButton,
} from "@/components/primitives";

export interface CultureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cefr: string;
  category: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const tabs = ["All", "Sayings", "False friends", "Etiquette", "Regional"];
const cefrOptions = ["All", "A1", "A2", "B1"];

// ─── Page ───────────────────────────────────────────────────────────────────

export function CultureBrowser({ items: allItems, initialTab = "All" }: { items: CultureItem[]; initialTab?: string }) {
  const [tab, setTab] = useState(tabs.includes(initialTab) ? initialTab : "All");
  const [cefr, setCefr] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (tab !== "All" && item.category !== tab) return false;
      if (cefr !== "All" && item.cefr !== cefr) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allItems, tab, cefr, search]);

  const totalForTab =
    tab === "All"
      ? allItems.length
      : allItems.filter((i) => i.category === tab).length;

  return (
    <>
      <TabBar
        tabs={tabs}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setCefr("All");
          setSearch("");
        }}
      />

      {/* ─── Filter bar (standard layout) ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <SegmentedFilter
          options={cefrOptions}
          value={cefr}
          onChange={setCefr}
        />
        <div className="flex-1" />
        <SearchInput
          placeholder="Search culture..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <CardShell key={item.id} interactive className="group">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-medium text-text-primary">
                    {item.title}
                  </span>
                  <AudioButton text={item.title} />
                </div>
                <div className="text-[12px] text-text-quaternary mt-0.5">
                  {item.subtitle}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-3">
                <BadgePill level={item.cefr} />
                <BadgePill label={item.category} variant="neutral" />
              </div>
            </div>
            <div className="text-[12px] text-text-secondary leading-relaxed">
              {item.description}
            </div>
          </CardShell>
        ))}
      </div>

      <CountLabel showing={filtered.length} total={totalForTab} />
    </>
  );
}
