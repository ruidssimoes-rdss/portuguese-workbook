/**
 * SectionLabel — tiny uppercase label for grouping content.
 * Used on the homepage ("THIS WEEK", "QUICK ACCESS") and sidebar ("LEARN", "YOU").
 *
 * <SectionLabel>This week</SectionLabel>
 */

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9B9DA3] mb-3">
      {children}
    </div>
  );
}
