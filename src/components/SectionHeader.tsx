import React from "react";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  href?: string;
  onAction?: () => void;
}

const actionClassName =
  "text-[var(--text-caption)] font-medium text-[var(--color-primary)] flex items-center gap-1 hover:underline transition-all";

export function SectionHeader({ title, actionText, href, onAction }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center pb-3">
      <h2 className="text-[var(--text-subheading)] font-semibold text-[var(--color-text-primary)] tracking-tight">
        {title}
      </h2>
      {actionText && href ? (
        <Link href={href} onClick={onAction} className={actionClassName}>
          {actionText} <span className="text-[14px]">{"\u2192"}</span>
        </Link>
      ) : actionText ? (
        <button onClick={onAction} className={actionClassName}>
          {actionText} <span className="text-[14px]">{"\u2192"}</span>
        </button>
      ) : null}
    </div>
  );
}
