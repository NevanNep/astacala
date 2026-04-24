import React from "react";

interface BadgeProps {
  variant: "success" | "warning" | "danger" | "info" | "neutral";
  text: string;
  icon?: string;
}

export function Badge({ variant, text, icon }: BadgeProps) {
  let bg = "";
  let color = "";

  switch (variant) {
    case "success":
      bg = "bg-[var(--color-success-light)]";
      color = "text-[var(--color-success)]";
      break;
    case "warning":
      bg = "bg-[var(--color-warning-light)]";
      color = "text-[#E65100]"; // Using hardcoded based on spec `#E65100`
      break;
    case "danger":
      bg = "bg-[var(--color-danger-light)]";
      color = "text-[var(--color-danger)]";
      break;
    case "info":
      bg = "bg-[var(--color-secondary-light)]";
      color = "text-[#1565C0]";
      break;
    case "neutral":
      bg = "bg-[#ECEFF1]";
      color = "text-[#546E7A]";
      break;
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-[var(--radius-full)] px-[6px] py-[2px] ${bg}`}
    >
      <span className={`text-[var(--text-nano)] font-medium ${color}`}>
        {icon && `${icon} `}{text}
      </span>
    </div>
  );
}
