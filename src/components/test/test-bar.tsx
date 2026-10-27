import Link from "next/link";

const SECONDARY =
  "inline-flex h-7 shrink-0 items-center justify-center rounded-lg border border-aula-border bg-white px-3 text-[12.5px] font-medium text-aula-text transition-colors hover:bg-aula-sunken";

/** Top bar of the test canvas: where you are, and the way out. */
export function TestBar({ title, lessonId }: { title: string; lessonId: string }) {
  return (
    <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-aula-text">{title}</p>
      <Link href={`/lessons/${lessonId}`} className={SECONDARY}>
        Sair
      </Link>
    </div>
  );
}

export { SECONDARY as TEST_SECONDARY };
