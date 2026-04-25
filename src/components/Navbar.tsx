import React from "react";

interface NavbarProps {
  variant?: "public" | "authenticated" | "flow";
  title?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function Navbar({ variant = "public", title, showBack, rightElement }: NavbarProps) {
  return (
    <div className="sticky top-0 z-10 w-full bg-[var(--color-bg-card)] border-b border-[var(--color-border)] px-4 md:px-8 lg:px-12 py-3 md:py-4 flex items-center justify-between">
      {/* Left Slot */}
      <div className="flex items-center gap-[8px]">
        {showBack ? (
          <>
            <span className="text-[var(--color-primary)] text-[13px]">‹</span>
            <span className="text-[var(--text-label)] font-medium text-[var(--color-text-primary)]">
              {title}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-[6px]">
            {/* Logo Circle */}
            <div
              className="w-[26px] h-[26px] rounded-full overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--color-secondary) 50%, var(--color-success) 50%)",
              }}
            />
            <span className="text-[var(--text-label)] font-bold tracking-wide text-[var(--color-primary)]">
              ASTACALA
            </span>
          </div>
        )}
      </div>

      {/* Right Slot */}
      <div className="flex items-center gap-[12px]">
        {rightElement}
        
        {/* Hamburger */}
        {variant !== "flow" && (
          <div className="flex flex-col justify-between h-[10px] w-[14px]">
            <div className="w-full h-[1.5px] bg-[var(--color-text-primary)]" />
            <div className="w-[10px] h-[1.5px] bg-[var(--color-text-primary)]" />
            <div className="w-full h-[1.5px] bg-[var(--color-text-primary)]" />
          </div>
        )}
      </div>
    </div>
  );
}
