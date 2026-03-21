"use client";

/**
 * ListRow — a single hoverable row inside a ListContainer.
 * Content is completely flexible via children.
 *
 * <ListRow>
 *   <span>o café</span>
 *   <span>coffee</span>
 *   <BadgePill level="A1" />
 * </ListRow>
 *
 * <ListRow onClick={() => toggle(id)} expandable expanded={isOpen}>
 *   ...header content...
 * </ListRow>
 */

interface ListRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ListRow({ children, onClick, className = "" }: ListRowProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white px-4 py-3 transition-colors duration-100 ${
        onClick ? "cursor-pointer hover:bg-[#F7F7F5]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
