import React from "react";

export interface NotificationItemProps {
  title: string;
  time: string;
  circleColor?: string;
  isLast?: boolean;
}

export function NotificationItem({ 
  title, 
  time, 
  circleColor = "var(--color-primary)", 
  isLast = false 
}: NotificationItemProps) {
  return (
    <div className={`flex flex-row items-center gap-4 py-4 ${!isLast ? "border-b border-[var(--color-border)]" : ""}`}>
      {/* Circle Container */}
      <div className="relative w-[48px] h-[48px] rounded-full shrink-0 flex items-center justify-center">
        {/* Soft Outer Background */}
        <div 
          className="absolute inset-0 rounded-full opacity-40" 
          style={{ backgroundColor: circleColor }} 
        />
        {/* Inner Solid Dot */}
        <div 
          className="relative w-[14px] h-[14px] rounded-full"
          style={{ backgroundColor: circleColor }}
        />
      </div>
      
      {/* Content */}
      <div className="flex flex-col flex-1">
        <span className="text-[var(--text-caption)] md:text-[var(--text-label)] font-medium text-[var(--color-text-primary)] leading-snug">
          {title}
        </span>
        <span className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] mt-0.5">
          {time}
        </span>
      </div>
    </div>
  );
}
