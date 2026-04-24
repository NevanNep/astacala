import React from "react";

interface AlertBannerProps {
  variant?: "siaga" | "warning";
  text: string;
  actionText?: string;
  onAction?: () => void;
}

export function AlertBanner({ variant = "siaga", text, actionText, onAction }: AlertBannerProps) {
  if (variant === "siaga") {
    return (
      <div className="bg-[#1B5E20] py-[6px] px-[12px] flex flex-row items-center gap-[6px]">
        <div className="w-[5px] h-[5px] rounded-full bg-[var(--color-warning)] shrink-0" />
        <span className="text-[var(--text-nano)] text-white flex-1">{text}</span>
        {actionText && (
          <button onClick={onAction} className="text-[var(--text-nano)] text-[var(--color-warning)] font-medium shrink-0">
            {actionText}
          </button>
        )}
      </div>
    );
  }

  // Warning variant
  return (
    <div className="bg-[var(--color-warning-light)] py-[6px] px-[12px] flex flex-row items-center gap-[6px] border-y-[0.5px] border-[#FFE082]">
      <span className="text-[10px] shrink-0 text-[#E65100]">⚠</span>
      <span className="text-[var(--text-micro)] text-[#E65100] flex-1">{text}</span>
    </div>
  );
}
