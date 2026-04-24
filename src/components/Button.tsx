import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "flex items-center justify-center text-center transition-colors";
  
  const widthClasses = fullWidth ? "w-full" : "";
  
  let variantClasses = "";
  if (disabled) {
    variantClasses = "bg-[#CCCCCC] text-white cursor-not-allowed py-[8px] px-[12px] rounded-[var(--radius-lg)] text-[var(--text-label)] font-medium";
  } else if (variant === "primary") {
    variantClasses = "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:bg-[var(--color-primary-dark)] text-white py-[8px] px-[12px] rounded-[var(--radius-lg)] text-[var(--text-label)] font-medium";
  } else if (variant === "outline") {
    variantClasses = "bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] py-[8px] px-[12px] rounded-[var(--radius-lg)] text-[var(--text-label)] font-medium hover:bg-[var(--color-bg-muted)]";
  } else if (variant === "ghost") {
    variantClasses = "bg-transparent text-[var(--color-primary)] py-[4px] px-0 text-[var(--text-caption)] font-medium";
  }

  return (
    <button
      className={`${baseClasses} ${widthClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
