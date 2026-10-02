/**
 * TipBox — fully enclosed navy callout (Figma: Callout / Accent).
 *
 * <TipBox>Unlike English, Portuguese uses articles with proper nouns.</TipBox>
 */

export function TipBox({ children, label = "Dica" }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint px-3.5 py-2.5">
      <div className="text-[12.5px] leading-relaxed text-aula-text">
        <span className="font-semibold text-aula-accent">{label}: </span>
        {children}
      </div>
    </div>
  );
}
