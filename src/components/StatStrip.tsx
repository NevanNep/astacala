import React from "react";

export interface StatItem {
  number: string;
  label: string;
}

interface StatStripProps {
  stats: StatItem[];
}

export function StatStrip({ stats }: StatStripProps) {
  return (
    <div className="flex flex-row w-full bg-white border-b-[0.5px] border-[var(--color-border)]">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`flex-1 flex flex-col py-4 md:py-6 px-4 md:px-8 text-center ${
            index !== stats.length - 1 ? "border-r-[0.5px] border-[var(--color-border)]" : ""
          }`}
        >
          <span className="text-[var(--text-heading)] font-medium text-[var(--color-text-primary)]">
            {stat.number}
          </span>
          <span className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] mt-[2px]">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
