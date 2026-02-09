"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import changelogData from "@/data/changelog.json";

type ChangelogEntry = {
  date: string;
  version: string;
  title: string;
  changes: string[];
};

type ChangelogData = { entries: ChangelogEntry[] };

const data = changelogData as unknown as ChangelogData;

const INDIGO = "#5B4FA0";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ChangelogPage() {
  const entries = data.entries ?? [];

  return (
    <>
      <Topbar />
      <main className="max-w-[1100px] mx-auto px-6 md:px-10 pb-16">
        <header className="pt-10 pb-8">
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-text">
            What&apos;s New
          </h1>
          <p className="text-text-2 text-[15px] mt-1">
            Latest updates and improvements to Aula PT
          </p>
        </header>

        <div className="relative pl-6 md:pl-8 border-l-2 space-y-0" style={{ borderColor: INDIGO }}>
          {entries.map((entry) => (
            <div key={entry.version} className="relative pb-10 last:pb-0">
              {/* Dot on timeline */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm top-1 -left-[21px]"
                style={{ backgroundColor: INDIGO }}
              />
              <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                <time className="text-[13px] text-text-3 font-medium">
                  {formatDate(entry.date)}
                </time>
                <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  v{entry.version}
                </span>
              </div>
              <h2 className="text-[17px] font-bold text-text mb-2">
                {entry.title}
              </h2>
              <ul className="list-disc list-inside space-y-1 text-[14px] text-text-2 pl-1">
                {entry.changes.map((change, j) => (
                  <li key={j}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
