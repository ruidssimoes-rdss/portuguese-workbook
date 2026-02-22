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
import { normalizeForSearch } from "@/lib/search";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { FilterPill } from "@/components/ui/filter-pill";
import { SearchInput } from "@/components/ui/search-input";
import { Divider } from "@/components/ui/divider";
import { Card } from "@/components/ui/card";
import { Badge, CEFRBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const sayings = (sayingsData as unknown as SayingsData).sayings;
const falseFriends = (falseFriendsData as unknown as FalseFriendsData).falseFriends;
const etiquetteTips = (etiquetteData as unknown as EtiquetteData).tips;
const regionalExpressions = (regionalData as unknown as RegionalData).expressions;

const TABS = [
  { id: "sayings", label: "Sayings & Proverbs", labelPt: "Ditados e Prov\u00e9rbios", count: sayings.length },
  { id: "false-friends", label: "False Friends", labelPt: "Falsos Amigos", count: falseFriends.length },
  { id: "etiquette", label: "Cultural Etiquette", labelPt: "Etiqueta Cultural", count: etiquetteTips.length },
  { id: "regional", label: "Regional Slang", labelPt: "Cal\u00e3o Regional", count: regionalExpressions.length },
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

const ETIQUETTE_CATEGORY_COLORS: Record<string, string> = {
  greetings: "text-violet-700 bg-violet-50",
  dining: "text-amber-700 bg-amber-50",
  social: "text-sky-700 bg-sky-50",
  shopping: "text-emerald-700 bg-emerald-50",
  daily: "text-rose-700 bg-rose-50",
};

/* ── Utility ────────────────────────────────────────────────── */

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ExpandableSection({ expanded, children }: { expanded: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`grid transition-all duration-150 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
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
    default: return "bg-[#F3F4F6] text-[#6B7280]";
  }
}

function regionLabel(region: string): string {
  const map: Record<string, string> = { lisbon: "Lisboa", porto: "Porto", north: "North", algarve: "Algarve", azores: "Azores", madeira: "Madeira" };
  return map[region] ?? region;
}

function themeLabel(themeKey: string): string {
  return THEMES.find((t) => t !== "All" && THEME_TO_KEY[t] === themeKey) ?? themeKey;
}

function etiquetteCategoryLabel(categoryKey: string): string {
  return ETIQUETTE_CATEGORIES.find((c) => c !== "All" && ETIQUETTE_TO_KEY[c] === categoryKey) ?? categoryKey;
}

/* ── Featured Saying ────────────────────────────────────────── */

function FeaturedSaying() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  const featured = sayings[dayIndex % sayings.length];

  return (
    <section className="mt-6">
      <SectionHeader className="mb-3">Destaque do Dia</SectionHeader>
      <Card variant="featured" padding="lg">
        <div className="flex items-start gap-3">
          <p className="text-xl font-semibold italic text-[#111827] leading-snug flex-1">
            &quot;{featured.portuguese}&quot;
          </p>
          <PronunciationButton text={featured.portuguese} size="sm" />
          <CEFRBadge level={featured.cefr} />
        </div>
        <p className="mt-3 text-sm text-[#6B7280]">{featured.meaning}</p>
        <div className="mt-3">
          <Badge>{themeLabel(featured.theme)}</Badge>
        </div>
      </Card>
    </section>
  );
}

/* ── Card Components ────────────────────────────────────────── */

function SayingCard({ saying, isHighlighted, isExpanded, onToggle }: { saying: Saying; isHighlighted?: boolean; isExpanded: boolean; onToggle: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(saying.portuguese).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [saying.portuguese]);

  return (
    <Card
      variant="outline"
      interactive
      padding="lg"
      onClick={onToggle}
      className={isHighlighted ? "ring-2 ring-[#111827]/40 border-[#111827]/30" : ""}
    >
      <article id={saying.id}>
        {/* Collapsed: always visible */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-[15px] font-semibold italic text-[#111827] leading-snug">
            &quot;{saying.portuguese}&quot;
          </p>
          <Chevron expanded={isExpanded} />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <PronunciationButton text={saying.portuguese} size="sm" />
          <CEFRBadge level={saying.cefr} />
          <Badge>{themeLabel(saying.theme)}</Badge>
        </div>
        <p className="mt-3 text-sm text-[#6B7280]">{saying.meaning}</p>

        {/* Expandable details */}
        <ExpandableSection expanded={isExpanded}>
          <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-3">
            <div className="bg-[#F9FAFB] rounded-lg p-3 space-y-2">
              <div>
                <p className="text-xs font-semibold text-[#6B7280]">Literal:</p>
                <p className="text-sm text-[#6B7280]">{saying.literal}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280]">When to use:</p>
                <p className="text-sm text-[#6B7280]">{saying.usage}</p>
              </div>
              {saying.example && (
                <div className="pt-2 border-t border-[#E5E7EB]">
                  <p className="text-sm text-[#111827] italic">{saying.example}</p>
                  {saying.exampleTranslation && <p className="text-sm text-[#6B7280] mt-1">{saying.exampleTranslation}</p>}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </ExpandableSection>
      </article>
    </Card>
  );
}

function FalseFriendCard({ item, isHighlighted, isExpanded, onToggle }: { item: FalseFriend; isHighlighted?: boolean; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Card
      variant="outline"
      interactive
      padding="lg"
      onClick={onToggle}
      className={isHighlighted ? "ring-2 ring-[#111827]/40 border-[#111827]/30" : ""}
    >
      <article id={item.id}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold text-[#111827] text-base">{item.portuguese}</p>
          <Chevron expanded={isExpanded} />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <PronunciationButton text={item.portuguese} size="sm" />
          <CEFRBadge level={item.cefr} />
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-lg bg-emerald-50 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 mb-0.5">Actually means</p>
            <p className="text-sm font-medium text-emerald-800">{item.actualMeaning}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500 mb-0.5">Looks like</p>
            <p className="text-sm font-medium text-red-700 line-through">{item.looksLike}</p>
          </div>
        </div>

        {/* Expandable details */}
        <ExpandableSection expanded={isExpanded}>
          <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-3">
            <p className="text-sm text-[#6B7280]">
              Correct word for &quot;{item.looksLike}&quot;: <span className="font-medium text-[#374151]">{item.correctWord}</span>
            </p>
            <div className="bg-[#F9FAFB] rounded-lg p-3">
              <p className="text-sm text-[#111827] italic">{item.example}</p>
              <p className="text-sm text-[#6B7280] mt-1">{item.exampleTranslation}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Tip:</p>
              <p className="text-sm text-amber-800">{item.tip}</p>
            </div>
          </div>
        </ExpandableSection>
      </article>
    </Card>
  );
}

function EtiquetteCard({ tip, isExpanded, onToggle }: { tip: EtiquetteTip; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Card
      variant="outline"
      interactive
      padding="lg"
      onClick={onToggle}
    >
      <article id={tip.id}>
        {/* Category badge at top */}
        <div className="flex items-start justify-between gap-3">
          <Badge color={ETIQUETTE_CATEGORY_COLORS[tip.category] ?? "text-[#6B7280] bg-[#F3F4F6]"}>
            {etiquetteCategoryLabel(tip.category)}
          </Badge>
          <Chevron expanded={isExpanded} />
        </div>

        <p className="font-bold text-[#111827] mt-2">{tip.title}</p>
        <p className="text-sm text-[#6B7280] italic mt-0.5">{tip.titlePt}</p>
        <p className={`mt-3 text-sm text-[#6B7280] ${isExpanded ? "" : "line-clamp-2"}`}>{tip.description}</p>

        {/* Expandable details */}
        <ExpandableSection expanded={isExpanded}>
          <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-3">
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">Do:</p>
              <p className="text-sm text-emerald-800">{tip.doThis}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-500 mb-1">Avoid:</p>
              <p className="text-sm text-red-700">{tip.avoidThis}</p>
            </div>
          </div>
        </ExpandableSection>
      </article>
    </Card>
  );
}

function RegionalCard({ item, isHighlighted, isExpanded, onToggle }: { item: RegionalExpression; isHighlighted?: boolean; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Card
      variant="outline"
      interactive
      padding="lg"
      onClick={onToggle}
      className={`bg-[#FAFBFC] ${isHighlighted ? "ring-2 ring-[#111827]/40 border-[#111827]/30" : ""}`}
    >
      <article id={item.id}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-[#111827] italic text-[15px]">{item.expression}</p>
          <Chevron expanded={isExpanded} />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge color={regionBadgeClass(item.region)}>{regionLabel(item.region)}</Badge>
          <CEFRBadge level={item.cefr} />
          <PronunciationButton text={item.expression} size="sm" />
        </div>
        <p className="mt-3 text-sm text-[#6B7280]">{item.meaning}</p>

        {/* Expandable details */}
        <ExpandableSection expanded={isExpanded}>
          <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-3">
            <p className="text-xs text-[#9CA3AF] font-mono">{item.pronunciation}</p>
            <p className="text-sm text-[#6B7280]">
              Standard Portuguese: <span className="font-medium text-[#374151]">{item.standardAlternative}</span>
            </p>
            <div className="bg-[#F9FAFB] rounded-lg p-3">
              <p className="text-sm text-[#111827] italic">{item.example}</p>
              <p className="text-sm text-[#6B7280] mt-1">{item.exampleTranslation}</p>
            </div>
          </div>
        </ExpandableSection>
      </article>
    </Card>
  );
}

/* ── Tab Filters ────────────────────────────────────────────── */

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
      {/* CEFR pills (left) */}
      {(tab === "sayings" || tab === "false-friends" || tab === "regional") && (
        <div className="flex items-center gap-1.5">
          {CEFR_LEVELS.map((level) => (
            <FilterPill
              key={level}
              active={cefrFilter === level}
              onClick={() => setCefrFilter(level)}
            >
              {level}
            </FilterPill>
          ))}
        </div>
      )}

      {/* Thin divider between CEFR and topic/category/region pills */}
      {(tab === "sayings" || tab === "regional") && (
        <div className="w-px h-5 bg-[#E5E7EB]" />
      )}

      {/* Topic pills for sayings */}
      {tab === "sayings" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {THEMES.map((t) => (
            <FilterPill
              key={t}
              active={themeFilter === t}
              onClick={() => setThemeFilter(t)}
            >
              {t}
            </FilterPill>
          ))}
        </div>
      )}

      {/* Category pills for etiquette */}
      {tab === "etiquette" && (
        <div className="flex items-center gap-1.5">
          {ETIQUETTE_CATEGORIES.map((c) => (
            <FilterPill
              key={c}
              active={etiquetteCategory === c}
              onClick={() => setEtiquetteCategory(c)}
            >
              {c}
            </FilterPill>
          ))}
        </div>
      )}

      {/* Region pills for regional */}
      {tab === "regional" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {REGIONS.map((r) => (
            <FilterPill
              key={r}
              active={regionFilter === r}
              onClick={() => setRegionFilter(r)}
            >
              {r}
            </FilterPill>
          ))}
        </div>
      )}

      {/* Search on far right */}
      <div className="w-full sm:w-auto sm:ml-auto">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

/* ── Main Content ───────────────────────────────────────────── */

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
      setExpandedId(null);
    },
    [searchParams, router]
  );

  const highlightId = searchParams.get("highlight");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleCard = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const [cefrFilter, setCefrFilterRaw] = useState<string>("All");
  const [themeFilter, setThemeFilterRaw] = useState<string>("All");
  const [etiquetteCategory, setEtiquetteCategoryRaw] = useState<string>("All");
  const [regionFilter, setRegionFilterRaw] = useState<string>("All");
  const [search, setSearchRaw] = useState("");

  // Wrap filter setters to also collapse expanded card
  const setCefrFilter = useCallback((v: string) => { setCefrFilterRaw(v); setExpandedId(null); }, []);
  const setThemeFilter = useCallback((v: string) => { setThemeFilterRaw(v); setExpandedId(null); }, []);
  const setEtiquetteCategory = useCallback((v: string) => { setEtiquetteCategoryRaw(v); setExpandedId(null); }, []);
  const setRegionFilter = useCallback((v: string) => { setRegionFilterRaw(v); setExpandedId(null); }, []);
  const setSearch = useCallback((v: string) => { setSearchRaw(v); setExpandedId(null); }, []);

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
      <PageContainer>
        <div className="py-5">
          <PageHeader
            title="Culture"
            titlePt="Cultura"
            subtitle={`4 sections \u00b7 ${sayings.length} sayings \u00b7 ${falseFriends.length} false friends \u00b7 ${etiquetteTips.length} etiquette tips \u00b7 ${regionalExpressions.length} regional expressions`}
          />

          {/* Featured Saying of the Day */}
          <FeaturedSaying />

          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <div className="flex items-center gap-1.5">
              {TABS.map((t) => (
                <FilterPill
                  key={t.id}
                  active={tab === t.id}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </FilterPill>
              ))}
            </div>
          </div>

          <Divider className="mt-4" />

          {/* Filters Row */}
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

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
          {tab === "sayings" && (
            <>
              {filteredSayings.length === 0 ? (
                <EmptyState message="No sayings match your filters." className="col-span-full" />
              ) : (
                filteredSayings.map((saying) => (
                  <SayingCard key={saying.id} saying={saying} isHighlighted={highlightId === saying.id} isExpanded={expandedId === saying.id} onToggle={() => toggleCard(saying.id)} />
                ))
              )}
            </>
          )}

          {tab === "false-friends" && (
            <>
              {filteredFalseFriends.length === 0 ? (
                <EmptyState message="No false friends match your filters." className="col-span-full" />
              ) : (
                filteredFalseFriends.map((item) => (
                  <FalseFriendCard key={item.id} item={item} isHighlighted={highlightId === item.id} isExpanded={expandedId === item.id} onToggle={() => toggleCard(item.id)} />
                ))
              )}
            </>
          )}

          {tab === "etiquette" && (
            <>
              {filteredEtiquette.length === 0 ? (
                <EmptyState message="No tips match your filters." className="col-span-full" />
              ) : (
                filteredEtiquette.map((tip) => <EtiquetteCard key={tip.id} tip={tip} isExpanded={expandedId === tip.id} onToggle={() => toggleCard(tip.id)} />)
              )}
            </>
          )}

          {tab === "regional" && (
            <>
              {filteredRegional.length === 0 ? (
                <EmptyState message="No regional expressions match your filters." className="col-span-full" />
              ) : (
                filteredRegional.map((item) => (
                  <RegionalCard key={item.id} item={item} isHighlighted={highlightId === item.id} isExpanded={expandedId === item.id} onToggle={() => toggleCard(item.id)} />
                ))
              )}
            </>
          )}
        </div>
      </PageContainer>
    </>
  );
}

export default function CulturePage() {
  return (
    <Suspense
      fallback={
        <>
          <Topbar />
          <PageContainer className="py-12">
            <p className="text-text-secondary">Loading...</p>
          </PageContainer>
        </>
      }
    >
      <CultureContent />
    </Suspense>
  );
}
