/** Breadcrumbs for any path inside the shell. Server-only — resolves names from src/data. */

import "server-only";

import grammarData from "@/data/grammar.json";
import { getResolvedLesson } from "@/data/resolve-lessons";
import { getCategory, getWord } from "@/lib/library";
import type { GrammarData } from "@/types/grammar";
import type { Crumb } from "@/components/shell/header-content";

const grammar = grammarData as unknown as GrammarData;

const SECTIONS: Record<string, string> = {
  vocabulary: "Vocabulário",
  grammar: "Gramática",
  conjugations: "Verbos",
  culture: "Cultura",
  learn: "Praticar",
  progress: "Progresso",
  lessons: "Lições",
  settings: "Definições",
  notes: "Notas",
  calendar: "Calendário",
  exams: "Exames",
  guide: "Guia",
  tutor: "Professor Elísio",
  changelog: "Novidades",
};

export function resolveCrumbs(segments: string[]): Crumb[] {
  if (segments.length === 0) return [{ label: "Hoje" }];
  const [section, a, b] = segments;
  const root = SECTIONS[section];
  if (!root) return [];
  const crumbs: Crumb[] = [{ label: root, href: `/${section}` }];

  if (section === "vocabulary" && a) {
    if (a === "a-rever") crumbs.push({ label: "A rever", href: "/vocabulary/a-rever" });
    else {
      const category = getCategory(a);
      if (category) crumbs.push({ label: category.title, href: category.href });
      const word = b && category ? getWord(category.id, b) : undefined;
      if (word) crumbs.push({ label: word.title, href: word.href });
    }
  } else if (section === "grammar" && a) {
    const topic = grammar.topics[a];
    if (topic) crumbs.push({ label: topic.titlePt || topic.title, href: `/grammar/${a}` });
  } else if (section === "conjugations" && a) {
    crumbs.push({ label: a.toLowerCase(), href: `/conjugations/${a}` });
  } else if (section === "exams" && a) {
    crumbs.push({ label: a.toUpperCase(), href: `/exams/${a}` });
  } else if (section === "lessons" && a) {
    const lesson = getResolvedLesson(a);
    if (lesson) crumbs.push({ label: lesson.ptTitle || lesson.title });
  }
  return crumbs;
}
