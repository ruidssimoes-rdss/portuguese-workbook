"use client";

import { useMemo, useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import sayingsData from "@/data/sayings.json";
import falseFriendsData from "@/data/false-friends.json";
import etiquetteData from "@/data/etiquette.json";
import regionalData from "@/data/regional.json";
import type { SayingsData, Saying } from "@/types/saying";
import type { FalseFriendsData, FalseFriend, EtiquetteData, EtiquetteTip, RegionalData, RegionalExpression } from "@/types/culture";
import { PronunciationButton } from "@/components/pronunciation-button";
import { cefrPillClass } from "@/lib/cefr";
import { normalizeForSearch } from "@/lib/search";

const sayings = (sayingsData as unknown as SayingsData).sayings;
const falseFriends = (falseFriendsData as unknown as FalseFriendsData).falseFriends;
const etiquetteTips = (etiquetteData as unknown as EtiquetteData).tips;
const regionalExpressions = (regionalData as unknown as RegionalData).expressions;

const TABS = [
  { id: "sayings", label: "Sayings & Proverbs", labelPt: "Ditados e Provérbios", count: sayings.length },
  { id: "false-friends", label: "False Friends", labelPt: "Falsos Amigos", count: falseFriends.length },
  { id: "etiquette", label: "Cultural Etiquette", labelPt: "Etiqueta Cultural", count: etiquetteTips.length },
  { id: "regional", label: "Regional Slang", labelPt: "Calão Regional", count: regionalExpressions.length },
] as const;
type TabId = (typeof TABS)[number]["id"];

const CEFR_LEVELS = ["All", "A1", "A2", "B1"] as const;
const THEMES = ["All", "Life", "Wisdom", "Patience", "Character", "Relationships", "Food", "Weather", "Money", "Work", "Humor"] as const;
const THEME_TO_KEY: Record<string, string> = {
  Life: "life", Wisdom: "wisdom", Patience: "patience", Character: "character",
  Relationships: "relationships", Food: "food", Weather: "weather", Money: "money", Work: "work", Humor: "humor",
};
const ETIQUETTE_CATEGORIES = ["All", "Greetings", "Dining", "Social", "Shopping", "Daily"] as const;
const ETIQUETTE_TO_KEY: Record<string, string> = {
  Greetings: "greetings", Dining: "dining", Social: "social", Shopping: "shopping", Daily: "daily",
};
const REGIONS = ["All", "Lisboa", "Porto", "North", "Algarve", "Azores", "Madeira"] as const;
const REGION_TO_KEY: Record<string, string> = {
  Lisboa: "lisbon", Porto: "porto", North: "north", Algarve: "algarve", Azores: "azores", Madeira: "madeira",
};

const PILL_ACTIVE =
  "px-3 py-1.5 rounded-full text-sm font-medium border border-[#111827] bg-[#111827] text-white cursor-pointer";
const PILL_INACTIVE =
  "px-3 py-1.5 rounded-full text-sm font-medium border border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] transition-colors cursor-pointer bg-white";
const SEARCH_INPUT =
  "w-full sm:w-[240px] px-3 py-1.5 rounded-full text-sm border border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] transition-colors bg-white";

function SayingCard({ saying, isHighlighted }: { saying: Saying; isHighlighted?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(saying.portuguese).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [saying.portuguese]);
  const hasExample = !!saying.example;
  return (
    <article
      id={saying.id}
      className={`bg-white border border-[#E5E7EB] rounded-xl p-5 mb-4 transition-all duration-200 ${
        isHighlighted ? "ring-2 ring-[#111827]/40 border-[#111827]/30" : ""
      } hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-text italic">&quot;{saying.portuguese}&quot;</p>
          <p className="text-sm font-mono text-text-muted mt-1">{saying.pronunciation}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PronunciationButton text={saying.portuguese} size="sm" />
          <span className={`inline-flex text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(saying.cefr)}`}>{saying.cefr}</span>
          <button type="button" onClick={handleCopy} className="text-xs text-text-secondary hover:text-[#111827] px-2 py-1 rounded-lg border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="border-t border-[#F3F4F6] pt-3 mt-3">
        <p className="text-sm font-semibold text-text-secondary mb-0.5">Literal:</p>
        <p className="text-sm text-[#374151]">{saying.literal}</p>
      </div>
      <div className="border-t border-[#F3F4F6] pt-3 mt-3">
        <p className="text-sm font-semibold text-[#374151] mb-0.5">Meaning:</p>
        <p className="text-sm text-[#374151]">{saying.meaning}</p>
      </div>
      <div className="border-t border-[#F3F4F6] pt-3 mt-3">
        <p className="text-sm font-semibold text-text-secondary mb-0.5">When to use:</p>
        <p className="text-sm text-[#374151]">{saying.usage}</p>
      </div>
      {hasExample && (
        <div className="border-t border-[#F3F4F6] pt-3 mt-3">
          <button type="button" onClick={() => setExampleOpen((o) => !o)} className="text-sm font-semibold text-text-secondary hover:text-[#111827]">
            Example {exampleOpen ? "–" : "+"}
          </button>
          {exampleOpen && (
            <div className="bg-[#F9FAFB] rounded-lg p-4 mt-3">
              <p className="text-sm text-text italic">{saying.example}</p>
              {saying.exampleTranslation && <p className="text-sm text-text-secondary mt-1">{saying.exampleTranslation}</p>}
            </div>
          )}
        </div>
      )}
      <div className="border-t border-[#F3F4F6] pt-3 mt-3">
        <span className="inline-block bg-border-light text-text-secondary rounded-full px-3 py-1 text-xs">
          {THEMES.find((t) => t !== "All" && THEME_TO_KEY[t] === saying.theme) ?? saying.theme}
        </span>
      </div>
    </article>
  );
}

function FalseFriendCard({ item, isHighlighted }: { item: FalseFriend; isHighlighted?: boolean }) {
  return (
    <article
      id={item.id}
      className={`bg-white border border-[#E5E7EB] rounded-xl p-5 mb-4 transition-all duration-200 ${
        isHighlighted ? "ring-2 ring-[#111827]/40 border-[#111827]/30" : ""
      } hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-text">{item.portuguese}</p>
          <p className="text-sm font-mono text-text-muted mt-1">{item.pronunciation}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PronunciationButton text={item.portuguese} size="sm" />
          <span className={`inline-flex text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(item.cefr)}`}>{item.cefr}</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-red-400 mt-3">
        Looks like: <span className="line-through text-red-500">{item.looksLike}</span>
      </p>
      <p className="text-sm font-semibold text-emerald-600 mt-1">Actually means: {item.actualMeaning}</p>
      <p className="text-sm font-semibold text-text-secondary mt-2">
        Correct word for &quot;{item.looksLike}&quot;: {item.correctWord}
      </p>
      <div className="border-t border-[#F3F4F6] pt-3 mt-3">
        <p className="text-sm text-[#374151] italic">{item.example}</p>
        <p className="text-sm text-text-secondary mt-1">{item.exampleTranslation}</p>
      </div>
      <div className="bg-amber-50 rounded-lg p-3 mt-3">
        <p className="text-xs font-semibold text-amber-700 mb-1">Tip:</p>
        <p className="text-sm text-amber-800">{item.tip}</p>
      </div>
    </article>
  );
}

function EtiquetteCard({ tip }: { tip: EtiquetteTip }) {
  const categoryLabel = ETIQUETTE_CATEGORIES.find((c) => c !== "All" && ETIQUETTE_TO_KEY[c] === tip.category) ?? tip.category;
  return (
    <article
      id={tip.id}
      className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-4 transition-all duration-200 hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text">{tip.title}</p>
          <p className="text-sm text-[#6B7280] font-medium mt-0.5">{tip.titlePt}</p>
        </div>
        <span className="text-xs bg-border-light text-text-secondary rounded-full px-3 py-1 shrink-0">{categoryLabel}</span>
      </div>
      <p className="text-sm text-text-secondary mt-3">{tip.description}</p>
      <div className="bg-emerald-50 rounded-lg p-3 mt-3">
        <p className="text-xs font-semibold text-emerald-700">Do:</p>
        <p className="text-sm text-emerald-800">{tip.doThis}</p>
      </div>
      <div className="bg-red-50 rounded-lg p-3 mt-2">
        <p className="text-xs font-semibold text-red-400">Avoid:</p>
        <p className="text-sm text-red-700">{tip.avoidThis}</p>
      </div>
    </article>
  );
}

function regionBadgeClass(region: string): string {
  switch (region) {
    case "lisbon": return "bg-yellow-50 text-yellow-700";
    case "porto": return "bg-blue-50 text-blue-700";
    case "algarve": return "bg-orange-50 text-orange-700";
    case "north": return "bg-emerald-50 text-emerald-700";
    case "azores": return "bg-cyan-50 text-cyan-700";
    case "madeira": return "bg-blue-50 text-blue-700";
    default: return "bg-border-light text-text-secondary";
  }
}
function regionLabel(region: string): string {
  const map: Record<string, string> = { lisbon: "Lisboa", porto: "Porto", north: "North", algarve: "Algarve", azores: "Azores", madeira: "Madeira" };
  return map[region] ?? region;
}

function RegionalCard({ item, isHighlighted }: { item: RegionalExpression; isHighlighted?: boolean }) {
  return (
    <article
      id={item.id}
      className={`bg-white border border-[#E5E7EB] rounded-xl p-5 mb-4 transition-all duration-200 ${
        isHighlighted ? "ring-2 ring-[#111827]/40 border-[#111827]/30" : ""
      } hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-text italic">{item.expression}</p>
          <p className="text-sm font-mono text-text-muted mt-1">{item.pronunciation}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PronunciationButton text={item.expression} size="sm" />
          <span className={`inline-flex text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${regionBadgeClass(item.region)}`}>
            {regionLabel(item.region)}
          </span>
          <span className={`inline-flex text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(item.cefr)}`}>{item.cefr}</span>
        </div>
      </div>
      <p className="text-sm text-[#374151] mt-3"><span className="font-semibold text-text-secondary">Meaning:</span> {item.meaning}</p>
      <p className="text-sm font-semibold text-text-secondary mt-2">Standard Portuguese: {item.standardAlternative}</p>
      <div className="border-t border-[#F3F4F6] pt-3 mt-3">
        <p className="text-sm text-text italic">{item.example}</p>
        <p className="text-sm text-text-secondary mt-1">{item.exampleTranslation}</p>
      </div>
    </article>
  );
}

function TabFilters({
  tab,
  cefrFilter,
  setCefrFilter,
  themeFilter,
  setThemeFilter,
  etiquetteCategory,
  setEtiquetteCategory,
  regionFilter,
  setRegionFilter,
  search,
  setSearch,
}: {
  tab: TabId;
  cefrFilter: string;
  setCefrFilter: (v: string) => void;
  themeFilter: string;
  setThemeFilter: (v: string) => void;
  etiquetteCategory: string;
  setEtiquetteCategory: (v: string) => void;
  regionFilter: string;
  setRegionFilter: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  const placeholder =
    tab === "sayings" ? "Search sayings..." :
    tab === "false-friends" ? "Search false friends..." :
    tab === "etiquette" ? "Search etiquette..." :
    "Search regional...";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* CEFR pills — shown for sayings, false-friends, regional */}
      {(tab === "sayings" || tab === "false-friends" || tab === "regional") && (
        <>
          <div className="flex items-center gap-1.5">
            {CEFR_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setCefrFilter(level)}
                className={cefrFilter === level ? PILL_ACTIVE : PILL_INACTIVE}
              >
                {level}
              </button>
            ))}
          </div>
          {/* Divider before next group if one exists */}
          {(tab === "sayings" || tab === "regional") && (
            <div className="w-px h-5 bg-[#E5E7EB]" />
          )}
        </>
      )}

      {/* Theme pills — sayings only */}
      {tab === "sayings" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setThemeFilter(t)}
              className={themeFilter === t ? PILL_ACTIVE : PILL_INACTIVE}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Etiquette category pills */}
      {tab === "etiquette" && (
        <div className="flex items-center gap-1.5">
          {ETIQUETTE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setEtiquetteCategory(c)}
              className={etiquetteCategory === c ? PILL_ACTIVE : PILL_INACTIVE}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Region pills — regional only */}
      {tab === "regional" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={regionFilter === r ? PILL_ACTIVE : PILL_INACTIVE}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Search — always right-aligned */}
      <div className="w-full sm:w-auto sm:ml-auto">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={SEARCH_INPUT}
        />
      </div>
    </div>
  );
}

function CultureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const tab: TabId = (TABS.some((t) => t.id === tabParam) ? tabParam : "sayings") as TabId;
  const setTab = useCallback(
    (id: TabId) => {
      const u = new URLSearchParams(searchParams.toString());
      u.set("tab", id);
      u.delete("highlight");
      router.replace(`/culture?${u.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const highlightId = searchParams.get("highlight");

  const [cefrFilter, setCefrFilter] = useState<string>("All");
  const [themeFilter, setThemeFilter] = useState<string>("All");
  const [etiquetteCategory, setEtiquetteCategory] = useState<string>("All");
  const [regionFilter, setRegionFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filteredSayings = useMemo(() => {
    let list = sayings;
    if (cefrFilter !== "All") list = list.filter((s) => s.cefr === cefrFilter);
    if (themeFilter !== "All") list = list.filter((s) => s.theme === THEME_TO_KEY[themeFilter]);
    if (search.trim()) {
      const q = normalizeForSearch(search.trim());
      list = list.filter((s) =>
        normalizeForSearch(s.portuguese).includes(q) ||
        normalizeForSearch(s.literal).includes(q) ||
        normalizeForSearch(s.meaning).includes(q) ||
        normalizeForSearch(s.usage).includes(q)
      );
    }
    return list;
  }, [cefrFilter, themeFilter, search]);

  const filteredFalseFriends = useMemo(() => {
    let list = falseFriends;
    if (cefrFilter !== "All") list = list.filter((f) => f.cefr === cefrFilter);
    if (search.trim()) {
      const q = normalizeForSearch(search.trim());
      list = list.filter((f) =>
        normalizeForSearch(f.portuguese).includes(q) ||
        normalizeForSearch(f.looksLike).includes(q) ||
        normalizeForSearch(f.actualMeaning).includes(q)
      );
    }
    return list;
  }, [cefrFilter, search]);

  const filteredEtiquette = useMemo(() => {
    let list = etiquetteTips;
    if (etiquetteCategory !== "All") list = list.filter((e) => e.category === ETIQUETTE_TO_KEY[etiquetteCategory]);
    if (search.trim()) {
      const q = normalizeForSearch(search.trim());
      list = list.filter((e) =>
        normalizeForSearch(e.title).includes(q) ||
        normalizeForSearch(e.titlePt).includes(q) ||
        normalizeForSearch(e.description).includes(q)
      );
    }
    return list;
  }, [etiquetteCategory, search]);

  const filteredRegional = useMemo(() => {
    let list = regionalExpressions;
    if (regionFilter !== "All") list = list.filter((r) => r.region === REGION_TO_KEY[regionFilter]);
    if (cefrFilter !== "All") list = list.filter((r) => r.cefr === cefrFilter);
    if (search.trim()) {
      const q = normalizeForSearch(search.trim());
      list = list.filter((r) =>
        normalizeForSearch(r.expression).includes(q) ||
        normalizeForSearch(r.meaning).includes(q) ||
        normalizeForSearch(r.standardAlternative).includes(q)
      );
    }
    return list;
  }, [regionFilter, cefrFilter, search]);

  const currentFiltered =
    tab === "sayings" ? filteredSayings :
    tab === "false-friends" ? filteredFalseFriends :
    tab === "etiquette" ? filteredEtiquette :
    filteredRegional;
  const currentTotal =
    tab === "sayings" ? sayings.length :
    tab === "false-friends" ? falseFriends.length :
    tab === "etiquette" ? etiquetteTips.length :
    regionalExpressions.length;

  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => {
      document.getElementById(highlightId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(t);
  }, [highlightId, tab]);

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#111827]">
              Culture
            </h1>
            <span className="text-lg text-[#9CA3AF] italic">
              Cultura
            </span>
          </div>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            4 sections · {sayings.length} sayings · {falseFriends.length} false friends · {etiquetteTips.length} etiquette tips · {regionalExpressions.length} regional expressions
          </p>

          {/* Section tabs + tab-specific filters + search — all in one row system */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-1.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={tab === t.id ? PILL_ACTIVE : PILL_INACTIVE}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#F3F4F6] mt-4" />

          {/* Tab-specific filters */}
          <div className="mt-6">
            <TabFilters
              tab={tab}
              cefrFilter={cefrFilter}
              setCefrFilter={setCefrFilter}
              themeFilter={themeFilter}
              setThemeFilter={setThemeFilter}
              etiquetteCategory={etiquetteCategory}
              setEtiquetteCategory={setEtiquetteCategory}
              regionFilter={regionFilter}
              setRegionFilter={setRegionFilter}
              search={search}
              setSearch={setSearch}
            />
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Showing {currentFiltered.length} of {currentTotal}
            </p>
          </div>
        </div>

        <div className="pb-16">
          {tab === "sayings" && (
            <>
              {filteredSayings.length === 0 ? (
                <p className="text-[13px] text-text-secondary py-8">No sayings match your filters.</p>
              ) : (
                filteredSayings.map((saying) => (
                  <SayingCard key={saying.id} saying={saying} isHighlighted={highlightId === saying.id} />
                ))
              )}
            </>
          )}

          {tab === "false-friends" && (
            <>
              {filteredFalseFriends.length === 0 ? (
                <p className="text-[13px] text-text-secondary py-8">No false friends match your filters.</p>
              ) : (
                filteredFalseFriends.map((item) => (
                  <FalseFriendCard key={item.id} item={item} isHighlighted={highlightId === item.id} />
                ))
              )}
            </>
          )}

          {tab === "etiquette" && (
            <>
              {filteredEtiquette.length === 0 ? (
                <p className="text-[13px] text-text-secondary py-8">No tips match your filters.</p>
              ) : (
                filteredEtiquette.map((tip) => <EtiquetteCard key={tip.id} tip={tip} />)
              )}
            </>
          )}

          {tab === "regional" && (
            <>
              {filteredRegional.length === 0 ? (
                <p className="text-[13px] text-text-secondary py-8">No regional expressions match your filters.</p>
              ) : (
                filteredRegional.map((item) => (
                  <RegionalCard key={item.id} item={item} isHighlighted={highlightId === item.id} />
                ))
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default function CulturePage() {
  return (
    <Suspense
      fallback={
        <>
          <Topbar />
          <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-12">
            <p className="text-text-secondary">Loading...</p>
          </main>
        </>
      }
    >
      <CultureContent />
    </Suspense>
  );
}
