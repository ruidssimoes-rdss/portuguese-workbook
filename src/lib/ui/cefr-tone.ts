/** Token classes for a CEFR level tag. A1 fresh, A2 accent, B1 learning. */
export function cefrTone(level: string): string {
  switch (level.toUpperCase()) {
    case "A1":
      return "bg-state-fresh-bg text-state-fresh";
    case "A2":
      return "bg-accent-subtle text-accent";
    case "B1":
      return "bg-state-learning-bg text-state-learning";
    default:
      return "bg-surface-sunken text-text-quaternary";
  }
}
