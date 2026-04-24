import React from "react";

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionText, onAction }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center pt-6 pb-4 px-4 md:px-8 lg:px-12">
      <span className="text-[var(--text-label)] font-medium text-[var(--color-text-primary)]">
        {title}
      </span>
      {actionText && (
        <button onClick={onAction} className="text-[var(--text-nano)] text-[var(--color-primary)]">
          {actionText}
        </button>
      )}
    </div>
  );
}
