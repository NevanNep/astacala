import React from "react";

interface CardProps {
  variant?: "default" | "featured";
  children: React.ReactNode;
  className?: string;
}

export function Card({ variant = "default", children, className = "" }: CardProps) {
  if (variant === "featured") {
    return (
      <div className={`rounded-[var(--radius-xl)] overflow-hidden relative ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`border-[0.5px] border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg-card)] overflow-hidden mb-[6px] ${className}`}
    >
      {children}
    </div>
  );
}
