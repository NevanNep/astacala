"use client";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="relative mx-auto flex max-w-[284px] items-center justify-between">
        {steps.map((_, index) => {
          if (index === steps.length - 1) return null;

          const isDoneConnector = index + 1 < currentStep;
          const leftPercent = 10 + (index * 80) / (steps.length - 1);
          const rightPercent = 100 - (10 + ((index + 1) * 80) / (steps.length - 1));

          return (
            <div
              key={`line-${index}`}
              className="absolute top-5 z-0 h-px"
              style={{
                left: `${leftPercent + 5}%`,
                right: `${rightPercent + 5}%`,
                backgroundColor: isDoneConnector ? "var(--color-success)" : "#212121",
              }}
            />
          );
        })}

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          let circleBg = "bg-[#757575]";
          if (isDone) circleBg = "bg-[var(--color-success)]";
          else if (isActive) circleBg = "bg-[var(--color-primary)]";

          let labelColor = "text-[var(--color-text-secondary)]";
          if (isDone) labelColor = "text-[var(--color-success)]";
          else if (isActive) labelColor = "text-[var(--color-primary)] font-semibold";

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-1 bg-white px-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-[18px] font-semibold text-white transition-colors ${circleBg}`}
              >
                {stepNumber}
              </div>
              <span className={`text-[13px] font-medium ${labelColor}`}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
