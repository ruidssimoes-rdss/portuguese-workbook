"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/conjugations", label: "Conjugations" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/grammar", label: "Grammar" },
  { href: "/practice", label: "Practice" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-l">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[15px] tracking-tight"
          >
            🇵🇹 Aula PT
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  pathname?.startsWith(item.href)
                    ? "bg-bg-h text-text"
                    : "text-text-2 hover:text-text hover:bg-bg-s"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[13px] text-text-3 cursor-text min-w-[160px]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-40 shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span>Search…</span>
            <kbd className="ml-auto text-[11px] px-1.5 py-0.5 border border-border rounded text-text-3 font-sans">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>
    </header>
  );
}
