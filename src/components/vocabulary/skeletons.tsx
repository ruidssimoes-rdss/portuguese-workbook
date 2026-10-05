import { Panel } from "@/components/shell/panel";
import { Skeleton } from "@/components/shell/skeleton";

/** Same box model as WordNote, line for line. */
export function WordNoteSkeleton() {
  return (
    <div aria-busy className="mx-auto w-full max-w-[620px] pt-[46px] pb-24">
      <div className="flex h-7 items-center"><Skeleton className="h-5 w-40" /></div>
      <div className="mt-2.5 flex h-6 items-center gap-2.5">
        <Skeleton className="h-6 w-[108px] rounded-pill" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="mt-9 flex h-6 items-center"><Skeleton className="h-4 w-56" /></div>
      <div className="mt-7 grid grid-cols-[192px_1fr] gap-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="flex h-[14px] items-center"><Skeleton className="h-2 w-16" /></div>
            <div className="mt-1 flex h-[18px] items-center"><Skeleton className="h-3 w-28" /></div>
          </div>
        ))}
      </div>
      <hr className="mt-8 border-border-default" />
      <div className="mt-8 flex h-[14px] items-center"><Skeleton className="h-2 w-16" /></div>
      <div className="mt-4 flex gap-2.5">
        <Skeleton className="size-5" />
        <div>
          <div className="flex h-[21px] items-center"><Skeleton className="h-3 w-52" /></div>
          <div className="mt-0.5 flex h-[17px] items-center"><Skeleton className="h-2.5 w-40" /></div>
        </div>
      </div>
    </div>
  );
}

export function IndexSkeleton() {
  return (
    <div aria-busy className="mx-auto w-full max-w-[620px] pt-[46px] pb-24">
      <div className="flex h-7 items-center"><Skeleton className="h-5 w-36" /></div>
      <div className="mt-1.5 flex h-[17px] items-center"><Skeleton className="h-2.5 w-64" /></div>
      <div className="mt-6 h-[30px] border-b border-border-default" />
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex h-[33px] items-center gap-3 border-b border-border-subtle">
          <Skeleton className="h-3 w-[120px]" />
          <Skeleton className="ml-[68px] h-3 w-[110px]" />
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({ label }: { label: string }) {
  return (
    <Panel label={label}>
      <div aria-busy className="rounded-card border border-border-default bg-surface-raised p-4">
        <div className="flex h-[18px] items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2.5 w-14" />
        </div>
        <Skeleton className="mt-2.5 h-1 w-full" />
        <div className="mt-4 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex h-[17px] items-center justify-between">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-8 w-full rounded-control" />
      </div>
    </Panel>
  );
}
