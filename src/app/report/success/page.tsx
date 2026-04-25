"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";

const INFO_ROWS = [
  { label: "Nomor Laporan", value: "#LPR-2026-001" },
  { label: "Jenis Bencana", value: "Banjir" },
  { label: "Lokasi", value: "Kec. Dayeuhkolot" },
  { label: "Waktu Kirim", value: "10/04/2026 · 09:41" },
  { label: "Status", value: "Menunggu Verifikasi" },
];

export default function ReportSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar — logo only */}
      <Navbar variant="flow" showBack={false} />

      {/* Centered Success Content */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-5 md:px-6 lg:px-8 py-10">
        {/* Success Icon */}
        <div className="w-[60px] h-[60px] rounded-full bg-[var(--color-success-light)] flex items-center justify-center mb-1">
          <div className="w-[28px] h-[28px] rounded-full bg-[var(--color-success)] flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 7L5.5 10L11.5 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[18px] font-medium text-[var(--color-text-primary)] text-center mt-4 mb-2">
          Laporan Terkirim!
        </h1>

        {/* Subtitle */}
        <p className="text-[13px] text-[var(--color-text-tertiary)] text-center leading-relaxed max-w-[320px] mb-6">
          Laporan bencana kamu telah berhasil dikirim dan sedang dalam proses
          verifikasi.
        </p>

        {/* Info Card */}
        <div className="w-full max-w-[420px] bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-xl p-4 mb-4">
          {INFO_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`flex justify-between items-start py-2.5 ${
                i < INFO_ROWS.length - 1
                  ? "border-b border-[var(--color-border)]"
                  : ""
              }`}
            >
              <span className="text-[12px] text-[var(--color-text-tertiary)]">
                {row.label}
              </span>
              <span className="text-[13px] font-medium text-[var(--color-text-primary)] text-right">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Info Note */}
        <div className="w-full max-w-[420px] bg-[var(--color-secondary-light)] rounded-xl p-4 mb-6">
          <p className="text-[13px] text-[var(--color-secondary)] leading-relaxed">
            Kamu akan mendapat notifikasi saat laporan diterima atau ditolak oleh
            pusat kendali. Pantau status di halaman Riwayat Laporan.
          </p>
        </div>

        {/* Primary Button */}
        <button
          className="w-full max-w-[420px] py-3 px-4 rounded-[16px] bg-[var(--color-primary)] text-[14px] font-medium text-white active:opacity-90 transition-colors"
          onClick={() => router.push("/dashboard")}
        >
          Kembali ke Beranda
        </button>
      </main>
    </div>
  );
}
