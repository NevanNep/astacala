"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/src/components/Badge";

export const CATEGORIES = ["Semua", "Banjir", "Gempa", "Longsor", "Kebakaran", "Lainnya"];

interface PublicNewsCardProps {
  id: string;
  title: string;
  category: string;
  location: string;
  time: string;
  description: string;
  imageUrl: string | null;
}

export function PublicNewsCard({ id, title, category, location, time, description, imageUrl }: PublicNewsCardProps) {
  return (
    <Link 
      href={`/berita/${id}`}
      className="group block rounded-[var(--radius-xl)] overflow-hidden relative shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow h-full flex flex-col bg-white"
    >
      {/* Image Area with Gradient Placeholder */}
      <div 
        className="w-full min-h-[180px] md:min-h-[200px] relative flex flex-col justify-end shrink-0"
        style={{ 
          background: imageUrl ? `url(${imageUrl}) center/cover no-repeat` : "linear-gradient(135deg, #78909C, #546E7A)" 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        
        <div className="absolute top-[8px] right-[8px]">
          <Badge variant="success" text="Terverifikasi" icon="✓" />
        </div>

        <div className="relative p-4 z-10 flex flex-col items-start gap-2">
          <div className="bg-[var(--color-primary)] text-white text-[var(--text-nano)] rounded-[var(--radius-sm)] px-[6px] py-[2px] font-semibold">
            {category}
          </div>
          <h3 className="text-[16px] md:text-[18px] font-bold text-white leading-tight group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[13px] md:text-[14px] text-[var(--color-text-secondary)] line-clamp-3 mb-4 flex-1">
          {description}
        </p>
        <div className="flex justify-between items-center mt-auto border-t border-[var(--color-border)] pt-3">
          <span className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {location || "-"}
          </span>
          <span className="text-[var(--text-nano)] text-[var(--color-text-tertiary)]">
            {time}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("kategori") || "Semua";

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "Semua") {
      params.delete("kategori");
    } else {
      params.set("kategori", category);
    }
    // reset to page 1 if pagination existed
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex overflow-x-auto no-scrollbar gap-2 py-2 mb-4 w-full">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => handleCategoryClick(cat)}
          className={`shrink-0 h-8 md:h-10 px-4 md:px-5 rounded-full text-[13px] md:text-[14px] font-bold transition-colors border ${
            currentCategory === cat
              ? "bg-[#D3262E] border-[#D3262E] text-white"
              : "bg-white border-[#E0E0E0] text-[#777777] hover:bg-[#F5F5F5]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full md:w-[300px] lg:w-[400px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari berita..."
        className="block w-full pl-10 pr-3 py-2 border border-[#E0E0E0] rounded-[8px] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#D3262E] focus:border-[#D3262E] transition-colors"
      />
    </form>
  );
}
