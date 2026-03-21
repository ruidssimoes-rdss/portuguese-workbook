import Link from "next/link";
import type { ReactNode } from "react";

interface CrossLinkTextProps {
  text: string;
  className?: string;
}

/** Renders text with inline [label](/path) markdown links as Next.js Link components */
export function CrossLinkText({ text, className }: CrossLinkTextProps) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  const rendered: ReactNode[] = parts.map((part, i) => {
    const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (match) {
      return (
        <Link key={i} href={match[2]} className="text-[#185FA5] hover:underline font-medium">
          {match[1]}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });

  return <span className={className}>{rendered}</span>;
}
