"use client";

import { useState, useCallback, useEffect } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", className }: CopyButtonProps) {
  const [supported, setSupported] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && !!navigator.clipboard);
  }, []);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`text-[12px] transition-colors duration-150 cursor-pointer ${
        copied ? "text-[#0F6E56]" : "text-[#9B9DA3] hover:text-[#6C6B71]"
      } ${className ?? ""}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
