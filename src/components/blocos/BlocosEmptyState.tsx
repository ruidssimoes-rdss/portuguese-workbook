interface BlocosEmptyStateProps {
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function BlocosEmptyState({ message, description, action }: BlocosEmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[14px] text-[#9CA3AF]">{message}</p>
      {description && (
        <p className="text-[13px] text-[#9CA3AF] mt-1">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="text-[14px] text-[#9CA3AF] hover:text-[#6B7280] mt-3 transition-colors duration-150 underline underline-offset-2 cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
