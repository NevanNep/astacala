"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { VolunteerSidebar, volunteerSidebarId } from "./VolunteerSidebar";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const defaultContainerClassName = isFlow
    ? "max-w-[860px]"
    : "max-w-[1200px] lg:px-12";
  const shouldShowMenu = showMenu ?? variant === "authenticated";
  const canOpenVolunteerSidebar = variant === "authenticated" || (variant === "flow" && shouldShowMenu);
  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  };

  return (
    <>
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
              <img 
                src="/images/logo-astacala.png" 
                alt="Astacala" 
                className="h-[44px] w-auto object-contain" 
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {rightElement}

            {shouldShowMenu && canOpenVolunteerSidebar ? (
              <button
                type="button"
                aria-label={sidebarOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
                aria-expanded={sidebarOpen}
                aria-controls={volunteerSidebarId}
                onClick={() => setSidebarOpen((current) => !current)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--color-bg-page)]"
              >
                <span className="flex h-[12px] w-[18px] flex-col justify-between" aria-hidden="true">
                  <span className="h-[1.5px] w-full bg-[var(--color-text-primary)]" />
                  <span className="h-[1.5px] w-[13px] bg-[var(--color-text-primary)]" />
                  <span className="h-[1.5px] w-full bg-[var(--color-text-primary)]" />
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {canOpenVolunteerSidebar && (
        <VolunteerSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
