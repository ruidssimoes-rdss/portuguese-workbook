import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/primitives";
import { CultureBrowser, type CultureItem } from "@/components/culture/culture-browser";

import sayingsData from "@/data/sayings.json";
import falseFriendsData from "@/data/false-friends.json";
import etiquetteData from "@/data/etiquette.json";
import regionalData from "@/data/regional.json";

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

export default function CulturePage() {
  const items: CultureItem[] = [
    ...normalizeSayings(),
    ...normalizeFalseFriends(),
    ...normalizeEtiquette(),
    ...normalizeRegional(),
  ];

  return (
    <PageShell>
      <PageHeader
        title="Cultura portuguesa"
        subtitle={`${items.length} items — traditions, etiquette, expressions, and regional language`}
      />
      <CultureBrowser items={items} />
    </PageShell>
  );
}
