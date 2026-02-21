'use client';

import Link from 'next/link';

// ============================================================
// 1. PageContainer — the max-width + padding wrapper used on every page
//    Replaces: max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-5
//    Found repeated 10x across the codebase
// ============================================================
export function PageContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-5 ${className}`}>
      {children}
    </div>
  );
}

// ============================================================
// 2. SectionLabel — the uppercase tracking-widest labels
//    Replaces: text-xs font-semibold tracking-widest uppercase text-[#6B7280]/50
//    Used for: RULES, EXAMPLES, NOTE, TIPS & TRICKS, etc.
// ============================================================
export function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-text-secondary/50 ${className}`}>
      {children}
    </span>
  );
}

// ============================================================
// 3. SurfaceCard — the rounded container with subtle bg
//    Replaces: bg-[#FAFAFA] rounded-xl p-4 sm:p-6 border border-[#E5E7EB]
//    Used for: intro cards, content containers
// ============================================================
export function SurfaceCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface rounded-xl p-4 sm:p-6 border border-border ${className}`}>
      {children}
    </div>
  );
}

// ============================================================
// 4. CEFRBadge — the level indicator pill
//    Replaces: scattered CEFR badge implementations
//    Standardizes the colour mapping across the app
// ============================================================
export function CEFRBadge({ level, size = 'sm' }: { level: string; size?: 'sm' | 'md' }) {
  const colorMap: Record<string, string> = {
    A1: 'border-cefr-a1/20 text-cefr-a1',
    A2: 'border-cefr-a2/20 text-cefr-a2',
    B1: 'border-cefr-b1/20 text-cefr-b1',
  };
  const colors = colorMap[level.toUpperCase()] || colorMap['A1'];
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${colors} ${sizeClasses}`}>
      {level.toUpperCase()}
    </span>
  );
}

// ============================================================
// 5. CrossLinkButton — the styled link to another grammar topic
//    Replaces: inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
//              border border-[#0144C0]/15 text-[#0144C0] text-sm font-medium
//    Used in grammar rule exceptions
// ============================================================
export function CrossLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-accent text-xs sm:text-sm font-medium hover:border-[#D1D5DB] hover:bg-[#FAFAFA] transition-all duration-200"
    >
      {label}
      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// ============================================================
// 6. FilterPill — the rounded filter/tab buttons
//    Replaces: repeated filter pill patterns in vocabulary, grammar, culture
// ============================================================
export function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-[#111827] text-white border-[#111827]'
          : 'border-border text-text-secondary hover:border-[#D1D5DB] hover:text-[#111827]'
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================
// 7. SearchInput — the search box pattern
//    Replaces: identical search input class strings repeated 7x
// ============================================================
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`px-4 py-2 rounded-full border border-border text-sm text-text bg-white placeholder:text-text-muted focus:outline-none focus:border-[#111827] transition-colors ${className}`}
    />
  );
}
