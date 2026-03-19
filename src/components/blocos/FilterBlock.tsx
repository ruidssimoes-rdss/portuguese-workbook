"use client";

import { Search, ChevronDown } from "lucide-react";

interface FilterPillOption {
  label: string;
  value: string;
}

interface FilterBlockProps {
  pills?: {
    options: FilterPillOption[];
    value: string;
    onChange: (value: string) => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  dropdown?: {
    label: string;
    options: FilterPillOption[];
    value: string;
    onChange: (value: string) => void;
  };
  count?: {
    showing: number;
    total: number;
  };
}

export function FilterBlock({ pills, search, dropdown, count }: FilterBlockProps) {
  return (
    <div className="pb-6">
      {/* Row 1: pills + dropdown | search */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Pills */}
          {pills && (
            <div className="flex items-center gap-1.5 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              {pills.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => pills.onChange(opt.value)}
                  className={`shrink-0 px-4 py-2 min-h-[44px] rounded-full text-[13px] border transition-colors duration-150 cursor-pointer ${
                    pills.value === opt.value
                      ? "font-medium bg-[#111827] text-white border-[#111827]"
                      : "font-normal bg-white text-[#9CA3AF] border-[#F3F4F6] hover:border-[#E5E7EB] hover:text-[#6B7280]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Dropdown */}
          {dropdown && (
            <div className="relative">
              <select
                value={dropdown.value}
                onChange={(e) => dropdown.onChange(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 rounded-full text-[13px] font-normal bg-white text-[#9CA3AF] border border-[#F3F4F6] hover:border-[#E5E7EB] hover:text-[#6B7280] transition-colors duration-150 cursor-pointer focus:outline-none focus:border-[#E5E7EB] focus:ring-1 focus:ring-[#003399]/20"
              >
                {dropdown.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
          )}
        </div>

        {/* Search */}
        {search && (
          <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || "Search..."}
              className="pl-9 pr-4 py-2.5 rounded-lg border border-[#F3F4F6] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#E5E7EB] focus:ring-1 focus:ring-[#003399]/20 focus:outline-none transition-colors duration-150 w-full sm:w-[240px] md:w-[280px]"
            />
          </div>
        )}
      </div>

      {/* Row 2: count */}
      {count && (
        <p className="text-[13px] text-[#9CA3AF] mt-3">
          Showing {count.showing} of {count.total}
        </p>
      )}
    </div>
  );
}
