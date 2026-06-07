"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface NavbarProps {
  variant?: "public" | "authenticated" | "flow";
  title?: string;
  showBack?: boolean;
  backHref?: string;
  showMenu?: boolean;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export function Navbar({
  variant = "public",
  title,
  showBack,
  backHref,
  showMenu,
  rightElement,
  containerClassName,
}: NavbarProps) {
  const isFlow = variant === "flow";
  const router = useRouter();
  const defaultContainerClassName = isFlow
    ? "max-w-[860px]"
    : "max-w-[1200px] lg:px-12";
  const shouldShowMenu = showMenu ?? variant !== "flow";
  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  };

  return (
    <div
      className={`sticky top-0 z-10 w-full bg-[var(--color-bg-card)] border-b border-[var(--color-border)] ${
        isFlow ? "py-3" : "py-3 md:py-4"
      }`}
    >
      <div
        className={`mx-auto flex w-full items-center justify-between px-4 md:px-8 ${
          containerClassName ?? defaultContainerClassName
        }`}
      >
        <div className="flex items-center gap-1">
          {showBack ? (
            <button type="button" onClick={handleBack} className="flex items-center gap-1">
              <span className="text-[22px] leading-none text-[var(--color-text-primary)]">&lsaquo;</span>
              <span
                className={
                  isFlow
                    ? "text-[24px] leading-none font-semibold text-[var(--color-text-primary)]"
                    : "text-[var(--text-label)] font-medium text-[var(--color-text-primary)]"
                }
              >
                {title}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-[6px]">
              <div
                className="h-[26px] w-[26px] overflow-hidden rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-secondary) 50%, var(--color-success) 50%)",
                }}
              />
              <span className="text-[var(--text-label)] font-bold tracking-wide text-[var(--color-primary)]">
                ASTACALA
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {rightElement}

          {shouldShowMenu && (
            <div className="flex h-[10px] w-[14px] flex-col justify-between">
              <div className="h-[1.5px] w-full bg-[var(--color-text-primary)]" />
              <div className="h-[1.5px] w-[10px] bg-[var(--color-text-primary)]" />
              <div className="h-[1.5px] w-full bg-[var(--color-text-primary)]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
