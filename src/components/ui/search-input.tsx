"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full sm:w-[240px] px-3 py-1.5 rounded-full text-sm border border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] focus-visible:ring-2 focus-visible:ring-[#3C5E95] focus-visible:ring-offset-2 transition-all duration-150 bg-white${className ? ` ${className}` : ""}`}
    />
  );
}
