interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <p
      className={`text-[13px] text-text-secondary py-8${className ? ` ${className}` : ""}`}
    >
      {message}
    </p>
  );
}
