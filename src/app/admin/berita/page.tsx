import Link from "next/link";
import { AdminMissionTopBar } from "../misi/_components/admin-mission-ui";
import { ADMIN_BERITA_LIST_CONTAINER, loadAdminNews, requireAdminSupabase } from "./_components/server-data";
import { BeritaListClient } from "./_components/berita-list-client";

export const dynamic = "force-dynamic";

export default async function AdminBeritaListPage() {
  const supabase = await requireAdminSupabase();
  const { news, error } = await loadAdminNews(supabase);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminMissionTopBar
        title="Berita"
        backHref="/admin/dashboard"
        width="wide"
        action={
          <Link
            href="/admin/berita/new"
            className="inline-flex h-[32px] items-center justify-center rounded-full border border-[#747474] bg-[#D3262E] px-3 text-[11px] font-extrabold text-white transition hover:bg-[#B71C1C] md:h-10 md:px-5 md:text-[13px]"
          >
            Buat Berita Baru
          </Link>
        }
      />

      <main className={`${ADMIN_BERITA_LIST_CONTAINER} pb-16 pt-5`}>
        <div className="mb-4 flex items-center gap-3 px-3 md:px-0">
          <h2 className="text-[16px] font-extrabold leading-none text-[#202124] md:text-[22px]">Daftar Berita</h2>
        </div>

        {error ? (
          <section className="rounded-[8px] border border-[#FF5B62] bg-white p-5">
            <h2 className="text-[18px] font-extrabold text-[#D3262E]">Berita belum dapat dimuat</h2>
            <p className="mt-2 text-[14px] font-semibold text-[#777777]">{error}</p>
            <Link
              href="/admin/berita"
              className="mt-5 inline-flex h-10 items-center rounded-[8px] bg-[#D3262E] px-5 text-[13px] font-bold text-white"
            >
              Coba lagi
            </Link>
          </section>
        ) : news.length === 0 ? (
          <section className="rounded-[8px] border border-[#747474] bg-white px-5 py-14 text-center">
            <h2 className="text-[20px] font-extrabold text-[#202124]">Belum ada berita</h2>
            <p className="mt-2 text-[14px] font-semibold text-[#777777]">
              Buat berita pertama untuk membagikan informasi.
            </p>
            <Link
              href="/admin/berita/new"
              className="mt-5 inline-flex h-10 items-center rounded-full bg-[#D3262E] px-5 text-[13px] font-bold text-white"
            >
              Buat Berita Baru
            </Link>
          </section>
        ) : (
          <BeritaListClient initialNews={news} />
        )}
      </main>
    </div>
  );
}
