"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "../../../components/Navbar";
import { formatDate, ReportRecord, ReportStatus, truncateText } from "../../../lib/report-flow";

const FILTERS = ["Semua", "Pending", "Diterima", "Ditolak"] as const;

const STATUS_BORDER: Record<ReportStatus, string> = {
  Diterima: "#2E7D32",
  Pending: "#F9A825",
  Ditolak: "#C62828",
};

const STATUS_BADGE: Record<ReportStatus, { bg: string; color: string }> = {
  Diterima: { bg: "#E8F5E9", color: "#2E7D32" },
  Pending: { bg: "#FFF8E1", color: "#E65100" },
  Ditolak: { bg: "#FFEBEE", color: "#C62828" },
};

function normalizeStatus(status: string | null | undefined): ReportStatus {
  if (status === "Diterima" || status === "Ditolak" || status === "Pending") return status;
  return "Pending";
}

export default function RiwayatLaporanPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("Semua");
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/laporan");
        const data: unknown = await response.json();

        if (!response.ok) {
          const apiError =
            data && typeof data === "object" && "error" in data
              ? String((data as { error?: unknown }).error ?? "")
              : "";
          throw new Error(apiError || "Gagal memuat riwayat laporan.");
        }

        const nextReports =
          data && typeof data === "object" && Array.isArray((data as { reports?: unknown }).reports)
            ? ((data as { reports: ReportRecord[] }).reports)
            : [];

        if (mounted) setReports(nextReports);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Gagal memuat riwayat laporan.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadReports();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      const status = normalizeStatus(report.status);
      const searchable = [report.id, report.judul, report.alamat, report.jenis_bencana]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchSearch = !search.trim() || searchable.includes(search.trim().toLowerCase());
      const matchFilter = activeFilter === "Semua" || status === activeFilter;

      return matchSearch && matchFilter;
    });
  }, [activeFilter, reports, search]);

  const isFiltering = search.trim() !== "" || activeFilter !== "Semua";

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      <div className="mx-auto min-h-screen max-w-[420px] bg-[var(--color-bg-page)]">
        <Navbar variant="authenticated" showBack title="Riwayat Laporan" />

        <main className="space-y-4 px-5 pb-24 pt-5">
          <input
            type="text"
            placeholder="Cari Laporan..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-full border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text-primary)] outline-none"
          />

          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className="h-8 flex-shrink-0 rounded-full px-4 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? "var(--color-primary)" : "#E0E0E0",
                    color: isActive ? "#ffffff" : "var(--color-text-tertiary)",
                  }}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-3 text-sm text-[var(--color-primary)]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="rounded-[8px] bg-white py-16 text-center text-sm text-[var(--color-text-tertiary)]">
                Memuat riwayat laporan...
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[8px] bg-white py-16 text-center text-sm text-[var(--color-text-tertiary)]">
                {isFiltering ? "Tidak ada laporan yang cocok" : "Belum ada laporan yang dikirim"}
              </div>
            ) : (
              filtered.map((report) => {
                const status = normalizeStatus(report.status);

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => router.push(`/report/${report.id}`)}
                    className="rounded-[8px] bg-white p-4 text-left transition-shadow hover:shadow-sm"
                    style={{ border: `1px solid ${STATUS_BORDER[status]}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold leading-snug text-[var(--color-text-primary)]">
                          {report.judul || `${report.jenis_bencana ?? "Laporan"} Bencana`}
                        </p>
                        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                          {truncateText(report.alamat, 42)}
                        </p>
                      </div>
                      <span
                        className="flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: STATUS_BADGE[status].bg,
                          color: STATUS_BADGE[status].color,
                        }}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {[
                        { label: "Dikirim", value: formatDate(report.created_at) },
                        { label: "Keparahan", value: report.keparahan ?? "-" },
                        { label: "Media", value: `${report.laporan_media?.length ?? 0} Foto` },
                        { label: "Jenis", value: report.jenis_bencana ?? "-" },
                      ].map((meta) => (
                        <div key={meta.label}>
                          <p className="text-[10px] leading-tight text-[var(--color-text-tertiary)]">
                            {meta.label}
                          </p>
                          <p className="mt-0.5 text-[12px] font-medium leading-tight text-[var(--color-text-primary)]">
                            {meta.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                      <span className="font-mono text-[11px] text-[var(--color-text-tertiary)]">{report.id}</span>
                      <span className="text-[11px] font-medium text-[var(--color-primary)]">Lihat Detail &gt;</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
