import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/src/components/Navbar";
import { Footer } from "@/src/components/Footer";
import { Badge } from "@/src/components/Badge";
import {
  requirePublicSupabase,
  loadPublishedNewsDetail,
  resolveBeritaViewerRole,
  resolveBeritaBackHref,
  buildBeritaListHref
} from "../_components/server-data";

export const dynamic = "force-dynamic";

function formatNewsDetailDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d) + " WIB";
  } catch {
    return isoString;
  }
}

export default async function PublicBeritaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const supabase = await requirePublicSupabase();
  const [{ news, error }, role] = await Promise.all([
    loadPublishedNewsDetail(supabase, id),
    resolveBeritaViewerRole(supabase),
  ]);

  if (error || !news) {
    notFound();
  }

  // Navbar exit target (public -> "/", relawan -> "/dashboard", admin ->
  // "/admin/dashboard", or a safe returnTo). The inline "Kembali ke Daftar
  // Berita" link always returns to the list, preserving authenticated context.
  const backHref = resolveBeritaBackHref(role, returnTo);
  const listHref = role === "public" ? "/berita" : buildBeritaListHref(backHref);
  const showMenu = role === "relawan";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-default)]">
      <Navbar
        variant="flow"
        title="Berita Bencana"
        showBack
        backHref={backHref}
        showMenu={showMenu}
      />

      <main className="w-full pb-10 md:pb-16 flex-1">
        {/* Cover Image Header if exists */}
        {news.image_url && (
          <div className="w-full h-[250px] md:h-[400px] lg:h-[500px] relative overflow-hidden bg-black/10">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${news.image_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className={`w-full max-w-[860px] mx-auto px-4 md:px-8 ${news.image_url ? '-mt-16 md:-mt-24 relative z-10' : 'pt-8 md:pt-12'}`}>
          <div className="bg-white rounded-t-[24px] md:rounded-[24px] shadow-sm border border-[var(--color-border)] overflow-hidden min-h-[50vh]">
            
            <div className="p-5 md:p-10">
              {/* Back Button */}
              <Link
                href={listHref}
                className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-6 md:mb-8 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-full w-fit border border-gray-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Kembali ke Daftar Berita
              </Link>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="success" text="Terverifikasi" icon="✓" />
                <div className="bg-[#FFF4F4] text-[#D3262E] text-[12px] font-bold px-3 py-1 rounded-full border border-[#FFEAEA]">
                  {news.kategori}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-[24px] md:text-[36px] font-extrabold text-[#202124] leading-[1.2] mb-6">
                {news.judul}
              </h1>

              {/* Sub-meta */}
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-[13px] md:text-[14px] text-[var(--color-text-tertiary)] mb-8 md:mb-10 pb-6 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3"></circle><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg>
                  <span>{news.lokasi || "Lokasi tidak diketahui"}</span>
                </div>
                <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300" />
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>{formatNewsDetailDate(news.created_at)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-red max-w-none prose-p:text-[#4B5563] prose-p:leading-relaxed prose-p:text-[15px] md:prose-p:text-[16px]">
                {news.konten.split("\n").map((paragraph, idx) => (
                  <p key={idx} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
