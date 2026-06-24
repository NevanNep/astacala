import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { createClient } from "@/src/utils/supabase/server";
import { isMfaSatisfied } from "@/src/lib/mfa";
import type { AdminReportListItem } from "./_components/types";
import { AdminTopBar, ReportListCard } from "./_components/admin-report-ui";

export const dynamic = "force-dynamic";

type AdminProfile = {
  role: string | null;
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const FILTERS = ["Pending", "Diterima", "Ditolak", "Semua"] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeFilter(value: string | string[] | undefined) {
  const status = firstParam(value);
  return FILTERS.includes(status as (typeof FILTERS)[number]) ? (status as (typeof FILTERS)[number]) : "Pending";
}

function cleanSearch(value: string | string[] | undefined) {
  return (firstParam(value) ?? "").replace(/[%_,]/g, " ").trim();
}

function filterHref(status: (typeof FILTERS)[number], q: string) {
  const params = new URLSearchParams();
  params.set("status", status);
  if (q) params.set("q", q);
  return `/admin/laporan?${params.toString()}`;
}

async function requireAdminSupabase() {
  const userClient = createClient(await cookies());
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  if (!(await isMfaSatisfied(user))) {
    redirect("/login/2fa");
  }

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return createAdminClient() ?? userClient;
}

async function loadReports(
  supabase: Awaited<ReturnType<typeof requireAdminSupabase>>,
  status: (typeof FILTERS)[number],
  q: string
) {
  let query = supabase
    .from("laporan")
    .select("id, user_id, judul, jenis_bencana, alamat, latitude, longitude, keparahan, status, created_at, laporan_media(id, laporan_id, storage_path, type, created_at), profiles(nama, nim, no_hp)")
    .order("created_at", { ascending: false });

  if (status !== "Semua") {
    query = query.eq("status", status);
  }

  if (q) {
    query = query.or(`id.ilike.%${q}%,judul.ilike.%${q}%,alamat.ilike.%${q}%,deskripsi.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (!error) {
    return { reports: (data ?? []) as AdminReportListItem[], error: null };
  }

  let fallbackQuery = supabase
    .from("laporan")
    .select("id, user_id, judul, jenis_bencana, alamat, latitude, longitude, keparahan, status, created_at, laporan_media(id, laporan_id, storage_path, type, created_at)")
    .order("created_at", { ascending: false });

  if (status !== "Semua") {
    fallbackQuery = fallbackQuery.eq("status", status);
  }

  if (q) {
    fallbackQuery = fallbackQuery.or(`id.ilike.%${q}%,judul.ilike.%${q}%,alamat.ilike.%${q}%,deskripsi.ilike.%${q}%`);
  }

  const { data: fallbackData, error: fallbackError } = await fallbackQuery;
  if (fallbackError) {
    return { reports: [], error: error.message };
  }

  return { reports: (fallbackData ?? []) as AdminReportListItem[], error: null };
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const activeFilter = normalizeFilter(params.status);
  const q = cleanSearch(params.q ?? params.search);
  const supabase = await requireAdminSupabase();
  const { reports, error } = await loadReports(supabase, activeFilter, q);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#202124]">
      <AdminTopBar
        title="Laporan Masuk"
        subtitle="Verifikasi laporan bencana relawan"
        backHref="/admin/dashboard"
        width="wide"
      />

      <main className="mx-auto w-full max-w-[1200px] px-4 py-5 md:px-8 lg:px-12">
        <section className="mb-5 rounded-[8px] border border-[#747474] bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-[22px] font-extrabold leading-tight tracking-[0] md:text-[28px]">
                Daftar Laporan
              </h2>
              <p className="mt-2 text-[13px] font-semibold text-[#777777] md:text-[15px]">
                {reports.length} laporan ditampilkan
              </p>
            </div>

            <form action="/admin/laporan" className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-[460px]">
              <input type="hidden" name="status" value={activeFilter} />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari ID, lokasi, atau deskripsi"
                className="h-11 min-w-0 flex-1 rounded-[8px] border border-[#BBBBBB] px-4 text-[13px] font-semibold outline-none focus:border-[#D3262E] focus:ring-2 focus:ring-[#D3262E]/15"
              />
              <button
                type="submit"
                className="h-11 rounded-[8px] bg-[#D3262E] px-5 text-[13px] font-bold text-white transition hover:bg-[#B71C1C]"
              >
                Cari
              </button>
            </form>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {FILTERS.map((status) => {
              const active = activeFilter === status;

              return (
                <Link
                  key={status}
                  href={filterHref(status, q)}
                  className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                    active
                      ? "bg-[#D3262E] text-white"
                      : "border border-[#BBBBBB] bg-white text-[#202124] hover:border-[#D3262E]"
                  }`}
                >
                  {status}
                </Link>
              );
            })}
          </div>
        </section>

        {error ? (
          <section className="rounded-[8px] border border-[#FF5B62] bg-white p-5">
            <h2 className="text-[18px] font-extrabold text-[#D3262E]">Laporan belum dapat dimuat</h2>
            <p className="mt-2 text-[14px] font-semibold text-[#777777]">{error}</p>
            <Link
              href="/admin/laporan"
              className="mt-5 inline-flex h-10 items-center rounded-[8px] bg-[#D3262E] px-5 text-[13px] font-bold text-white"
            >
              Coba lagi
            </Link>
          </section>
        ) : reports.length === 0 ? (
          <section className="rounded-[8px] border border-[#747474] bg-white px-5 py-14 text-center">
            <h2 className="text-[20px] font-extrabold text-[#202124]">Tidak ada laporan</h2>
            <p className="mt-2 text-[14px] font-semibold text-[#777777]">
              Belum ada laporan untuk filter ini.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <ReportListCard key={report.id} report={report} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
