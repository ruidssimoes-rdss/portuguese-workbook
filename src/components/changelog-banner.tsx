"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const STORAGE_KEY = "aula-pt-changelog-dismissed";

type Props = {
  version: string;
  title: string;
  /** If set, shown in banner instead of first change. Truncated on mobile. */
  summary?: string;
  /** Fallback when summary is not set (backward compatible). */
  firstChange?: string;
};

export function ChangelogBanner({ version, title, summary, firstChange }: Props) {
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setDismissedVersion(localStorage.getItem(STORAGE_KEY));
    } catch {
      setDismissedVersion(null);
    }
    setMounted(true);
  }, []);

  const show = mounted && dismissedVersion !== version;
  const bannerText = summary ?? (firstChange ? firstChange : "");

  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(STORAGE_KEY, version);
      setDismissedVersion(version);
    } catch {
      setDismissedVersion(version);
    }
  };

  if (!show) return null;

  return (
    <div
      className="mt-6 mb-4 rounded-lg border border-blue-200 bg-sky-50 px-4 py-3 flex items-center gap-3"
      style={{ borderLeftWidth: "3px", borderLeftColor: "#111827" }}
    >
      <Link
        href="/changelog"
        className="flex-1 min-w-0 flex items-center gap-2 text-[14px] text-text hover:text-text group"
      >
        <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
          v{version}
        </span>
        <span className="font-medium truncate">
          {title}
          {bannerText ? (
            <span className="hidden sm:inline">
              {" · "}
              <span className="font-normal truncate max-w-[40ch] inline-block align-bottom">
                {bannerText}
              </span>
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-blue-800 group-hover:underline text-[13px]">
          See all updates →
        </span>
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 p-1.5 rounded-md text-text-3 hover:text-text hover:bg-blue-100 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
