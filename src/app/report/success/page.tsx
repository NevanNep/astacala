"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { Button } from "../../../components/Button";

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
      <Navbar variant="flow" showBack={false} />

      <main className="w-full flex-1 flex flex-col justify-center max-w-200 mx-auto px-5 md:px-6 lg:px-8 py-10">

        <div className="w-full flex flex-col gap-6">

          {/* Success Icon */}
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--color-success)" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12L9.5 16.5L19 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1
              className="font-medium"
              style={{
                fontSize: "var(--text-title)",
                color: "var(--color-text-primary)",
              }}
            >
              Laporan Terkirim
            </h1>
            <p
              className="leading-relaxed"
              style={{
                fontSize: "var(--text-caption)",
                color: "var(--color-text-tertiary)",
              }}
            >
              Laporan bencana kamu telah berhasil dikirim dan sedang dalam
              proses verifikasi.
            </p>
          </div>

          {/* Info Card */}
          <div
            className="w-full rounded-lg p-4"
            style={{
              backgroundColor: "#fff",
              border: "1px solid var(--color-border)",
            }}
          >
            {INFO_ROWS.map((row, i) => (
              <div
                key={row.label}
                className="flex justify-between items-start py-2"
                style={
                  i < INFO_ROWS.length - 1
                    ? { borderBottom: "1px solid var(--color-border)" }
                    : {}
                }
              >
                <span
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  {row.label}
                </span>
                <span
                  className="font-medium text-right"
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-primary)",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Info Note */}
          <div
            className="w-full rounded-lg p-4"
            style={{ backgroundColor: "var(--color-secondary-light)" }}
          >
            <p
              className="leading-relaxed"
              style={{
                fontSize: "var(--text-caption)",
                color: "var(--color-secondary)",
              }}
            >
              Kamu akan mendapat notifikasi saat laporan diterima atau ditolak
              oleh pusat kendali. Pantau status di halaman Riwayat Laporan.
            </p>
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push("/dashboard")}
          >
            Kembali ke Beranda
          </Button>

        </div>
      </main>
    </div>
  );
}