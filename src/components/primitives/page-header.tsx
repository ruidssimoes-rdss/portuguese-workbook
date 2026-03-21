/**
 * PageHeader — title + optional subtitle + optional description.
 * Used at the top of every page.
 *
 * <PageHeader title="Gramática" subtitle="31 topics across A1, A2, and B1" />
 * <PageHeader title="Boa tarde, Kim" subtitle="You're on lesson 14..." />
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // For custom content below the subtitle
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-[22px] font-medium text-[#111111] tracking-[-0.02em] m-0">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[13px] text-[#6C6B71] mt-1 m-0">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
