"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "../../../components/Navbar";
import {
  coordinateText,
  formatDateTime,
  ReportMediaRecord,
  ReportRecord,
  ReportStatus,
} from "../../../lib/report-flow";

const STATUS_BADGE: Record<ReportStatus, { bg: string; color: string }> = {
  Diterima: { bg: "#E8F5E9", color: "#2E7D32" },
  Pending: { bg: "#FFF8E1", color: "#E65100" },
  Ditolak: { bg: "#FFEBEE", color: "#C62828" },
};
const DETAIL_CONTAINER = "w-full max-w-[760px] lg:max-w-[860px] mx-auto px-4 md:px-8";

function normalizeStatus(status: string | null | undefined): ReportStatus {
  if (status === "Diterima" || status === "Ditolak" || status === "Pending") return status;
  return "Pending";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-[var(--color-border)] py-3 text-[13px] last:border-b-0 md:grid-cols-[150px_minmax(0,1fr)] md:gap-6 md:py-4 md:text-[14px]">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="min-w-0 break-words font-semibold leading-relaxed text-[var(--color-text-primary)]">
        {value}
      </span>
    </div>
  );
}

function mediaUrl(media: ReportMediaRecord) {
  // The laporan-media bucket is private; the API attaches a short-lived signed
  // URL after verifying the caller owns the laporan.
  return media.signed_url ?? null;
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/laporan/${encodeURIComponent(id)}`);
        const data: unknown = await response.json();

        if (!response.ok) {
          const apiError =
            data && typeof data === "object" && "error" in data
              ? String((data as { error?: unknown }).error ?? "")
              : "";
          throw new Error(apiError || "Gagal memuat detail laporan.");
        }

        const nextReport =
          data && typeof data === "object" && "report" in data
            ? ((data as { report: ReportRecord }).report)
            : null;

        if (mounted) setReport(nextReport);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Gagal memuat detail laporan.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) loadReport();

    return () => {
      mounted = false;
    };
  }, [id]);

  const status = normalizeStatus(report?.status);
  const rejectionReason = report?.rejection_reason ?? report?.alasan_penolakan ?? "";
  const media = report?.laporan_media?.filter((item) => item.storage_path) ?? [];

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)]">
      <Navbar
        variant="authenticated"
        showBack
        title="Detail Laporan"
        containerClassName="max-w-[860px]"
        rightElement={
          <button
            type="button"
            onClick={() => router.push("/report/history")}
            className="text-[12px] font-semibold text-[var(--color-primary)] md:text-[13px]"
          >
            Riwayat
          </button>
        }
      />

      <main className={`${DETAIL_CONTAINER} space-y-4 pb-24 pt-5 md:space-y-5 md:pt-8`}>
        {!id ? (
          <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-[var(--color-primary)]">
            ID laporan tidak valid.
          </div>
        ) : loading ? (
          <div className="rounded-[8px] bg-white py-16 text-center text-sm text-[var(--color-text-tertiary)]">
            Memuat detail laporan...
          </div>
        ) : error ? (
          <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-[var(--color-primary)]">
            {error}
          </div>
        ) : report ? (
          <>
            <section className="rounded-[8px] border border-[var(--color-border)] bg-white p-4 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[12px] text-[var(--color-text-tertiary)]">{report.id}</p>
                  <h1 className="mt-1 text-[20px] font-semibold leading-snug text-[var(--color-text-primary)] md:text-[24px]">
                    {report.judul || `${report.jenis_bencana ?? "Laporan"} Bencana`}
                  </h1>
                  <p className="mt-2 break-words text-[13px] leading-relaxed text-[var(--color-text-secondary)] md:text-[14px]">
                    {report.alamat || "-"}
                  </p>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: STATUS_BADGE[status].bg, color: STATUS_BADGE[status].color }}
                >
                  {status}
                </span>
              </div>
            </section>

            <section className="rounded-[8px] border border-[var(--color-border)] bg-white px-4 md:px-6">
              <DetailRow label="Koordinat" value={coordinateText(report.latitude, report.longitude)} />
              <DetailRow label="Alamat" value={report.alamat || "-"} />
              <DetailRow label="Detail Lokasi" value={report.detail || "-"} />
              <DetailRow label="Jenis" value={report.jenis_bencana || "-"} />
              <DetailRow label="Keparahan" value={report.keparahan || "-"} />
              <DetailRow label="Deskripsi" value={report.deskripsi || "-"} />
              <DetailRow label="Kebutuhan" value={report.kebutuhan?.length ? report.kebutuhan.join(", ") : "-"} />
              <DetailRow label="Dibuat" value={formatDateTime(report.created_at)} />
              {status === "Ditolak" && <DetailRow label="Alasan Ditolak" value={rejectionReason || "-"} />}
            </section>

            <section className="rounded-[8px] border border-[var(--color-border)] bg-white p-4 md:p-6">
              <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)] md:text-[18px]">
                Media Bukti
              </h2>
              {media.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--color-text-tertiary)]">Tidak ada media bukti.</p>
              ) : (
                <div
                  className={
                    media.length === 1
                      ? "mt-4 grid grid-cols-1"
                      : "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4"
                  }
                >
                  {media.map((item) => {
                    const url = mediaUrl(item);

                    return url ? (
                      <a
                        key={`${item.storage_path}-${item.id ?? ""}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className={`block overflow-hidden rounded-[8px] bg-[var(--color-bg-muted)] ${
                          media.length === 1 ? "aspect-[4/3]" : "aspect-square"
                        }`}
                      >
                        <span
                          className="block h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url("${url}")` }}
                          role="img"
                          aria-label="Media bukti laporan"
                        />
                      </a>
                    ) : null;
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="rounded-[8px] bg-white py-16 text-center text-sm text-[var(--color-text-tertiary)]">
            Laporan tidak ditemukan.
          </div>
        )}
      </main>
    </div>
  );
}
