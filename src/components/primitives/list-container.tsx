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
      className={`flex flex-col divide-y divide-aula-line border border-aula-border rounded-xl overflow-hidden bg-white ${className}`}
    >
      {children}
    </div>
  );
}
