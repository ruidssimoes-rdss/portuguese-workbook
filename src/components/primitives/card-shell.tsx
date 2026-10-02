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
      className={`border border-aula-border rounded-xl p-4 bg-white transition-colors duration-100 ${
        interactive || onClick
          ? "cursor-pointer hover:border-aula-text-4"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
