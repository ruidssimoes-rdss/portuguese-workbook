import { Link2, BookOpen } from "lucide-react";
import type { BlocoFooter } from "../smart-bloco.types";

interface FooterRowProps {
  footer: BlocoFooter;
}

function ContentTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-[8px] h-[29px] px-[12px] py-[4px] rounded-[var(--bloco-radius-tag)] font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text-muted)] whitespace-nowrap"
      style={{
        backgroundColor: "rgba(156, 163, 175, 0.05)",
        border: "1px solid var(--color-bloco-text-muted)",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function StatusBadge({ label, isLocked }: { label: string; isLocked?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center h-[25px] px-[10px] py-[4px] rounded-[var(--bloco-radius-badge)] font-[family-name:var(--font-sans)] text-[12px] font-medium uppercase tracking-[0.6px] whitespace-nowrap ${isLocked ? "opacity-50" : ""}`}
      style={{
        backgroundColor: "rgba(156, 163, 175, 0.05)",
        border: "0.8px solid rgba(156, 163, 175, 0.5)",
        color: isLocked ? "var(--color-bloco-text-muted)" : "rgba(156, 163, 175, 0.5)",
      }}
    >
      {label}
    </span>
  );
}

export function FooterRow({ footer }: FooterRowProps) {
  const {
    relatedCount,
    wordCount,
    itemCount,
    ruleCount,
    questionCount,
    label,
  } = footer;

  // Lesson-style footer: status badge (Open/Locked) + item count
  const isLessonFooter = label && (label === "Open" || label === "Locked");
  if (isLessonFooter) {
    return (
      <div className="flex items-center justify-between">
        <StatusBadge label={label} isLocked={label === "Locked"} />
        {itemCount && (
          <span className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text-muted)]">
            {itemCount} items
          </span>
        )}
      </div>
    );
  }

  // Tag-style footer (rules, questions, word counts, labels as tags)
  const hasTags = ruleCount || questionCount;
  const hasLabelOnly = label && !relatedCount && !hasTags;

  if (hasTags || (hasLabelOnly && !wordCount && !itemCount)) {
    return (
      <div className="flex flex-wrap items-start gap-[var(--bloco-section-gap)]">
        {ruleCount && (
          <ContentTag
            icon={<BookOpen size={14} />}
            label={`${ruleCount} Rules`}
          />
        )}
        {questionCount && (
          <ContentTag
            icon={<BookOpen size={14} />}
            label={`${questionCount} Questions`}
          />
        )}
        {wordCount && (
          <ContentTag
            icon={<BookOpen size={14} />}
            label={`${wordCount} words`}
          />
        )}
        {label && (
          <ContentTag icon={<BookOpen size={14} />} label={label} />
        )}
      </div>
    );
  }

  // Standard footer: related count + word/item count
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-[4px]">
        {relatedCount !== undefined && (
          <>
            <Link2
              size={14}
              className="text-[var(--color-bloco-text-muted)]"
            />
            <span className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text-muted)]">
              Related ({relatedCount})
            </span>
          </>
        )}
      </div>
      {(wordCount || itemCount) && (
        <span className="font-[family-name:var(--font-sans)] text-[13px] font-normal text-[var(--color-bloco-text-muted)]">
          {wordCount
            ? `${wordCount} words`
            : itemCount
              ? `${itemCount} items`
              : ""}
        </span>
      )}
    </div>
  );
}
