import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { StatStrip, StatItem } from "../components/StatStrip";
import { SectionDivider } from "../components/SectionDivider";
import { SectionHeader } from "../components/SectionHeader";
import { NewsCard } from "../components/NewsCard";
import { Footer } from "../components/Footer";
import { Button } from "../components/Button";
import { createAdminClient } from "../utils/supabase/admin";

export const dynamic = "force-dynamic";

type PublicNewsItem = {
  id: string;
  judul: string | null;
  kategori: string | null;
  lokasi: string | null;
  created_at: string | null;
  image_url: string | null;
  konten: string | null;
  terverifikasi: boolean | null;
};

type HomeCounts = {
  laporan_terverifikasi: number;
  misi_selesai: number;
  relawan_aktif: number;
};

function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function loadHomeCounts(client: SupabaseClient): Promise<HomeCounts> {
  const [verifiedReports, completedMissions, activeVolunteers] = await Promise.all([
    client.from("laporan").select("id", { count: "exact", head: true }).eq("status", "Diterima"),
    client.from("misi").select("id", { count: "exact", head: true }).eq("status", "Selesai"),
    client.from("profiles").select("id", { count: "exact", head: true }).eq("role", "relawan"),
  ]);

  const error = [verifiedReports.error, completedMissions.error, activeVolunteers.error].find(Boolean);
  if (error) throw new Error(error.message);

  return {
    laporan_terverifikasi: verifiedReports.count ?? 0,
    misi_selesai: completedMissions.count ?? 0,
    relawan_aktif: activeVolunteers.count ?? 0,
  };
}

async function loadLatestNews(client: SupabaseClient) {
  const { data, error } = await client
    .from("berita")
    .select("id, judul, kategori, lokasi, created_at, image_url, konten, terverifikasi")
    .eq("terverifikasi", true)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicNewsItem[];
}

async function loadHomeData() {
  const publicClient = createPublicClient();
  const adminClient = createAdminClient();
  const client = publicClient ?? adminClient;

  if (!client) {
    return {
      counts: null,
      news: [],
      error: "Supabase client is not configured",
    };
  }

  try {
    const [counts, news] = await Promise.all([loadHomeCounts(client), loadLatestNews(client)]);
    return { counts, news, error: null };
  } catch (error) {
    console.error("Load home data error:", error);

    if (publicClient && adminClient) {
      try {
        const [counts, news] = await Promise.all([
          loadHomeCounts(adminClient),
          loadLatestNews(adminClient),
        ]);
        return { counts, news, error: null };
      } catch (fallbackError) {
        console.error("Load home data fallback error:", fallbackError);
      }
    }

    return {
      counts: null,
      news: [],
      error: "Data terbaru belum dapat dimuat.",
    };
  }
}

function formatRelativeTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${Math.max(1, minutes)} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function truncate(value: string | null, maxLength = 130) {
  const text = value?.trim() ?? "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export default async function Home() {
  const { counts, news, error } = await loadHomeData();
  const statsData: StatItem[] = [
    { number: counts ? String(counts.laporan_terverifikasi) : "-", label: "Laporan Terverifikasi" },
    { number: counts ? String(counts.misi_selesai) : "-", label: "Misi Selesai" },
    { number: counts ? String(counts.relawan_aktif) : "-", label: "Relawan Aktif" },
  ];
  const [featuredNews, ...otherNews] = news;

  return (
    <main className="w-full px-4">
      <Navbar variant="public" />

      <section className="bg-[var(--color-primary)] px-6 md:px-8 lg:px-12 py-8 md:py-12 flex flex-col items-center justify-center text-center">
        <img
          src="/images/logo-astacala.png"
          alt="Astacala Logo"
          className="h-[64px] w-auto object-contain mb-[16px]"
        />
        <span className="text-[var(--text-nano)] uppercase tracking-[0.05em] text-white/75 mb-[8px]">
          ASTACALA RESCUE - TELKOM UNIVERSITY
        </span>
        <h1 className="text-[var(--text-hero)] font-medium text-white leading-[1.3] mb-[8px] px-[16px]">
          Informasi Bencana Terpercaya & Terverifikasi
        </h1>
        <p className="text-[var(--text-nano)] text-white/80 mb-[20px] px-[20px]">
          Portal informasi dan manajemen relawan Astacala untuk tanggap darurat bencana di Indonesia.
        </p>
        <Link href="/login">
          <Button variant="primary" className="bg-white !text-[var(--color-primary)] hover:bg-[#F5F5F5] active:bg-[#EEEEEE]">
            Masuk sebagai Relawan
          </Button>
        </Link>
      </section>

      <StatStrip stats={statsData} />

      <SectionDivider />

      <section className="bg-[var(--color-bg-card)] pb-8 md:pb-12 space-y-4 md:space-y-6">
        <SectionHeader title="Berita Bencana Terkini" actionText="Lihat semua" href="/berita" />

        {error && (
          <div className="mx-4 md:mx-8 lg:mx-12 rounded-[8px] border border-[#F0B12A] bg-white px-4 py-3 text-[13px] text-[var(--color-text-secondary)]">
            {error}
          </div>
        )}

        {!error && news.length === 0 ? (
          <div className="mx-4 md:mx-8 lg:mx-12 rounded-[8px] border border-[var(--color-border)] bg-white px-5 py-8 text-center text-[13px] text-[var(--color-text-secondary)]">
            Belum ada berita bencana terverifikasi.
          </div>
        ) : (
          <>
            {featuredNews && (
              <NewsCard
                variant="featured"
                title={featuredNews.judul ?? "Berita Astacala"}
                category={featuredNews.kategori ?? "Info"}
                location={featuredNews.lokasi ?? undefined}
                time={formatRelativeTime(featuredNews.created_at)}
                verified={Boolean(featuredNews.terverifikasi)}
                imageUrl={featuredNews.image_url}
                href={`/berita/${featuredNews.id}`}
                description={truncate(featuredNews.konten)}
              />
            )}

            {otherNews.map((item) => (
              <NewsCard
                key={item.id}
                variant="small"
                title={item.judul ?? "Berita Astacala"}
                category={item.kategori ?? "Info"}
                time={formatRelativeTime(item.created_at)}
                verified={Boolean(item.terverifikasi)}
                imageUrl={item.image_url}
                href={`/berita/${item.id}`}
              />
            ))}
          </>
        )}
      </section>

      <SectionDivider />

      <section className="bg-[var(--color-bg-muted)] px-6 md:px-8 lg:px-12 py-8 md:py-12 border-y-[0.5px] border-[var(--color-border)] flex flex-col items-center text-center">
        <span className="text-[var(--text-nano)] uppercase text-[var(--color-text-tertiary)] mb-[8px]">
          BERGABUNG DENGAN KAMI
        </span>
        <h2 className="text-[var(--text-subheading)] font-medium text-[var(--color-text-primary)] mb-[8px]">
          Kamu Relawan Astacala? Masuk dan Mulai Melapor
        </h2>
        <p className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] leading-[1.6] mb-[20px] px-[10px]">
          Akses dashboard relawan untuk membuat laporan bencana, daftar misi, dan pantau status laporanmu secara real-time.
        </p>
        <Link href="/login">
          <Button variant="primary" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]">
            Masuk sebagai Relawan
          </Button>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
