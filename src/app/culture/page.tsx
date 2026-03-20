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
import { SectionHeader } from "@/components/ui/section-header";
import { FilterPill } from "@/components/ui/filter-pill";
import { SearchInput } from "@/components/ui/search-input";
import { Divider } from "@/components/ui/divider";
import { Card } from "@/components/ui/card";
import { CEFRBadge } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLayout, IntroBlock } from "@/components/blocos";
import { SmartBloco } from "@/components/smart-bloco";
import { Expression, Comparison, DoAvoid } from "@/components/smart-bloco-inserts";
import type { CEFRLevel } from "@/components/smart-bloco";

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

/* ── Utility ────────────────────────────────────────────────── */

function themeLabel(themeKey: string): string {
  return THEMES.find((t) => t !== "All" && THEME_TO_KEY[t] === themeKey) ?? themeKey;
}

function regionLabel(region: string): string {
  const map: Record<string, string> = { lisbon: "Lisboa", porto: "Porto", north: "North", algarve: "Algarve", azores: "Azores", madeira: "Madeira" };
  return map[region] ?? region;
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
      <Card padding="lg" className="bg-[#EFF6FF]/60 border-[#BFDBFE]/50">
        <div className="flex items-start gap-3">
          <p className="text-xl font-semibold italic text-[#111827] leading-snug flex-1">
            &quot;{featured.portuguese}&quot;
          </p>
          <PronunciationButton text={featured.portuguese} size="sm" variant="default" />
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

  const totalItems = sayings.length + falseFriends.length + etiquetteTips.length + regionalExpressions.length;

  return (
    <PageLayout>
      <IntroBlock
        title="Culture"
        subtitle="Cultura"
        description="Sayings, etiquette, false friends, and regional expressions — the real Portugal behind the language."
        pills={[{ label: `${totalItems} items` }]}
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

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
          {tab === "sayings" && (
            <>
              {filteredSayings.length === 0 ? (
                <EmptyState message="No sayings match your filters." className="col-span-full" />
              ) : (
                filteredSayings.map((saying) => (
                  <SmartBloco
                    key={saying.id}
                    title={saying.portuguese}
                    hasAudio
                    cefrLevel={saying.cefr as CEFRLevel}
                    metaBadge={themeLabel(saying.theme)}
                    description={saying.meaning}
                    expandedContent={
                      expandedId === saying.id ? (
                        <Expression
                          meaning={saying.meaning}
                          usage={saying.usage}
                          quote={{ pt: saying.portuguese, en: saying.literal }}
                          hasAudio
                        />
                      ) : undefined
                    }
                    onClick={() => toggleCard(saying.id)}
                    className={highlightId === saying.id ? "ring-2 ring-[#111827]/40" : ""}
                  />
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
                  <SmartBloco
                    key={item.id}
                    title={item.portuguese}
                    hasAudio
                    cefrLevel={item.cefr as CEFRLevel}
                    description={`Looks like "${item.looksLike}" but actually means "${item.actualMeaning}"`}
                    expandedContent={
                      expandedId === item.id ? (
                        <Comparison
                          positive={{ label: "Actually means", text: item.actualMeaning }}
                          negative={{ label: "Looks like", text: item.looksLike }}
                        />
                      ) : undefined
                    }
                    onClick={() => toggleCard(item.id)}
                    className={highlightId === item.id ? "ring-2 ring-[#111827]/40" : ""}
                  />
                ))
              )}
            </>
          )}

          {tab === "etiquette" && (
            <>
              {filteredEtiquette.length === 0 ? (
                <EmptyState message="No tips match your filters." className="col-span-full" />
              ) : (
                filteredEtiquette.map((tip) => (
                  <SmartBloco
                    key={tip.id}
                    title={tip.title}
                    subtitle={tip.titlePt}
                    description={tip.description}
                    metaBadge={etiquetteCategoryLabel(tip.category)}
                    expandedContent={
                      expandedId === tip.id ? (
                        <DoAvoid
                          doItems={[tip.doThis]}
                          avoidItems={[tip.avoidThis]}
                        />
                      ) : undefined
                    }
                    onClick={() => toggleCard(tip.id)}
                  />
                ))
              )}
            </>
          )}

          {tab === "regional" && (
            <>
              {filteredRegional.length === 0 ? (
                <EmptyState message="No regional expressions match your filters." className="col-span-full" />
              ) : (
                filteredRegional.map((item) => (
                  <SmartBloco
                    key={item.id}
                    title={item.expression}
                    subtitle={item.meaning}
                    hasAudio
                    cefrLevel={item.cefr as CEFRLevel}
                    metaBadge={regionLabel(item.region)}
                    expandedContent={
                      expandedId === item.id ? (
                        <Expression
                          meaning={item.standardAlternative ? `Standard: ${item.standardAlternative}` : item.meaning}
                          quote={{ pt: item.example, en: item.exampleTranslation }}
                          hasAudio
                        />
                      ) : undefined
                    }
                    onClick={() => toggleCard(item.id)}
                    className={highlightId === item.id ? "ring-2 ring-[#111827]/40" : ""}
                  />
                ))
              )}
            </>
          )}
        </div>
      </PageLayout>
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
