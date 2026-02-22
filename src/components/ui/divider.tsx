interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return (
    <div
      className={`border-t border-[#F3F4F6]${className ? ` ${className}` : ""}`}
    />
  );
}
