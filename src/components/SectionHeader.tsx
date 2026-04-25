import React from "react";

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionText, onAction }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center pb-3">
      <h2 className="text-[var(--text-subheading)] font-semibold text-[var(--color-text-primary)] tracking-tight">
        {title}
      </h2>
      {actionText && (
        <button 
          onClick={onAction} 
          className="text-[var(--text-caption)] font-medium text-[var(--color-primary)] flex items-center gap-1 hover:underline transition-all"
        >
          {actionText} <span className="text-[14px]">→</span>
        </button>
      )}
    </div>
  );
}
