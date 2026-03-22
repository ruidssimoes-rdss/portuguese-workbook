"use client";

import { useState, useMemo } from "react";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  TabBar,
  FilterBar,
  CardShell,
  BadgePill,
  CountLabel,
  AudioButton,
} from "@/components/primitives";

import sayingsData from "@/data/sayings.json";
import falseFriendsData from "@/data/false-friends.json";
import etiquetteData from "@/data/etiquette.json";
import regionalData from "@/data/regional.json";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CultureItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cefr: string;
  category: string;
}

// ─── Data normalization ─────────────────────────────────────────────────────

function normalizeSayings(): CultureItem[] {
  return sayingsData.sayings.map((s) => ({
    id: s.id,
    title: s.portuguese,
    subtitle: s.literal,
    description: s.meaning,
    cefr: s.cefr,
    category: "Sayings",
  }));
}

function normalizeFalseFriends(): CultureItem[] {
  return falseFriendsData.falseFriends.map((f) => ({
    id: f.id,
    title: f.portuguese,
    subtitle: `Looks like "${f.looksLike}" — actually means: ${f.actualMeaning}`,
    description: f.tip,
    cefr: f.cefr,
    category: "False friends",
  }));
}

function normalizeEtiquette(): CultureItem[] {
  return etiquetteData.tips.map((e) => ({
    id: e.id,
    title: e.titlePt,
    subtitle: e.title,
    description: e.description,
    cefr: "A2",
    category: "Etiquette",
  }));
}

function normalizeRegional(): CultureItem[] {
  return regionalData.expressions.map((r) => ({
    id: r.id,
    title: r.expression,
    subtitle: r.meaning,
    description: `${r.region.charAt(0).toUpperCase() + r.region.slice(1)} expression. Standard alternative: "${r.standardAlternative}"`,
    cefr: r.cefr,
    category: "Regional",
  }));
}

// ─── Constants ──────────────────────────────────────────────────────────────

const tabs = ["All", "Sayings", "False friends", "Etiquette", "Regional"];
const cefrOptions = ["All", "A1", "A2", "B1"];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CulturePage() {
  const [tab, setTab] = useState("All");
  const [cefr, setCefr] = useState("All");
  const [search, setSearch] = useState("");

  const allItems: CultureItem[] = useMemo(() => {
    return [
      ...normalizeSayings(),
      ...normalizeFalseFriends(),
      ...normalizeEtiquette(),
      ...normalizeRegional(),
    ];
  }, []);

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
    <PageShell>
      <PageHeader
        title="Cultura portuguesa"
        subtitle={`${allItems.length} items — traditions, etiquette, expressions, and regional language`}
      />

      <TabBar
        tabs={tabs}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setCefr("All");
          setSearch("");
        }}
      />

      <FilterBar
        filterOptions={cefrOptions}
        filterValue={cefr}
        onFilterChange={setCefr}
        searchPlaceholder="Search culture..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item) => (
          <CardShell key={item.id} interactive className="group">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-medium text-[#111111]">
                    {item.title}
                  </span>
                  <AudioButton text={item.title} />
                </div>
                <div className="text-[12px] text-[#9B9DA3] mt-0.5">
                  {item.subtitle}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-3">
                <BadgePill level={item.cefr} />
                <BadgePill label={item.category} variant="neutral" />
              </div>
            </div>
            <div className="text-[12px] text-[#6C6B71] leading-relaxed">
              {item.description}
            </div>
          </CardShell>
        ))}
      </div>

      <CountLabel showing={filtered.length} total={totalForTab} />
    </PageShell>
  );
}
