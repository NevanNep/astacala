import React from "react";
import Link from "next/link";
import { Badge } from "./Badge";

interface NewsCardProps {
  variant: "featured" | "small";
  title: string;
  category: string;
  location?: string;
  time?: string;
  verified?: boolean;
  isCarousel?: boolean;
  description?: string;
  imageUrl?: string | null;
  href?: string;
}

function MediaFallback({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-[var(--color-bg-muted)] text-center text-[11px] font-medium leading-tight text-[var(--color-text-tertiary)] ${className}`}
    >
      Tidak ada gambar
    </div>
  );
}

export function NewsCard({
  variant,
  title,
  category,
  location,
  time,
  verified,
  isCarousel,
  description,
  imageUrl,
  href,
}: NewsCardProps) {
  const card =
    variant === "featured" ? (
      <div className="rounded-[var(--radius-xl)] overflow-hidden relative mx-4 md:mx-8 lg:mx-12 mb-4 md:mb-6 shadow-sm">
        <div className="w-full min-h-[220px] md:min-h-[260px] relative flex flex-col justify-end overflow-hidden">
          {imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${imageUrl}")` }}
            />
          ) : (
            <MediaFallback className="absolute inset-0" />
          )}

          {verified && (
            <div className="absolute top-[8px] right-[8px]">
              <Badge variant="success" text="Terverifikasi" icon="OK" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

          <div className="relative p-5 z-10 flex flex-col items-start gap-2 md:gap-3">
            {!isCarousel && (
              <div className="bg-[var(--color-primary)] text-white text-[var(--text-nano)] rounded-[var(--radius-sm)] px-[4px] py-[1px]">
                {category}
              </div>
            )}
            <h3 className="text-[var(--text-micro)] md:text-[var(--text-heading)] font-medium text-white leading-[1.3]">
              {title}
            </h3>
            {description && (
              <p className="text-[var(--text-nano)] md:text-[var(--text-caption)] text-white/90 line-clamp-2">
                {description}
              </p>
            )}

            {isCarousel && (
              <div className="flex gap-2 justify-center w-full mt-2">
                <div className="w-[8px] h-[8px] rounded-full bg-[var(--color-primary)]" />
                <div className="w-[8px] h-[8px] rounded-full bg-white/50" />
                <div className="w-[8px] h-[8px] rounded-full bg-white/50" />
              </div>
            )}
          </div>
        </div>

        {!isCarousel && (
          <div className="bg-white py-3 md:py-4 px-5 flex justify-between items-center">
            <span className="text-[var(--text-nano)] text-[var(--color-text-tertiary)]">
              {location && time ? `${location} - ${time}` : location || time || ""}
            </span>
          </div>
        )}
      </div>
    ) : (
      <div className="flex flex-row gap-4 mx-4 md:mx-8 lg:mx-12 mb-4 p-4 md:p-5 bg-[var(--color-bg-card)] border-[0.5px] border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-sm">
        {imageUrl ? (
          <div
            className="w-[60px] h-[60px] rounded-[var(--radius-sm)] shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
        ) : (
          <MediaFallback className="w-[60px] h-[60px] rounded-[var(--radius-sm)] shrink-0 px-1" />
        )}
        <div className="flex flex-col justify-between flex-1">
          <h4 className="text-[var(--text-caption)] font-medium text-[var(--color-text-primary)] leading-[1.4] line-clamp-2">
            {title}
          </h4>
          <div className="flex items-center justify-between mt-[4px]">
            <span className="text-[var(--text-nano)] text-[var(--color-text-tertiary)]">
              {time}
            </span>
            {verified && (
              <span className="text-[var(--text-nano)] text-[var(--color-success)] font-medium">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>
    );

  if (!href) return card;

  return (
    <Link href={href} className="block">
      {card}
    </Link>
  );
}
