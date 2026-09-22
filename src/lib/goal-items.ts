/**
 * Goal planning — client-safe helpers over a small curriculum index that
 * the server builds (see src/lib/curriculum-index.ts).
 */

export interface CurriculumIndex {
  lessons: Array<{ id: string; title: string; ptTitle: string; cefr: "A1" | "A2" | "B1" }>;
  verbsA1: Array<{ id: string; title: string }>;
  grammarA1: Array<{ id: string; title: string }>;
}

export type GoalLinkedType = "lesson" | "verb" | "grammar";

export function buildGoalItems(
  goalType: string,
  index: CurriculumIndex,
  completedLessonIds: Set<string>
): { items: Array<{ id: string; title: string }>; linkedType: GoalLinkedType } {
  const lessonsFor = (cefr: "A1" | "A2" | "B1") =>
    index.lessons
      .filter((l) => l.cefr === cefr && !completedLessonIds.has(l.id))
      .map((l) => ({ id: l.id, title: l.ptTitle ?? l.title }));

  switch (goalType) {
    case "lessons_a1":
      return { items: lessonsFor("A1"), linkedType: "lesson" };
    case "lessons_a2":
      return { items: lessonsFor("A2"), linkedType: "lesson" };
    case "lessons_b1":
      return { items: lessonsFor("B1"), linkedType: "lesson" };
    case "verbs_a1":
      return { items: index.verbsA1, linkedType: "verb" };
    case "grammar_a1":
      return { items: index.grammarA1, linkedType: "grammar" };
    default:
      return { items: [], linkedType: "lesson" };
  }
}
