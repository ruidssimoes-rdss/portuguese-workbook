import type { LearningState } from "@/lib/learning-state";

const DOT: Record<LearningState, string> = {
  overdue: "bg-state-overdue",
  learning: "bg-state-learning",
  mastered: "bg-state-mastered",
  unseen: "bg-state-unseen",
};

/** 6px learning-state dot; overdue items show their days late beside it. */
export function StateDot({ state, overdueDays }: { state: LearningState; overdueDays?: number | null }) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">
      {state === "overdue" && overdueDays != null && (
        <span className="text-caption tabular-nums text-state-overdue">{overdueDays}d</span>
      )}
      <span aria-hidden className={`size-1.5 rounded-full ${DOT[state]}`} />
      <span className="sr-only">{stateSrLabel(state, overdueDays)}</span>
    </span>
  );
}

function stateSrLabel(state: LearningState, days?: number | null): string {
  if (state === "overdue") return `em atraso ${days ?? ""} dias`;
  if (state === "learning") return "a aprender";
  if (state === "mastered") return "dominada";
  return "por ver";
}
