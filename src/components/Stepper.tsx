"use client";

import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-4">
      <div className="relative flex justify-between items-center max-w-[280px] mx-auto">
        {/* Connector lines between steps */}
        {steps.map((_, index) => {
          if (index === steps.length - 1) return null;
          const isDoneConnector = index + 1 < currentStep;
          const leftPercent = 10 + (index * 80) / (steps.length - 1);
          const rightPercent = 100 - (10 + ((index + 1) * 80) / (steps.length - 1));
          return (
            <div
              key={`line-${index}`}
              className="absolute top-[16px] h-[2px] z-0"
              style={{
                left: `${leftPercent + 5}%`,
                right: `${rightPercent + 5}%`,
                backgroundColor: isDoneConnector ? "var(--color-success)" : "#E0E0E0",
              }}
            />
          );
        })}

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          let circleBg = "bg-[#BDBDBD]";
          if (isDone) circleBg = "bg-[var(--color-success)]";
          else if (isActive) circleBg = "bg-[var(--color-primary)]";

          let labelColor = "text-[var(--color-text-tertiary)]";
          if (isDone) labelColor = "text-[var(--color-success)]";
          else if (isActive) labelColor = "text-[var(--color-primary)] font-semibold";

          return (
            <div key={step} className="flex flex-col items-center gap-2 relative bg-white px-2 z-10">
              <div
                className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] font-semibold text-white transition-colors ${circleBg}`}
              >
                {isDone ? "✓" : stepNumber}
              </div>
              <span className={`text-[12px] font-medium ${labelColor}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
