/**
 * TipBox — yellow highlighted tip/note box.
 * Used in grammar expanded sections.
 *
 * <TipBox>Unlike English, Portuguese uses articles with proper nouns.</TipBox>
 */

export function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#FFFBEB] border-[0.5px] border-[#FEF3C7] rounded-lg px-3.5 py-2.5">
      <div className="text-[12px] text-[#92400E] leading-relaxed">
        <span className="font-medium">Tip: </span>
        {children}
      </div>
    </div>
  );
}
