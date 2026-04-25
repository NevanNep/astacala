"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { Stepper } from "../../../components/Stepper";

/* ── Mock review data (would come from form context in production) ── */
const MOCK_DATA = {
  lokasi: {
    koordinat: "-6.9175, 107.6191",
    kecamatan: "Coblong, Bandung",
    alamat: "Jl. Ganesha No.10, Lb. Siliwangi, Kecamatan Coblong",
  },
  kondisi: {
    jenis: "Banjir",
    keparahan: "Parah",
    terdampak: "±150 jiwa · 12 korban luka",
    kebutuhan: "Logistik, Tenda, Obat, Medis",
    deskripsi: "Tinggi air mencapai 2 meter, sejumlah rumah terendam dan akses jalan terputus.",
  },
  media: {
    fotoCount: 3,
  },
};

/* ── Reusable Review Card ── */
function ReviewCard({
  title,
  editHref,
  rows,
  router,
}: {
  title: string;
  editHref: string;
  rows: { label: string; value: React.ReactNode }[];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="border border-[var(--color-border)] rounded-[12px] overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-bg-muted)]">
        <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
          {title}
        </span>
        <button
          type="button"
          onClick={() => router.push(editHref)}
          className="text-[12px] font-medium text-[var(--color-primary)]"
        >
          Edit ›
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between gap-4 items-start">
            <span className="text-[12px] text-[var(--color-text-tertiary)] shrink-0">
              {row.label}
            </span>
            <span className="text-[13px] text-[var(--color-text-primary)] text-right truncate">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Step3ReviewPage() {
  const router = useRouter();

  const handleKirim = () => {
    // In production this would submit to an API
    router.push("/report/success");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar
        variant="flow"
        showBack={true}
        title="Buat Laporan"
        rightElement={
          <span className="text-[16px] font-medium text-[var(--color-text-primary)]">
            3/3
          </span>
        }
      />

      {/* Stepper */}
      <div className="w-full border-b border-[var(--color-border)]">
        <Stepper steps={["Lokasi", "Kondisi", "Kirim"]} currentStep={3} />
      </div>

      {/* Sub-header info strip */}
      <div className="w-full bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] py-2.5">
        <p className="text-[12px] text-center text-[var(--color-text-tertiary)]">
          Periksa kembali sebelum mengirim laporan
        </p>
      </div>

      {/* Scrollable Review Content */}
      <main className="w-full flex-1 overflow-y-auto px-5 md:px-6 lg:px-8 pt-5 pb-32 max-w-[800px] mx-auto">
        {/* Section 1 — Lokasi Kejadian */}
        <ReviewCard
          title="Lokasi Kejadian"
          editHref="/report/step1"
          router={router}
          rows={[
            { label: "Koordinat", value: MOCK_DATA.lokasi.koordinat },
            { label: "Kecamatan", value: MOCK_DATA.lokasi.kecamatan },
            { label: "Alamat", value: MOCK_DATA.lokasi.alamat },
          ]}
        />

        {/* Section 2 — Kondisi Bencana */}
        <ReviewCard
          title="Kondisi Bencana"
          editHref="/report/step2"
          router={router}
          rows={[
            { label: "Jenis", value: MOCK_DATA.kondisi.jenis },
            { label: "Keparahan", value: MOCK_DATA.kondisi.keparahan },
            { label: "Terdampak", value: MOCK_DATA.kondisi.terdampak },
            { label: "Kebutuhan", value: MOCK_DATA.kondisi.kebutuhan },
            { label: "Deskripsi", value: MOCK_DATA.kondisi.deskripsi },
          ]}
        />

        {/* Section 3 — Media Bukti */}
        <div className="border border-[var(--color-border)] rounded-[12px] overflow-hidden mb-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-bg-muted)]">
            <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
              Media Bukti
            </span>
            <button
              type="button"
              onClick={() => router.push("/report/step2")}
              className="text-[12px] font-medium text-[var(--color-primary)]"
            >
              Edit ›
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-3">
            <div className="flex justify-between items-center gap-4">
              <span className="text-[12px] text-[var(--color-text-tertiary)] shrink-0">
                Foto
              </span>
              <div className="flex items-center gap-2">
                {/* Thumbnail placeholders */}
                {Array.from({ length: MOCK_DATA.media.fotoCount }).map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-[var(--radius-sm)]"
                    style={{
                      background:
                        i % 2 === 0
                          ? "linear-gradient(135deg, #90A4AE, #607D8B)"
                          : "linear-gradient(135deg, #78909C, #546E7A)",
                    }}
                  />
                ))}
                {/* Count chip */}
                <span className="text-[12px] text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] px-2.5 py-1 rounded-[var(--radius-sm)]">
                  {MOCK_DATA.media.fotoCount} Foto
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Box */}
        <div className="bg-[var(--color-success-light)] rounded-[12px] p-4 flex gap-3 items-start mt-2">
          <span className="text-[16px] text-[var(--color-success)] shrink-0 mt-0.5">✓</span>
          <p className="text-[13px] text-[var(--color-success)] leading-relaxed">
            Dengan mengirim laporan ini, saya menyatakan bahwa informasi yang
            diberikan adalah benar dan dapat dipertanggungjawabkan.
          </p>
        </div>
      </main>

      {/* Fixed Bottom Button Row */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[var(--color-border)] px-5 py-4 z-50">
        <div className="max-w-[800px] mx-auto flex gap-3">
          <div className="flex-1">
            <button
              className="w-full py-3 px-4 rounded-[16px] border border-[var(--color-border)] text-[14px] font-medium text-[var(--color-text-secondary)] bg-white active:bg-gray-50 transition-colors"
              onClick={() => router.push("/report/step2")}
            >
              ← Kembali
            </button>
          </div>
          <div className="flex-[2]">
            <button
              className="w-full py-3 px-4 rounded-[16px] bg-[var(--color-primary)] text-[14px] font-medium text-white active:opacity-90 transition-colors"
              onClick={handleKirim}
            >
              Kirim Laporan ✓
            </button>
          </div>
        </div>
        {/* Safe area spacing for mobile iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
