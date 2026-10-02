"use client";

/**
 * TabBar — segmented tabs (no underline-for-state; Figma: PanelTabs).
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
    <div className="mb-5 inline-flex flex-wrap gap-0.5 rounded-lg bg-aula-sunken p-[3px]">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`h-[26px] rounded-md border px-3 text-[12px] transition-colors duration-100 ${
            value === tab
              ? "border-aula-line bg-white font-medium text-aula-text shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              : "border-transparent text-aula-text-2 hover:text-aula-text"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
