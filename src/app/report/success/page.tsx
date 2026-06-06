"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "../../../components/Navbar";
import { formatDateTime, readReportSuccessSummary, ReportSuccessSummary, truncateText } from "../../../lib/report-flow";

export default function ReportSuccessPage() {
  const router = useRouter();
  const [summary] = useState<ReportSuccessSummary | null>(() => readReportSuccessSummary());

  const rows = [
    { label: "Nomor Laporan", value: summary?.id || "Tersimpan di riwayat laporan" },
    { label: "Jenis Bencana", value: summary?.jenis_bencana || "-" },
    { label: "Lokasi", value: truncateText(summary?.alamat, 30) },
    { label: "Waktu Kirim", value: formatDateTime(summary?.created_at) },
    { label: "Status", value: summary?.status || "Menunggu Verifikasi" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="flow" showBack={false} />

      <main className="mx-auto flex min-h-[calc(100vh-58px)] w-full max-w-[860px] flex-col justify-center px-8 py-10">
        <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success)]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12.5L9.2 16.7L19 7.3"
                stroke="white"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="text-center">
            <h1 className="text-[24px] font-semibold text-[var(--color-text-primary)]">Laporan Terkirim</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
              Laporan bencana kamu telah berhasil dikirim dan sedang dalam proses verifikasi.
            </p>
          </div>

          <section className="w-full rounded-[8px] border border-[#8E8E8E] bg-white px-4 py-2">
            {rows.map((row, index) => (
              <div
                key={row.label}
                className={`flex items-start justify-between gap-4 py-2 text-[12px] ${
                  index < rows.length - 1 ? "border-b border-[var(--color-border)]" : ""
                }`}
              >
                <span className="text-[var(--color-text-secondary)]">{row.label}</span>
                <span className="max-w-[300px] text-right font-semibold text-[var(--color-primary)]">
                  {row.value}
                </span>
              </div>
            ))}
          </section>

          <div className="w-full rounded-[8px] bg-[var(--color-secondary-light)] px-4 py-3">
            <p className="text-[13px] leading-relaxed text-[var(--color-secondary)]">
              Kamu akan mendapat notifikasi saat laporan diterima atau ditolak oleh pusat kendali. Pantau status di
              halaman Riwayat Laporan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="h-11 w-full rounded-[8px] bg-[var(--color-primary)] text-[16px] font-semibold text-white"
          >
            Kembali ke Beranda
          </button>
        </div>
      </main>
    </div>
  );
}
