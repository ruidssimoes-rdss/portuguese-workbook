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
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9DA3]"
        strokeWidth={2}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-3 py-1.5 border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg text-[12px] w-[220px] bg-white text-[#111111] outline-none placeholder:text-[#9B9DA3] focus:border-[rgba(0,0,0,0.12)] transition-colors"
      />
    </div>
  );
}
