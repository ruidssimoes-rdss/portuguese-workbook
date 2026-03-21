/**
 * ListContainer — bordered rounded box that holds rows.
 * Used for vocab lists, grammar topics, activity feeds, etc.
 *
 * <ListContainer>
 *   <ListRow>...</ListRow>
 *   <ListRow>...</ListRow>
 * </ListContainer>
 */

interface ListContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ListContainer({ children, className = "" }: ListContainerProps) {
  return (
    <div
      className={`flex flex-col gap-px border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
