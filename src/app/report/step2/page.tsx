"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { Stepper } from "../../../components/Stepper";

const JENIS_BENCANA_OPTIONS = [
  "Banjir",
  "Gempa",
  "Longsor",
  "Kebakaran",
  "Tsunami",
  "Lainnya",
];

const SEVERITY_OPTIONS = ["Ringan", "Sedang", "Parah", "Kritis"];

const KEBUTUHAN_OPTIONS = [
  "Perahu",
  "Logistik",
  "Obat",
  "Tenda",
  "Medis",
  "Alat Berat",
];

export default function Step2KondisiPage() {
  const router = useRouter();

  const [jenisBencana, setJenisBencana] = useState("");
  const [severity, setSeverity] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kebutuhan, setKebutuhan] = useState<string[]>([]);

  const toggleKebutuhan = (item: string) => {
    setKebutuhan((prev) =>
      prev.includes(item) ? prev.filter((k) => k !== item) : [...prev, item]
    );
  };

  const handleLanjut = () => {
    // Basic validation
    if (!jenisBencana) return alert("Pilih jenis bencana");
    if (!severity) return alert("Pilih tingkat keparahan");
    if (deskripsi.length < 30)
      return alert("Deskripsi minimal 30 karakter");

    router.push("/report/step3");
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
            2/3
          </span>
        }
      />

      {/* Stepper */}
      <div className="w-full border-b border-[var(--color-border)]">
        <Stepper steps={["Lokasi", "Kondisi", "Kirim"]} currentStep={2} />
      </div>

      {/* Scrollable Form Content */}
      <main className="w-full flex-1 overflow-y-auto px-5 md:px-6 lg:px-8 pt-6 pb-32 max-w-[800px] mx-auto">
        {/* Section Title */}
        <h1 className="text-[20px] font-medium text-[var(--color-text-primary)] mb-5">
          Kondisi Bencana
        </h1>

        <div className="space-y-5">
          {/* 1. Jenis Bencana */}
          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">
              Jenis Bencana <span className="text-[var(--color-primary)]">*</span>
            </label>
            <div className="relative">
              <select
                value={jenisBencana}
                onChange={(e) => setJenisBencana(e.target.value)}
                className="w-full appearance-none bg-white border border-[var(--color-border)] rounded-[16px] py-3 px-4 pr-10 text-[14px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer"
              >
                <option value="" disabled>
                  Pilih jenis bencana
                </option>
                {JENIS_BENCANA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {/* Dropdown Arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1.5L6 6.5L11 1.5"
                    stroke="var(--color-text-tertiary)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. Tingkat Keparahan */}
          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">
              Tingkat Keparahan <span className="text-[var(--color-primary)]">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {SEVERITY_OPTIONS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                    severity === level
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[#E0E0E0] text-[var(--color-text-primary)]"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Deskripsi Kondisi */}
          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">
              Deskripsi Kondisi <span className="text-[var(--color-primary)]">*</span>
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tinggi air mencapai 2 meter"
              className="w-full bg-white border border-[var(--color-border)] rounded-[16px] py-3 px-4 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-primary)] transition-colors resize-none min-h-[120px]"
            />
            <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1.5">
              Min. 30 Karakter · Jelaskan kondisi sejelas mungkin
            </p>
          </div>

          {/* 4. Kebutuhan Mendesak */}
          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--color-text-primary)] mb-2">
              Kebutuhan Mendesak
            </label>
            <div className="bg-white border border-[var(--color-border)] rounded-[16px] p-4">
              <div className="flex flex-wrap gap-2">
                {KEBUTUHAN_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleKebutuhan(item)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                      kebutuhan.includes(item)
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[#E0E0E0] text-[var(--color-text-primary)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Foto Kejadian */}
          <div className="flex flex-col">
            <label className="text-[14px] font-medium text-[var(--color-text-primary)] mb-3">
              Foto Kejadian
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="aspect-square border-2 border-[var(--color-border)] rounded-xl flex items-center justify-center bg-white hover:bg-[var(--color-bg-muted)] transition-colors"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 6V22M6 14H22"
                      stroke="var(--color-text-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-[#FFF3CD] rounded-xl p-4 flex gap-3 items-start">
            <span className="text-[18px] shrink-0 mt-0.5">⚠️</span>
            <p className="text-[12px] text-[#856404] leading-relaxed">
              Pastikan foto menunjukkan kondisi nyata di lapangan. Laporan
              dengan bukti yang jelas akan lebih cepat diverifikasi.
            </p>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button Row */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[var(--color-border)] px-5 py-4 z-50">
        <div className="max-w-[800px] mx-auto flex gap-3">
          <div className="flex-1">
            <button
              className="w-full py-3 px-4 rounded-[16px] border border-[var(--color-border)] text-[14px] font-medium text-[var(--color-text-secondary)] bg-white active:bg-gray-50 transition-colors"
              onClick={() => router.push("/report/step1")}
            >
              ← Kembali
            </button>
          </div>
          <div className="flex-[2]">
            <button
              className="w-full py-3 px-4 rounded-[16px] bg-[var(--color-primary)] text-[14px] font-medium text-white active:opacity-90 transition-colors"
              onClick={handleLanjut}
            >
              Lanjut
            </button>
          </div>
        </div>
        {/* Safe area spacing for mobile iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
