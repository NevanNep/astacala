import React from "react";
import { Navbar } from "@/src/components/Navbar";
import { Footer } from "@/src/components/Footer";
import { SectionHeader } from "@/src/components/SectionHeader";
import {
  requirePublicSupabase,
  loadPublishedNews,
  resolveBeritaViewerRole,
  resolveBeritaBackHref
} from "./_components/server-data";
import { 
  PublicNewsCard, 
  CategoryFilter, 
  SearchBar 
} from "./_components/public-news-ui";

export const dynamic = "force-dynamic";

function formatNewsDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(d);
  } catch {
    return isoString;
  }
}

export default async function PublicBeritaListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; returnTo?: string }>;
}) {
  const supabase = await requirePublicSupabase();
  const params = await searchParams;
  const [{ news, error }, role] = await Promise.all([
    loadPublishedNews(supabase, params.q, params.kategori),
    resolveBeritaViewerRole(supabase),
  ]);

  // Context-aware back/exit target: public -> "/", relawan -> "/dashboard",
  // admin -> "/admin/dashboard" (or a safe returnTo when provided).
  const backHref = resolveBeritaBackHref(role, params.returnTo);
  // Only relawan get the volunteer sidebar; public/admin do not.
  const showMenu = role === "relawan";
  // Carry the authenticated context into detail links so detail navigation
  // returns to the right place. Public links stay clean.
  const detailReturnTo = role === "public" ? undefined : backHref;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-default)]">
      <Navbar
        variant="flow"
        title="Berita Bencana"
        showBack
        backHref={backHref}
        showMenu={showMenu}
        containerClassName="max-w-[1200px] lg:px-12"
      />

      <main className="w-full pb-10 md:pb-16 flex-1">
        {/* Header Section */}
        <section className="bg-[var(--color-primary)] w-full py-6 md:py-8 px-4 md:px-6 lg:px-8 relative">
          <div className="w-full max-w-[1200px] mx-auto text-white">
            <h1 className="text-[24px] md:text-[32px] font-bold leading-tight mb-2">
              Berita Bencana
            </h1>
            <p className="text-[14px] md:text-[16px] text-white/90 max-w-[600px]">
              Dapatkan informasi terkini mengenai kondisi bencana, peringatan dini, dan operasi darurat di seluruh wilayah.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 mt-6 md:mt-8">
          {/* Controls: Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-auto">
              <CategoryFilter />
            </div>
            <div className="w-full md:w-auto shrink-0">
              <SearchBar />
            </div>
          </div>

          <div className="mb-4">
            <SectionHeader title={params.q ? `Hasil pencarian untuk "${params.q}"` : "Daftar Berita"} />
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[8px] mt-4">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!error && news.length === 0 && (
            <div className="bg-white border border-[#E0E0E0] rounded-[16px] p-8 md:p-12 text-center mt-4 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h2 className="text-[18px] md:text-[20px] font-bold text-[#202124] mb-2">
                {params.q || params.kategori ? "Berita tidak ditemukan" : "Belum ada berita"}
              </h2>
              <p className="text-[14px] md:text-[16px] text-[#777777] max-w-[400px] mx-auto">
                {params.q || params.kategori 
                  ? "Coba sesuaikan kata kunci pencarian atau ganti kategori filter Anda."
                  : "Saat ini belum ada berita bencana yang diterbitkan. Silakan kembali lagi nanti."}
              </p>
            </div>
          )}

          {/* News Grid */}
          {!error && news.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-4">
              {news.map((item) => (
                <PublicNewsCard
                  key={item.id}
                  id={item.id}
                  title={item.judul}
                  category={item.kategori}
                  location={item.lokasi}
                  time={formatNewsDate(item.created_at)}
                  description={item.konten}
                  imageUrl={item.image_url}
                  returnTo={detailReturnTo}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
