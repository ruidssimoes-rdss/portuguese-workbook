"use client";

/**
 * FilterBar — horizontal bar with segmented filter + search + optional extras.
 * Composes SegmentedFilter and SearchInput.
 *
 * <FilterBar
 *   filterOptions={["All", "A1", "A2", "B1"]}
 *   filterValue={level}
 *   onFilterChange={setLevel}
 *   searchPlaceholder="Search words..."
 *   searchValue={query}
 *   onSearchChange={setQuery}
 * />
 */

import { SegmentedFilter } from "./segmented-filter";
import { SearchInput } from "./search-input";

interface FilterBarProps {
  filterOptions?: string[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode; // For extra controls between filter and search
}

export function FilterBar({
  filterOptions,
  filterValue,
  onFilterChange,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  children,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      {filterOptions && filterValue && onFilterChange && (
        <SegmentedFilter
          options={filterOptions}
          value={filterValue}
          onChange={onFilterChange}
        />
      )}
      {children}
      <div className="flex-1" />
      {onSearchChange !== undefined && (
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue || ""}
          onChange={onSearchChange}
        />
      )}
    </div>
  );
}
