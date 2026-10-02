"use client";

/**
 * SearchInput — search field with icon. Used on vocab, grammar, culture pages.
 *
 * <SearchInput placeholder="Search words..." value={q} onChange={setQ} />
 */

import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#98988F]"
        strokeWidth={2}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pl-8 pr-3 border border-aula-line rounded-lg text-[12px] w-[240px] max-md:w-full bg-aula-sunken text-aula-text outline-none placeholder:text-aula-text-3 focus:border-aula-border focus:bg-white transition-colors"
      />
    </div>
  );
}
