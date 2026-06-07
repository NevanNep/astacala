"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "../../components/Badge";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";

interface Mission {
  id: string;
  judul: string;
  lokasi: string;
  latitude: number | null;
  longitude: number | null;
  deskripsi: string;
  persyaratan: string[];
  jenis: string;
  koordinator: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  kuota: number;
  status: "Terbuka" | "Penuh" | "Selesai";
  created_at: string;
  registration_count: number;
  registered: boolean;
}

type FilterChip = "Semua" | "Terbuka" | "Terdaftar" | "Penuh" | "Selesai";

const FILTER_CHIPS: FilterChip[] = ["Semua", "Terbuka", "Terdaftar", "Penuh", "Selesai"];
const MISSION_PAGE_CONTAINER = "w-full max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function calcDuration(start: string | null, end: string | null): string {
  if (!start || !end) return "-";
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? `${days} Hari` : "-";
}

function statusBadgeVariant(
  status: Mission["status"]
): "success" | "warning" | "neutral" {
  if (status === "Terbuka") return "success";
  if (status === "Penuh") return "warning";
  return "neutral";
}

function MissionListCard({ mission }: { mission: Mission }) {
  return (
    <Link href={`/misi/${mission.id}`} className="block h-full group">
      <div
        className={`h-full bg-white rounded-xl border p-5 md:p-6 shadow-sm transition-shadow hover:shadow-md ${
          mission.registered
            ? "border-[var(--color-primary)]"
            : "border-[var(--color-border)]"
        }`}
      >
        {/* Header row */}
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] md:text-[17px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
              {mission.judul}
            </h3>
            <p className="text-[12px] md:text-[13px] text-[var(--color-text-secondary)] mt-0.5 truncate">
              {mission.lokasi}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={statusBadgeVariant(mission.status)} text={mission.status} />
            {mission.registered && <Badge variant="danger" text="Terdaftar" />}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 md:gap-3 mb-5">
          {[
            { label: "Mulai", value: formatDate(mission.tanggal_mulai) },
            { label: "Relawan", value: `${mission.registration_count}/${mission.kuota}` },
            { label: "Durasi", value: calcDuration(mission.tanggal_mulai, mission.tanggal_selesai) },
            { label: "Jenis", value: mission.jenis },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-[10px] text-[var(--color-text-tertiary)] font-medium">
                {item.label}
              </div>
              <div className="text-[12px] md:text-[13px] text-[var(--color-text-primary)] font-medium leading-snug">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* CTA label */}
        <div className="flex justify-start">
          {mission.status === "Selesai" ? (
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[12px] font-medium bg-gray-100 text-gray-400">
              Lihat Laporan
            </span>
          ) : mission.registered ? (
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[12px] font-medium bg-gray-200 text-gray-600">
              Terdaftar
            </span>
          ) : mission.status === "Penuh" ? (
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[12px] font-medium bg-[var(--color-warning-light)] text-[#E65100]">
              Penuh
            </span>
          ) : (
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[12px] font-medium bg-[var(--color-primary)] text-white group-hover:bg-[var(--color-primary-dark)] transition-colors">
              Daftar
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-5 bg-gray-200 rounded-full w-16" />
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-2.5 bg-gray-100 rounded w-10" />
            <div className="h-3.5 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>
      <div className="h-7 bg-gray-100 rounded-full w-20" />
    </div>
  );
}

export default function MisiPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterChip>("Semua");

  const retry = () => {
    setLoading(true);
    setError(null);
    setFetchTrigger((n) => n + 1);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch("/api/misi");
        if (cancelled) return;
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          const data: { error?: string } = await res.json().catch(() => ({}));
          if (!cancelled) {
            setError(data.error ?? "Gagal memuat daftar misi.");
            setLoading(false);
          }
          return;
        }
        const data: { missions: Mission[] } = await res.json();
        if (!cancelled) {
          setMissions(data.missions ?? []);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [fetchTrigger, router]);

  const filtered = missions.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      m.judul.toLowerCase().includes(q) ||
      m.lokasi.toLowerCase().includes(q);

    const matchFilter =
      filter === "Semua" ||
      (filter === "Terdaftar" && m.registered) ||
      (filter === "Terbuka" && m.status === "Terbuka") ||
      (filter === "Penuh" && m.status === "Penuh") ||
      (filter === "Selesai" && m.status === "Selesai");

    return matchSearch && matchFilter;
  });

  const activeMissions = missions.filter((m) => m.status === "Terbuka").length;
  const registeredMissions = missions.filter((m) => m.registered).length;
  const doneMissions = missions.filter((m) => m.status === "Selesai").length;

  const sectionTitle =
    filter === "Semua" ? "Semua Misi" : `Misi ${filter}`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-default)]">
      <Navbar
        variant="flow"
        title="Misi Bencana"
        showBack
        backHref="/dashboard"
        showMenu
        containerClassName="max-w-[1200px] lg:px-12"
      />

      <main className="flex-1 pb-12">
        {/* Hero */}
        <section className="bg-[var(--color-primary)] w-full py-6 md:py-10 lg:py-12">
          <div className={MISSION_PAGE_CONTAINER}>
            <h1 className="text-[22px] md:text-[34px] font-bold text-white mb-1">
              Misi Tanggap Bencana
            </h1>
            <p className="text-[13px] md:text-[16px] text-white/80 mb-6 md:mb-8">
              Bergabung dan bantu penanganan bencana di lapangan
            </p>

            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-[760px]">
              {[
                { label: "Misi Aktif", value: loading ? "—" : String(activeMissions) },
                { label: "Kamu Terdaftar", value: loading ? "—" : String(registeredMissions) },
                { label: "Misi Selesai", value: loading ? "—" : String(doneMissions) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/20 backdrop-blur rounded-xl p-3 md:p-5 text-center"
                >
                  <div className="text-[22px] md:text-[30px] font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-[11px] md:text-[13px] text-white/80 mt-0.5 leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search + Filter */}
        <div className={`${MISSION_PAGE_CONTAINER} mt-6 md:mt-8 space-y-3`}>
          <input
            type="search"
            placeholder="Cari misi bencana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors shadow-sm"
          />

          <div className="flex gap-2 flex-wrap">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setFilter(chip)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                  filter === chip
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Mission list */}
        <div className={`${MISSION_PAGE_CONTAINER} mt-6 md:mt-8`}>
          <div className="flex justify-between items-center gap-3 mb-4 md:mb-5">
            <h2 className="text-[16px] md:text-[18px] font-semibold text-[var(--color-text-primary)]">
              {sectionTitle}
            </h2>
            {!loading && !error && (
              <span className="text-[13px] text-[var(--color-text-secondary)]">
                {filtered.length} Misi Ditemukan
              </span>
            )}
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-xl border border-red-200 p-10 text-center">
              <p className="text-[var(--color-danger)] text-[14px] mb-4">{error}</p>
              <button
                onClick={retry}
                className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-[14px] font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
              <p className="text-[var(--color-text-secondary)] text-[14px]">
                {search || filter !== "Semua"
                  ? "Tidak ada misi yang sesuai dengan filter."
                  : "Belum ada misi tersedia saat ini."}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div
              className={
                filtered.length === 1
                  ? "grid grid-cols-1 md:max-w-[680px] md:mx-auto"
                  : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5"
              }
            >
              {filtered.map((mission) => (
                <MissionListCard key={mission.id} mission={mission} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
