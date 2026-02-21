"use client";

import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import changelogData from "@/data/changelog.json";

type ChangelogEntry = {
  date: string;
  version: string;
  title: string;
  summary?: string;
  changes: string[];
};

type ChangelogData = { entries: ChangelogEntry[] };

const data = changelogData as unknown as ChangelogData;

const ACCENT = "#111827";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ChangelogPage() {
  const entries = data.entries ?? [];

  return (
    <>
      <Topbar />
      <main className="max-w-[896px] mx-auto px-4 md:px-6 lg:px-10 pb-16">
        <header className="py-5">
          <h1 className="text-2xl font-bold tracking-tight text-text">
            What&apos;s New
          </h1>
          <p className="text-[13px] text-text-3 mt-1">
            Latest updates and improvements to Aula PT
          </p>
        </header>

        <div className="relative pl-6 md:pl-8 space-y-0" style={{ borderLeftWidth: "2px", borderColor: ACCENT }}>
          {entries.map((entry) => (
            <div key={entry.version} className="relative pb-8 last:pb-0">
              {/* Dot on timeline — 8px circle */}
              <div
                className="absolute rounded-full border-2 border-white shadow-sm top-1.5 -left-[21px] md:-left-[25px] box-content"
                style={{ width: "8px", height: "8px", backgroundColor: ACCENT }}
              />
              <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                <time className="text-sm text-[#6B7280]">
                  {formatDate(entry.date)}
                </time>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  v{entry.version}
                </span>
              </div>
              <h2 className="text-[15px] font-semibold text-text mb-2">
                {entry.title}
              </h2>
              {entry.summary ? (
                <p className="text-[15px] text-[#6B7280] mb-2 leading-snug">
                  {entry.summary}
                </p>
              ) : null}
              <ul className="list-disc list-inside space-y-1 text-sm text-[#374151] pl-1">
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
