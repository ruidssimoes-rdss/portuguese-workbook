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
    <div className="inline-flex gap-0.5 bg-[#F7F7F5] rounded-md p-0.5">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-3 py-[5px] rounded-[5px] text-[12px] border-none cursor-pointer transition-all duration-100 ${
            value === option
              ? "bg-white text-[#111111] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              : "bg-transparent text-[#9B9DA3] hover:text-[#6C6B71]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
