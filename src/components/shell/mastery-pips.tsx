import type { LearningState } from "@/lib/learning-state";

const FILL: Record<LearningState, string> = {
  overdue: "bg-state-overdue",
  learning: "bg-state-learning",
  mastered: "bg-state-mastered",
  unseen: "bg-track-empty",
};

/** Five segments, one per mastery level. */
export function MasteryPips({
  level,
  state,
  size = "sm",
}: {
  level: number;
  state: LearningState;
  size?: "sm" | "lg";
}) {
  const seg = size === "lg" ? "h-1 flex-1" : "h-[3px] w-3";
  return (
    <span
      role="img"
      aria-label={`nível ${level} de 5`}
      className={`flex items-center ${size === "lg" ? "w-full gap-1" : "gap-[3px]"}`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`${seg} rounded-pill ${i <= level ? FILL[state] : "bg-track-empty"}`} />
      ))}
    </span>
  );
}
