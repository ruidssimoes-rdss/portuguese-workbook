import { cefrTone } from "@/lib/ui/cefr-tone";

export function LevelTag({ level }: { level: string }) {
  return (
    <span className={`inline-flex h-[18px] items-center rounded-xs px-1.5 text-caption font-medium ${cefrTone(level)}`}>
      {level}
    </span>
  );
}
