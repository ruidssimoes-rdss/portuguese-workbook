"use client";

import { useState } from "react";
import { Lightbulb, Copy, Check } from "lucide-react";
import type { BlocoActions } from "../smart-bloco.types";

interface ActionRowProps {
  actions: BlocoActions;
  copyText?: string;
}

export function ActionRow({ actions, copyText }: ActionRowProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!copyText) return;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-[var(--bloco-badge-gap)]">
      {actions.hasTip && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            actions.onTip?.();
          }}
          className="inline-flex items-center gap-[8px] h-[24px] px-[12px] py-[4px] rounded-[var(--bloco-radius-badge)] font-[family-name:var(--font-sans)] text-[13px] font-normal cursor-pointer transition-colors duration-150"
          style={{
            backgroundColor: "rgba(234, 88, 12, 0.1)",
            border: "0.8px solid var(--color-bloco-tip)",
            color: "var(--color-bloco-tip)",
          }}
          type="button"
        >
          <Lightbulb size={14} />
          Tip
        </button>
      )}
      {actions.hasCopy && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleCopy();
          }}
          className="inline-flex items-center gap-[8px] h-[24px] px-[12px] py-[4px] rounded-[var(--bloco-radius-badge)] font-[family-name:var(--font-sans)] text-[13px] font-normal cursor-pointer transition-colors duration-150 hover:bg-[rgba(156,163,175,0.15)]"
          style={{
            border: "0.8px solid var(--color-bloco-text-muted)",
            color: copied
              ? "var(--color-bloco-success)"
              : "var(--color-bloco-text-muted)",
          }}
          aria-label="Copy example sentence"
          type="button"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied ✓" : "Copy"}
        </button>
      )}
    </div>
  );
}
