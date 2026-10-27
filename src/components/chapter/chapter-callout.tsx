export function ChapterCallout({ tone, title, body }: { tone: "note" | "cultura"; title: string; body: string }) {
  if (tone === "note") {
    return (
      <div className="flex flex-col gap-1 rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint px-[14px] py-[12px]">
        <p className="text-[11px] font-medium text-aula-accent">{title}</p>
        <p className="text-[12px] leading-relaxed text-aula-text-2">{body}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] bg-aula-canvas px-[14px] py-[12px]">
      <p className="text-[11px] font-medium text-aula-text-3">{title}</p>
      <p className="text-[13px] leading-relaxed text-aula-text-2">{body}</p>
    </div>
  );
}
