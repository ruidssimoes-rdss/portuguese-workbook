/**
 * CardShell — bordered rounded box for card-style content.
 * Used for culture cards, quick-link cards, CTA cards.
 *
 * <CardShell>...card content...</CardShell>
 * <CardShell interactive>...clickable card...</CardShell>
 */

interface CardShellProps {
  children: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CardShell({
  children,
  interactive = false,
  onClick,
  className = "",
}: CardShellProps) {
  return (
    <div
      onClick={onClick}
      className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-4 transition-colors duration-100 ${
        interactive || onClick
          ? "cursor-pointer hover:border-[rgba(0,0,0,0.12)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
