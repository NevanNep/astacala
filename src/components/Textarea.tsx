"use client";

import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function Textarea({
  label,
  error,
  hint,
  required,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className={`flex flex-col mb-[8px] ${className}`}>
      {/* Label */}
      <label className="text-[var(--text-caption)] font-medium text-[var(--color-text-secondary)] mb-[4px]">
        {label}
        {required && <span className="text-[var(--color-primary)] ml-[2px]">*</span>}
      </label>

      {/* Textarea wrapper */}
      <div className="relative">
        <textarea
          className={`w-full bg-[var(--color-bg-card)] text-[var(--text-caption)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] border ${
            error ? "border-[var(--color-primary)]" : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
          } rounded-[var(--radius-md)] py-[8px] px-[8px] outline-none transition-colors`}
          {...props}
        />
      </div>

      {/* Hint or Error */}
      {error ? (
        <span className="text-[var(--text-micro)] text-[var(--color-primary)] mt-[2px]">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] mt-[2px]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
