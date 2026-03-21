"use client";

/**
 * TabBar — underline-style tabs for category switching.
 * Used on the culture page.
 *
 * <TabBar tabs={["All", "Traditions", "Food"]} value="All" onChange={setTab} />
 */

interface TabBarProps {
  tabs: string[];
  value: string;
  onChange: (value: string) => void;
}

export function TabBar({ tabs, value, onChange }: TabBarProps) {
  return (
    <div className="flex gap-0 border-b-[0.5px] border-[rgba(0,0,0,0.06)] mb-5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-3.5 py-2 text-[12px] border-none cursor-pointer bg-transparent transition-colors duration-100 -mb-[0.5px] ${
            value === tab
              ? "text-[#111111] font-medium border-b-[1.5px] border-b-[#111111]"
              : "text-[#9B9DA3] border-b-[1.5px] border-b-transparent hover:text-[#6C6B71]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
