interface ResponsiveSwitcherProps {
  mobileContent: React.ReactNode;
  desktopContent: React.ReactNode;
  breakpoint?: "sm" | "md" | "lg";
  className?: string;
}

export function ResponsiveSwitcher({ mobileContent, desktopContent, breakpoint = "md", className }: ResponsiveSwitcherProps) {
  const hideDesktop = breakpoint === "sm" ? "sm:hidden" : breakpoint === "lg" ? "lg:hidden" : "md:hidden";
  const showDesktop = breakpoint === "sm" ? "hidden sm:block" : breakpoint === "lg" ? "hidden lg:block" : "hidden md:block";

  return (
    <div className={className}>
      <div className={hideDesktop}>{mobileContent}</div>
      <div className={showDesktop}>{desktopContent}</div>
    </div>
  );
}
