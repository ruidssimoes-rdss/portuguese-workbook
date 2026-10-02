"use client";

/**
 * SegmentedFilter — pill-group toggle for filtering (e.g., CEFR levels).
 *
 * <SegmentedFilter
 *   options={["All", "A1", "A2", "B1"]}
 *   value="All"
 *   onChange={setFilter}
 * />
 */

interface SegmentedFilterProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedFilter({
  options,
  value,
  onChange,
}: SegmentedFilterProps) {
  return (
    <div className="inline-flex gap-0.5 bg-aula-sunken rounded-lg p-[3px]">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-3 h-[26px] rounded-md text-[12px] border cursor-pointer transition-all duration-100 ${
            value === option
              ? "bg-white text-aula-text font-medium border-aula-line shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              : "bg-transparent border-transparent text-aula-text-2 hover:text-aula-text"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
