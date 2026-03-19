import { PageLayout } from "./PageLayout";
import { ContentGrid } from "./ContentGrid";

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#F3F4F6] rounded ${className ?? ""}`} />;
}

export function SmartBlockSkeleton({ variant = "default" }: { variant?: "default" | "stat" }) {
  if (variant === "stat") {
    return (
      <div className="bg-white border border-[#F3F4F6] rounded-xl p-4 md:p-6">
        <div className="flex flex-col items-center gap-2 py-2">
          <SkeletonPulse className="h-8 w-24" />
          <SkeletonPulse className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#F3F4F6] rounded-xl p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-5 w-36" />
          <SkeletonPulse className="h-4 w-48" />
        </div>
        <SkeletonPulse className="h-6 w-12 rounded-full" />
      </div>
      <SkeletonPulse className="h-20 w-full rounded-lg" />
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-4 w-20" />
        <SkeletonPulse className="h-4 w-16" />
      </div>
    </div>
  );
}

export function IntroBlockSkeleton({ hasBackLink = false }: { hasBackLink?: boolean }) {
  return (
    <div className="pb-8 space-y-4">
      {/* Row 1 — Breadcrumb */}
      <div className="flex items-baseline gap-3">
        {hasBackLink && (
          <>
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-4 w-2" />
          </>
        )}
        <SkeletonPulse className="h-4 w-40" />
        <SkeletonPulse className="h-4 w-28" />
      </div>
      {/* Row 2 — Description */}
      <SkeletonPulse className="h-4 w-80" />
      {/* Row 3 — Pills */}
      <div className="flex items-center gap-2">
        <SkeletonPulse className="h-8 w-24 rounded-full" />
        <SkeletonPulse className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function FilterBlockSkeleton() {
  return (
    <div className="pb-6 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-9 w-16 rounded-full" />
        <SkeletonPulse className="h-9 w-16 rounded-full" />
        <SkeletonPulse className="h-9 w-16 rounded-full" />
        <SkeletonPulse className="h-9 w-16 rounded-full" />
        <div className="ml-auto">
          <SkeletonPulse className="h-10 w-[240px] rounded-lg" />
        </div>
      </div>
      <SkeletonPulse className="h-4 w-28" />
    </div>
  );
}

export function PageSkeleton({
  hasBackLink = false,
  hasFilter = true,
  blockCount = 8,
  blockVariant = "default",
  columns,
}: {
  hasBackLink?: boolean;
  hasFilter?: boolean;
  blockCount?: number;
  blockVariant?: "default" | "stat";
  columns?: 1 | 2 | 3 | 4;
}) {
  return (
    <PageLayout>
      <IntroBlockSkeleton hasBackLink={hasBackLink} />
      {hasFilter && <FilterBlockSkeleton />}
      <ContentGrid columns={columns}>
        {Array.from({ length: blockCount }).map((_, i) => (
          <SmartBlockSkeleton key={i} variant={blockVariant} />
        ))}
      </ContentGrid>
    </PageLayout>
  );
}
