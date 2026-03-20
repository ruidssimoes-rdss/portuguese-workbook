"use client";

import Link from "next/link";
import type { SmartBlocoProps } from "./smart-bloco.types";
import { BadgeRow } from "./parts/badge-row";
import { ExampleBlock } from "./parts/example-block";
import { ProgressBar } from "./parts/progress-bar";
import { FooterRow } from "./parts/footer-row";
import { StatDisplay } from "./parts/stat-display";
import { ActionRow } from "./parts/action-row";

export function SmartBloco({
  title,
  subtitle,
  pronunciation,
  translation,
  description,
  hasAudio,
  cefrLevel,
  metaBadge,
  example,
  expandedContent,
  actions,
  footer,
  progress,
  stat,
  onClick,
  href,
  className = "",
}: SmartBlocoProps) {
  const isClickable = Boolean(onClick || href);
  const isLocked = progress?.isLocked;

  // ── Stat mode ────────────────────────────────────────

  if (stat) {
    return (
      <article
        className={`
          bg-[var(--color-bloco-surface)]
          border border-[rgba(156,163,175,0.5)]
          rounded-[var(--bloco-radius)]
          p-[var(--bloco-padding)]
          max-w-[150px] w-full min-w-[120px]
          ${className}
        `}
      >
        <StatDisplay stat={stat} />
      </article>
    );
  }

  // ── Card content ─────────────────────────────────────

  const cardContent = (
    <>
      {/* Badge row */}
      <BadgeRow
        title={title}
        hasAudio={hasAudio}
        cefrLevel={cefrLevel}
        metaBadge={metaBadge}
      />

      {/* Core content */}
      <div className="flex flex-col gap-[var(--bloco-section-gap)]">
        {/* Title + pronunciation + translation row */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-[20px] flex-wrap">
              <span className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text)]">
                {title}
              </span>
              {pronunciation && (
                <span className="font-[family-name:var(--font-mono)] text-[13px] font-normal italic text-[var(--color-bloco-text-muted)]">
                  {pronunciation}
                </span>
              )}
            </div>
            {translation && (
              <span
                className="font-[family-name:var(--font-content)] text-[12px] font-medium shrink-0"
                style={{ color: "var(--color-bloco-primary)" }}
              >
                {translation}
              </span>
            )}
          </div>
          {subtitle && (
            <span
              className="font-[family-name:var(--font-content)] text-[12px] font-medium block mt-[4px]"
              style={{ color: "var(--color-bloco-primary)" }}
            >
              {subtitle}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text-muted)] leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* Example */}
        {example && <ExampleBlock example={example} />}

        {/* Progress */}
        {progress && <ProgressBar progress={progress} />}
      </div>

      {/* Actions */}
      {actions && (
        <ActionRow
          actions={actions}
          copyText={
            example
              ? `${example.portuguese} — ${example.english}`
              : undefined
          }
        />
      )}

      {/* Expanded content */}
      {expandedContent && (
        <div className="pt-[var(--bloco-padding)] border-t border-[var(--color-bloco-border-divider)]">
          {expandedContent}
        </div>
      )}

      {/* Footer */}
      {footer && <FooterRow footer={footer} />}
    </>
  );

  // ── Shell ────────────────────────────────────────────

  const hasExpanded = Boolean(expandedContent);
  const maxWidth = hasExpanded ? "max-w-[700px]" : "max-w-[340px]";

  const shellClasses = `
    @container
    bg-[var(--color-bloco-surface)]
    border border-[rgba(156,163,175,0.5)]
    rounded-[var(--bloco-radius)]
    p-[var(--bloco-padding)]
    ${maxWidth} w-full
    flex flex-col gap-[var(--bloco-section-gap)]
    ${isClickable ? "cursor-pointer transition-all duration-150 ease-out hover:bg-[rgba(0,0,0,0.02)] hover:border-[rgba(156,163,175,0.7)] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100" : ""}
    ${isLocked ? "opacity-50 pointer-events-none" : ""}
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#163EA4] focus-visible:outline-none
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className="block">
        <article
          className={shellClasses}
          aria-disabled={isLocked || undefined}
        >
          {cardContent}
        </article>
      </Link>
    );
  }

  if (onClick) {
    return (
      <article
        className={shellClasses}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-disabled={isLocked || undefined}
      >
        {cardContent}
      </article>
    );
  }

  return (
    <article
      className={shellClasses}
      aria-disabled={isLocked || undefined}
    >
      {cardContent}
    </article>
  );
}
