"use client";

import { useState, useMemo } from "react";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import {
  PageHeader,
  TabBar,
  SegmentedFilter,
  SearchInput,
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
    category: "Ditados",
  }));
}

function normalizeFalseFriends(): CultureItem[] {
  return falseFriendsData.falseFriends.map((f) => ({
    id: f.id,
    title: f.portuguese,
    subtitle: `Parece «${f.looksLike}» — quer dizer: ${f.actualMeaning}`,
    description: f.tip,
    cefr: f.cefr,
    category: "Falsos amigos",
  }));
}

function normalizeEtiquette(): CultureItem[] {
  return etiquetteData.tips.map((e) => ({
    id: e.id,
    title: e.titlePt,
    subtitle: e.title,
    description: e.description,
    cefr: "A2",
    category: "Etiqueta",
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

const tabs = ["Tudo", "Ditados", "Falsos amigos", "Etiqueta", "Regional"];
const cefrOptions = ["Todos", "A1", "A2", "B1"];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CulturePage() {
  const [tab, setTab] = useState("Tudo");
  const [cefr, setCefr] = useState("Todos");
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
      if (tab !== "Tudo" && item.category !== tab) return false;
      if (cefr !== "Todos" && item.cefr !== cefr) return false;
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

  // Same saying for everyone all week.
  const week = Math.floor(Date.now() / (7 * 86_400_000));
  const saying = sayingsData.sayings[week % sayingsData.sayings.length];

  const totalForTab =
    tab === "Tudo"
      ? allItems.length
      : allItems.filter((i) => i.category === tab).length;

  return (
    <PageShell
      header={<Crumbs items={[{ label: "Cultura" }]} />}
      panel={
        <div className="flex flex-col gap-6">
          <div className="rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint p-4">
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-accent">Ditado da semana</div>
            <div className="text-[15px] font-semibold leading-snug text-aula-text">«{saying.portuguese.replace(/\.$/, "")}»</div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-aula-text-2">{saying.meaning}</p>
          </div>
          <div>
            <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Coleções</div>
            {tabs.slice(1).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex h-7 w-full items-center rounded-md px-2 text-[12.5px] ${tab === t ? "bg-aula-selected font-medium text-aula-text" : "text-aula-text-2 hover:bg-aula-sunken"}`}
              >
                {t}
                <span className="flex-1" />
                <span className="text-[11px] text-aula-text-3">{allItems.filter((i) => i.category === t).length}</span>
              </button>
            ))}
          </div>
        </div>
      }
    >
      <PageHeader
        title="Cultura"
        subtitle={`${allItems.length} notas sobre como se vive e se fala em Portugal`}
      />

      <TabBar
        tabs={tabs}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setCefr("Todos");
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
          placeholder="Procurar na cultura…"
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
                  <span className="text-[14px] font-medium text-[#1F1F1F]">
                    {item.title}
                  </span>
                  <AudioButton text={item.title} />
                </div>
                <div className="text-[12px] text-[#98988F] mt-0.5">
                  {item.subtitle}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0 ml-3">
                <BadgePill level={item.cefr} />
                <BadgePill label={item.category} variant="neutral" />
              </div>
            </div>
            <div className="text-[12px] text-[#6B6B69] leading-relaxed">
              {item.description}
            </div>
          </CardShell>
        ))}
      </div>

      <CountLabel showing={filtered.length} total={totalForTab} />
    </PageShell>
  );
}
