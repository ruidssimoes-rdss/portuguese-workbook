"use client";

import Link from "next/link";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
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

const ACCENT = "#1F1F1F";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ChangelogPage() {
  const entries = data.entries ?? [];

  return (
    <PageShell header={<Crumbs items={[{ label: "Novidades" }]} />}>
      <div className="mx-auto max-w-[620px] pb-16">
        <header className="py-5">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">
            Novidades
          </h1>
          <p className="text-[13px] text-text-3 mt-1">
            O que mudou no Aula
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
                <time className="text-sm text-[#6B6B69]">
                  {formatDate(entry.date)}
                </time>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F3F5FA] text-[#1B2B61] border border-[#D3DAEB]">
                  v{entry.version}
                </span>
              </div>
              <h2 className="text-[15px] font-semibold text-text mb-2">
                {entry.title}
              </h2>
              {entry.summary ? (
                <p className="text-[15px] text-[#6B6B69] mb-2 leading-snug">
                  {entry.summary}
                </p>
              ) : null}
              <ul className="list-disc list-inside space-y-1 text-sm text-[#1F1F1F] pl-1">
                {entry.changes.map((change, j) => (
                  <li key={j}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
