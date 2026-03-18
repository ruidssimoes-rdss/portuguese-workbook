import { patterns } from "@/lib/design-tokens";

interface EmptyStateProps {
  message?: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ message, title, description, action, className }: EmptyStateProps) {
  // If using the simple message prop (backward compatible)
  if (message && !title) {
    return (
      <p className={`text-[13px] text-text-secondary py-8${className ? ` ${className}` : ""}`}>
        {message}
      </p>
    );
  }

  // Enhanced version with title + description + action
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className ?? ""}`}>
      {title && <p className="text-[16px] font-semibold text-[#111827]">{title}</p>}
      {(description || message) && (
        <p className="text-[13px] text-[#6B7280] mt-1 max-w-[400px]">{description || message}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={`${patterns.button.primary} h-9 px-5 mt-4`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
