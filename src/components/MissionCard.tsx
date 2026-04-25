import React from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface MissionCardProps {
  title: string;
  location: string;
  status: "terbuka" | "penuh";
  startDate: string;
  volunteers: string;
  onAction?: () => void;
}

export function MissionCard({
  title,
  location,
  status,
  startDate,
  volunteers,
  onAction
}: MissionCardProps) {
  const isOpen = status === "terbuka";

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-md p-5 md:p-6 flex flex-col gap-4 md:gap-5">
      {/* Top Row */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className="text-[var(--text-caption)] md:text-[var(--text-label)] font-medium text-[var(--color-text-primary)]">
            {title}
          </h3>
          <span className="text-[var(--text-nano)] text-[var(--color-text-secondary)]">
            {location}
          </span>
        </div>
        <Badge variant={isOpen ? "success" : "neutral"} text={isOpen ? "Terbuka" : "Penuh"} />
      </div>

      {/* Bottom Row */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <span className="text-[var(--text-nano)] text-[var(--color-text-secondary)]">
            Mulai: {startDate}
          </span>
          <span className="text-[var(--text-nano)] text-[var(--color-text-secondary)]">
            Relawan: {volunteers}
          </span>
        </div>
        
        <div className="w-[80px] md:w-[100px]">
          <Button 
            variant="primary" 
            fullWidth 
            disabled={!isOpen}
            onClick={onAction}
            className={!isOpen ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isOpen ? "Daftar" : "Penuh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
