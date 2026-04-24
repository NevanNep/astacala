"use client";

import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  required,
  type = "text",
  className = "",
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword && showPassword ? "text" : type;

  const togglePassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className={`flex flex-col mb-[8px] ${className}`}>
      {/* Label */}
      <label className="text-[var(--text-caption)] font-medium text-[var(--color-text-secondary)] mb-[4px]">
        {label}
        {required && <span className="text-[var(--color-primary)] ml-[2px]">*</span>}
      </label>

      {/* Input wrapper */}
      <div className="relative">
        <input
          type={currentType}
          className={`w-full bg-[var(--color-bg-card)] text-[var(--text-caption)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] border ${
            error ? "border-[var(--color-primary)]" : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
          } rounded-[var(--radius-md)] py-[6px] px-[8px] outline-none transition-colors h-auto`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[var(--text-nano)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
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
